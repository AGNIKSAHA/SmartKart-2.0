export const Loader = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="rounded-xl border border-brand-100 bg-white px-6 py-4 shadow-soft text-brand-700">
        {label}
      </div>
    </div>
  );
};
