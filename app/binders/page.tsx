'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Binder = {
  id: string
  name: string
  primary_color: string
  rows_count: number
  columns_count: number
  total_pages: number
}

export default function BindersPage() {
const [binders, setBinders] = useState<Binder[]>([])

const [showCreateForm, setShowCreateForm] = useState(false)

const [binderName, setBinderName] =
  useState('Meu Binder')

const [rowsCount, setRowsCount] =
  useState(3)

const [columnsCount, setColumnsCount] =
  useState(3)

const [totalPages, setTotalPages] =
  useState(10)

const [primaryColor, setPrimaryColor] =
  useState('#facc15')

  useEffect(() => {
  async function loadBinders() {
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
      .eq('user_id', user.id)

    setBinders(data || [])
  }

  loadBinders()
}, [])

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
  <h1 className="text-5xl font-bold">
    Meus Binders
  </h1>

  <button
    onClick={() => setShowCreateForm(true)}
    className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-slate-950"
  >
    + Novo Binder
  </button>
</div>

      {showCreateForm && (
  <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="mb-4 text-2xl font-bold">
      Novo Binder
    </h2>

    <div className="space-y-4">

      <input
        value={binderName}
        onChange={(e) =>
          setBinderName(e.target.value)
        }
        placeholder="Nome do Binder"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
      />

      <input
        type="number"
        value={rowsCount}
        onChange={(e) =>
          setRowsCount(Number(e.target.value))
        }
        placeholder="Linhas"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
      />

      <input
        type="number"
        value={columnsCount}
        onChange={(e) =>
          setColumnsCount(Number(e.target.value))
        }
        placeholder="Colunas"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
      />

      <input
        type="number"
        value={totalPages}
        onChange={(e) =>
          setTotalPages(Number(e.target.value))
        }
        placeholder="Páginas"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
      />

      <input
        type="color"
        value={primaryColor}
        onChange={(e) =>
          setPrimaryColor(e.target.value)
        }
      />

      <button
        className="rounded-full bg-green-500 px-6 py-3 font-semibold"
      >
        Criar Binder
      </button>

    </div>
  </div>
)}

<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {binders.map((binder) => (
          <div
            key={binder.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold">
              {binder.name}
            </h2>

            <p className="mt-3 text-slate-400">
              Grid: {binder.rows_count} x {binder.columns_count}
            </p>

            <p className="text-slate-400">
              Páginas: {binder.total_pages}
            </p>

            <p className="text-slate-400">
              Slots totais:{' '}
              {binder.rows_count *
                binder.columns_count *
                binder.total_pages}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}