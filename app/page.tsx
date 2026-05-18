export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
          PokéBinder
        </p>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Sua coleção Pokémon TCG organizada, bonita e compartilhável.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Cadastre suas cartas, acompanhe idiomas, condições, valores, repetidas,
          wishlist e compartilhe seu binder com amigos.
        </p>
      </section>
    </main>
  )
}