import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const ShopkeeperAlert = () => {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-4">
      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h3 className="text-lg font-semibold text-amber-800">
          Complete Your Profile
        </h3>
        <p className="mt-1 text-amber-700">
          You need to complete your shopkeeper profile before you can add or
          manage products in your inventory.
        </p>
        <Link
          to="/profile"
          className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
        >
          Go to Profile Settings
        </Link>
      </div>
    </div>
  );
};
