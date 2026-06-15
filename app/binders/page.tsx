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
  cards_count?: number
}

export default function BindersPage() {
  const [binders, setBinders] = useState<Binder[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBinderId, setEditingBinderId] = useState<string | null>(null)

  const [editBinderName, setEditBinderName] = useState('')
  const [editBinderDescription, setEditBinderDescription] = useState('')
  const [editCoverImageUrl, setEditCoverImageUrl] = useState('')

  const [binderName, setBinderName] = useState('Meu Binder')
  const [binderDescription, setBinderDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  const [rowsCount, setRowsCount] = useState(3)
  const [columnsCount, setColumnsCount] = useState(3)
  const [totalPages, setTotalPages] = useState(10)
  const [primaryColor, setPrimaryColor] = useState('#facc15')

  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingEditCover, setUploadingEditCover] = useState(false)

  useEffect(() => {
    async function loadBinders() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data } = await supabase
        .from('binders')
        .select(`
          *,
          cards_count:cards(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const bindersWithCount = (data || []).map((binder) => ({
        ...binder,
        cards_count: binder.cards_count?.[0]?.count || 0,
      }))

      setBinders(bindersWithCount)
    }

    loadBinders()
  }, [])

  async function uploadBinderCover(file: File, mode: 'create' | 'edit') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    if (mode === 'create') {
      setUploadingCover(true)
    } else {
      setUploadingEditCover(true)
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`
    const filePath = `covers/${fileName}`

    const { error } = await supabase.storage
      .from('binder-covers')
      .upload(filePath, file, {
        upsert: true,
      })

    if (error) {
      alert(`Erro ao enviar capa: ${error.message}`)
      setUploadingCover(false)
      setUploadingEditCover(false)
      return
    }

    const { data } = supabase.storage
      .from('binder-covers')
      .getPublicUrl(filePath)

    if (mode === 'create') {
      setCoverImageUrl(data.publicUrl)
      setUploadingCover(false)
    } else {
      setEditCoverImageUrl(data.publicUrl)
      setUploadingEditCover(false)
    }
  }

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
        description: binderDescription || null,
        cover_image_url: coverImageUrl || null,
        rows_count: rowsCount,
        columns_count: columnsCount,
        total_pages: totalPages,
        primary_color: primaryColor,
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
    setBinderDescription('')
    setCoverImageUrl('')
    setRowsCount(3)
    setColumnsCount(3)
    setTotalPages(10)
    setPrimaryColor('#facc15')
  }

  function startEditingBinder(binder: Binder) {
    setEditingBinderId(binder.id)
    setEditBinderName(binder.name)
    setEditBinderDescription(binder.description || '')
    setEditCoverImageUrl(binder.cover_image_url || '')
  }

  async function saveBinderEdit(binderId: string) {
    const { error } = await supabase
      .from('binders')
      .update({
        name: editBinderName,
        description: editBinderDescription || null,
        cover_image_url: editCoverImageUrl || null,
      })
      .eq('id', binderId)

    if (error) {
      alert(error.message)
      return
    }

    setBinders((current) =>
      current.map((binder) =>
        binder.id === binderId
          ? {
              ...binder,
              name: editBinderName,
              description: editBinderDescription || null,
              cover_image_url: editCoverImageUrl || null,
            }
          : binder
      )
    )

    setEditingBinderId(null)
  }

  async function deleteBinder(binderId: string) {
    const confirmDelete = confirm(
      'Tem certeza que deseja excluir este binder? As cartas não serão apagadas, apenas ficarão sem binder.'
    )

    if (!confirmDelete) return

    await supabase
      .from('cards')
      .update({
        binder_id: null,
        binder_page: null,
        binder_slot: null,
      })
      .eq('binder_id', binderId)

    const { error } = await supabase
      .from('binders')
      .delete()
      .eq('id', binderId)

    if (error) {
      alert(error.message)
      return
    }

    setBinders((current) =>
      current.filter((binder) => binder.id !== binderId)
    )
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
              onChange={(e) => setBinderName(e.target.value)}
              placeholder="Nome do Binder"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <textarea
              value={binderDescription}
              onChange={(e) => setBinderDescription(e.target.value)}
              placeholder="Descrição do binder"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">
                📤 Capa do binder
              </label>

              <input
                type="file"
                accept="image/*"
                disabled={uploadingCover}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    uploadBinderCover(file, 'create')
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              {uploadingCover && (
                <p className="mt-2 text-sm text-yellow-300">
                  Enviando capa...
                </p>
              )}

              {coverImageUrl && !uploadingCover && (
                <div className="mt-3">
                  <img
                    src={coverImageUrl}
                    alt="Preview da capa"
                    className="h-40 w-full max-w-md rounded-2xl object-cover"
                  />

                  <p className="mt-2 text-xs text-green-400">
                    ✓ Capa pronta para salvar
                  </p>
                </div>
              )}
            </div>

            <input
              type="number"
              value={rowsCount}
              onChange={(e) => setRowsCount(Number(e.target.value))}
              placeholder="Linhas"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="number"
              value={columnsCount}
              onChange={(e) => setColumnsCount(Number(e.target.value))}
              placeholder="Colunas"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value))}
              placeholder="Páginas"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />

            <div>
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
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {binders.map((binder) => (
          <Link
            href={`/binders/${binder.id}`}
            key={binder.id}
            className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:border-yellow-400"
          >
            {binder.cover_image_url ? (
              <img
                src={binder.cover_image_url}
                alt={binder.name}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div
                className="flex h-48 w-full items-center justify-center text-4xl font-bold text-slate-950"
                style={{ backgroundColor: binder.primary_color || '#facc15' }}
              >
                {binder.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold">
                {binder.name}
              </h2>

              {binder.description && (
                <p className="mt-2 text-sm text-slate-400">
                  {binder.description}
                </p>
              )}

              <p className="mt-4 text-slate-400">
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

              {(() => {
                const totalSlots =
                  binder.rows_count *
                  binder.columns_count *
                  binder.total_pages

                const filledSlots = binder.cards_count || 0

                const percent =
                  totalSlots > 0
                    ? Math.round((filledSlots / totalSlots) * 100)
                    : 0

                return (
                  <div className="mt-4">
                    <p className="text-sm text-slate-300">
                      {filledSlots} / {totalSlots} slots preenchidos
                    </p>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {percent}% completo
                    </p>
                  </div>
                )
              })()}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    startEditingBinder(binder)
                  }}
                  className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    deleteBinder(binder.id)
                  }}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                >
                  Excluir
                </button>
              </div>

              {editingBinderId === binder.id && (
                <div className="mt-5 space-y-3 rounded-2xl bg-slate-950 p-4">
                  <input
                    value={editBinderName}
                    onChange={(e) => setEditBinderName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                  />

                  <textarea
                    value={editBinderDescription}
                    onChange={(e) =>
                      setEditBinderDescription(e.target.value)
                    }
                    placeholder="Descrição"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      📤 Nova capa
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingEditCover}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          uploadBinderCover(file, 'edit')
                        }
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                    />

                    {uploadingEditCover && (
                      <p className="mt-2 text-sm text-yellow-300">
                        Enviando nova capa...
                      </p>
                    )}

                    {editCoverImageUrl && !uploadingEditCover && (
                      <div className="mt-3">
                        <img
                          src={editCoverImageUrl}
                          alt="Preview da nova capa"
                          className="h-32 w-full rounded-2xl object-cover"
                        />

                        <p className="mt-2 text-xs text-green-400">
                          ✓ Nova capa pronta para salvar
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault()
                        saveBinderEdit(binder.id)
                      }}
                      className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950"
                    >
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault()
                        setEditingBinderId(null)
                      }}
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}