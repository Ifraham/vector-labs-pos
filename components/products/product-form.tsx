"use client";

import { useActionState } from "react";

type ProductFormState = {
  error: string | null;
};

const initialState: ProductFormState = {
  error: null,
};

type ProductFormProps = {
  action: (
    state: ProductFormState,
    formData: FormData
  ) => Promise<ProductFormState>;
};

export function ProductForm({ action }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Add product
      </p>

      <form action={formAction} className="mt-6 space-y-4">
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
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
            placeholder="Rice 25kg"
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
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
            placeholder="RICE-25KG"
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
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
            placeholder="2500.00"
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
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
            placeholder="10"
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
          {pending ? "Saving..." : "Save product"}
        </button>
      </form>
    </div>
  );
}
