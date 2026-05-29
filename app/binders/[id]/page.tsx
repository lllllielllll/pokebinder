'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type Binder = {
  id: string
  name: string
  primary_color: string
  rows_count: number
  columns_count: number
  total_pages: number
}

export default function BinderDetailPage() {
  const params = useParams()
  const binderId = params.id as string

  const [binder, setBinder] = useState<Binder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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
    }

    loadBinder()
  }, [binderId])

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
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${binder.columns_count}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((_, index) => (
          <div
            key={index}
            className="flex aspect-[2.5/3.5] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 text-slate-500"
          >
            Slot {index + 1}
          </div>
        ))}
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
    </main>
  )
}