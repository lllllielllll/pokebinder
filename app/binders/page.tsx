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

  useEffect(() => {
  async function loadBinders() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('USER LOGADO:', user?.id)

    alert(`USER LOGADO: ${user?.id}`)

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data, error } = await supabase
      .from('binders')
      .select('*')
      .eq('user_id', user.id)

    console.log('ERROR:', error)
    console.log('DATA:', data)

    setBinders(data || [])
  }

  loadBinders()
}, [])

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-5xl font-bold">
        Meus Binders
      </h1>

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