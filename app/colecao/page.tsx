'use client'

import ProfileMenu from '@/components/ProfileMenu'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Card = {
  id: string
  name: string
  created_at: string
  language?: string
  condition?: string
  quantity?: number
  variant?: string
  image_url?: string
  set_name?: string
  card_number?: string
  rarity?: string
  auto_price?: number | null
  api_card_id?: string | null
  binder_page?: number | null
  binder_slot?: number | null
  manual_price?: number | null
  manual_price_currency?: string | null
  manual_price_updated_at?: string | null
  }

function getLanguageFlag(language: string) {
  switch (language) {
    case 'Português':
      return '🇧🇷'
    case 'Inglês':
      return '🇺🇸'
    case 'Japonês':
      return '🇯🇵'
    case 'Alemão':
      return '🇩🇪'
    case 'Francês':
      return '🇫🇷'
    case 'Italiano':
      return '🇮🇹'
    case 'Espanhol':
      return '🇪🇸'
    case 'Coreano':
      return '🇰🇷'
    case 'Chinês Simplificado':
      return '🇨🇳'
    case 'Chinês Tradicional':
      return '🇹🇼'
    case 'Tailandês':
      return '🇹🇭'
    case 'Indonésio':
      return '🇮🇩'
    default:
      return '🌍'
  }
}

export default function ColecaoPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editLanguage, setEditLanguage] = useState('')
  const [editCondition, setEditCondition] = useState('')
  const [editVariant, setEditVariant] = useState('')
  const [editQuantity, setEditQuantity] = useState(1)
  const [editManualPrice, setEditManualPrice] = useState('')
  const [editManualPriceCurrency, setEditManualPriceCurrency] = useState('BRL')

  const [isPlacingInBinder, setIsPlacingInBinder] = useState(false)
  const [targetBinderPage, setTargetBinderPage] = useState(1)
  const [targetBinderSlot, setTargetBinderSlot] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [languageFilter, setLanguageFilter] = useState('Todos')
  const [conditionFilter, setConditionFilter] = useState('Todas')
  const [variantFilter, setVariantFilter] = useState('Todas')
  const [sortBy, setSortBy] = useState('recent')

  const [viewMode, setViewMode] = useState<'grid' | 'binder'>('grid')
  const [binderPage, setBinderPage] = useState(1)
  const [maxBinderPages, setMaxBinderPages] = useState(1)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)

  const [usdToBrl, setUsdToBrl] = useState(5.1)
  const [exchangeUpdatedAt, setExchangeUpdatedAt] = useState('')

  useEffect(() => {
    async function fetchCards() {
    
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
  window.location.href = '/login'
  return
}

const { data, error } = await supabase
  .from('cards')
  .select('*')
  .eq('user_id', user.id)
  
        .order('created_at', { ascending: false })

      setCards(data || [])
    }

    fetchCards()
  }, [])

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const response = await fetch(
          'https://economia.awesomeapi.com.br/json/last/USD-BRL'
        )

        const data = await response.json()
        const rate = Number(data.USDBRL.bid)

        if (!Number.isNaN(rate)) {
          setUsdToBrl(rate)
          setExchangeUpdatedAt(new Date().toLocaleString('pt-BR'))
        }
      } catch {
        console.log('Não foi possível buscar a cotação atual.')
      }
    }

    fetchExchangeRate()

    const interval = setInterval(() => {
      fetchExchangeRate()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  async function deleteCard(cardId: string) {
    const confirmDelete = confirm('Tem certeza que deseja excluir esta carta?')

    if (!confirmDelete) return

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }

    setCards((currentCards) =>
      currentCards.filter((card) => card.id !== cardId)
    )

    setSelectedCard(null)
  }

  function startEditing(card: Card) {
    setIsEditing(true)
    setEditLanguage(card.language || 'Português')
    setEditCondition(card.condition || 'NM')
    setEditVariant(card.variant || 'Todas')
    setEditQuantity(card.quantity || 1)
    setEditManualPrice(
      card.manual_price?.toString() || ''
    )
    setEditManualPriceCurrency(
  card.manual_price_currency || 'BRL'
)
  }

  async function saveEdit() {
    if (!selectedCard) return
    if (!selectedCard) return

   const manualPriceValue =
  editManualPrice === '' ? null : Number(editManualPrice)

const manualPriceUpdatedAt =
  editManualPrice === '' ? null : new Date().toISOString()

console.log('manualPriceValue', manualPriceValue)
console.log('manualPriceUpdatedAt', manualPriceUpdatedAt)

const updateData = {
  language: editLanguage,
  condition: editCondition,
  variant: editVariant,
  quantity: editQuantity,

  manual_price: manualPriceValue,
  manual_price_currency: editManualPriceCurrency,
  manual_price_updated_at: manualPriceUpdatedAt,
}

    const { error } = await supabase
  .from('cards')
  .update(updateData)
  .eq('id', selectedCard.id)

    if (error) {
      alert(`Erro ao editar: ${error.message}`)
      return
    }

    const updatedCard = {
      ...selectedCard,
      language: editLanguage,
      condition: editCondition,
      variant: editVariant,
      quantity: editQuantity,
      manual_price: editManualPrice === '' ? null : Number(editManualPrice),
      manual_price_currency: editManualPriceCurrency,
      manual_price_updated_at: editManualPrice === '' ? null : new Date().toISOString(),
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === selectedCard.id ? updatedCard : card
      )
    )

    setSelectedCard(updatedCard)
    setIsEditing(false)
  }

  async function updateCardPrices() {
    alert('Começando atualização de preços...')

    const cardsWithApiId = cards.filter((card) => card.api_card_id)

    alert(`Cartas encontradas com API ID: ${cardsWithApiId.length}`)

    if (cardsWithApiId.length === 0) {
      alert('Nenhuma carta com ID da API para atualizar.')
      return
    }

    for (const card of cardsWithApiId) {
      try {
        const response = await fetch(
          `https://api.pokemontcg.io/v2/cards/${card.api_card_id}`
        )

        const data = await response.json()
        const apiCard = data.data

        const newPrice =
          apiCard?.tcgplayer?.prices?.holofoil?.market ||
          apiCard?.tcgplayer?.prices?.reverseHolofoil?.market ||
          apiCard?.tcgplayer?.prices?.normal?.market ||
          null

        await supabase
          .from('cards')
          .update({
            auto_price: newPrice,
          })
          .eq('id', card.id)

        setCards((currentCards) =>
          currentCards.map((currentCard) =>
            currentCard.id === card.id
              ? { ...currentCard, auto_price: newPrice }
              : currentCard
          )
        )
      } catch {
        console.log(`Erro ao atualizar preço de ${card.name}`)
      }
    }

    alert('Preços atualizados!')
  }

  async function placeCardInBinder() {
    if (!selectedCard) return

    const { error } = await supabase
      .from('cards')
      .update({
        binder_page: targetBinderPage,
        binder_slot: targetBinderSlot,
      })
      .eq('id', selectedCard.id)

    if (error) {
      alert(`Erro ao mover carta: ${error.message}`)
      return
    }

    const updatedCard = {
      ...selectedCard,
      binder_page: targetBinderPage,
      binder_slot: targetBinderSlot,
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === selectedCard.id ? updatedCard : card
      )
    )

    setSelectedCard(updatedCard)
    setIsPlacingInBinder(false)
    alert('Carta adicionada ao binder!')
  }

  async function moveCardToSlot(slotNumber: number) {
    if (!draggedCardId) return

    const draggedCard = cards.find((card) => card.id === draggedCardId)

    if (!draggedCard) return

    const cardAlreadyInSlot = cards.find((card) => {
      return (
        (card.binder_page || 1) === binderPage &&
        card.binder_slot === slotNumber
      )
    })

    const oldPage = draggedCard.binder_page || 1
    const oldSlot = draggedCard.binder_slot || null

    const { error } = await supabase
      .from('cards')
      .update({
        binder_page: binderPage,
        binder_slot: slotNumber,
      })
      .eq('id', draggedCard.id)

    if (error) {
      alert(`Erro ao mover carta: ${error.message}`)
      return
    }

    if (cardAlreadyInSlot) {
      const { error: swapError } = await supabase
        .from('cards')
        .update({
          binder_page: oldPage,
          binder_slot: oldSlot,
        })
        .eq('id', cardAlreadyInSlot.id)

      if (swapError) {
        alert(`Erro ao trocar cartas: ${swapError.message}`)
        return
      }
    }

    setCards((currentCards) =>
      currentCards.map((card) => {
        if (card.id === draggedCard.id) {
          return {
            ...card,
            binder_page: binderPage,
            binder_slot: slotNumber,
          }
        }

        if (cardAlreadyInSlot && card.id === cardAlreadyInSlot.id) {
          return {
            ...card,
            binder_page: oldPage,
            binder_slot: oldSlot,
          }
        }

        return card
      })
    )

    setDraggedCardId(null)
  }

  function getCollectionImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null

  if (
    imageUrl.endsWith('.png') ||
    imageUrl.endsWith('.jpg') ||
    imageUrl.endsWith('.jpeg') ||
    imageUrl.endsWith('.webp')
  ) {
    return imageUrl
  }

  return `${imageUrl}/high.webp`
}

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.set_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLanguage =
      languageFilter === 'Todos' || card.language === languageFilter

    const matchesCondition =
      conditionFilter === 'Todas' || card.condition === conditionFilter

    const matchesVariant =
      variantFilter === 'Todas' || card.variant === variantFilter

    return (
      matchesSearch &&
      matchesLanguage &&
      matchesCondition &&
      matchesVariant
    )
  })

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'price-high') {
      return (b.auto_price || 0) - (a.auto_price || 0)
    }

    if (sortBy === 'price-low') {
      return (a.auto_price || 0) - (b.auto_price || 0)
    }

    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }

    if (sortBy === 'rarity') {
      return (b.rarity || '').localeCompare(a.rarity || '')
    }

    return 0
  })

  const cardsPerPage = 16

  const binderPageCards = cards.filter((card) => {
    return (card.binder_page || 1) === binderPage
  })

  const binderSlots = Array.from({ length: 16 }, (_, index) => {
    const slotNumber = index + 1

    const cardInSlot = binderPageCards.find((card) => {
      return card.binder_slot === slotNumber
    })

    return {
      slotNumber,
      card: cardInSlot || null,
    }
  })

  const totalBinderPages = Math.max(
    maxBinderPages,
    Math.ceil(cards.length / cardsPerPage),
    1
  )

  const totalUniqueCards = cards.length

  const totalQuantity = cards.reduce((sum, card) => {
    return sum + (card.quantity || 1)
  }, 0)

  function getCardValueUsd(card: Card) {
  const quantity = card.quantity || 1

  if (card.manual_price && card.manual_price_currency === 'BRL') {
    return (Number(card.manual_price) / usdToBrl) * quantity
  }

  if (card.manual_price && card.manual_price_currency === 'USD') {
    return Number(card.manual_price) * quantity
  }

  return (card.auto_price || 0) * quantity
}

const totalUsd = cards.reduce((sum, card) => {
  return sum + getCardValueUsd(card)
}, 0)

const totalBrl = totalUsd * usdToBrl

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <ProfileMenu />

      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              PokéBinder
            </p>

            <h1 className="mt-3 text-5xl font-bold">
              Minha coleção
            </h1>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-full px-5 py-2 font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-slate-800 text-white'
                }`}
              >
                Grid
              </button>

              <button
                onClick={() => setViewMode('binder')}
                className={`rounded-full px-5 py-2 font-semibold transition ${
                  viewMode === 'binder'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-slate-800 text-white'
                }`}
              >
                Binder 4x4
              </button>
            </div>

            <p className="mt-3 text-slate-400">
              {filteredCards.length} cartas exibidas de {cards.length} cadastradas
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Cartas únicas</p>
                <p className="mt-1 text-2xl font-bold">{totalUniqueCards}</p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Quantidade total</p>
                <p className="mt-1 text-2xl font-bold">{totalQuantity}</p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Valor em USD</p>
                <p className="mt-1 text-2xl font-bold text-yellow-400">
                  US$ {totalUsd.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Valor em BRL</p>
                <p className="mt-1 text-2xl font-bold text-green-400">
                  R$ {totalBrl.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Dólar: R$ {usdToBrl.toFixed(2)}
                  {exchangeUpdatedAt && ` · Atualizado em ${exchangeUpdatedAt}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={updateCardPrices}
              className="rounded-full bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Atualizar preços
            </button>

            <Link
              href="/adicionar"
              className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950 hover:bg-yellow-300"
            >
              Adicionar carta
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-2xl font-bold">Filtrar coleção</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome ou set..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option>Todos</option>
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

            <select
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option>Todas</option>
              <option>NM</option>
              <option>LP</option>
              <option>MP</option>
              <option>HP</option>
            </select>

            <select
              value={variantFilter}
              onChange={(event) => setVariantFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option>Todas</option>
              <option>Normal</option>
              <option>Reverse Holo</option>
              <option>Holo</option>
              <option>Full Art</option>
              <option>Alt Art</option>
              <option>Gold</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="recent">Mais recentes</option>
              <option value="price-high">Maior preço</option>
              <option value="price-low">Menor preço</option>
              <option value="name">Nome (A-Z)</option>
              <option value="rarity">Raridade</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('')
              setLanguageFilter('Todos')
              setConditionFilter('Todas')
              setVariantFilter('Todas')
              setSortBy('recent')
              setBinderPage(1)
            }}
            className="mt-4 rounded-full border border-slate-700 px-5 py-2 text-sm hover:border-slate-400"
          >
            Limpar filtros
          </button>
        </div>

        <div
          className={
            viewMode === 'binder'
              ? 'mt-12 grid grid-cols-4 gap-6 rounded-[40px] border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-10 shadow-[0_0_80px_rgba(0,0,0,0.7)]'
              : 'mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'
          }
        >
          {viewMode === 'binder'
            ? binderSlots.map((slot) => (
                <article
                  key={slot.slotNumber}
                  draggable={!!slot.card}
                  onDragStart={() => {
                    if (slot.card) {
                      setDraggedCardId(slot.card.id)
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                  }}
                  onDrop={() => moveCardToSlot(slot.slotNumber)}
                  onClick={() => {
                    if (slot.card) {
                      setSelectedCard(slot.card)
                      setIsEditing(false)
                    }
                  }}
                  className={`group relative aspect-[2.5/3.5] cursor-pointer overflow-hidden rounded-2xl border p-3 shadow-2xl transition duration-300 ${
                    slot.card
                      ? 'border-slate-600 bg-white/5 backdrop-blur-sm hover:scale-[1.03] hover:border-yellow-400'
                      : 'border-dashed border-slate-700 bg-slate-900/40'
                  }`}
                >
                  {slot.card?.image_url ? (
                    <img
                      src={slot.card.image_url}
                      alt={slot.card.name}
                      className="h-full w-full rounded-xl object-contain transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-600">
                      Slot {slot.slotNumber}
                    </div>
                  )}
                </article>
              ))
            : sortedCards.map((card) => (
                <article
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card)
                    setIsEditing(false)
                  }}
                  className="group relative cursor-pointer rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition hover:scale-[1.02] hover:border-yellow-400"
                >
                  {getCollectionImageUrl(card.image_url) ? (
                    <>
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/80 px-2 py-1 text-sm shadow-lg backdrop-blur">
                        {getLanguageFlag(card.language || '')}
                      </div>

                      <img
                        src={getCollectionImageUrl(card.image_url) || ''}
                        alt={card.name}
                        className="mx-auto mb-5 w-full max-w-[240px] rounded-2xl"
                      />
                    </>
                  ) : (
                    <div className="mb-5 flex h-80 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                      Sem imagem
                    </div>
                  )}

                  <h2 className="text-2xl font-bold">
                    {card.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {card.set_name || 'Set não informado'}
                  </p>

                  <p className="text-sm text-slate-400">
                    Nº {card.card_number || '—'} · {card.rarity || 'Sem raridade'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                      {card.language || 'Idioma não informado'}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                      {card.condition || 'Sem condição'}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                      {card.variant || 'Sem variante'}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                      Qtd: {card.quantity || 1}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">
  {card.manual_price ? `Preço manual (${card.manual_price_currency || 'BRL'})` : 'Preço automático'}
</p>

                    <p className="mt-1 text-2xl font-bold text-yellow-400">
                      {card.manual_price
                        ? `R$ ${Number(card.manual_price).toFixed(2)}`
                        : card.auto_price
                          ? `US$ ${card.auto_price}`
                          : 'Sem preço'}
                    </p>
                    {selectedCard?.manual_price_updated_at ? (
  <p className="mt-2 text-sm text-slate-400">
    Atualizado em{' '}
    {new Date(selectedCard.manual_price_updated_at).toLocaleDateString('pt-BR')}
  </p>
) : null}
                  </div>
                </article>
              ))}
        </div>

        {viewMode === 'binder' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setBinderPage((current) => Math.max(current - 1, 1))
                }
                className="rounded-full bg-slate-800 px-5 py-2 font-semibold text-white hover:bg-slate-700"
              >
                ← Página anterior
              </button>

              <div className="rounded-full bg-slate-900 px-6 py-2 font-semibold">
                Página {binderPage} de {totalBinderPages || 1}
              </div>

              <button
                onClick={() =>
                  setBinderPage((current) =>
                    Math.min(current + 1, totalBinderPages || 1)
                  )
                }
                className="rounded-full bg-slate-800 px-5 py-2 font-semibold text-white hover:bg-slate-700"
              >
                Próxima página →
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setMaxBinderPages((current) => current + 1)
                  setBinderPage(totalBinderPages + 1)
                }}
                className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-400"
              >
                ➕ Nova página
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="max-w-4xl rounded-3xl bg-slate-900 p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                {getCollectionImageUrl(selectedCard.image_url) ? (
                  <img
                    src={getCollectionImageUrl(selectedCard.image_url) || ''}
                    alt={selectedCard.name}
                    className="max-h-[420px] w-auto rounded-3xl object-contain"
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center rounded-3xl bg-slate-950">
                    Sem imagem
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
                  {selectedCard.set_name || 'Pokémon TCG'}
                </p>

                <h2 className="mt-3 text-5xl font-bold">
                  {selectedCard.name}
                </h2>

                <div className="mt-6 space-y-3 text-lg text-slate-300">
                  <p><strong>Idioma:</strong> {selectedCard.language}</p>
                  <p><strong>Condição:</strong> {selectedCard.condition}</p>
                  <p><strong>Variante:</strong> {selectedCard.variant}</p>
                  <p><strong>Raridade:</strong> {selectedCard.rarity || '—'}</p>
                  <p><strong>Número:</strong> {selectedCard.card_number || '—'}</p>
                  <p><strong>Quantidade:</strong> {selectedCard.quantity}</p>
                </div>

                <div className="mt-8 rounded-3xl bg-slate-950 p-6">
                  <p className="text-sm text-slate-400">
  {selectedCard.manual_price
    ? `Preço manual (${selectedCard.manual_price_currency || 'BRL'})`
    : 'Preço automático'}
</p>

                  <p className="mt-1 text-2xl font-bold text-yellow-400">
                    {selectedCard.manual_price
                      ? `R$ ${Number(selectedCard.manual_price).toFixed(2)}`
                      : selectedCard.auto_price
                        ? `US$ ${selectedCard.auto_price}`
                        : 'Sem preço'}
                  </p>
                </div>

                {isEditing ? (
                  <div className="mt-8 max-h-[70vh] space-y-4 overflow-y-auto rounded-3xl bg-slate-950 p-6">
                    <h3 className="text-xl font-bold">Editar carta</h3>

                    <div>
                      <label className="mb-2 block text-sm">Idioma</label>
                      <select
                        value={editLanguage}
                        onChange={(event) => setEditLanguage(event.target.value)}
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
                      <label className="mb-2 block text-sm">Condição</label>
                      <select
                        value={editCondition}
                        onChange={(event) => setEditCondition(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                      >
                        <option>NM</option>
                        <option>LP</option>
                        <option>MP</option>
                        <option>HP</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">Variante</label>
                      <select
                        value={editVariant}
                        onChange={(event) => setEditVariant(event.target.value)}
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
                      <label className="mb-2 block text-sm">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(event) =>
                          setEditQuantity(Number(event.target.value))
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">
                        Preço manual (R$)
                        <div>
  <label className="mb-2 block text-sm">
    Moeda do preço manual
  </label>

  <select
    value={editManualPriceCurrency}
    onChange={(event) =>
      setEditManualPriceCurrency(event.target.value)
    }
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
  >
    <option value="BRL">BRL — Real</option>
    <option value="USD">USD — Dólar</option>
  </select>
</div>
                      </label>

                      <input
                        type="number"
                        step="0.01"
                        value={editManualPrice}
                        onChange={(event) =>
                          setEditManualPrice(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveEdit}
                        className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
                      >
                        Salvar edição
                      </button>

                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(selectedCard)}
                    className="mt-8 mr-3 rounded-full bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
                  >
                    Editar carta
                  </button>
                )}

                <button
                  onClick={() => setIsPlacingInBinder(true)}
                  className="mt-8 mr-3 rounded-full bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
                >
                  Colocar no binder
                </button>

                {isPlacingInBinder && (
                  <div className="mt-6 space-y-4 rounded-3xl bg-slate-950 p-6">
                    <h3 className="text-xl font-bold">Escolher posição no binder</h3>

                    <div>
                      <label className="mb-2 block text-sm">Página</label>
                      <input
                        type="number"
                        min="1"
                        value={targetBinderPage}
                        onChange={(event) =>
                          setTargetBinderPage(Number(event.target.value))
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">Slot</label>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        value={targetBinderSlot}
                        onChange={(event) =>
                          setTargetBinderSlot(Number(event.target.value))
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                      />
                    </div>

                    <button
                      onClick={placeCardInBinder}
                      className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
                    >
                      Salvar no binder
                    </button>
                  </div>
                )}

                <button
                  onClick={() => deleteCard(selectedCard.id)}
                  className="mt-8 mr-3 rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-400"
                >
                  Excluir carta
                </button>

                <button
                  onClick={() => setSelectedCard(null)}
                  className="mt-8 rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}