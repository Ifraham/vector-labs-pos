export default function DashboardOverviewPage() {
  return (
    <main className="px-6 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Overview
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Welcome to Vector Labs POS
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          This dashboard will grow into the main control center for products,
          sales, and invoice printing.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Products</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              Manage inventory
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Sales</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              Record transactions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Invoices</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              Print clean receipts
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
