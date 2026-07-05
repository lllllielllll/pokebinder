'use client'

import ProfileMenu from '@/components/ProfileMenu'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Binder = {
  id: string
  name: string
}

type ApiCard = {

  id: string
  name: string
  source?: 'catalog' | 'pokemonapi' | 'tcgdex'

  finish?: string | null

  number?: string
  localId?: string

  image?: string
  image_url?: string | null
  images?: {
    small?: string
    large?: string
  }

  rarity?: string | null
  illustrator?: string | null
  artist?: string | null
  illustrators?: string[]

  card_type?: string | null
  types?: string[]
  hp?: string | number | null
  stage?: string | null
  category?: string | null

  set?: {
    id?: string
    name?: string
    series?: string
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
  const [binders, setBinders] = useState<Binder[]>([])
  const [selectedBinderId, setSelectedBinderId] = useState('')
  const [binderPage, setBinderPage] = useState(1)
  const [binderSlot, setBinderSlot] = useState(1)

  const [name, setName] = useState('')
  const [setFilter, setSetFilter] = useState('')
  const [numberFilter, setNumberFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('Todas')

  const [language, setLanguage] = useState('Português')
  const [condition, setCondition] = useState('NM')
  const [quantity, setQuantity] = useState(1)
  const [manualPriceBrl, setManualPriceBrl] = useState('')
  const [finish, setFinish] = useState('Normal')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const [results, setResults] = useState<ApiCard[]>([])
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null)

  const [manualMode, setManualMode] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualSetName, setManualSetName] = useState('')
  const [manualCardNumber, setManualCardNumber] = useState('')
  const [manualRarity, setManualRarity] = useState('')
  const [manualIllustrator, setManualIllustrator] = useState('')
  const [manualCardType, setManualCardType] = useState('')
  const [manualHp, setManualHp] = useState('')
  const [manualStage, setManualStage] = useState('')

  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data } = await supabase
        .from('binders')
        .select('id, name')
        .eq('user_id', user.id)

      setBinders(data || [])

      if (data && data.length > 0) {
        setSelectedBinderId(data[0].id)
      }
    }

    checkUser()
  }, [])

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

  function getImageUrl(card: ApiCard | null) {
    if (!card) return null

    const image =
      card.image_url ||
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

  function getIllustrator(card: ApiCard | null) {
    if (!card) return null

    return (
      card.illustrator ||
      card.artist ||
      card.illustrators?.[0] ||
      null
    )
  }

  function getCardType(card: ApiCard | null) {
    if (!card) return null

    return (
      card.card_type ||
      card.types?.join(', ') ||
      card.category ||
      null
    )
  }

  function getHp(card: ApiCard | null) {
    if (!card?.hp) return null
    return String(card.hp)
  }

  function getStage(card: ApiCard | null) {
    if (!card) return null
    return card.stage || null
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

  function detectVariant(card: ApiCard) {
    const rarity = card.rarity?.toLowerCase() || ''
    const name = card.name?.toLowerCase() || ''

    if (rarity.includes('special illustration')) return 'Special Illustration Rare'
    if (rarity.includes('illustration')) return 'Illustration Rare'
    if (rarity.includes('hyper')) return 'Gold'
    if (rarity.includes('secret')) return 'Alt Art'
    if (rarity.includes('rainbow')) return 'Rainbow'
    if (rarity.includes('ultra')) return 'Full Art'
    if (rarity.includes('double rare')) return 'Double Rare'
    if (rarity.includes('radiant')) return 'Radiant'
    if (rarity.includes('amazing')) return 'Amazing Rare'
    if (rarity.includes('ace spec')) return 'ACE SPEC'
    if (rarity.includes('promo')) return 'Promo'
    if (rarity.includes('holo')) return 'Holo'
    if (name.includes(' ex')) return 'ex'
    if (name.includes(' vmax')) return 'VMAX'
    if (name.includes(' vstar')) return 'VSTAR'
    if (name.includes(' v')) return 'V'

    return 'Normal'
  }

  async function uploadCardImage(file: File) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setUploadingImage(true)

    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`
    const filePath = `cards/${fileName}`

    const { error } = await supabase.storage
      .from('card-images')
      .upload(filePath, file, {
        upsert: true,
      })

    if (error) {
      alert(`Erro ao enviar imagem: ${error.message}`)
      setUploadingImage(false)
      return
    }

    const { data } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath)

    setUploadedImageUrl(data.publicUrl)
    setUploadingImage(false)
  }
    async function searchCardCatalog() {
    const cleanName = name.trim()

    const { data, error } = await supabase
      .from('card_catalog')
      .select('*')
      .ilike('name', `%${cleanName}%`)
      .limit(100)

    if (error) {
      console.log('Erro ao buscar no catálogo:', error.message)
      return []
    }

    return (data || []).map((card) => ({
      id: card.id,
      name: card.name,
      number: card.card_number || undefined,
      localId: card.card_number || undefined,
      image_url: card.image_url || undefined,
      rarity: card.rarity || undefined,
      illustrator: card.illustrator || undefined,
      card_type: card.card_type || undefined,
      hp: card.hp || undefined,
      stage: card.stage || undefined,
      source: 'catalog' as const,
      set: {
        name: card.set_name || undefined,
      },
    }))
  }

  async function searchPokemonTcgApi() {
    const cleanName = name.trim()

    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:*${encodeURIComponent(
        cleanName
      )}*&pageSize=250`
    )

    const data = await response.json()

    return (data.data || []).map((card: ApiCard) => ({
      ...card,
      source: 'pokemonapi' as const,
      card_type: card.types?.join(', ') || card.card_type || null,
      illustrator: card.artist || card.illustrator || null,
      stage: card.stage || null,
      hp: card.hp || null,
    }))
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
      'https://api.tcgdex.net/v2/en/cards'
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

        const approximateImage = detail.image
          ? detail.image
          : await findApproximateImage(detail)

        return {
          ...detail,
          image: approximateImage || detail.image,
          source: 'tcgdex' as const,
          illustrator:
            detail.illustrator ||
            detail.illustrators?.[0] ||
            detail.artist ||
            null,
          card_type:
            detail.card_type ||
            detail.category ||
            detail.types?.join(', ') ||
            null,
          hp: detail.hp || null,
          stage: detail.stage || null,
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
      const catalogCards = await searchCardCatalog()
      const pokemonApiCards = await searchPokemonTcgApi()
      const tcgdexCards = await searchTcgdexFallback()

      const mergedCards = [
        ...catalogCards,
        ...pokemonApiCards,
        ...tcgdexCards,
      ]

      let cards: ApiCard[] = mergedCards.filter(
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

      if (setFilter.trim()) {
        cards = cards.filter((card) =>
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

        cards = cards.filter((card) => {
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
        cards = cards.filter((card) =>
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

    if (!selectedCard && !manualMode) {
      setMessage('Selecione uma carta ou use o modo manual.')
      return
    }

    if (manualMode && !manualName.trim()) {
      setMessage('Digite o nome da carta manual.')
      return
    }

    if (manualMode && !uploadedImageUrl) {
      setMessage('Envie uma imagem da carta manual.')
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

    const cardToSave = {
      name: manualMode ? manualName : selectedCard!.name,

      image_url: uploadedImageUrl || getImageUrl(selectedCard),

      set_name: manualMode
        ? manualSetName || null
        : selectedCard!.set?.name || null,

      card_number: manualMode
        ? manualCardNumber || null
        : selectedCard!.number || selectedCard!.localId || null,

      rarity: manualMode
        ? manualRarity || null
        : selectedCard!.rarity || null,

      illustrator: manualMode
        ? manualIllustrator || null
        : getIllustrator(selectedCard),

      card_type: manualMode
        ? manualCardType || null
        : getCardType(selectedCard),

      hp: manualMode
        ? manualHp || null
        : getHp(selectedCard),

      stage: manualMode
        ? manualStage || null
        : getStage(selectedCard),

      language,
      condition,
      quantity,
      finish,

      api_card_id:
        !manualMode && selectedCard?.source === 'pokemonapi'
          ? selectedCard.id
          : null,

      tcgdex_id:
        !manualMode && selectedCard?.source === 'tcgdex'
          ? selectedCard.id
          : null,
    }

    const { error } = await supabase
      .from('cards')
      .insert({
        name: cardToSave.name,
        language: cardToSave.language,
        condition: cardToSave.condition,
        quantity: cardToSave.quantity,
        finish: cardToSave.finish,

        image_url: cardToSave.image_url,

        set_name: cardToSave.set_name,
        card_number: cardToSave.card_number,
        rarity: cardToSave.rarity,
        illustrator: cardToSave.illustrator,
        card_type: cardToSave.card_type,
        hp: cardToSave.hp,
        stage: cardToSave.stage,

        auto_price: null,

        manual_price: manualPriceBrl
          ? Number(manualPriceBrl)
          : null,

        manual_price_currency: 'BRL',
        manual_price_updated_at: manualPriceBrl
          ? new Date().toISOString()
          : null,

        auto_price_brl: manualPriceBrl
          ? Number(manualPriceBrl)
          : null,

        price_provider: null,
        price_url: null,
        price_updated_at: null,

        user_id: user.id,

        binder_id: selectedBinderId || null,
        binder_page: selectedBinderId ? binderPage : null,
        binder_slot: selectedBinderId ? binderSlot : null,

        api_card_id: cardToSave.api_card_id,
        tcgdex_id: cardToSave.tcgdex_id,

        tcgdex_local_id:
          !manualMode && selectedCard?.source === 'tcgdex'
            ? selectedCard?.localId || null
            : null,

        tcgdex_set_id:
          !manualMode && selectedCard?.source === 'tcgdex'
            ? selectedCard?.set?.id || null
            : null,

        card_language_code: getLanguageCode(language),
      })

    if (error) {
      setMessage(`Erro: ${error.message}`)
      setLoading(false)
      return
    }

    await supabase
      .from('card_catalog')
      .upsert(
        {
          name: cardToSave.name,
          image_url: cardToSave.image_url,
          set_name: cardToSave.set_name,
          card_number: cardToSave.card_number,
          rarity: cardToSave.rarity,
          illustrator: cardToSave.illustrator,
          card_type: cardToSave.card_type,
          hp: cardToSave.hp,
          stage: cardToSave.stage,
          language: cardToSave.language,
          variant: cardToSave.finish,
          api_card_id: cardToSave.api_card_id,
          tcgdex_id: cardToSave.tcgdex_id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'name,set_name,card_number,language',
        }
      )

    setMessage('Carta salva com sucesso!')

    setName('')
    setSetFilter('')
    setNumberFilter('')
    setRarityFilter('Todas')
    setResults([])
    setSelectedCard(null)

    setManualMode(false)
    setManualName('')
    setManualSetName('')
    setManualCardNumber('')
    setManualRarity('')
    setManualIllustrator('')
    setManualCardType('')
    setManualHp('')
    setManualStage('')

    setUploadedImageUrl('')
    setQuantity(1)
    setManualPriceBrl('')
    setFinish('Normal')
    setLoading(false)
  }

  function detectFinish(card: ApiCard): string {
    // Implement the logic to detect the finish of the card
    return card.finish || 'Normal';
  }

    return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <ProfileMenu />

      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold">
          Adicionar carta
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold">
              Buscar carta
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome da carta. Ex: Umbreon"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                value={setFilter}
                onChange={(event) => setSetFilter(event.target.value)}
                placeholder="Coleção / Set"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                value={numberFilter}
                onChange={(event) => setNumberFilter(event.target.value)}
                placeholder="Número"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={searchCard}
                disabled={searching}
                className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-400 disabled:opacity-50"
              >
                {searching ? 'Buscando...' : 'Buscar cartas'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setManualMode(true)
                  setSelectedCard(null)
                  setResults([])
                  setMessage('')
                  setFinish('Normal')
                }}
                className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
              >
                + Adicionar manualmente
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold">
              Dados da sua carta
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Idioma
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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
                <label className="mb-2 block text-sm text-slate-400">
                  Condição
                </label>

                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <option>NM</option>
                  <option>LP</option>
                  <option>MP</option>
                  <option>HP</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Acabamento

              </label>

                <select
                  value={finish}
                  onChange={(event) => setFinish(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <option>Normal</option>
                  <option>Holo</option>
                  <option>Reverse Holo</option>
                  <option>Stamped</option>
                  <option>Stamped Promo</option>
                  <option>Cosmos Holo</option>
                  <option>Cracked Ice Holo</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Quantidade
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Valor manual em R$
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={manualPriceBrl}
                  onChange={(event) => setManualPriceBrl(event.target.value)}
                  placeholder="Ex: 149.90"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>
            </div>
          </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold">
              Imagem da carta
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Para carta manual, envie obrigatoriamente uma imagem. Para carta buscada, a imagem oficial será usada, mas você pode enviar uma imagem própria para substituir.
            </p>

            <input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(event) => {
                const file = event.target.files?.[0]

                if (file) {
                  uploadCardImage(file)
                }
              }}
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            {uploadingImage && (
              <p className="mt-2 text-sm text-yellow-300">
                Enviando imagem...
              </p>
            )}

            {uploadedImageUrl && (
              <div className="mt-4">
                <img
                  src={uploadedImageUrl}
                  alt="Imagem enviada"
                  className="w-40 rounded-xl"
                />

                <p className="mt-2 text-xs text-green-400">
                  ✓ Imagem enviada e pronta para salvar
                </p>
              </div>
            )}
          </section>

          {manualMode && (
            <section className="rounded-3xl border border-yellow-400 bg-yellow-400/10 p-6">
              <h2 className="text-2xl font-bold text-yellow-300">
                Adicionar carta manualmente
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                Preencha todos os dados da carta. Esses dados também alimentam o banco do PokéBinder.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Nome
                  </label>

                  <input
                    value={manualName}
                    onChange={(event) => setManualName(event.target.value)}
                    placeholder="Ex: Squirtle"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Coleção / Set
                  </label>

                  <input
                    value={manualSetName}
                    onChange={(event) => setManualSetName(event.target.value)}
                    placeholder="Ex: Pokémon 151"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Número
                  </label>

                  <input
                    value={manualCardNumber}
                    onChange={(event) =>
                      setManualCardNumber(event.target.value)
                    }
                    placeholder="Ex: 007/165"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Raridade
                  </label>

                  <input
                    value={manualRarity}
                    onChange={(event) => setManualRarity(event.target.value)}
                    placeholder="Ex: Common, Rare, Illustration Rare..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Ilustrador
                  </label>

                  <input
                    value={manualIllustrator}
                    onChange={(event) =>
                      setManualIllustrator(event.target.value)
                    }
                    placeholder="Ex: Mitsuhiro Arita"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Tipo
                  </label>

                  <input
                    value={manualCardType}
                    onChange={(event) =>
                      setManualCardType(event.target.value)
                    }
                    placeholder="Ex: Pokémon Água, Treinador, Energia..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    HP
                  </label>

                  <input
                    value={manualHp}
                    onChange={(event) => setManualHp(event.target.value)}
                    placeholder="Ex: 70"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Estágio
                  </label>

                  <input
                    value={manualStage}
                    onChange={(event) => setManualStage(event.target.value)}
                    placeholder="Ex: Básico, Stage 1, Treinador..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  />
                </div>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold">
              Binder
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Binder
                </label>

                <select
                  value={selectedBinderId}
                  onChange={(event) =>
                    setSelectedBinderId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <option value="">Sem binder</option>

                  {binders.map((binder) => (
                    <option key={binder.id} value={binder.id}>
                      {binder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Página
                </label>

                <input
                  type="number"
                  min="1"
                  value={binderPage}
                  onChange={(event) =>
                    setBinderPage(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Slot
                </label>

                <input
                  type="number"
                  min="1"
                  value={binderSlot}
                  onChange={(event) =>
                    setBinderSlot(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>
            </div>
          </section>

                    {results.length > 0 && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-bold">
                Resultados da busca
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((card) => (
                  <button
                    key={`${card.id}-${card.number || card.localId}`}
                    type="button"
                    onClick={() => {
                      setSelectedCard(card)

                      setFinish(detectFinish(card))

                      if (!manualPriceBrl && getAutoPrice(card)) {
                        setManualPriceBrl(
                          String(getAutoPrice(card))
                        )
                      }
                    }}
                    className={`overflow-hidden rounded-2xl border transition ${
                      selectedCard?.id === card.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-500'
                    }`}
                  >
                    {getImageUrl(card) && (
                      <img
                        src={getImageUrl(card)!}
                        alt={card.name}
                        className="h-72 w-full object-cover"
                      />
                    )}

                    <div className="p-4 text-left">
                      <h3 className="font-bold">
                        {card.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {card.set?.name}
                      </p>

                      <p className="text-sm text-slate-400">
                        Nº {card.number || card.localId}
                      </p>

                      <p className="text-sm text-slate-400">
                        {card.rarity}
                      </p>

                      {getIllustrator(card) && (
                        <p className="mt-2 text-xs text-slate-500">
                          🎨 {getIllustrator(card)}
                        </p>
                      )}

                      {getCardType(card) && (
                        <p className="text-xs text-slate-500">
                          Tipo: {getCardType(card)}
                        </p>
                      )}

                      {getHp(card) && (
                        <p className="text-xs text-slate-500">
                          HP {getHp(card)}
                        </p>
                      )}

                      {getStage(card) && (
                        <p className="text-xs text-slate-500">
                          {getStage(card)}
                        </p>
                      )}

                      {language === 'Inglês' &&
                        getAutoPrice(card) && (
                          <p className="mt-3 font-semibold text-green-400">
                            US$ {getAutoPrice(card)}
                          </p>
                        )}

                      {card.source === 'catalog' && (
                        <span className="mt-3 inline-block rounded-full bg-green-500 px-2 py-1 text-xs font-bold">
                          Banco PokéBinder
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedCard && (
            <section className="rounded-3xl border border-yellow-400 bg-yellow-400/10 p-6">
              <h2 className="text-2xl font-bold text-yellow-300">
                Carta selecionada
              </h2>

              <div className="mt-6 flex flex-col gap-8 lg:flex-row">

                {getImageUrl(selectedCard) && (
                  <img
                    src={getImageUrl(selectedCard)!}
                    alt={selectedCard.name}
                    className="w-72 rounded-2xl"
                  />
                )}

                <div className="flex-1 space-y-3">

                  <h3 className="text-4xl font-bold">
                    {selectedCard.name}
                  </h3>

                  <p>
                    <strong>Set:</strong>{' '}
                    {selectedCard.set?.name}
                  </p>

                  <p>
                    <strong>Número:</strong>{' '}
                    {selectedCard.number ||
                      selectedCard.localId}
                  </p>

                  <p>
                    <strong>Raridade:</strong>{' '}
                    {selectedCard.rarity}
                  </p>

                  <p>
                    <strong>Ilustrador:</strong>{' '}
                    {getIllustrator(selectedCard) || '-'}
                  </p>

                  <p>
                    <strong>Tipo:</strong>{' '}
                    {getCardType(selectedCard) || '-'}
                  </p>

                  <p>
                    <strong>HP:</strong>{' '}
                    {getHp(selectedCard) || '-'}
                  </p>

                  <p>
                    <strong>Estágio:</strong>{' '}
                    {getStage(selectedCard) || '-'}
                  </p>

                  <p>
                    <strong>Acabamento detectado:</strong>{' '}
                    {detectFinish(selectedCard)}
                  </p>

                  {language === 'Inglês' &&
                    getAutoPrice(selectedCard) && (
                      <p className="text-xl font-bold text-green-400">
                        US$ {getAutoPrice(selectedCard)}
                      </p>
                    )}

                </div>

              </div>
            </section>
          )}

          {message && (
            <p className="text-lg text-slate-300">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-4">

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-yellow-400 px-8 py-4 text-lg font-bold text-slate-950"
            >
              {loading
                ? 'Salvando...'
                : 'Salvar carta'}
            </button>

            <Link
              href="/colecao"
              className="rounded-full border border-slate-700 px-8 py-4 font-semibold"
            >
              Ver coleção
            </Link>

          </div>

        </form>
      </div>
    </main>
  )
}