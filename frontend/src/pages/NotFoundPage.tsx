import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link to="/" className="mt-4 inline-flex rounded-lg bg-brand-700 px-4 py-2 text-white">
        Go Home
      </Link>
    </section>
  );
};
