import { type FormEvent } from "react";
import { PRODUCT_CATEGORIES } from "../../types/api";

type Props = {
  category: string;
  setCategory: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  applyFilters: (e: FormEvent) => void;
};

export const ProductFilters = ({
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  applyFilters,
}: Props) => {
  return (
    <form
      onSubmit={applyFilters}
      className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4 items-end"
    >
      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700 capitalize bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="min-price"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Min Price
        </label>
        <input
          id="min-price"
          name="minPrice"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700"
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <label
          htmlFor="max-price"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Max Price
        </label>
        <input
          id="max-price"
          name="maxPrice"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700"
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="999"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-700 font-medium px-4 py-2 text-white hover:bg-brand-800 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};
