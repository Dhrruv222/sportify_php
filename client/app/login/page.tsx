"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, Shield, Users, TrendingUp } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface LoginResponse {
  status: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

const STATS = [
  { icon: Users, label: "Active Players", value: "500+" },
  { icon: Shield, label: "Verified Clubs", value: "50+" },
  { icon: TrendingUp, label: "Connections", value: "10k+" },
];

const POSITIONS = [
  { top: "12%", left: "8%", label: "GK", delay: "0s" },
  { top: "28%", left: "18%", label: "CB", delay: "0.4s" },
  { top: "55%", left: "6%", label: "LB", delay: "0.8s" },
  { top: "40%", left: "32%", label: "CM", delay: "0.2s" },
  { top: "20%", left: "48%", label: "CAM", delay: "1s" },
  { top: "65%", left: "38%", label: "FW", delay: "0.6s" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect if already logged in
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/profile");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.status === "success" && res.data?.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        router.push("/profile");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* ── Online video background (YouTube embed) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <iframe
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          src="https://www.youtube.com/embed/EhK4exhhlU4?autoplay=1&mute=1&loop=1&playlist=EhK4exhhlU4&controls=0&rel=0&modestbranding=1&playsinline=1"
          title="Sportify hero background"
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
        />
      </div>

      {/* ── Ambient gradient overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(29,185,84,0.10) 0%, transparent 65%), " +
            "radial-gradient(ellipse 50% 40% at 80% 20%, rgba(29,185,84,0.06) 0%, transparent 60%), " +
            "radial-gradient(ellipse 40% 40% at 60% 80%, rgba(255,255,255,0.02) 0%, transparent 50%)",
        }}
      />

      {/* ── Pitch graphic (visual decoration) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.15) 60px, rgba(255,255,255,0.15) 61px), " +
            "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.08) 60px, rgba(255,255,255,0.08) 61px)",
        }}
      />

      {/* ── Floating player position badges ── */}
      {mounted &&
        POSITIONS.map((pos) => (
          <div
            key={pos.label}
            aria-hidden
            className="pointer-events-none absolute hidden lg:flex"
            style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1db954]/30 bg-[#1db954]/10 text-[11px] font-bold text-[#1db954]"
              style={{
                animation: `floatBadge 4s ease-in-out infinite`,
                animationDelay: pos.delay,
              }}
            >
              {pos.label}
            </span>
          </div>
        ))}

      {/* ── Logo bar ── */}
      <header className="relative z-10 flex h-16 items-center px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954]">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Sportify
          </span>
        </div>
      </header>

      {/* ── Main two-column layout ── */}
      <main className="relative z-10 flex min-h-[calc(100vh-64px)] items-center">
        {/* Left: Hero copy */}
        <div className="hidden flex-1 flex-col justify-center px-12 lg:flex xl:px-20">
          {/* Live badge */}
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#1db954]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1db954]">
              Live Scouting Platform
            </span>
          </div>

          <h1 className="mb-4 text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
            The Future
            <br />
            of{" "}
            <span
              className="relative"
              style={{
                background:
                  "linear-gradient(90deg, #1db954 0%, #1ed760 50%, #a8e6cf 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Football
            </span>
          </h1>

          <p className="mb-10 max-w-sm text-base leading-relaxed text-[#b3b3b3]">
            Connect elite talent with top clubs. Build your professional profile,
            showcase your skills, and get discovered by scouts worldwide.
          </p>

          {/* Stats row */}
          <div className="flex gap-8">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col">
                <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#1db954]/15">
                  <Icon className="h-4 w-4 text-[#1db954]" />
                </div>
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs text-[#6a6a6a]">{label}</span>
              </div>
            ))}
          </div>

          {/* Field graphic */}
          <div className="mt-12 relative h-44 w-full max-w-md rounded-2xl border border-white/5 bg-gradient-to-br from-[#0a2a0a] to-[#051505] overflow-hidden">
            {/* Pitch lines */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(29,185,84,0.15) 0%, transparent 70%)",
              }}
            />
            {/* Center circle */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1db954]/20"
            />
            {/* Center spot */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1db954]/40"
            />
            {/* Half-way line */}
            <div
              aria-hidden
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#1db954]/10"
            />
            {/* Goal boxes */}
            <div
              aria-hidden
              className="absolute left-0 top-1/2 h-16 w-10 -translate-y-1/2 rounded-r border border-[#1db954]/15 border-l-0"
            />
            <div
              aria-hidden
              className="absolute right-0 top-1/2 h-16 w-10 -translate-y-1/2 rounded-l border border-[#1db954]/15 border-r-0"
            />
            {/* Player dots */}
            {[
              { x: "20%", y: "50%", active: true },
              { x: "35%", y: "25%", active: false },
              { x: "35%", y: "75%", active: false },
              { x: "50%", y: "40%", active: false },
              { x: "50%", y: "60%", active: true },
              { x: "65%", y: "35%", active: false },
              { x: "65%", y: "65%", active: true },
              { x: "80%", y: "50%", active: false },
            ].map((dot, i) => (
              <div
                key={i}
                aria-hidden
                className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                  dot.active
                    ? "border-[#1db954] bg-[#1db954]"
                    : "border-white/40 bg-white/20"
                }`}
                style={{ left: dot.x, top: dot.y }}
              />
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-[480px] lg:shrink-0 lg:px-12">
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(18,18,18,0.95) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Card heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-[#6a6a6a]">
                Sign in to your Sportify account
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-[#b3b3b3]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-[#3a3a3a] outline-none transition-all focus:border-[#1db954]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#1db954]/20"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-[#b3b3b3]"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-[#6a6a6a] hover:text-[#1db954] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-sm text-white placeholder:text-[#3a3a3a] outline-none transition-all focus:border-[#1db954]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#1db954]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1db954] text-sm font-bold text-black transition-all hover:bg-[#1ed760] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-xs text-[#3a3a3a]">New to Sportify?</span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            {/* Register link */}
            <Link
              href="/register"
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5"
            >
              Register
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex gap-5">
            {["Privacy Policy", "Terms of Service", "Help"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs text-[#3a3a3a] hover:text-[#b3b3b3] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Keyframe for floating badges */}
      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
