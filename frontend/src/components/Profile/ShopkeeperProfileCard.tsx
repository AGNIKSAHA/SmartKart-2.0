import type { ShopkeeperProfile } from "../../types/api";

type Props = {
  shopkeeperProfile: ShopkeeperProfile | null;
};

export const ShopkeeperProfileCard = ({ shopkeeperProfile }: Props) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Company Name
        </p>
        <p className="mt-1 font-medium">
          {shopkeeperProfile?.companyName || "Not set"}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Company Address
        </p>
        <p className="mt-1 font-medium">
          {shopkeeperProfile?.companyAddress || "Not set"}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Mobile Number
        </p>
        <p className="mt-1 font-medium">
          {shopkeeperProfile?.mobileNumber || "Not set"}
        </p>
      </div>
    </div>
  );
};
