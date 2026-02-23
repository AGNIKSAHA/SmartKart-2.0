import { useParams } from "react-router-dom";
import { useProduct } from "../features/products/productHooks";
import { Loader } from "../components/Loader";
import { AddToCartButton } from "../components/AddToCartButton";
import { Navigation } from "lucide-react";

export const ProductDetailsPage = () => {
  const { productId = "" } = useParams();
  const productQuery = useProduct(productId);

  if (productQuery.isLoading) {
    return <Loader label="Loading product..." />;
  }

  const product = productQuery.data;
  if (!product) {
    return <p className="text-slate-600">Product not found.</p>;
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-full rounded-2xl object-cover h-[400px]"
      />
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-3xl font-bold text-brand-500">
              ${product.price}
            </p>
            <p
              className={`text-sm font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              className="flex-1 rounded-xl bg-brand-500 px-6 py-4 text-white font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all active:scale-[0.98]"
            />
            {product.location?.coordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${product.location.coordinates[1]},${product.location.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-6 py-4 text-brand-500 font-bold hover:bg-brand-100 transition-all active:scale-[0.98]"
              >
                <Navigation className="h-5 w-5" />
                Directions
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
