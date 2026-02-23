import { type FormEvent, useState } from "react";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../../types/api";
import { LocationSelector } from "../LocationSelector";

type Props = {
  onSubmitProduct: (payload: {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
    storeName: string;
    category: ProductCategory;
    location?: { lng: number; lat: number };
  }) => Promise<void>;
  isPending: boolean;
};

export const CreateProductForm = ({ onSubmitProduct, isPending }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState<ProductCategory>(
    PRODUCT_CATEGORIES[0],
  );
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(
    null,
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmitProduct({
      title,
      description,
      imageUrl,
      price: Number(price),
      stock: Number(stock),
      storeName,
      category,
      ...(location ? { location } : {}),
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="product-title"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Title
        </label>
        <input
          id="product-title"
          name="title"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Premium Hoodie"
          required
        />
      </div>
      <div>
        <label
          htmlFor="product-description"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Heavyweight cotton hoodie for daily wear."
          required
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="product-image-url"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Image URL
        </label>
        <input
          id="product-image-url"
          name="imageUrl"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/product-image.jpg"
          required
        />
      </div>
      <div>
        <label
          htmlFor="product-price"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Price
        </label>
        <input
          id="product-price"
          name="price"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          type="number"
          min={1}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="99.99"
          required
        />
      </div>
      <div>
        <label
          htmlFor="product-stock"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Stock
        </label>
        <input
          id="product-stock"
          name="stock"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          type="number"
          min={0}
          step={1}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="25"
          required
        />
      </div>
      <div>
        <label
          htmlFor="product-store-name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Store Name
        </label>
        <input
          id="product-store-name"
          name="storeName"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Awesome Electronics"
          required
        />
      </div>
      <div>
        <label
          htmlFor="product-category"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Category
        </label>
        <select
          id="product-category"
          name="category"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 capitalize bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          required
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Product Location
        </label>
        <LocationSelector
          initialLocation={location || undefined}
          onLocationSelect={setLocation}
        />
      </div>
      <button
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white"
        disabled={isPending}
      >
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
};
