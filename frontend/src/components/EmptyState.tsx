export const EmptyState = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
};
