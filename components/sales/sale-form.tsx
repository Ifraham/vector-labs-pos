"use client";

import { useActionState } from "react";

type SaleFormState = {
  error: string | null;
};

const initialState: SaleFormState = {
  error: null,
};

type SaleFormProps = {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price: string;
    stock: number;
  }>;
  action: (
    state: SaleFormState,
    formData: FormData
  ) => Promise<SaleFormState>;
};

export function SaleForm({ products, action }: SaleFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Create sale
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-slate-700"
          >
            Customer name
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="Walk-in customer"
          />
        </div>

        <div>
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-slate-700"
          >
            Product
          </label>
          <select
            id="productId"
            name="productId"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} | {product.sku} | ৳{product.price} | stock{" "}
                {product.stock}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-slate-700"
          >
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="1"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save sale"}
        </button>
      </form>
    </div>
  );
}
