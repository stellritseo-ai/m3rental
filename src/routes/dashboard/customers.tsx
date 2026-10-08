import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  UserCheck,
  Sparkles,
  MapPin,
  X,
  FileText,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { getBookings, saveBookings, type Booking } from "@/lib/booking-store";
import { getQuotes, type RentalQuote } from "@/lib/dashboard-store";
import { toast } from "sonner";
import {
  getCustomersDb,
  deleteCustomerDb,
  type CustomerDoc,
} from "@/lib/api/customers.functions";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [
      { title: "Customer Directory & Accounts — M3 Rental Houston Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardCustomersPage,
});

interface AggregatedCustomer {
  id: string;
  name: string;
  company?: string | undefined;
  email: string;
  phone: string;
  address?: string | undefined;
  driversLicense?: string | undefined;
  totalBookings: number;
  totalQuotes: number;
  totalSpent: number;
  firstSeen: string;
  lastActive: string;
  bookingIds: string[];
  vehicleHistory: string[];
  status: "verified" | "active" | "inquiry_only";
}

function DashboardCustomersPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "commercial" | "high_value">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load bookings and quotes from store
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<RentalQuote[]>([]);
  const [dbCustomers, setDbCustomers] = useState<CustomerDoc[]>([]);

  // Delete Customer state
  const [customerToDelete, setCustomerToDelete] = useState<AggregatedCustomer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [deletedCustomerEmails, setDeletedCustomerEmails] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("m3_deleted_customers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loadData = async () => {
    setBookings(getBookings());
    setQuotes(getQuotes());
    setIsSyncing(true);
    try {
      const res = await getCustomersDb();
      if (res && res.success && res.customers) {
        setDbCustomers(res.customers);
      }
    } catch (e) {
      console.warn("DB customer sync fallback:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setBookings(getBookings());
      setQuotes(getQuotes());
    };

    window.addEventListener("m3-bookings-changed", handleUpdate);
    window.addEventListener("m3-quotes-changed", handleUpdate);
    return () => {
      window.removeEventListener("m3-bookings-changed", handleUpdate);
      window.removeEventListener("m3-quotes-changed", handleUpdate);
    };
  }, []);

  // Aggregate customers from bookings, commercial quotes, and database
  const customers = useMemo(() => {
    const map = new Map<string, AggregatedCustomer>();

    const isDeleted = (email: string) =>
      deletedCustomerEmails.includes(email.toLowerCase().trim());

    bookings.forEach((b) => {
      const emailKey = b.customer.email.toLowerCase().trim();
      if (isDeleted(emailKey)) return;

      const existing = map.get(emailKey);
      const spent = b.paymentStatus === "approved" || b.bookingStatus === "confirmed" ? b.totalAmount : 0;

      if (existing) {
        existing.totalBookings += 1;
        existing.totalSpent += spent;
        existing.bookingIds.push(b.id);
        if (!existing.vehicleHistory.includes(b.vehicleName)) {
          existing.vehicleHistory.push(b.vehicleName);
        }
        if (new Date(b.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = b.createdAt;
        }
        if (!existing.address && b.customer.address) {
          existing.address = b.customer.address;
        }
        existing.status = existing.totalSpent > 0 ? "active" : "verified";
      } else {
        map.set(emailKey, {
          id: `cust-${emailKey.replace(/[^a-z0-9]/g, "-")}`,
          name: b.customer.fullName,
          email: b.customer.email,
          phone: b.customer.phone,
          address: b.customer.address,
          totalBookings: 1,
          totalQuotes: 0,
          totalSpent: spent,
          firstSeen: b.createdAt,
          lastActive: b.createdAt,
          bookingIds: [b.id],
          vehicleHistory: [b.vehicleName],
          status: spent > 0 ? "active" : "verified",
        });
      }
    });

    quotes.forEach((q) => {
      const emailKey = q.email.toLowerCase().trim();
      if (isDeleted(emailKey)) return;

      const existing = map.get(emailKey);

      if (existing) {
        existing.totalQuotes += 1;
        if (!existing.company && q.companyName) existing.company = q.companyName;
        if (new Date(q.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = q.createdAt;
        }
      } else {
        map.set(emailKey, {
          id: `cust-${emailKey.replace(/[^a-z0-9]/g, "-")}`,
          name: q.customerName,
          ...(q.companyName ? { company: q.companyName } : {}),
          email: q.email,
          phone: q.phone,
          totalBookings: 0,
          totalQuotes: 1,
          totalSpent: 0,
          firstSeen: q.createdAt,
          lastActive: q.createdAt,
          bookingIds: [],
          vehicleHistory: [q.equipmentRequested],
          status: "inquiry_only",
        });
      }
    });

    // Also include any customer from MongoDB not already mapped
    dbCustomers.forEach((c) => {
      const emailKey = c.email.toLowerCase().trim();
      if (isDeleted(emailKey)) return;

      if (!map.has(emailKey)) {
        map.set(emailKey, {
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          address: c.address,
          driversLicense: c.driversLicense,
          totalBookings: c.totalBookings,
          totalQuotes: c.totalQuotes,
          totalSpent: c.totalSpent,
          firstSeen: c.firstSeen,
          lastActive: c.lastActive,
          bookingIds: c.bookingIds || [],
          vehicleHistory: c.vehicleHistory || [],
          status: c.status,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }, [bookings, quotes, dbCustomers, deletedCustomerEmails]);

  // Handle Delete Customer from Database & Local Store
  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeletingCustomer(true);
    const emailKey = customerToDelete.email.toLowerCase().trim();

    try {
      // 1. Delete from MongoDB database
      await deleteCustomerDb({
        data: {
          id: customerToDelete.id,
          email: customerToDelete.email,
        },
      });

      // 2. Add email to deletedCustomerEmails & localStorage
      const updatedDeleted = [...deletedCustomerEmails, emailKey];
      setDeletedCustomerEmails(updatedDeleted);
      try {
        localStorage.setItem("m3_deleted_customers", JSON.stringify(updatedDeleted));
      } catch {}

      // 3. Update dbCustomers state
      setDbCustomers((prev) =>
        prev.filter((c) => c.email.toLowerCase().trim() !== emailKey && c.id !== customerToDelete.id)
      );

      // 4. Remove any bookings belonging to this customer from store
      const currentBookings = getBookings();
      const remainingBookings = currentBookings.filter(
        (b) => b.customer.email.toLowerCase().trim() !== emailKey
      );
      if (remainingBookings.length !== currentBookings.length) {
        saveBookings(remainingBookings);
        setBookings(remainingBookings);
      }

      toast.success(`Customer ${customerToDelete.name} deleted from database`, {
        description: "Customer profile and rental records have been permanently removed.",
      });

      if (selectedCustomerId === customerToDelete.id) {
        setSelectedCustomerId(null);
      }
      setCustomerToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete customer:", err);
      toast.error(`Failed to delete customer: ${err?.message || "Please try again."}`);
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filterType === "active" && c.totalBookings === 0) return false;
      if (filterType === "commercial" && !c.company) return false;
      if (filterType === "high_value" && c.totalSpent < 500) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchCompany = (c.company || "").toLowerCase().includes(q);
        const matchDl = (c.driversLicense || "").toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchCompany || matchDl;
      }
      return true;
    });
  }, [customers, filterType, search]);

  const activeCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Customer's specific bookings
  const customerBookings = useMemo(() => {
    if (!activeCustomer) return [];
    return bookings.filter((b) => b.customer.email.toLowerCase() === activeCustomer.email.toLowerCase());
  }, [bookings, activeCustomer]);

  // KPI calculations
  const totalClients = customers.length;
  const commercialClients = customers.filter((c) => !!c.company).length;
  const activeRenters = customers.filter((c) => c.totalBookings > 0).length;
  const totalLtv = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Company", "Email", "Phone", "Total Bookings", "Total Spent", "Drivers License", "Last Active"];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.company || "N/A"}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      c.totalBookings,
      `$${c.totalSpent.toFixed(2)}`,
      `"${c.driversLicense || "N/A"}"`,
      `"${new Date(c.lastActive).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `m3-customers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer directory CSV exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="size-7 text-[#0040DD]" />
            Client Directory & Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commercial contractors, verified drivers, rental history, and total fleet lifetime value.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold shadow-sm">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              MongoDB: <span className="text-emerald-400 font-bold">customers</span>
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
            title="Reload from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSyncing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="size-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Clients</span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#0040DD]">
              <Users className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{totalClients}</div>
          <div className="mt-1 text-xs text-slate-500">Across retail & commercial</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Commercial / B2B</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Building className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{commercialClients}</div>
          <div className="mt-1 text-xs text-slate-500">Contractors & fleet companies</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Renters</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{activeRenters}</div>
          <div className="mt-1 text-xs text-slate-500">With completed bookings</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Lifetime Spend</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${totalLtv.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">Processed rental transactions</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, company..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]/30 focus:border-[#0040DD] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === "all"
                ? "bg-[#061220] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setFilterType("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === "active"
                ? "bg-[#0040DD] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active Renters ({activeRenters})
          </button>
          <button
            onClick={() => setFilterType("commercial")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === "commercial"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Commercial B2B ({commercialClients})
          </button>
          <button
            onClick={() => setFilterType("high_value")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === "high_value"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            VIP ($500+)
          </button>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Customer / Business</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Bookings</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="size-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search term or filter chips.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#0040DD] transition-colors flex items-center gap-1.5">
                            {cust.name}
                            {cust.company && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                PRO
                              </span>
                            )}
                          </div>
                          {cust.company ? (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building className="size-3 text-slate-400" />
                              {cust.company}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 mt-0.5">Retail Customer</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail className="size-3.5 text-slate-400" />
                          {cust.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="size-3.5 text-slate-400" />
                          {cust.phone}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Car className="size-4 text-slate-400" />
                        <span>{cust.totalBookings}</span>
                        {cust.totalQuotes > 0 && (
                          <span className="text-xs text-slate-400 font-normal">
                            (+{cust.totalQuotes} quote)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900">
                        ${cust.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cust.totalSpent > 0 ? "Paid In Full" : "Pending"}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5 text-slate-400" />
                        {new Date(cust.lastActive).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="size-3.5 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerToDelete(cust);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                          title="Delete customer from database"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal / Drawer */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3.5">
                <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-tr from-[#0040DD] to-indigo-600 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-md shrink-0">
                  {activeCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                    {activeCustomer.name}
                    {activeCustomer.company && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        {activeCustomer.company}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Customer Account: <code className="font-mono text-slate-700">{activeCustomer.id}</code>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Contact Information Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Account Credentials & Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email Address</span>
                      <span className="font-bold text-slate-800">{activeCustomer.email}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeCustomer.email, "email")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0040DD] hover:bg-blue-50"
                    >
                      {copiedKey === "email" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone Number</span>
                      <span className="font-bold text-slate-800">{activeCustomer.phone}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeCustomer.phone, "phone")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0040DD] hover:bg-blue-50"
                    >
                      {copiedKey === "phone" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>

                  {activeCustomer.driversLicense && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Driver's License / ID</span>
                        <span className="font-bold text-slate-800">{activeCustomer.driversLicense}</span>
                      </div>
                      <ShieldCheck className="size-4 text-emerald-600" />
                    </div>
                  )}

                  {activeCustomer.address && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 sm:col-span-2 flex items-start gap-2">
                      <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Address</span>
                        <span className="font-medium text-slate-800">{activeCustomer.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rental History */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Vehicle Rental & Booking History ({customerBookings.length})
                </h4>

                {customerBookings.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No confirmed bookings yet. Customer came in via custom commercial quote.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customerBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-blue-50 text-[#0040DD] flex items-center justify-center shrink-0">
                            <Car className="size-4" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{b.vehicleName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{b.pickupDate} to {b.returnDate}</span>
                              <span>•</span>
                              <span>{b.rentalDays} {b.rentalDays === 1 ? "day" : "days"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <div className="font-extrabold text-slate-900">${b.totalAmount.toFixed(2)}</div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.bookingStatus === "confirmed"
                                   ? "bg-emerald-100 text-emerald-800"
                                  : b.bookingStatus === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {b.bookingStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Member since {new Date(activeCustomer.firstSeen).toLocaleDateString()}</span>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerToDelete(activeCustomer);
                  }}
                  className="text-red-600 hover:text-red-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Customer</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeCustomer.phone}`}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Phone className="size-3.5 text-[#0040DD]" />
                  Call Customer
                </a>
                <a
                  href={`mailto:${activeCustomer.email}`}
                  className="px-3.5 py-2 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mail className="size-3.5" />
                  Email Client
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Customer Confirmation ── */}
      {customerToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 space-y-5 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-lg">
                  Delete Customer Profile?
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{customerToDelete.name}</span>
              </div>
              {customerToDelete.company && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Company:</span>
                  <span className="font-bold text-slate-900">{customerToDelete.company}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email Address:</span>
                <span className="font-medium text-slate-800">{customerToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Bookings:</span>
                <span className="font-bold text-slate-900">{customerToDelete.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Spent:</span>
                <span className="font-bold text-[#0040DD]">${customerToDelete.totalSpent.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
              Warning: This will permanently remove this customer's account and history from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeletingCustomer}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCustomer}
                disabled={isDeletingCustomer}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingCustomer ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Yes, Delete Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
