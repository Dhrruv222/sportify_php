"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!gdprConsent) {
      setError("You must accept the privacy policy to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        email,
        password,
        gdprConsent: true,
      });

      if (response.status === "success" && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        router.push("/profile");
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 lg:px-12">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="space-y-6 lg:max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#111] px-4 py-2 text-sm text-[#7fdc7f]"><ShieldCheck className="h-4 w-4" /> Welcome to Sportify</div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Create your account</h1>
            <p className="max-w-xl text-sm text-[#b3b3b3]">
              Register to access the platform, view your profile, and start connecting with clubs, coaches, and teammates.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#6a6a6a]">Already have an account?</p>
                <p className="mt-1 text-lg font-semibold">Sign in here</p>
              </div>
              <Link
                href="/login"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full max-w-2xl rounded-4xl border border-white/10 bg-[#111] p-8 shadow-2xl shadow-black/40 lg:p-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#6a6a6a]">Registration</p>
              <h2 className="text-2xl font-semibold">Create a new account</h2>
            </div>
            <span className="rounded-full bg-[#1db954]/10 px-3 py-1 text-xs font-semibold text-[#1db954]">Easy and secure</span>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm text-[#b3b3b3]">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#1db954]/60 focus:bg-white/8"
                placeholder="you@example.com"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-[#b3b3b3]">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white outline-none transition focus:border-[#1db954]/60 focus:bg-white/8"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <label className="block text-sm text-[#b3b3b3]">
                Confirm password
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#1db954]/60 focus:bg-white/8"
                  placeholder="********"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 text-sm text-[#b3b3b3]">
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(event) => setGdprConsent(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0f0f0f] text-[#1db954] focus:ring-[#1db954]"
              />
              <span>
                I agree to the <strong>privacy policy</strong> and consent to use my data to create the account.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1db954] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
