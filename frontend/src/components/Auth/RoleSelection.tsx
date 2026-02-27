import { User, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import type { UserRole } from "../../types/api";

type Props = {
  selectedRole: UserRole | "";
  onSelect: (role: UserRole) => void;
  onConfirm: () => void;
  isPending: boolean;
};

export const RoleSelection = ({
  selectedRole,
  onSelect,
  onConfirm,
  isPending,
}: Props) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Final Step!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tell us how you'll be using SmartKart.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Consumer Card */}
        <button
          type="button"
          onClick={() => onSelect("consumer")}
          className={`relative flex flex-col items-center rounded-2xl border-2 p-6 transition-all hover:shadow-md ${
            selectedRole === "consumer"
              ? "border-brand-600 bg-brand-50"
              : "border-slate-100 bg-white hover:border-brand-200"
          }`}
        >
          {selectedRole === "consumer" && (
            <div className="absolute right-3 top-3">
              <CheckCircle2 className="h-5 w-5 text-brand-600" />
            </div>
          )}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              selectedRole === "consumer"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <User className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Consumer</h3>
          <p className="mt-1 text-center text-xs text-slate-500 leading-relaxed">
            I want to browse and purchase amazing products.
          </p>
        </button>

        {/* Shopkeeper Card */}
        <button
          type="button"
          onClick={() => onSelect("shopkeeper")}
          className={`relative flex flex-col items-center rounded-2xl border-2 p-6 transition-all hover:shadow-md ${
            selectedRole === "shopkeeper"
              ? "border-brand-600 bg-brand-50"
              : "border-slate-100 bg-white hover:border-brand-200"
          }`}
        >
          {selectedRole === "shopkeeper" && (
            <div className="absolute right-3 top-3">
              <CheckCircle2 className="h-5 w-5 text-brand-600" />
            </div>
          )}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              selectedRole === "shopkeeper"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Store className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Shopkeeper</h3>
          <p className="mt-1 text-center text-xs text-slate-500 leading-relaxed">
            I want to list my products and grow my business.
          </p>
        </button>
      </div>

      <button
        type="button"
        disabled={!selectedRole || isPending}
        onClick={onConfirm}
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-800 disabled:opacity-50 active:scale-[0.98]"
      >
        {isPending ? "Setting things up..." : "Complete Setup"}
        {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
      </button>

      <p className="mt-6 text-center text-xs text-slate-400">
        You can change your profile details later in settings.
      </p>
    </div>
  );
};
