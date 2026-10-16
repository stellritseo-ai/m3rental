import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  KeyRound,
  Users,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  History,
  Building,
  Check,
  X,
  Radio,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminProfileDb,
  updateAdminProfileDb,
  getAdminUsersDb,
  createAdminUserDb,
  toggleAdminUserStatusDb,
  deleteAdminUserDb,
  getSecurityAuditLogsDb,
  type AdminUserDoc,
} from "@/lib/api/auth.functions";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Admin Profile & Access Management — M3 Rental Houston Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardProfilePage,
});

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("m3_admin_session_token") || undefined;
}

function formatDisplayDate(dateVal?: Date | string): string {
  if (!dateVal) return "Never";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(dateVal);
  }
}

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3 || score === 4) return { score: 3, label: "Strong", color: "bg-blue-600" };
  return { score: 4, label: "Excellent", color: "bg-emerald-500" };
}

function DashboardProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "team" | "audit">("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // My Profile State
  const [profile, setProfile] = useState<{
    username: string;
    fullName?: string | undefined;
    email?: string | undefined;
    role: string;
    createdAt?: Date | string | undefined;
    lastLoginAt?: Date | string | undefined;
  }>({
    username: "admin",
    fullName: "Houston Dispatch Admin",
    email: "dispatch@m3rental.com",
    role: "superadmin",
  });

  // Edit Profile Form
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Admin Team Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "dispatcher" as "superadmin" | "dispatcher" | "fleet_manager",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Security Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const loadProfileAndTeam = async (showToast = false) => {
    setIsRefreshing(true);
    const token = getToken();

    try {
      // 1. Fetch current profile
      const profRes = await getAdminProfileDb({ data: { token } });
      if (profRes && profRes.success && profRes.user) {
        const u = profRes.user as any;
        setProfile(u);
        setEditFullName((u.fullName as string) || "");
        setEditEmail((u.email as string) || "");
        setEditUsername((u.username as string) || "");
      }

      // 2. Fetch all admin users
      const usersRes = await getAdminUsersDb({ data: { token } });
      if (usersRes && usersRes.success && Array.isArray(usersRes.users)) {
        setAdminUsers(usersRes.users);
      }

      // 3. Fetch security audit logs
      const auditRes = await getSecurityAuditLogsDb({ data: { token, limit: 30 } });
      if (auditRes && auditRes.success && Array.isArray(auditRes.logs)) {
        setAuditLogs(auditRes.logs);
      }

      if (showToast) {
        toast.success("Security profile & users reloaded from MongoDB Atlas.");
      }
    } catch (err: any) {
      console.error("[Profile] Data load error:", err);
      toast.error("Failed to load security profile.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileAndTeam();
  }, []);

  // Handle Profile & Password Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Current password is required to authorize any changes.", {
        description: "For security, enter your current password to confirm your identity.",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const token = getToken();
      const res = await updateAdminProfileDb({
        data: {
          token,
          currentPassword: currentPassword.trim(),
          newUsername: editUsername.trim() !== profile.username ? editUsername.trim() : undefined,
          newPassword: newPassword.trim() ? newPassword.trim() : undefined,
          fullName: editFullName.trim() || undefined,
          email: editEmail.trim() || undefined,
        },
      });

      if (res && res.success) {
        toast.success("Security profile updated successfully!", {
          description: "All changes and encrypted password hash saved to MongoDB Atlas.",
        });

        // Update local session
        if (res.updatedUsername && typeof window !== "undefined") {
          localStorage.setItem("m3_admin_username", res.updatedUsername);
        }

        // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        loadProfileAndTeam();
      } else {
        toast.error(res?.error || "Failed to update profile. Check current password.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Server error updating profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Create New Admin User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.fullName.trim() || !newUser.email.trim()) {
      toast.error("All user fields are required.");
      return;
    }

    setIsCreatingUser(true);
    try {
      const token = getToken();
      const res = await createAdminUserDb({
        data: {
          token,
          username: newUser.username.trim().toLowerCase(),
          password: newUser.password.trim(),
          fullName: newUser.fullName.trim(),
          email: newUser.email.trim(),
          role: newUser.role,
        },
      });

      if (res && res.success) {
        toast.success(`New admin "${newUser.username}" created with encrypted password!`);
        setShowAddUserModal(false);
        setNewUser({
          username: "",
          fullName: "",
          email: "",
          password: "",
          role: "dispatcher",
        });
        loadProfileAndTeam();
      } else {
        toast.error(res?.error || "Failed to create user.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Server error creating user.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (targetUsername: string, currentStatus: boolean) => {
    try {
      const token = getToken();
      const res = await toggleAdminUserStatusDb({
        data: {
          token,
          targetUsername,
          isActive: !currentStatus,
        },
      });

      if (res && res.success) {
        toast.success(`User ${targetUsername} ${!currentStatus ? "activated" : "suspended"}.`);
        loadProfileAndTeam();
      } else {
        toast.error(res?.error || "Could not change user status.");
      }
    } catch (err: any) {
      toast.error("Failed to update status.");
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const token = getToken();
      const res = await deleteAdminUserDb({
        data: {
          token,
          targetUsername: userToDelete.username,
        },
      });

      if (res && res.success) {
        toast.success(`User "${userToDelete.username}" deleted from database.`);
        setUserToDelete(null);
        loadProfileAndTeam();
      } else {
        toast.error(res?.error || "Could not delete user.");
      }
    } catch (err: any) {
      toast.error("Failed to delete user.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const passStrength = calculatePasswordStrength(newPassword);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* ── 1. Page Header & Security Telemetry ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0040DD] text-white flex items-center justify-center shadow-md shadow-blue-900/20">
              <ShieldCheck className="size-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Admin Profile &amp; Security Console</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Atlas Verified
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your credentials, change passwords with PBKDF2-SHA512 encryption, add team members, and review security audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300">
              User: <span className="text-emerald-400 font-bold">{profile.username}</span> ({profile.role})
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadProfileAndTeam(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Reload security profile from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Security Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Primary Account</span>
            <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] grid place-items-center">
              <User className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {profile.username}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Role: <span className="font-bold text-[#0040DD] uppercase">{profile.role}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Encryption Standard</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Fingerprint className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            PBKDF2-SHA512
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            <span>100,000 Iterations + Salt</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Rate Limit Shield</span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <Lock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            3 Attempts / 2h
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            2-Hour Brute Force Lockout
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Authorized Team</span>
            <div className="size-8 rounded-xl bg-purple-50 text-purple-600 grid place-items-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {adminUsers.length || 1} Admins
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            MongoDB collection: <code className="font-bold">admin_users</code>
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "profile"
              ? "border-[#0040DD] text-[#0040DD]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="size-4" />
          <span>My Profile &amp; Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "team"
              ? "border-[#0040DD] text-[#0040DD]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="size-4" />
          <span>Admin Team ({adminUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "border-[#0040DD] text-[#0040DD]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History className="size-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── 4. TAB 1: My Profile & Password Update Form ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Profile & Password Updates (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-black text-slate-900 text-lg">
                  Update Profile &amp; Change Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Any changes to your username or password require your current password for security verification.
                </p>
              </div>
              <span className="p-2 rounded-xl bg-blue-50 text-[#0040DD]">
                <KeyRound className="size-5" />
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Details Section */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  1. Account Identification
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 text-xs block mb-1.5">
                      Dispatch Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#0040DD] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Used to log into the Houston Yard Console.
                    </span>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 text-xs block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="e.g. Jiten Soni"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-700 text-xs block mb-1.5">
                      Dispatch Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="dispatch@m3rental.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                    2. Security Password (Leave blank to keep existing)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Min 6 characters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-slate-700 text-xs block mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-medium focus:border-[#0040DD] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Strength:</span>
                          <span className="font-bold text-slate-700">{passStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passStrength.color} transition-all`}
                            style={{ width: `${(passStrength.score / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 text-xs block mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#0040DD] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Current Password Check */}
              <div className="pt-4 border-t border-slate-100 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-amber-700 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Authorization Verification Required *
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 font-medium">
                  Please enter your <strong>Current Password</strong> to verify your identity before updating credentials.
                </p>

                <div className="relative max-w-sm">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-medium focus:border-amber-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-black shadow-md shadow-[#0040DD]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Encrypting &amp; Saving to Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Save Profile &amp; Password Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Information Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-[#061220] text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg">
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">{profile.fullName || profile.username}</h4>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Username:</span>
                  <span className="font-mono font-bold text-white">{profile.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Clearance:</span>
                  <span className="font-bold text-blue-300 capitalize">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered:</span>
                  <span className="text-slate-300">{formatDisplayDate(profile.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Terminal Login:</span>
                  <span className="text-emerald-400 font-bold">{formatDisplayDate(profile.lastLoginAt)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 leading-relaxed">
                <ShieldCheck className="size-4 text-emerald-400 inline mr-1" />
                Passwords are automatically hashed with 100,000 PBKDF2-SHA512 iterations and a 16-byte random salt in MongoDB Atlas. Plain-text credentials are never saved.
              </div>
            </div>

            {/* Houston Security Policy Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Shield className="size-4 text-[#0040DD]" />
                <span>Security Policies Enforced</span>
              </h4>
              <ul className="space-y-2 text-slate-600 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>3-Attempt Rate Limit:</strong> 3 failed attempts triggers an automatic 2-hour terminal lockout.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Encrypted Salt Hashing:</strong> Each account possesses a cryptographically random salt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Session Expiry:</strong> Active login sessions auto-expire after 7 days of inactivity.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. TAB 2: Admin Team & Dispatchers ── */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div>
              <h3 className="font-display font-black text-slate-900 text-base">
                Authorized Dispatch Personnel &amp; Accounts
              </h3>
              <p className="text-xs text-slate-500">
                Team members with access to the Houston Yard Operations Console.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-bold shadow-md shadow-[#0040DD]/20 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>+ Add New Dispatcher</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Contact Email</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Last Login</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminUsers.map((u) => {
                    const isSelf = u.username === profile.username;
                    return (
                      <tr key={u.username} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-[#0040DD] to-indigo-800 text-white font-black text-xs grid place-items-center">
                              {u.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{u.fullName || u.username}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-[#0040DD]">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">@{u.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              u.role === "superadmin"
                                ? "bg-purple-100 text-purple-900 border border-purple-200"
                                : u.role === "dispatcher"
                                ? "bg-blue-100 text-[#0040DD] border border-blue-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600 font-medium">
                          {u.email || "No email provided"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              u.isActive !== false
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                u.isActive !== false ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            <span>{u.isActive !== false ? "Active" : "Disabled"}</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                          {formatDisplayDate(u.lastLoginAt)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!isSelf && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u.username, u.isActive !== false)}
                                  className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                    u.isActive !== false
                                      ? "border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                      : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                  }`}
                                  title={u.isActive !== false ? "Disable account" : "Enable account"}
                                >
                                  {u.isActive !== false ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                                  title="Delete user"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. TAB 3: Security & Audit Event Stream ── */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-black text-slate-900 text-base">
                Security Audit Log Stream
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of authentication events, password updates, and lockouts.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Atlas collection: <code className="font-bold">admin_audit_logs</code>
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">
                No recent security audit logs recorded yet.
              </p>
            ) : (
              auditLogs.map((log, i) => {
                const isFail = log.event === "LOGIN_FAILURE";
                const isSuccess = log.event === "LOGIN_SUCCESS";
                const isPass = log.event === "PROFILE_UPDATED";
                const isUserCreate = log.event === "USER_CREATED";

                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-8 rounded-xl grid place-items-center shrink-0 ${
                          isFail
                            ? "bg-rose-100 text-rose-600"
                            : isSuccess
                            ? "bg-emerald-100 text-emerald-600"
                            : isPass
                            ? "bg-blue-100 text-[#0040DD]"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {isFail ? (
                          <AlertTriangle className="size-4" />
                        ) : isSuccess ? (
                          <CheckCircle2 className="size-4" />
                        ) : isPass ? (
                          <KeyRound className="size-4" />
                        ) : (
                          <User className="size-4" />
                        )}
                      </div>

                      <div>
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{log.event.replace(/_/g, " ")}</span>
                          {log.username && (
                            <span className="text-slate-500 font-mono font-semibold">
                              ({log.username})
                            </span>
                          )}
                          {log.isLocked && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white">
                              2H LOCKOUT TRIGGERED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {log.attempts ? `Failed attempt #${log.attempts} of 3` : "Verified operation"}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatDisplayDate(log.timestamp)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Add New Dispatcher ── */}
      {showAddUserModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4 my-8 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#0040DD]">
                  <Plus className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">
                    Create New Dispatcher
                  </h3>
                  <p className="text-xs text-slate-500">
                    Stores password encrypted in MongoDB Atlas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="e.g. Carlos Mendoza"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="e.g. carlos_dispatch"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="carlos@m3rental.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-[#0040DD] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-[#0040DD] focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Will be encrypted with a 16-byte salt and PBKDF2-SHA512 hash.
                </span>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Assigned Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-[#0040DD] focus:outline-hidden bg-white"
                >
                  <option value="dispatcher">Yard Dispatcher (Bookings, Quotes, Customers)</option>
                  <option value="fleet_manager">Fleet Manager (Equipment, Rates, Inventory)</option>
                  <option value="superadmin">Superadmin (Full Unrestricted Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-bold shadow-md shadow-[#0040DD]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingUser ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete User Confirmation ── */}
      {userToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4 my-8 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-red-100 text-red-600 grid place-items-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-base">
                  Delete Admin Account?
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>@{userToDelete.username}</strong> ({userToDelete.fullName})? All active sessions for this user will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingUser ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
