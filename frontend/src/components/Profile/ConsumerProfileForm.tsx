import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

const phoneRegex = /^[0-9]{7,15}$/;

type Props = {
  initialFullName: string;
  initialDeliveryContactsText: string;
  initialMobileNumber: string;
  initialAlternateNumber: string;
  updateConsumerPending: boolean;
  onSubmitProfile: (payload: {
    fullName: string;
    deliveryContacts: { recipientName: string; address: string }[];
    mobileNumber: string;
    alternateNumber?: string;
  }) => Promise<void>;
};

export const ConsumerProfileForm = ({
  initialFullName,
  initialDeliveryContactsText,
  initialMobileNumber,
  initialAlternateNumber,
  updateConsumerPending,
  onSubmitProfile,
}: Props) => {
  const [fullName, setFullName] = useState(initialFullName);
  const [deliveryContactsText, setDeliveryContactsText] = useState(
    initialDeliveryContactsText,
  );
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [alternateNumber, setAlternateNumber] = useState(
    initialAlternateNumber,
  );

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

    await onSubmitProfile({
      fullName: normalizedFullName,
      deliveryContacts: parsedContacts,
      mobileNumber,
      ...(alternateNumber ? { alternateNumber } : {}),
    });
  };

  return (
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
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-white hover:bg-brand-800 transition-colors"
        disabled={updateConsumerPending}
      >
        {updateConsumerPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};
