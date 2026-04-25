import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <section className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold">Gestão Frete</h1>

        <p className="text-slate-300 text-lg">
          Conecte gestores de frete e caminhoneiros disponíveis de forma simples,
          rápida e organizada.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-white text-slate-950 px-6 py-3 rounded-xl font-semibold"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="border border-white px-6 py-3 rounded-xl font-semibold"
          >
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}
