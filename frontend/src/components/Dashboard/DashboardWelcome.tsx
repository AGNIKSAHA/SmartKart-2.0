import { Link } from "react-router-dom";

type Props = {
  user: { name: string; role: string };
  hasProfile: boolean;
};

export const DashboardWelcome = ({ user, hasProfile }: Props) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Role: <span className="capitalize">{user.role}</span>
      </p>
      {user.role === "shopkeeper" && hasProfile && (
        <Link
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition-colors"
          to="/shopkeeper/products/new"
        >
          Add New Product
        </Link>
      )}
    </div>
  );
};
