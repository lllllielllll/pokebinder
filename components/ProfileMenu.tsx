'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfileMenu() {
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setEmail(user?.email || null)
    }

    loadUser()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="fixed right-6 top-24 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-lg font-bold text-yellow-300 shadow-lg"
      >
        {email ? email[0].toUpperCase() : '?'}
      </button>

      {open && (
        <div className="mt-3 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-xl">
          <p className="text-xs text-slate-400">Logado como</p>
          <p className="mt-1 break-all text-sm font-semibold">
            {email || 'Não logado'}
          </p>

          <div className="mt-4 space-y-2">
            <Link
              href="/perfil"
              className="block rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            >
              Editar perfil
            </Link>

            <button
              onClick={logout}
              className="w-full rounded-xl bg-red-500 px-4 py-2 text-left text-sm font-semibold text-white hover:bg-red-400"
            >
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}