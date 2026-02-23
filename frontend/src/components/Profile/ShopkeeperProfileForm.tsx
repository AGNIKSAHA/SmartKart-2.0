import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

const phoneRegex = /^[0-9]{7,15}$/;

type Props = {
  initialCompanyName: string;
  initialCompanyAddress: string;
  initialShopkeeperMobile: string;
  updateShopkeeperPending: boolean;
  onSubmitProfile: (payload: {
    companyName: string;
    companyAddress: string;
    mobileNumber: string;
  }) => Promise<void>;
};

export const ShopkeeperProfileForm = ({
  initialCompanyName,
  initialCompanyAddress,
  initialShopkeeperMobile,
  updateShopkeeperPending,
  onSubmitProfile,
}: Props) => {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [companyAddress, setCompanyAddress] = useState(initialCompanyAddress);
  const [shopkeeperMobile, setShopkeeperMobile] = useState(
    initialShopkeeperMobile,
  );

  const onSubmitShopkeeper = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phoneRegex.test(shopkeeperMobile)) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }

    await onSubmitProfile({
      companyName,
      companyAddress,
      mobileNumber: shopkeeperMobile,
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmitShopkeeper}>
      <div>
        <label
          htmlFor="profile-company-name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Company Name
        </label>
        <input
          id="profile-company-name"
          name="companyName"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Retail Pvt Ltd"
          required
        />
      </div>
      <div>
        <label
          htmlFor="profile-company-address"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Company Address
        </label>
        <textarea
          id="profile-company-address"
          name="companyAddress"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          rows={3}
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          placeholder="123 Industrial Park, New York"
          required
        />
      </div>
      <div>
        <label
          htmlFor="profile-shopkeeper-mobile"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Mobile Number
        </label>
        <input
          id="profile-shopkeeper-mobile"
          name="mobileNumber"
          className="w-full rounded-lg border border-slate-300 px-4 py-2"
          value={shopkeeperMobile}
          onChange={(e) => setShopkeeperMobile(e.target.value)}
          placeholder="9876543210"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white hover:bg-brand-800 transition-colors"
        disabled={updateShopkeeperPending}
      >
        {updateShopkeeperPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};
