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
  ArrowLeft,
  RefreshCw,
  Database,
  Radio,
  ShieldAlert,
  Fingerprint,
  MapPin,
  Truck,
  Sparkles,
  Check,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";
import { loginAdmin, getLockoutStatus, MAX_FAILED_ATTEMPTS } from "@/lib/api/auth.functions";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-site.jpg";
import { toast } from "sonner";

interface AdminLoginProps {
  onSuccess: (token: string, user: { username: string; role: string; fullName?: string | undefined }) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live Houston Clock
  const [houstonTime, setHoustonTime] = useState("");

  // Lockout & attempts states
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTimeStr, setRemainingTimeStr] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_FAILED_ATTEMPTS);

  // Live Houston Yard Clock Effect
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        setHoustonTime(
          now.toLocaleTimeString("en-US", {
            timeZone: "America/Chicago",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          }) + " CST"
        );
      } catch {
        setHoustonTime("");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check initial lockout status
  const checkStatus = (userToCheck?: string) => {
    const target = (userToCheck || username).trim() || "admin";
    if (typeof window !== "undefined") {
      const localLock = window.localStorage.getItem(`m3_lock_${target}`);
      if (localLock) {
        const until = parseInt(localLock, 10);
        if (until > Date.now()) {
          setIsLocked(true);
          setLockedUntil(until);
        } else {
          window.localStorage.removeItem(`m3_lock_${target}`);
        }
      }
    }

    getLockoutStatus({ data: { username: target } })
      .then((res) => {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(`m3_lock_${target}`, res.lockedUntil.toString());
          }
        } else {
          setIsLocked(false);
          setLockedUntil(null);
          if (res.attemptsLeft !== undefined) {
            setAttemptsLeft(res.attemptsLeft);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkStatus(username);
  }, [username]);

  // Real-time Countdown timer for the 2-Hour Lockout
  useEffect(() => {
    if (!isLocked || !lockedUntil) return;

    const updateTimer = () => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        setIsLocked(false);
        setLockedUntil(null);
        setError("");
        setAttemptsLeft(MAX_FAILED_ATTEMPTS);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(`m3_lock_${username.trim() || "admin"}`);
        }
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      if (hours > 0) {
        setRemainingTimeStr(`${hours}h ${mins}m ${secs.toString().padStart(2, "0")}s`);
      } else {
        setRemainingTimeStr(`${mins}m ${secs.toString().padStart(2, "0")}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil, username]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
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
          window.localStorage.removeItem(`m3_lock_${username.trim() || "admin"}`);
          window.localStorage.setItem("m3_admin_session_token", res.token);
          window.localStorage.setItem("m3_admin_username", res.user?.username || "admin");
        }
        setIsSuccess(true);
        toast.success("Security credentials verified! Accessing Houston Dispatch Terminal...");
        setTimeout(() => {
          onSuccess(res.token!, res.user || { username: "admin", role: "superadmin" });
        }, 500);
      } else {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(`m3_lock_${username.trim() || "admin"}`, res.lockedUntil.toString());
          }
          toast.error("Account locked for 2 hours due to 3 consecutive failed attempts!");
        }
        if (res.attemptsLeft !== undefined) {
          setAttemptsLeft(res.attemptsLeft);
        }
        setError(res.error || "Authentication failed. Invalid username or password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Database authentication error. Please verify server connectivity.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020611] text-slate-100 flex flex-col lg:flex-row relative overflow-hidden font-sans select-none selection:bg-[#0040DD] selection:text-white">
      {/* ── LEFT SHOWCASE PANEL (Desktop: 58% width) ── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-white/[0.08]">
        {/* Background Photo with Cinematic Dark Mask */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:transition-transform motion-safe:duration-10000"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020611] via-[#020611]/80 to-[#020611]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020611]/90 via-transparent to-[#020611]" />

        {/* Ambient Top Glow */}
        <div
          className="absolute top-10 left-10 size-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,64,221,0.3) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        {/* Top Header Strip */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src={logo}
              alt="M3 Rental Houston"
              className="h-10 w-auto object-contain brightness-0 invert opacity-95 group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Houston Live Telemetry Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs font-mono backdrop-blur-md shadow-lg">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[11px]">HOUSTON DISPATCH:</span>
            <span className="text-emerald-300 font-bold text-[11px]">{houstonTime || "7:00 AM CST"}</span>
          </div>
        </div>

        {/* Center Hero Copy & Brand Message */}
        <div className="relative z-10 my-auto max-w-xl space-y-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Industrial Fleet Logistics &amp; Security</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1] font-display">
            Houston Heavy Equipment Operations Console.
          </h1>

          <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-medium">
            Centralized dispatch terminal for commercial fleet reservations, key handoffs, payment verifications, and real-time equipment telemetry across Texas Gulf Coast.
          </p>

          {/* 3 Live Telemetry Stat Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Truck className="size-3 text-[#0040DD]" />
                <span>Fleet Ready</span>
              </div>
              <div className="text-lg xl:text-xl font-black text-white">70+ Units</div>
              <div className="text-[10px] text-slate-400">Cranes, trucks &amp; trailers</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <MapPin className="size-3 text-emerald-400" />
                <span>Central Yard</span>
              </div>
              <div className="text-lg xl:text-xl font-black text-white">S Wilcrest</div>
              <div className="text-[10px] text-slate-400">Houston, TX 77099</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <ShieldCheck className="size-3 text-purple-400" />
                <span>Security</span>
              </div>
              <div className="text-lg xl:text-xl font-black text-white">PBKDF2</div>
              <div className="text-[10px] text-slate-400">SHA-512 Encrypted</div>
            </div>
          </div>
        </div>

        {/* Bottom Facility Footer */}
        <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-300">Gates Open: Mon–Sat 7:00 AM – 7:00 PM CST</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Dispatch Hotlines: (281) 933-5000
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTHENTICATION CONSOLE (Desktop: 42% width) ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-[#030914] relative z-20 overflow-y-auto">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute top-1/3 right-1/4 size-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,64,221,0.2) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        {/* Mobile Header (Brand Logo for small screens) */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <Link to="/">
            <img src={logo} alt="M3 Rental" className="h-8 w-auto brightness-0 invert" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[10px] font-mono text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Houston Live</span>
          </div>
        </div>

        {/* Centered Login Box */}
        <div className="my-auto max-w-sm sm:max-w-md w-full mx-auto space-y-6 pt-6 pb-6">
          {/* Section Greeting */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-[10px] font-black uppercase tracking-widest text-blue-300">
              <ShieldCheck className="size-3 text-emerald-400" />
              <span>Dispatcher Security Clearance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Welcome to Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your credentials to access fleet reservations, quotes &amp; dispatch controls.
            </p>
          </div>

          {/* Database & Rate Limit Shield Strip */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4 text-[#0040DD]" />
              <div className="space-y-0.5">
                <span className="text-slate-300 font-bold block text-[11px]">Security Rate-Limiter</span>
                <span className="text-[10px] text-slate-400 font-mono">3 Attempts • 2-Hour Lockout</span>
              </div>
            </div>

            {/* Visual 3-Attempt Shield Pills */}
            <div className="flex items-center gap-1">
              {[...Array(MAX_FAILED_ATTEMPTS)].map((_, idx) => {
                const isUsable = idx < attemptsLeft;
                return (
                  <span
                    key={idx}
                    className={`h-2.5 w-5 rounded-full transition-all ${
                      isLocked
                        ? "bg-rose-500/80 shadow-xs shadow-rose-500/50"
                        : isUsable
                        ? "bg-emerald-500 shadow-xs shadow-emerald-500/40"
                        : "bg-rose-500/70"
                    }`}
                    title={isUsable ? "Attempt available" : "Attempt consumed"}
                  />
                );
              })}
            </div>
          </div>

          {/* ── 2-HOUR LOCKOUT ACTIVE HUD CARD ── */}
          {isLocked && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 to-rose-900/40 border border-rose-500/40 text-rose-200 text-xs space-y-3.5 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 font-black text-rose-300 text-sm">
                <ShieldAlert className="size-5 shrink-0 text-rose-400 animate-pulse" />
                <span>Terminal Security Lockout Active</span>
              </div>
              <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                Too many incorrect password attempts. To protect fleet data and client records, this terminal is locked for 2 hours.
              </p>

              <div className="p-3.5 rounded-xl bg-black/50 border border-rose-500/30 flex items-center justify-center gap-2.5">
                <Clock className="size-4 text-rose-400 animate-spin" />
                <span className="text-xl font-black text-white font-mono tracking-wider">
                  {remainingTimeStr || "2h 00m 00s"}
                </span>
              </div>

              <div className="text-[10px] text-rose-300/80 flex items-center justify-between pt-1 border-t border-rose-500/20">
                <span>Lockout Enforced: 7,200,000 ms</span>
                <span className="font-bold">Contact Superadmin</span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {error && !isLocked && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-rose-300">Access Denied</div>
                <div className="text-[11px] text-rose-200 leading-relaxed">{error}</div>
              </div>
            </div>
          )}

          {/* Main Credentials Form */}
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
                  placeholder="e.g. admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:bg-white/[0.07] focus:border-[#0040DD] focus:outline-hidden focus:ring-2 focus:ring-[#0040DD]/30 transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Security Password
                </label>
                {capsLockActive && (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="size-3" /> Caps Lock On
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLocked || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:bg-white/[0.07] focus:border-[#0040DD] focus:outline-hidden focus:ring-2 focus:ring-[#0040DD]/30 transition-all disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading || isSuccess}
              className={`w-full py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                isSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-900/40"
                  : isLocked
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-[#0040DD] via-[#0036ba] to-[#002b99] hover:brightness-110 text-white shadow-[#0040DD]/30 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Verifying Credentials with Atlas...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-200" />
                  <span>Security Cleared! Launching...</span>
                </>
              ) : isLocked ? (
                <>
                  <Clock className="size-4 text-rose-400" />
                  <span>Terminal Locked ({remainingTimeStr})</span>
                </>
              ) : (
                <>
                  <KeyRound className="size-4 text-blue-200" />
                  <span>Authenticate &amp; Access Yard</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Return to Public Website */}
          <div className="pt-4 text-center border-t border-white/[0.08]">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Return to M3 Rental Public Site</span>
            </Link>
          </div>
        </div>

        {/* Security Compliance Watermark */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>M3 Operations • Encrypted Session • TLS 1.3 Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
