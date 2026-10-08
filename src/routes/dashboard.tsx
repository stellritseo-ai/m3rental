import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Truck,
  MessageSquare,
  FileText,
  Users,
  Mail,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  Search,
  Sparkles,
  ExternalLink,
  QrCode,
  Menu,
  X,
  ArrowLeft,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Radio,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { getBookings } from "@/lib/booking-store";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  DashboardNotification,
  getQuotes,
} from "@/lib/dashboard-store";
import { site } from "@/lib/site";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { verifyAdminSession, logoutAdmin } from "@/lib/api/auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Fleet Management & Operations Console — M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NavItem {
  label: string;
  to: string;
  icon: any;
  badge?: string | null;
  badgeColor?: string;
  pulse?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string }>({
    username: "admin",
    role: "superadmin",
  });

  // Notifications & State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [newQuotesCount, setNewQuotesCount] = useState(0);

  // Check auth on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("m3_admin_session_token") : null;
    if (token) {
      verifyAdminSession({ data: { token } })
        .then((res) => {
          if (res.valid) {
            setIsAuthenticated(true);
            if (res.username) {
              setAdminUser({ username: res.username, role: res.role || "superadmin" });
            }
          } else {
            localStorage.removeItem("m3_admin_session_token");
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          // If offline / local dev, allow session if token exists
          setIsAuthenticated(true);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshData = () => {
    setNotifications(getNotifications());
    const bookings = getBookings();
    setPendingBookingsCount(
      bookings.filter((b) => b && b.paymentStatus === "verification_pending").length
    );
    const quotes = getQuotes();
    setNewQuotesCount(quotes.filter((q) => q && q.status === "new").length);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    refreshData();
    window.addEventListener("m3-bookings-changed", refreshData);
    window.addEventListener("m3-notifs-changed", refreshData);
    window.addEventListener("m3-quotes-changed", refreshData);
    return () => {
      window.removeEventListener("m3-bookings-changed", refreshData);
      window.removeEventListener("m3-notifs-changed", refreshData);
      window.removeEventListener("m3-quotes-changed", refreshData);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("m3_admin_session_token") || undefined : undefined;
    try {
      await logoutAdmin({ data: { token } });
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("m3_admin_session_token");
      localStorage.removeItem("m3_admin_username");
    }
    setIsAuthenticated(false);
    toast.info("Logged out of Houston Operations Console.");
  };

  // If loading session check, display sleek loading splash
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#040d1a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-300 text-xs">
          <div className="size-9 rounded-xl border-2 border-[#0040DD] border-t-transparent animate-spin" />
          <span className="font-bold tracking-wider uppercase text-[10px] text-blue-300">
            Checking Authorized Session...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in, render the login form lockscreen
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={(token, user) => {
          setIsAuthenticated(true);
          setAdminUser(user);
        }}
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navSections: NavSection[] = [
    {
      title: "DISPATCH OPERATIONS",
      items: [
        {
          label: "Executive Overview",
          to: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Rental Bookings",
          to: "/dashboard/bookings",
          icon: Truck,
          badge: pendingBookingsCount > 0 ? `${pendingBookingsCount} Review` : null,
          badgeColor: "bg-amber-500 text-slate-950 font-black",
          pulse: pendingBookingsCount > 0,
        },
      ],
    },
    {
      title: "INVENTORY & FLEET",
      items: [
        {
          label: "Fleet Equipment",
          to: "/dashboard/equipment",
          icon: Package,
          badge: "70+ Units",
          badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
        },
      ],
    },
    {
      title: "FINANCE & CLIENTS",
      items: [
        {
          label: "Customer Directory",
          to: "/dashboard/customers",
          icon: Users,
        },
        {
          label: "Payment & QR Settings",
          to: "/dashboard/payments",
          icon: QrCode,
          badge: "Zelle / Cash App",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
        },
      ],
    },
    {
      title: "REPUTATION & COMMS",
      items: [
        {
          label: "Customer Reviews",
          to: "/dashboard/reviews",
          icon: MessageSquare,
        },
        {
          label: "Dispatch Inbox",
          to: "/dashboard/inbox",
          icon: Mail,
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbTitle = () => {
    const p = location.pathname;
    if (p === "/dashboard" || p === "/dashboard/") return "Executive Overview";
    if (p.includes("/bookings")) return "Rental Bookings & Verification";
    if (p.includes("/equipment")) return "Fleet Catalog & Rates";
    if (p.includes("/customers")) return "Client Directory & Accounts";
    if (p.includes("/payments")) return "Zelle & Cash App Payment Settings";
    if (p.includes("/reviews")) return "Customer Reviews & Reputation";
    if (p.includes("/inbox")) return "Dispatch Message Inbox";
    return "Operations Console";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased selection:bg-[#0040DD] selection:text-white">
      {/* ─── ULTRA-LUXURY DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-gradient-to-b from-[#061220] via-[#08182c] to-[#040d1a] text-white shrink-0 border-r border-blue-500/15 shadow-2xl z-40 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02]">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="M3 Rental Houston"
              className="h-8 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
            />
          </Link>
          {/* <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Yard
          </div> */}
        </div>

        {/* Houston Yard Dispatch Telemetry Strip */}
        <div className="px-5 py-3 border-b border-white/[0.06] bg-blue-950/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="size-3.5 text-[#0040DD]" />
            <span className="font-semibold text-slate-200">SW Houston Yard</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            11613 S Texas 6
          </span>
        </div>

        {/* Nav Links Grouped by Section */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {sec.title}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer group relative ${active
                          ? "bg-gradient-to-r from-[#0040DD] to-[#2563eb] text-white shadow-md shadow-[#0040DD]/30 border border-blue-400/30"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-7 rounded-lg flex items-center justify-center transition-colors ${active
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                            }`}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <span className="tracking-tight">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1 ${item.badgeColor || "bg-white/10 text-white"
                            }`}
                        >
                          {item.pulse && (
                            <span className="size-1.5 rounded-full bg-slate-950 animate-ping" />
                          )}
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer & User Profile */}
        <div className="p-4 mt-auto space-y-3 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative size-9 rounded-xl bg-gradient-to-tr from-[#0040DD] to-[#16A34A] text-white font-black text-xs grid place-items-center shadow-md shrink-0">
                M3
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#061220]" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-black text-white truncate flex items-center gap-1">
                  {adminUser.username}
                  <ShieldCheck className="size-3.5 text-blue-300 shrink-0" />
                </div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Dispatch Yard Admin
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="tel:2819335000"
                title="Call Yard Phone"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="size-3.5 text-emerald-400" />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out of Terminal"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
              >
                <LogOut className="size-3.5 text-rose-400" />
              </button>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/10 shadow-xs"
          >
            <ArrowLeft className="size-3.5 text-blue-400" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          />
          <aside className="fixed top-0 bottom-0 left-0 w-[280px] bg-gradient-to-b from-[#061220] via-[#08182c] to-[#040d1a] text-white flex flex-col border-r border-blue-500/15 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="h-20 px-6 flex items-center justify-between border-b border-white/[0.08]">
              <img src={logo} alt="M3 Rental" className="h-7 w-auto brightness-0 invert opacity-95" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              {navSections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {sec.title}
                  </div>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${active
                            ? "bg-gradient-to-r from-[#0040DD] to-[#2563eb] text-white shadow-md shadow-[#0040DD]/30"
                            : "text-slate-300 hover:bg-white/[0.07]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/20 text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-white/[0.08] space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20"
              >
                <LogOut className="size-3.5" />
                <span>Log Out ({adminUser.username})</span>
              </button>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to Website</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Menu className="size-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link to="/dashboard" className="hover:text-[#0040DD] font-bold text-slate-700 transition-colors">
                M3 Console
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-extrabold tracking-tight">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2.5 rounded-xl border transition-all ${notificationsOpen
                    ? "border-[#0040DD] bg-blue-50/60 text-[#0040DD]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                title="Notifications"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#0040DD] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">System Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0040DD] text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markAllNotificationsAsRead();
                        setNotifications(getNotifications());
                      }}
                      className="text-[11px] font-bold text-[#0040DD] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        <CheckCircle2 className="size-8 mx-auto text-emerald-500 mb-1" />
                        <p className="font-semibold text-slate-600">All caught up!</p>
                        <p className="text-[11px] text-slate-400">No new alerts at this time.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            setNotifications(getNotifications());
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${n.read
                              ? "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                              : "bg-blue-50/70 border-blue-200 text-slate-900 font-semibold shadow-2xs"
                            }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-xs text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed font-normal">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View Website Button */}
            <a
              href="/equipment/2008-honda-ridgeline-midsize-pickup"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <ExternalLink className="size-3.5 text-[#0040DD]" />
              <span className="hidden sm:inline">View Website</span>
            </a>

            {/* Log Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
              title={`Logged in as ${adminUser.username} — click to log out`}
            >
              <LogOut className="size-3.5 text-rose-500" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Child Pages Render Here */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
