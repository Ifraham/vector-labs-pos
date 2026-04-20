import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Vector Labs POS
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            A clean starting point for products, sales, and invoice printing.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            This project will grow step by step into a point of sale system.
            The next milestones are database setup, product management, sales
            flow, and printable invoices.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Dashboard
            </Link>

            <Link
              href="/products"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Products
            </Link>

            <Link
              href="/sales"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sales
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Next step</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                PostgreSQL + Prisma setup
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Current state</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                Project foundation is ready
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
