import { type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, UserCircle, ArrowRight } from "lucide-react";
import type { UserRole } from "../../types/api";

type Props = {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  role: UserRole | "";
  setRole: (val: UserRole | "") => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
};

export const RegisterForm = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  role,
  setRole,
  onSubmit,
  isPending,
}: Props) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Full Name
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="register-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="John Doe"
              minLength={2}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Email address
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Password
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Confirm Password
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-role"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Account Type
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserCircle className="h-5 w-5 text-slate-400" />
            </div>
            <select
              id="register-role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole | "")}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6 appearance-none bg-white"
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="consumer">Consumer</option>
              <option value="shopkeeper">Shopkeeper</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-70  transition-all active:scale-[0.98]"
        >
          {isPending ? (
            "Creating account..."
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-5 w-5 transition-transform " />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-700  transition-colors"
        >
          Sign in
        </Link>
      </div>
    </>
  );
};
