'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Binder = {
  id: string
  name: string
  description: string | null
  cover_image_url: string | null

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

const [binderDescription, setBinderDescription] =
  useState('')

const [coverImageUrl, setCoverImageUrl] =
  useState('')

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

  .order('created_at', { ascending: false })

    setBinders(data || [])
  }

  loadBinders()
}, [])

async function createBinder() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = '/login'
    return
  }

  const { data, error } = await supabase
    .from('binders')
    .insert({
      user_id: user.id,
      name: binderName,
      rows_count: rowsCount,
      columns_count: columnsCount,
      total_pages: totalPages,
      primary_color: primaryColor,
      description: binderDescription,
      cover_image_url: coverImageUrl,
    })
    .select()
    .single()

  if (error) {
    alert(error.message)
    return
  }

  setBinders([data, ...binders])
  setShowCreateForm(false)
  setBinderName('Meu Binder')
  setRowsCount(3)
  setColumnsCount(3)
  setTotalPages(10)
  setPrimaryColor('#facc15')
  }

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

      <textarea
  value={binderDescription}
  onChange={(e) =>
    setBinderDescription(e.target.value)
  }
  placeholder="Descrição do binder"
  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
/>

<input
  value={coverImageUrl}
  onChange={(e) =>
    setCoverImageUrl(e.target.value)
  }
  placeholder="URL da capa"
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
  type="button"
  onClick={createBinder}
  className="rounded-full bg-green-500 px-6 py-3 font-semibold"
>
  Criar Binder
</button>

<button
  type="button"
  onClick={() => setShowCreateForm(false)}
  className="ml-3 rounded-full border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-400"
>
  Cancelar
</button>

    </div>
  </div>
)}

<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {binders.map((binder) => (
          <Link
            href={`/binders/${binder.id}`}
            key={binder.id}
            className="block rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-yellow-400"
            >
            <h2 className="text-2xl font-bold">
              {binder.name}

              {binder.cover_image_url && (
  <img
    src={binder.cover_image_url}
    alt={binder.name}
    className="mb-4 h-48 w-full rounded-2xl object-cover"
  />
)}

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
          </Link>
        ))}
      </div>
    </main>
  )
}