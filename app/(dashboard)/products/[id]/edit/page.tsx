import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In newer Next.js versions, route params are async in server components.
  const { id } = await params;

  // Load the product being edited.
  const product = await prisma.product.findUnique({
    where: { id },
  });

  // If the id does not exist, show Next.js not-found behavior.
  if (!product) {
    notFound();
  }

  // Server action for updating the product.
  async function updateProduct(formData: FormData) {
    "use server";

    const id = formData.get("id")?.toString() ?? "";
    const name = formData.get("name")?.toString().trim() ?? "";
    const sku = formData.get("sku")?.toString().trim() ?? "";
    const priceValue = formData.get("price")?.toString().trim() ?? "";
    const stockValue = formData.get("stock")?.toString().trim() ?? "";

    const price = Number(priceValue);
    const stock = Number(stockValue);

    // Keep validation simple and explicit.
    if (!id || !name || !sku || Number.isNaN(price) || Number.isNaN(stock)) {
      throw new Error("Please provide valid product values.");
    }

    try {
      await prisma.product.update({
        where: { id },
        data: {
          name,
          sku,
          price,
          stock,
        },
      });
    } catch (error) {
      // If another product already uses this SKU, stop the update.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("A product with this SKU already exists.");
      }

      throw error;
    }

    // Refresh the products list and redirect back after success.
    revalidatePath("/products");
    redirect("/products");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Products
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Edit product
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Update the product details, then save the changes.
            </p>
          </div>

          <Link
            href="/products"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form action={updateProduct} className="space-y-4">
            {/* Hidden id lets the server action know which product to update. */}
            <input type="hidden" name="id" value={product.id} />

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={product.name}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-slate-700"
              >
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                defaultValue={product.sku}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-slate-700"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price.toString()}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-slate-700"
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                step="1"
                defaultValue={product.stock}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Update product
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
