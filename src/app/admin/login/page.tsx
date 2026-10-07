"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/apiPublic";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
  Users,
  Globe,
  TrendingUp,
  FileCheck,
} from "lucide-react";

const stats = [
  { value: "2,400+", label: "Students Placed" },
  { value: "120+", label: "Universities" },
  { value: "40+", label: "Countries" },
  { value: "98%", label: "Visa Success" },
];

const features = [
  { icon: Users,     label: "Student Management" },
  { icon: FileCheck, label: "Application Tracking" },
  { icon: Globe,     label: "Visa Management" },
  { icon: TrendingUp,label: "Analytics & Reports" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        setError(
          res.errors?.length
            ? res.errors.map((err) => err.msg).join(" · ")
            : res.message || "Invalid credentials."
        );
        return;
      }
      const user = res.data?.user;
      if (user?.role !== "admin" && user?.role !== "super_admin") {
        setError("Access denied. Administrators only.");
        return;
      }
      localStorage.setItem("admin_token", res.data!.token);
      localStorage.setItem("admin_user", JSON.stringify(user));
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* ═══════════════════════════════════════════════
          LEFT — full-bleed image with bottom-up overlay
      ═══════════════════════════════════════════════ */}
      <div 
        className="hidden lg:block lg:w-[52%] relative bg-cover bg-center bg-[#1e3a8a]"
        style={{
          backgroundImage: `url('/admin-bg.jpg'), linear-gradient(to bottom right, #1e3a8a, #1e40af)`
        }}
      >

        {/* Strong bottom-to-top gradient so bottom content is always legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04122e] via-[#04122e]/60 to-transparent" />

        {/* Subtle top vignette so logo is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-10 pt-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 p-2.5 rounded-xl">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">
                Zylo Consultancy
              </p>
              <p className="text-white/60 text-[10px] uppercase tracking-widest mt-0.5">
                Study Abroad & Admissions
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to website
          </Link>
        </div>

        {/* ── Bottom content ──────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#20c997]/20 border border-[#20c997]/40 backdrop-blur-sm text-[#20c997] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Admin Portal
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-[2.6rem] font-extrabold text-white leading-tight mb-3">
            Manage your <span className="text-[#20c997]">consultancy</span><br />
            with confidence.
          </h1>

          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-[360px]">
            One powerful dashboard for leads, applications, visas,
            English tests, and everything in between.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <Icon className="w-3.5 h-3.5 text-[#20c997]" />
                {label}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 border-t border-white/10 pt-6">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-extrabold text-xl">{value}</p>
                <p className="text-white/50 text-[11px] mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT — login form
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-[#1e3a8a] p-1.5 rounded-lg">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1e3a8a] text-sm">Zylo Admin</span>
          </div>
          <Link href="/" className="text-xs text-slate-500 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Website
          </Link>
        </div>

        {/* Centred card */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#f8faff]">
          <div className="w-full max-w-[400px]">

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 px-8 py-9">

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a] flex items-center justify-center mb-6 shadow-lg shadow-[#1e3a8a]/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm mt-1 mb-7">
                Sign in to your Zylo Admin portal
              </p>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center mt-0.5">!</span>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 block">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@zyloconsultancy.com"
                    disabled={loading}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1e3a8a] focus:bg-white focus:ring-3 focus:ring-[#1e3a8a]/10 disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700 block">
                      Password
                    </label>
                    <button type="button" className="text-xs text-[#1e3a8a] font-semibold hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1e3a8a] focus:bg-white focus:ring-3 focus:ring-[#1e3a8a]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide" : "Show"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-[#1e3a8a]/30 hover:shadow-lg hover:shadow-[#1e3a8a]/30 hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-3 focus:ring-[#1e3a8a]/30"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  ) : (
                    "Sign in to Dashboard"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">protected access</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-5">
                {[
                  { icon: ShieldCheck, text: "SSL Encrypted" },
                  { icon: ShieldCheck, text: "Role-based" },
                  { icon: ShieldCheck, text: "JWT Secured" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-slate-400">
                    <Icon className="w-3.5 h-3.5 text-[#20c997]" />
                    <span className="text-[11px] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-5">
              Administrators only ·{" "}
              <Link href="/" className="text-[#1e3a8a] font-semibold hover:underline">
                Return to main site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
