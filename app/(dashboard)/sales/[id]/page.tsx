import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/sales/print-button";
import { prisma } from "@/lib/prisma";

export default async function SaleInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Read the sale id from the route.
  const { id } = await params;

  // Load one sale with its related line items.
  const sale = await prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!sale) {
    notFound();
  }

  return (
    <main className="px-6 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Invoice
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
              Sale invoice
            </h1>

            <p className="mt-3 text-base text-slate-600">
              Review the sale details and print this invoice from the browser.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/sales"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </Link>

            <PrintButton />
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Vector Labs POS
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Invoice #{sale.id.slice(-8).toUpperCase()}
              </h2>
            </div>

            <div className="text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Customer:</span>{" "}
                {sale.customerName || "Walk-in customer"}
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-900">Date:</span>{" "}
                {sale.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
              <p>Product</p>
              <p>Unit price</p>
              <p>Quantity</p>
              <p>Line total</p>
            </div>

            <div className="divide-y divide-slate-200">
              {sale.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 gap-4 px-5 py-4 text-sm text-slate-700"
                >
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p>৳{item.unitPrice.toString()}</p>
                  <p>{item.quantity}</p>
                  <p className="font-medium text-slate-900">
                    ৳{item.lineTotal.toString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Total items</span>
                <span>{sale.items.length}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-base font-semibold text-slate-900">
                  Grand total
                </span>
                <span className="text-2xl font-semibold text-slate-900">
                  ৳{sale.totalAmount.toString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
