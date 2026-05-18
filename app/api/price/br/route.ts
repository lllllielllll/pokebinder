import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const name = searchParams.get('name') || ''
  const number = searchParams.get('number') || ''

  const searchUrl = `https://www.ligapokemon.com.br/?view=cards/search&card=${encodeURIComponent(
    `${name} ${number}`
  )}`

  return NextResponse.json({
    provider: 'LigaPokemon',
    url: searchUrl,
    price: null,
    pricesFound: [],
    message:
      'Preço brasileiro automático desativado temporariamente. LigaPokemon/MYP bloqueiam scraping automático.',
  })
}