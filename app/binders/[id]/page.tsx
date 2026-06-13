'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Binder = {
  id: string
  name: string
  primary_color: string
  rows_count: number
  columns_count: number
  total_pages: number
}

type Card = {
  id: string
  name: string
  image_url?: string | null
  binder_page?: number | null
  binder_slot?: number | null
}

export default function BinderDetailPage() {}
  const params = useParams()
  const binderId = params.id as string
  const [binder, setBinder] = useState<Binder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [cards, setCards] = useState<Card[]>([])
  const [collectionCards, setCollectionCards] = useState<Card[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  useEffect(() => {
    async function loadBinder() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('binders')
        .select('*')
        .eq('id', binderId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setBinder(data)

      const { data: binderCards } = await supabase
        .from('cards')
        .select('id, name, image_url, binder_page, binder_slot')
        .eq('binder_id', binderId)
        .eq('binder_page', currentPage)

      setCards(binderCards || [])
    
    const { data: allCards } = await supabase
  .from('cards')
  .select('id, name, image_url, binder_page, binder_slot')
  .is('binder_id', null)
  .not('image_url', 'is', null)
  .neq('image_url', '')
  .order('name', { ascending: true })

setCollectionCards(
  (allCards || []).filter((card) =>
    card.image_url &&
    card.image_url.startsWith('http')
  )
)
    }

    loadBinder()
  }, [binderId, currentPage])
async function addCardToSlot(cardId: string) {
  if (!selectedSlot) return

  const { error } = await supabase
    .from('cards')
    .update({
      binder_id: binderId,
      binder_page: currentPage,
      binder_slot: selectedSlot,
    })
    .eq('id', cardId)

  if (error) {
    alert(error.message)
    return
  }

  setSelectedSlot(null)

  const { data: binderCards } = await supabase
    .from('cards')
    .select('id, name, image_url, binder_page, binder_slot')
    .eq('binder_id', binderId)
    .eq('binder_page', currentPage)

  setCards(binderCards || [])

async function addCardToSlot(cardId: string) {
  if (!selectedSlot) return

  const { error } = await supabase
    .from('cards')
    .update({
      binder_id: binderId,
      binder_page: currentPage,
      binder_slot: selectedSlot,
    })
    .eq('id', cardId)

  if (error) {
    alert(error.message)
    return
  }

  setSelectedSlot(null)

  const { data: binderCards } = await supabase
    .from('cards')
    .select('id, name, image_url, binder_page, binder_slot')
    .eq('binder_id', binderId)
    .eq('binder_page', currentPage)

  setCards(binderCards || [])
}

async function removeCardFromSlot(cardId: string) {
  const { error } = await supabase
    .from('cards')
    .update({
      binder_id: null,
      binder_page: null,
      binder_slot: null,
    })
    .eq('id', cardId)

  if (error) {
    alert(error.message)
    return
  }

  setCards((current) =>
    current.filter((card) => card.id !== cardId)
  )
}
  if (!binder) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Carregando binder...
      </main>
    )
  }

  const totalSlots = binder.rows_count * binder.columns_count
  const slots = Array.from({ length: totalSlots })

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">
            {binder.name}
          </h1>

          <p className="mt-3 text-slate-400">
            Página {currentPage} de {binder.total_pages} · Grid{' '}
            {binder.rows_count} x {binder.columns_count}
          </p>
        </div>

        <a
          href="/binders"
          className="rounded-full border border-slate-700 px-6 py-3 font-semibold"
        >
          Voltar
        </a>
      </div>

      <div
        className="mx-auto grid max-w-5xl gap-4"
        style={{
          gridTemplateColumns: `repeat(${binder.columns_count}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((_, index) => {
          const slotNumber = index + 1

          const card = cards.find(
            (c) => c.binder_slot === slotNumber
          )

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
            >
              {card ? (
                <div>
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-full"
                    />
                  )}

                  <div className="p-2 text-center text-sm">
  {card.name}
</div>

<button
  type="button"
  onClick={() => removeCardFromSlot(card.id)}
  className="mx-auto mb-3 block rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-400"
>
  Remover do binder
</button>
                </div>
              ) : (
                <button
  type="button"
  onClick={() => {
    setSelectedSlot(slotNumber)
  }}
  className="flex aspect-[2.5/3.5] w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500 transition hover:border-yellow-400 hover:text-yellow-300"
>
  + Slot {slotNumber}
</button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="rounded-full border border-slate-700 px-6 py-3 disabled:opacity-40"
        >
          Página anterior
        </button>

        <button
          type="button"
          disabled={currentPage === binder.total_pages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="rounded-full border border-slate-700 px-6 py-3 disabled:opacity-40"
        >
          Próxima página
        </button>
      </div>
          {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Escolher carta para o slot {selectedSlot}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="rounded-full border border-slate-700 px-4 py-2"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collectionCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => addCardToSlot(card.id)}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-yellow-400"
                >
                  {card.image_url && (
                    <img
                      src={card.image_url || ''}
                      alt={card.name}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                      className="mb-3 w-28 rounded-xl"
                    />
                  )}

                  <p className="font-semibold">
                    {card.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}