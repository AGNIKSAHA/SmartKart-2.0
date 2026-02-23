import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <section className="grid gap-8 rounded-3xl border border-brand-100 bg-white p-8 shadow-soft md:grid-cols-2 md:p-12">
      <div>
        <p className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          New Season Drop
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900">
          Modern e-commerce starter with secure auth and strict TypeScript.
        </h1>
        <p className="mt-4 text-slate-600">
          Browse products, add to cart, place orders, and manage inventory with role-based dashboards.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/products" className="rounded-lg bg-brand-700 px-5 py-2.5 text-white">
            Shop Now
          </Link>
          <Link to="/register" className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700">
            Create Account
          </Link>
        </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-600 p-6 text-white">
        <h2 className="text-xl font-bold">What is included</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>JWT access + refresh token auth in HttpOnly cookies</li>
          <li>Role-based authorization (shopkeeper, consumer)</li>
          <li>TanStack Query server-state architecture</li>
          <li>Redux Toolkit app-state architecture</li>
          <li>React Router v7 protected routes</li>
        </ul>
      </div>
    </section>
  );
};
