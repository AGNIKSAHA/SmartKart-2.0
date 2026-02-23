import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCreateProduct } from "../features/products/productHooks";
import { type ProductCategory } from "../types/api";
import { CreateProductForm } from "../components/Products/CreateProductForm";

export const ShopkeeperCreateProductPage = () => {
  const createProduct = useCreateProduct();
  const navigate = useNavigate();

  const handleSubmit = async (payload: {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
    storeName: string;
    category: ProductCategory;
    location?: { lng: number; lat: number };
  }) => {
    try {
      await createProduct.mutateAsync(payload);
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
      <CreateProductForm
        onSubmitProduct={handleSubmit}
        isPending={createProduct.isPending}
      />
    </section>
  );
};
