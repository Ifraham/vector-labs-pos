import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SaleForm } from "@/components/sales/sale-form";
import { prisma } from "@/lib/prisma";

type SaleFormState = {
  error: string | null;
};

export default async function SalesPage() {
  // Load products so they can be selected in the sale form.
  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Load recent sales so we can see that creation is working.
  const sales = await prisma.sale.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  // Server action for creating a simple one-product sale.
  async function createSale(
    _state: SaleFormState,
    formData: FormData
  ): Promise<SaleFormState> {
    "use server";

    const customerName = formData.get("customerName")?.toString().trim() || null;
    const productId = formData.get("productId")?.toString() ?? "";
    const quantityValue = formData.get("quantity")?.toString() ?? "";
    const quantity = Number(quantityValue);

    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      return {
        error: "Please select a product and enter a valid quantity.",
      };
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return {
        error: "The selected product could not be found.",
      };
    }

    // Prevent selling more than the available stock.
    if (quantity > product.stock) {
      return {
        error: `Only ${product.stock} unit(s) available in stock.`,
      };
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice.mul(quantity);

    // Create the sale and its one sale item together.
    await prisma.sale.create({
      data: {
        customerName,
        totalAmount: lineTotal,
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              unitPrice,
              quantity,
              lineTotal,
            },
          ],
        },
      },
    });

    // Reduce stock after the sale is created.
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    revalidatePath("/sales");
    revalidatePath("/products");
    redirect("/sales");
  }

  const formProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price.toString(),
    stock: product.stock,
  }));

  return (
    <main className="px-6 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Sales
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Sales flow will start here.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          This page now creates a basic one-product sale and stores it in the
          database with snapshot sale item data.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SaleForm products={formProducts} action={createSale} />

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent sales
              </h2>
            </div>

            {sales.length === 0 ? (
              <p className="px-6 py-6 text-slate-600">No sales yet.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {sales.map((sale) => (
                  <div key={sale.id} className="px-6 py-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Customer</p>
                        <p className="font-semibold text-slate-900">
                          {sale.customerName || "Walk-in customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="font-semibold text-slate-900">
                          ৳{sale.totalAmount.toString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View invoice
                      </Link>
                    </div>

                    <div className="mt-4 space-y-2">
                      {sale.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <p className="font-medium text-slate-900">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Qty {item.quantity} × ৳{item.unitPrice.toString()} = ৳
                            {item.lineTotal.toString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
