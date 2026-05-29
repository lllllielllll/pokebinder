'use client'

import ProfileMenu from '@/components/ProfileMenu'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type ApiCard = {
  id: string
  name: string
  localId?: string
  number?: string
  image?: string
  images?: {
    small?: string
    large?: string
  }
  rarity?: string
  set?: {
    id?: string
    name?: string
  }
  tcgplayer?: {
    prices?: {
      normal?: { market?: number }
      holofoil?: { market?: number }
      reverseHolofoil?: { market?: number }
    }
  }
}

export default function AdicionarCartaPage() {
 
   useEffect(() => {
  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
    }
  }

  checkUser()
}, [])

  const [manualImageUrl, setManualImageUrl] = useState('')
  const [name, setName] = useState('')
  const [setFilter, setSetFilter] = useState('')
  const [numberFilter, setNumberFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('Todas')

  const [language, setLanguage] = useState('Português')
  const [condition, setCondition] = useState('NM')
  const [quantity, setQuantity] = useState(1)
  const [manualPriceBrl, setManualPriceBrl] = useState('')
  const [variant, setVariant] = useState('Todas')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const [results, setResults] = useState<ApiCard[]>([])
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null)

  function getLanguageCode(language: string) {
    switch (language) {
      case 'Português':
        return 'pt-br'
      case 'Inglês':
        return 'en'
      case 'Japonês':
        return 'ja'
      case 'Alemão':
        return 'de'
      case 'Francês':
        return 'fr'
      case 'Italiano':
        return 'it'
      case 'Espanhol':
        return 'es'
      case 'Coreano':
        return 'ko'
      case 'Chinês Simplificado':
        return 'zh-cn'
      case 'Chinês Tradicional':
        return 'zh-tw'
      case 'Tailandês':
        return 'th'
      case 'Indonésio':
        return 'id'
      default:
        return 'en'
    }
  }

  function getAutoPrice(card: ApiCard | null) {
    if (language !== 'Inglês') return null

    return (
      card?.tcgplayer?.prices?.holofoil?.market ||
      card?.tcgplayer?.prices?.reverseHolofoil?.market ||
      card?.tcgplayer?.prices?.normal?.market ||
      null
    )
  }

  function getImageUrl(card: ApiCard | null) {
    if (!card) return null

    const image =
      card.images?.large ||
      card.images?.small ||
      card.image ||
      null

    if (!image) return null

    if (
      image.endsWith('.png') ||
      image.endsWith('.jpg') ||
      image.endsWith('.jpeg') ||
      image.endsWith('.webp')
    ) {
      return image
    }

    return `${image}/high.webp`
  }

  async function searchPokemonTcgApi() {
  const cleanName = name.trim()

  const response = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=name:*${encodeURIComponent(
      cleanName
    )}*&pageSize=250`
  )

  const data = await response.json()

  return data.data || []
}

  async function findApproximateImage(card: ApiCard) {
  const cardNumber = String(card.number || card.localId || '')
    .replace(/^0+/, '')
    .toLowerCase()

  if (!card.name || !cardNumber) return null

  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:*${encodeURIComponent(
        card.name
      )}*&pageSize=250`
    )

    const data = await response.json()
    const cards = data.data || []

    const match = cards.find((apiCard: ApiCard) => {
      const apiNumber = String(apiCard.number || apiCard.localId || '')
        .replace(/^0+/, '')
        .toLowerCase()

      return apiNumber === cardNumber && apiCard.images?.large
    })

    return match?.images?.large || cards[0]?.images?.large || null
  } catch {
    return null
  }
}

async function searchTcgdexFallback() {
  const languageCode = getLanguageCode(language)

  const response = await fetch(
  `https://api.tcgdex.net/v2/en/cards`
)

  const allCards = await response.json()

  const matchingCards = allCards
    .filter((card: ApiCard) =>
      card.name?.toLowerCase().includes(name.toLowerCase())
    )
    .slice(0, 40)

  const detailedCards = await Promise.all(
    matchingCards.map(async (card: ApiCard) => {
      const detailResponse = await fetch(
        `https://api.tcgdex.net/v2/${languageCode}/cards/${card.id}`
      )

      const detail = await detailResponse.json()

      if (detail.image) return detail

const approximateImage = await findApproximateImage(detail)

return {
  ...detail,
  image: approximateImage || detail.image,
}

      const englishResponse = await fetch(
        `https://api.tcgdex.net/v2/en/cards/${card.id}`
      )

      if (!englishResponse.ok) return detail

      const englishDetail = await englishResponse.json()

      return {
        ...detail,
        image: englishDetail.image || detail.image,
      }
    })
  )

  return detailedCards
}

  async function searchCard() {
    if (!name.trim()) {
      setMessage('Digite o nome da carta.')
      return
    }

    setSearching(true)
    setMessage('')
    setSelectedCard(null)
    setResults([])

    try {
      const pokemonApiCards =
  await searchPokemonTcgApi()

const tcgdexCards =
  await searchTcgdexFallback()

const mergedCards = [
  ...pokemonApiCards,
  ...tcgdexCards,
]

const uniqueCards = mergedCards.filter(
  (card, index, self) =>
    index ===
    self.findIndex(
      (c) =>
        (c.number || c.localId) ===
          (card.number || card.localId) &&
        c.name === card.name &&
        c.set?.name === card.set?.name
    )
)

let cards: ApiCard[] = uniqueCards

      if (setFilter.trim()) {
        cards = cards.filter((card: ApiCard) =>
          card.set?.name
            ?.toLowerCase()
            .includes(setFilter.toLowerCase())
        )
      }

      if (numberFilter.trim()) {
        const cleanNumber = numberFilter
          .split('/')[0]
          .replace(/^0+/, '')
          .toLowerCase()

        cards = cards.filter((card: ApiCard) => {
          const apiNumber = String(card.number || card.localId || '')
            .split('/')[0]
            .replace(/^0+/, '')
            .toLowerCase()

          return (
            apiNumber === cleanNumber ||
            apiNumber.includes(cleanNumber) ||
            cleanNumber.includes(apiNumber)
          )
        })
      }

      if (rarityFilter !== 'Todas') {
        cards = cards.filter((card: ApiCard) =>
          card.rarity
            ?.toLowerCase()
            .includes(rarityFilter.toLowerCase())
        )
      }

      if (cards.length === 0) {
        setMessage('Nenhuma carta encontrada.')
        setSearching(false)
        return
      }

      setResults(cards)
      setMessage(`${cards.length} cartas encontradas.`)
    } catch {
      setMessage('Erro ao buscar carta.')
    }

    setSearching(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedCard) {
      setMessage('Selecione uma carta.')
      return
    }

    setLoading(true)
    setMessage('')

    const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  setMessage('Você precisa estar logado para salvar cartas.')
  setLoading(false)
  return
}

    const { error } = await supabase
      .from('cards')
      .insert({
        name: selectedCard.name,
        language,
        condition,
        quantity,
        variant,

        image_url: manualImageUrl || getImageUrl(selectedCard),

        set_name: selectedCard.set?.name || null,

        card_number:
          selectedCard.number ||
          selectedCard.localId ||
          null,

        rarity: selectedCard.rarity || null,

        auto_price: getAutoPrice(selectedCard),

        auto_price_brl: manualPriceBrl
          ? Number(manualPriceBrl)
          : null,
        price_provider: null,
        price_url: null,
        price_updated_at: null,
        user_id: user.id,

        api_card_id: selectedCard.images ? selectedCard.id : null,

        tcgdex_id: selectedCard.images ? null : selectedCard.id || null,

        tcgdex_local_id: selectedCard.localId || null,

        tcgdex_set_id: selectedCard.set?.id || null,

        card_language_code: getLanguageCode(language),
      })

    if (error) {
      setMessage(`Erro: ${error.message}`)
      setLoading(false)
      return
    }

    setMessage('Carta salva com sucesso!')
    setName('')
    setResults([])
    setSelectedCard(null)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <ProfileMenu />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold">
          Adicionar carta
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm">
              Nome da carta
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Umbreon"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Coleção / Set
            </label>

            <input
              type="text"
              value={setFilter}
              onChange={(event) => setSetFilter(event.target.value)}
              placeholder="Ex: Evolving Skies"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Número da carta
            </label>

            <input
              type="text"
              value={numberFilter}
              onChange={(event) => setNumberFilter(event.target.value)}
              placeholder="Ex: 215"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            />
          </div>

<div>
  <label className="mb-2 block text-sm">
    URL da imagem manual
  </label>

  <input
    type="text"
    value={manualImageUrl}
    onChange={(event) => setManualImageUrl(event.target.value)}
    placeholder="Cole aqui a imagem da carta se a API não encontrar"
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
  />
</div>

          <div>
            <label className="mb-2 block text-sm">
              Raridade
            </label>

            <select
              value={rarityFilter}
              onChange={(event) => setRarityFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            >
              <option>Todas</option>
              <option>Common</option>
              <option>Uncommon</option>
              <option>Rare</option>
              <option>Rare Holo</option>
              <option>Rare Ultra</option>
              <option>Rare Secret</option>
              <option>Rare Rainbow</option>
              <option>Rare Holo V</option>
              <option>Rare Holo VMAX</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Variante
            </label>

            <select
              value={variant}
              onChange={(event) => setVariant(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            >
              <option>Todas</option>
              <option>Normal</option>
              <option>Reverse Holo</option>
              <option>Holo</option>
              <option>Full Art</option>
              <option>Alt Art</option>
              <option>Gold</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Idioma da sua carta física
            </label>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            >
              <option>Português</option>
              <option>Inglês</option>
              <option>Japonês</option>
              <option>Alemão</option>
              <option>Francês</option>
              <option>Italiano</option>
              <option>Espanhol</option>
              <option>Coreano</option>
              <option>Chinês Simplificado</option>
              <option>Chinês Tradicional</option>
              <option>Tailandês</option>
              <option>Indonésio</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Condição
            </label>

            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            >
              <option>NM</option>
              <option>LP</option>
              <option>MP</option>
              <option>HP</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Quantidade
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            />
          </div>

          <div>   
            <label className="mb-2 block text-sm">
              Valor manual (R$)
            </label>

            <input
              type="number"
              step="0.01"
              value={manualPriceBrl}
              onChange={(event) =>
                setManualPriceBrl(event.target.value)
              }
              placeholder="Ex: 149.90"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={searchCard}
              disabled={searching}
              className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-400"
            >
              {searching ? 'Buscando...' : 'Buscar cartas'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
            >
              {loading ? 'Salvando...' : 'Salvar carta'}
            </button>

            <Link
              href="/colecao"
              className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-400"
            >
              Ver coleção
            </Link>
          </div>

          {message && (
            <p className="text-slate-300">
              {message}
            </p>
          )}

          {results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((card) => (
                <button
                  key={`${card.id}-${card.set?.id || card.set?.name || 'set'}-${card.number || card.localId || 'num'}`}
                  type="button"
                  onClick={() => {
                    setSelectedCard(card)

                    if (card?.rarity) {
                      const rarity = card.rarity.toLowerCase()

                      if (rarity.includes('hyper')) {
                        setVariant('Gold')
                      } else if (rarity.includes('secret')) {
                        setVariant('Alt Art')
                      } else if (rarity.includes('ultra')) {
                        setVariant('Full Art')
                      } else if (rarity.includes('holo')) {
                        setVariant('Holo')
                      } else {
                        setVariant('Normal')
                      }
                    }
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedCard?.id === card.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  {getImageUrl(card) && (
                    <img
                      src={getImageUrl(card) || ''}
                      alt={card.name}
                      className="mb-4 w-32 rounded-xl"
                    />
                  )}

                  <h2 className="text-xl font-bold">
                    {card.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {card.set?.name}
                  </p>

                  <p className="text-sm text-slate-400">
                    Nº {card.number || card.localId}
                  </p>

                  <p className="text-sm text-slate-400">
                    {card.rarity}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {language === 'Inglês' && getAutoPrice(card)
                      ? `US$ ${getAutoPrice(card)}`
                      : 'Sem preço automático para este idioma'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedCard && (
            <div className="rounded-3xl border border-yellow-400 bg-yellow-400/10 p-5">
              <h2 className="text-2xl font-bold text-yellow-300">
                Carta selecionada
              </h2>

              <div className="mt-4 flex gap-5">
                {getImageUrl(selectedCard) && (
                  <img
                    src={getImageUrl(selectedCard) || ''}
                    alt={selectedCard.name}
                    className="w-40 rounded-xl"
                  />
                )}

                <div>
                  <h3 className="text-3xl font-bold">
                    {selectedCard.name}
                  </h3>

                  <p className="mt-3 text-slate-300">
                    Set: {selectedCard.set?.name}
                  </p>

                  <p className="text-slate-300">
                    Número: {selectedCard.number || selectedCard.localId}
                  </p>

                  <p className="text-slate-300">
                    Raridade: {selectedCard.rarity}
                  </p>

                  <p className="text-slate-300">
                    Preço:{' '}
                    {language === 'Inglês' && getAutoPrice(selectedCard)
                      ? `US$ ${getAutoPrice(selectedCard)}`
                      : 'Não disponível para este idioma'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}