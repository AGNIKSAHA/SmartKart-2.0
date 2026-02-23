import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCreateProduct } from "../features/products/productHooks";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../types/api";
import { LocationSelector } from "../components/LocationSelector";

export const ShopkeeperCreateProductPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<ProductCategory>(
    PRODUCT_CATEGORIES[0],
  );
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(
    null,
  );

  const createProduct = useCreateProduct();
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createProduct.mutateAsync({
        title,
        description,
        imageUrl,
        price: Number(price),
        stock: Number(stock),
        category,
        ...(location ? { location } : {}),
      });
      navigate("/products");
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.data?.message ===
          "Complete your shopkeeper profile before managing products"
      ) {
        toast.error("profile incomplete");
        return;
      }
      toast.error("Product creation failed");
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Product</h1>
        <Link
          to="/dashboard"
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Return to Dashboard"
        >
          <X className="w-6 h-6" />
        </Link>
      </div>
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
          disabled={createProduct.isPending}
        >
          {createProduct.isPending ? "Creating..." : "Create"}
        </button>
      </form>
    </section>
  );
};
