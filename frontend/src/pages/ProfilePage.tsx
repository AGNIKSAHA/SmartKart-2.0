import { type FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthState } from "../features/auth/authHooks";
import {
  useProfile,
  useUpdateConsumerProfile,
  useUpdateShopkeeperProfile,
} from "../features/profile/profileHooks";
import type { ConsumerProfile, ShopkeeperProfile } from "../types/api";
import { Loader } from "../components/Loader";

const phoneRegex = /^[0-9]{7,15}$/;

export const ProfilePage = () => {
  const { user } = useAuthState();
  const profileQuery = useProfile();
  const updateConsumer = useUpdateConsumerProfile();
  const updateShopkeeper = useUpdateShopkeeperProfile();

  const consumerProfile = useMemo(() => {
    if (profileQuery.data?.role !== "consumer") {
      return null;
    }
    return (profileQuery.data.profile as ConsumerProfile | null) ?? null;
  }, [profileQuery.data]);

  const shopkeeperProfile = useMemo(() => {
    if (profileQuery.data?.role !== "shopkeeper") {
      return null;
    }
    return (profileQuery.data.profile as ShopkeeperProfile | null) ?? null;
  }, [profileQuery.data]);

  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [deliveryContactsText, setDeliveryContactsText] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [shopkeeperMobile, setShopkeeperMobile] = useState("");

  const resetFormFromProfile = (): void => {
    if (consumerProfile) {
      setFullName(consumerProfile.fullName);
      setDeliveryContactsText(
        consumerProfile.deliveryContacts
          .map((entry) => `${entry.recipientName} | ${entry.address}`)
          .join("\n"),
      );
      setMobileNumber(consumerProfile.mobileNumber);
      setAlternateNumber(consumerProfile.alternateNumber ?? "");
    }

    if (shopkeeperProfile) {
      setCompanyName(shopkeeperProfile.companyName);
      setCompanyAddress(shopkeeperProfile.companyAddress);
      setShopkeeperMobile(shopkeeperProfile.mobileNumber);
    }
  };

  useEffect(() => {
    resetFormFromProfile();
  }, [consumerProfile, shopkeeperProfile]);

  if (!user) {
    return null;
  }

  if (profileQuery.isLoading) {
    return <Loader label="Loading profile..." />;
  }

  const onSubmitConsumer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedFullName = fullName.trim();
    if (normalizedFullName.length < 2) {
      toast.error("Please enter a valid name");
      return;
    }

    if (!phoneRegex.test(mobileNumber)) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }

    if (alternateNumber && !phoneRegex.test(alternateNumber)) {
      toast.error("Enter a valid alternate number (7-15 digits)");
      return;
    }

    const deliveryContacts = deliveryContactsText
      .split("\n")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (deliveryContacts.length === 0) {
      toast.error("Please add at least one delivery contact");
      return;
    }

    const parsedContacts = deliveryContacts
      .map((entry) => {
        const parts = entry.split("|");
        const hasExplicitName = parts.length > 1;
        const recipientName = hasExplicitName
          ? (parts[0]?.trim() ?? "")
          : normalizedFullName;
        const address = hasExplicitName
          ? parts.slice(1).join("|").trim()
          : entry.trim();

        if (recipientName.length < 2 || address.length < 5) {
          return null;
        }

        return {
          recipientName,
          address,
        };
      })
      .filter(
        (entry): entry is { recipientName: string; address: string } =>
          entry !== null,
      );

    if (parsedContacts.length !== deliveryContacts.length) {
      toast.error(
        "Each line must be either 'Name | Address' or just 'Address'",
      );
      return;
    }

    try {
      await updateConsumer.mutateAsync({
        fullName: normalizedFullName,
        deliveryContacts: parsedContacts,
        mobileNumber,
        ...(alternateNumber ? { alternateNumber } : {}),
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  const onSubmitShopkeeper = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phoneRegex.test(shopkeeperMobile)) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }

    try {
      await updateShopkeeper.mutateAsync({
        companyName,
        companyAddress,
        mobileNumber: shopkeeperMobile,
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Email: {profileQuery.data?.email}
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            onClick={() => {
              resetFormFromProfile();
              setIsEditing(true);
            }}
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            onClick={() => {
              resetFormFromProfile();
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {!isEditing && user.role === "consumer" && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Name
            </p>
            <p className="mt-1 font-medium">
              {consumerProfile?.fullName || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Delivery Contacts
            </p>
            <div className="mt-2 space-y-2">
              {(consumerProfile?.deliveryContacts ?? []).map((entry, index) => (
                <div
                  key={`${entry.recipientName}-${entry.address}-${index}`}
                  className="rounded-md bg-slate-50 p-3"
                >
                  <p className="font-medium">{entry.recipientName}</p>
                  <p className="text-sm text-slate-600">{entry.address}</p>
                </div>
              ))}
              {(consumerProfile?.deliveryContacts ?? []).length === 0 && (
                <p className="text-sm text-slate-600">
                  No delivery contacts added.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mobile Number
            </p>
            <p className="mt-1 font-medium">
              {consumerProfile?.mobileNumber || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Alternate Number
            </p>
            <p className="mt-1 font-medium">
              {consumerProfile?.alternateNumber || "Not set"}
            </p>
          </div>
        </div>
      )}

      {!isEditing && user.role === "shopkeeper" && (
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
      )}

      {isEditing && user.role === "consumer" && (
        <form className="mt-6 space-y-4" onSubmit={onSubmitConsumer}>
          <div>
            <label
              htmlFor="profile-full-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="profile-full-name"
              name="fullName"
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label
              htmlFor="profile-delivery-contacts"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Delivery Contacts (one per line as Name | Address)
            </label>
            <textarea
              id="profile-delivery-contacts"
              name="deliveryContacts"
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              rows={4}
              value={deliveryContactsText}
              onChange={(e) => setDeliveryContactsText(e.target.value)}
              placeholder={
                "John Doe | Home: 12 Main Street\nJane Doe | Office: 45 Market Road"
              }
              required
            />
          </div>
          <div>
            <label
              htmlFor="profile-mobile"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Mobile Number
            </label>
            <input
              id="profile-mobile"
              name="mobileNumber"
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label
              htmlFor="profile-alternate-mobile"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Alternate Number
            </label>
            <input
              id="profile-alternate-mobile"
              name="alternateNumber"
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              value={alternateNumber}
              onChange={(e) => setAlternateNumber(e.target.value)}
              placeholder="9123456780"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white"
            disabled={updateConsumer.isPending}
          >
            {updateConsumer.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {isEditing && user.role === "shopkeeper" && (
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
            className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white"
            disabled={updateShopkeeper.isPending}
          >
            {updateShopkeeper.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </section>
  );
};
