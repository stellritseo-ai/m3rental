import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Database,
  Radio,
} from "lucide-react";
import { loginAdmin, getLockoutStatus } from "@/lib/api/auth.functions";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface AdminLoginProps {
  onSuccess: (token: string, user: { username: string; role: string }) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lockout states
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTimeStr, setRemainingTimeStr] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Check initial lockout status
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localLock = window.localStorage.getItem("m3_admin_lockout_until");
      if (localLock) {
        const until = parseInt(localLock, 10);
        if (until > Date.now()) {
          setIsLocked(true);
          setLockedUntil(until);
        } else {
          window.localStorage.removeItem("m3_admin_lockout_until");
        }
      }
    }

    getLockoutStatus({ data: { username: username.trim() || "admin" } })
      .then((res) => {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("m3_admin_lockout_until", res.lockedUntil.toString());
          }
        } else if (res.attemptsLeft !== undefined) {
          setAttemptsLeft(res.attemptsLeft);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, [username]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !lockedUntil) return;

    const updateTimer = () => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        setIsLocked(false);
        setLockedUntil(null);
        setError("");
        setAttemptsLeft(5);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("m3_admin_lockout_until");
        }
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setRemainingTimeStr(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("admin12");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await loginAdmin({ data: { username, password } });

      if (res.success && res.token) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("m3_admin_lockout_until");
          window.localStorage.setItem("m3_admin_session_token", res.token);
          window.localStorage.setItem("m3_admin_username", res.user?.username || "admin");
        }
        setIsSuccess(true);
        toast.success("Authentication verified! Launching Executive Dashboard...");
        setTimeout(() => {
          onSuccess(res.token!, res.user || { username: "admin", role: "superadmin" });
        }, 600);
      } else {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("m3_admin_lockout_until", res.lockedUntil.toString());
          }
        }
        if (res.attemptsLeft !== undefined) {
          setAttemptsLeft(res.attemptsLeft);
        }
        setError(res.error || "Authentication failed. Invalid username or password.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Database connection error. Please verify server status.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none bg-[#040d1a]">
      {/* ─── Ambient Glow Lights ─── */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(0,64,221,0.2) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ─── Form Container Card ─── */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
          {/* Logo & Portal Title */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block group">
              <img
                src={logo}
                alt="M3 Rental Houston"
                className="h-9 w-auto mx-auto object-contain brightness-0 invert opacity-95 group-hover:scale-105 transition-transform"
              />
            </Link>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">
                <ShieldCheck className="size-3 text-emerald-400" />
                Dispatch Operations Security Portal
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Houston Yard Console
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter authorized credentials to manage fleet reservations &amp; payments.
              </p>
            </div>
          </div>

          {/* Database & Telemetry Status Badge */}
          <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Database className="size-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">Database Authentication</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          </div>

          {/* Security Lockout Banner (if triggered) */}
          {isLocked && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="size-4 shrink-0 text-rose-400" />
                <span>Security Lockout Triggered</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200">
                Too many failed login attempts. Terminal is locked for:{" "}
                <strong className="text-white font-mono">{remainingTimeStr}</strong>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocked && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-rose-300">Authentication Error</div>
                <div className="text-[11px] text-rose-200">{error}</div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Dispatch Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={isLocked || isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.05] text-white placeholder:text-slate-500 focus:bg-white/[0.08] focus:border-[#0040DD] focus:outline-none focus:ring-2 focus:ring-[#0040DD]/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Security Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Min 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLocked || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.05] text-white placeholder:text-slate-500 focus:bg-white/[0.08] focus:border-[#0040DD] focus:outline-none focus:ring-2 focus:ring-[#0040DD]/30 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Credential Quick-Fill Helper */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-between text-xs">
              <div className="text-[11px] text-blue-200">
                <span className="text-slate-400">Credentials:</span>{" "}
                <code className="font-bold text-white bg-white/10 px-1 py-0.5 rounded">admin</code> /{" "}
                <code className="font-bold text-white bg-white/10 px-1 py-0.5 rounded">admin12</code>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-300 hover:text-white underline underline-offset-2"
              >
                Auto-fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading || isSuccess}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                isSuccess
                  ? "bg-emerald-600 text-white"
                  : isLocked
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:brightness-110 text-white shadow-blue-900/30"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Verifying with Database...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Access Granted! Redirecting...</span>
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  <span>Unlock Operations Console</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Public Site */}
          <div className="pt-2 text-center border-t border-white/[0.08]">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>

        {/* Security watermark footer */}
        <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Houston Yard Dispatch Terminal • TLS 1.3 Encrypted Session</span>
        </p>
      </div>
    </div>
  );
}
