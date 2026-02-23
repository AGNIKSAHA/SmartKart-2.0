import type { ConsumerProfile } from "../../types/api";

type Props = {
  consumerProfile: ConsumerProfile | null;
};

export const ConsumerProfileCard = ({ consumerProfile }: Props) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
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
  );
};
