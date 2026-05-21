'use client'

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      window.location.href = '/colecao'
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="mb-6 text-3xl font-bold text-white">
          Entrar no PokéBinder
        </h1>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
          }}
          providers={[]}
          theme="dark"
          redirectTo={
            typeof window !== 'undefined'
              ? `${window.location.origin}/colecao`
              : undefined
          }
        />
      </div>
    </main>
  )
}