import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { ProductForm } from "@/components/products/product-form";
import { prisma } from "@/lib/prisma";

type ProductFormState = {
  error: string | null;
};

export default async function ProductsPage() {
  // Load all products from the database, newest first.
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Server action for creating a product from the form submission.
  async function createProduct(
    _state: ProductFormState,
    formData: FormData
  ): Promise<ProductFormState> {
    "use server";

    const name = formData.get("name")?.toString().trim() ?? "";
    const sku = formData.get("sku")?.toString().trim() ?? "";
    const priceValue = formData.get("price")?.toString().trim() ?? "";
    const stockValue = formData.get("stock")?.toString().trim() ?? "";

    const price = Number(priceValue);
    const stock = Number(stockValue);

    // Basic validation before writing to the database.
    if (!name || !sku || Number.isNaN(price) || Number.isNaN(stock)) {
      return {
        error: "Please fill in all fields with valid values.",
      };
    }

    try {
      await prisma.product.create({
        data: {
          name,
          sku,
          price,
          stock,
        },
      });
    } catch (error) {
      // P2002 means a unique field already exists.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          error: "A product with this SKU already exists.",
        };
      }

      return {
        error: "Something went wrong while saving the product.",
      };
    }

    // Refresh the page data after a successful create.
    revalidatePath("/products");

    return {
      error: null,
    };
  }

  // Server action for deleting one product by id.
  async function deleteProduct(formData: FormData) {
    "use server";

    const id = formData.get("id")?.toString() ?? "";

    if (!id) {
      return;
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath("/products");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Products
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Product management will start here.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          This page is now reading and writing live data from the database.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Product list
              </h2>
            </div>

            {products.length === 0 ? (
              <p className="px-6 py-6 text-slate-600">No products found.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-3 px-6 py-5 sm:grid-cols-5"
                  >
                    <div>
                      <p className="text-sm text-slate-500">Name</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {product.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">SKU</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {product.sku}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="mt-1 font-medium text-slate-900">
                        ৳{product.price.toString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Stock</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {product.stock}
                      </p>
                    </div>

                    <div className="flex items-end gap-3">
                      {/* Edit navigates to a dedicated product edit page. */}
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      {/* Delete submits the product id to the delete action. */}
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ProductForm action={createProduct} />
        </div>
      </section>
    </main>
  );
}
