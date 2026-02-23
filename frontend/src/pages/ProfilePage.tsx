import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useAuthState } from "../features/auth/authHooks";
import {
  useProfile,
  useUpdateConsumerProfile,
  useUpdateShopkeeperProfile,
} from "../features/profile/profileHooks";
import type { ConsumerProfile, ShopkeeperProfile } from "../types/api";
import { Loader } from "../components/Loader";

import { ConsumerProfileCard } from "../components/Profile/ConsumerProfileCard";
import { ShopkeeperProfileCard } from "../components/Profile/ShopkeeperProfileCard";
import { ConsumerProfileForm } from "../components/Profile/ConsumerProfileForm";
import { ShopkeeperProfileForm } from "../components/Profile/ShopkeeperProfileForm";

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
  const [resetKey, setResetKey] = useState(0);

  if (!user) {
    return null;
  }

  if (profileQuery.isLoading) {
    return <Loader label="Loading profile..." />;
  }

  const cancelEditing = () => {
    setResetKey((prev) => prev + 1);
    setIsEditing(false);
  };

  const startEditing = () => {
    setResetKey((prev) => prev + 1);
    setIsEditing(true);
  };

  const handleConsumerSubmit = async (payload: {
    fullName: string;
    deliveryContacts: { recipientName: string; address: string }[];
    mobileNumber: string;
    alternateNumber?: string;
  }) => {
    try {
      await updateConsumer.mutateAsync(payload);
      setIsEditing(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Profile update failed");
      } else {
        toast.error("Profile update failed");
      }
    }
  };

  const handleShopkeeperSubmit = async (payload: {
    companyName: string;
    companyAddress: string;
    mobileNumber: string;
  }) => {
    try {
      await updateShopkeeper.mutateAsync(payload);
      setIsEditing(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Profile update failed");
      } else {
        toast.error("Profile update failed");
      }
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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
            onClick={startEditing}
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </div>

      <div key={resetKey}>
        {!isEditing && user.role === "consumer" && (
          <ConsumerProfileCard consumerProfile={consumerProfile} />
        )}

        {!isEditing && user.role === "shopkeeper" && (
          <ShopkeeperProfileCard shopkeeperProfile={shopkeeperProfile} />
        )}

        {isEditing && user.role === "consumer" && (
          <ConsumerProfileForm
            initialFullName={consumerProfile?.fullName || ""}
            initialDeliveryContactsText={
              consumerProfile?.deliveryContacts
                .map((entry) => `${entry.recipientName} | ${entry.address}`)
                .join("\n") || ""
            }
            initialMobileNumber={consumerProfile?.mobileNumber || ""}
            initialAlternateNumber={consumerProfile?.alternateNumber || ""}
            updateConsumerPending={updateConsumer.isPending}
            onSubmitProfile={handleConsumerSubmit}
          />
        )}

        {isEditing && user.role === "shopkeeper" && (
          <ShopkeeperProfileForm
            initialCompanyName={shopkeeperProfile?.companyName || ""}
            initialCompanyAddress={shopkeeperProfile?.companyAddress || ""}
            initialShopkeeperMobile={shopkeeperProfile?.mobileNumber || ""}
            updateShopkeeperPending={updateShopkeeper.isPending}
            onSubmitProfile={handleShopkeeperSubmit}
          />
        )}
      </div>
    </section>
  );
};
