import { type FormEvent } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

type Props = {
  email: string;
  setEmail: (val: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
};

export const VerifyEmailForm = ({
  email,
  setEmail,
  onSubmit,
  isPending,
}: Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="verify-email"
          className="block text-sm font-medium leading-6 text-slate-900"
        >
          Email address
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="verify-email"
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

      <button
        type="submit"
        disabled={isPending || !email.trim()}
        className="flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:focus-visible:outline-brand-700 disabled:opacity-70 transition-all active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending link...
          </>
        ) : (
          <>
            Send verification link
            <ArrowRight className="ml-2 h-5 w-5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};
