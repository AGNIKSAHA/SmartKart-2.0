import { type FormEvent } from "react";
import { Lock, Mail, KeyRound, ArrowRight } from "lucide-react";

type Props = {
  email: string;
  setEmail: (val: string) => void;
  token: string;
  setToken: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showEmailField: boolean;
  showTokenField: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
};

export const ResetPasswordForm = ({
  email,
  setEmail,
  token,
  setToken,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showEmailField,
  showTokenField,
  onSubmit,
  isPending,
}: Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {showEmailField && (
        <div>
          <label
            htmlFor="reset-email"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Email address
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="john@example.com"
            />
          </div>
        </div>
      )}

      {showTokenField && (
        <div>
          <label
            htmlFor="reset-token"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Reset Token
          </label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <KeyRound className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="reset-token"
              name="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
              placeholder="Paste your reset token"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="reset-new-password"
          className="block text-sm font-medium leading-6 text-slate-900"
        >
          New Password
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="reset-new-password"
            name="newPassword"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="reset-confirm-password"
          className="block text-sm font-medium leading-6 text-slate-900"
        >
          Confirm New Password
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-70 transition-all active:scale-[0.98]"
      >
        {isPending ? (
          "Resetting..."
        ) : (
          <>
            Reset Password
            <ArrowRight className="ml-2 h-5 w-5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};
