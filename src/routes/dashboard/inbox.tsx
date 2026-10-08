import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Inbox,
  Search,
  Mail,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Building,
  Sparkles,
  Check,
  Star,
  RefreshCw,
  Archive,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Paperclip,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  Copy,
  ExternalLink,
  X,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteInboxMessage,
  getInboxMessages,
  purgeAllInboxMessages,
  submitClientInquiry,
  updateInboxMessage,
  type DispatchMessage,
  type MessageTag,
} from "@/lib/inbox-store";
import { getMessagesDb } from "@/lib/api/inbox.functions";

export const Route = createFileRoute("/dashboard/inbox")({
  head: () => ({
    meta: [
      { title: "Dispatch Inbox & Inbound Leads — M3 Rental Houston Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardInboxPage,
});

const CANNED_RESPONSES = [
  {
    title: "Yard Address & Pick-up Hours",
    text: "Hello! Our Houston yard is located at 11732 S Wilcrest Dr, Houston, TX 77099. Dispatch gates are open Mon–Sat 7:00 AM – 7:00 PM. Please bring your government photo ID and active insurance for a rapid 15-minute key handoff.",
  },
  {
    title: "Quote Prepared & Confirmed",
    text: "Thank you for reaching out to M3 Rental Houston! We have reviewed your request and confirmed machine availability. We are holding the unit for your requested dates. Call dispatch at (281) 933-5000 to finalize lock-in.",
  },
  {
    title: "Certified Operator Included",
    text: "Yes, our Houston yard provides certified heavy machine operators and CDL drivers for all trucks, trailers, and excavators. Let us know your jobsite address to schedule delivery.",
  },
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function DashboardInboxPage() {
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | "unread" | "landing" | "contact" | "starred">("all");
  const [replyText, setReplyText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [messageToDelete, setMessageToDelete] = useState<DispatchMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    const local = getInboxMessages();
    setMessages(local);
    if (!selectedId && local.length > 0 && local[0]) {
      setSelectedId(local[0].id);
    }
    setIsSyncing(true);

    try {
      const res = await getMessagesDb();
      if (res && res.success && Array.isArray(res.messages)) {
        const remote = (res.messages as unknown as DispatchMessage[]).filter(
          (m) => m && !["msg-1", "msg-2", "msg-3", "msg-101", "msg-102", "msg-103"].includes(m.id)
        );
        setMessages(remote);
        try {
          localStorage.setItem("m3_rental_inbox_v1", JSON.stringify(remote));
        } catch {}
        if (!selectedId && remote.length > 0 && remote[0]) {
          setSelectedId(remote[0].id);
        } else if (remote.length === 0) {
          setSelectedId("");
        }
      }
    } catch (e) {
      console.warn("DB messages fetch fallback:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePurgeAll = () => {
    if (!window.confirm("Are you sure you want to clear all inquiries from your inbox? This will permanently delete them from the database.")) return;
    purgeAllInboxMessages();
    setMessages([]);
    setSelectedId("");
    toast.success("Inbox cleared.");
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      const updated = getInboxMessages();
      setMessages(updated);
      if (!selectedId && updated.length > 0 && updated[0]) {
        setSelectedId(updated[0].id);
      }
    };

    window.addEventListener("m3-inbox-changed", handleUpdate);
    return () => window.removeEventListener("m3-inbox-changed", handleUpdate);
  }, []);

  const activeMessage = useMemo(() => {
    if (!selectedId && messages.length > 0) return messages[0];
    return messages.find((m) => m.id === selectedId) || messages[0] || null;
  }, [messages, selectedId]);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterTag === "unread" && !m.unread) return false;
      if (filterTag === "starred" && !m.starred) return false;
      if (filterTag === "landing" && m.tag !== "Landing Page Form") return false;
      if (filterTag === "contact" && m.tag !== "Contact Page Form") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.senderName.toLowerCase().includes(q);
        const matchEmail = m.senderEmail.toLowerCase().includes(q);
        const matchPhone = m.senderPhone.toLowerCase().includes(q);
        const matchSubject = m.subject.toLowerCase().includes(q);
        const matchCompany = (m.company || "").toLowerCase().includes(q);
        const matchEq = (m.equipmentRequested || "").toLowerCase().includes(q);
        const matchPreview = m.preview.toLowerCase().includes(q);
        return (
          matchName ||
          matchEmail ||
          matchPhone ||
          matchSubject ||
          matchCompany ||
          matchEq ||
          matchPreview
        );
      }
      return true;
    });
  }, [messages, search, filterTag]);

  const unreadCount = messages.filter((m) => m.unread).length;
  const landingCount = messages.filter((m) => m.tag === "Landing Page Form").length;
  const contactCount = messages.filter((m) => m.tag === "Contact Page Form").length;
  const starredCount = messages.filter((m) => m.starred).length;

  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    setMobileShowDetail(true);
    const target = messages.find((m) => m.id === id);
    if (target && target.unread) {
      updateInboxMessage(id, { unread: false });
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = messages.find((m) => m.id === id);
    if (target) {
      updateInboxMessage(id, { starred: !target.starred });
    }
  };

  const handleToggleRead = (id: string) => {
    const target = messages.find((m) => m.id === id);
    if (target) {
      updateInboxMessage(id, { unread: !target.unread });
      toast.info(target.unread ? "Marked as read" : "Marked as unread");
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    const id = messageToDelete.id;

    try {
      deleteInboxMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));

      if (selectedId === id) {
        const remaining = messages.filter((m) => m.id !== id);
        setSelectedId(remaining[0]?.id || "");
      }

      toast.success("Inquiry deleted from database.");
      setMessageToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete message:", err);
      toast.error(`Error deleting inquiry: ${err?.message || "Please try again."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeMessage) return;

    updateInboxMessage(activeMessage.id, {
      replyText: replyText.trim(),
      unread: false,
    });

    setReplyText("");
    toast.success("Dispatcher reply logged and synchronized to MongoDB.");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="size-7 text-[#0040DD]" />
            Inbound Leads &amp; Form Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time feed of equipment requests submitted by clients from the Landing Page and Contact Page.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold shadow-sm">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              MongoDB: <span className="text-emerald-400 font-bold">messages</span>
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Reload from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSyncing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handlePurgeAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Delete all test/dummy inquiries from database"
            >
              <Trash2 className="size-3.5" />
              <span>Purge All</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#0040DD]">
              <MessageSquare className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{messages.length}</div>
          <div className="mt-1 text-xs text-slate-500">All inbound client inquiries</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unread Inquiries</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600 flex items-center gap-2">
            <span>{unreadCount}</span>
            {unreadCount > 0 && <span className="size-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="mt-1 text-xs text-slate-500">Awaiting dispatcher action</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Landing Page</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{landingCount}</div>
          <div className="mt-1 text-xs text-slate-500">Instant inquiries from homepage</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Page</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileText className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{contactCount}</div>
          <div className="mt-1 text-xs text-slate-500">Full equipment reserve requests</div>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, email, phone, equipment, or notes..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0040DD] focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFilterTag("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTag === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Submissions ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTag("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTag === "unread"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Unread ({unreadCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag("landing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTag === "landing"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Landing Page Form ({landingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag("contact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTag === "contact"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-100 text-purple-900 hover:bg-purple-200"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Contact Page Form ({contactCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag("starred")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTag === "starred"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Star className="size-3.5 fill-current" />
            <span>Starred ({starredCount})</span>
          </button>

          <div className="ml-auto text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredMessages.length}</span> of{" "}
            <span className="font-bold text-slate-800">{messages.length}</span> inquiries
          </div>
        </div>
      </div>

      {/* ── Main Two-Pane Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Inquiries Feed (col-span-5) */}
        <div className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[700px] lg:h-[750px] ${
          mobileShowDetail ? "hidden lg:flex" : "flex"
        }`}>
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Incoming Inquiries Feed
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {filteredMessages.length} leads
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Inbox className="size-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No Inquiries Found</p>
                <p className="text-xs text-slate-400">
                  Submissions from the landing page or contact page will appear here instantly.
                </p>
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isSelected = activeMessage?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMessage(m.id)}
                    className={`p-4 transition-all cursor-pointer relative group ${
                      isSelected
                        ? "bg-blue-50/60 border-l-4 border-l-[#0040DD]"
                        : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                    } ${m.unread ? "bg-amber-50/20" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Unread indicator */}
                        {m.unread && (
                          <span className="size-2 rounded-full bg-[#0040DD] shrink-0" />
                        )}
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {m.senderName}
                        </span>
                        {m.company && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline">
                            • {m.company}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, m.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            m.starred
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 hover:text-amber-500"
                          }`}
                        >
                          <Star className="size-3.5" fill={m.starred ? "currentColor" : "none"} />
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDisplayDate(m.date)}
                        </span>
                      </div>
                    </div>

                    {/* Tag badge */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          m.tag === "Landing Page Form"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : m.tag === "Contact Page Form"
                            ? "bg-blue-50 text-[#0040DD] border border-blue-200"
                            : "bg-purple-50 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {m.tag}
                      </span>
                      {m.equipmentRequested && (
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                          {m.equipmentRequested}
                        </span>
                      )}
                    </div>

                    {/* Preview snippet */}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {m.preview}
                    </p>

                    {/* Quick delete on hover */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/60">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Phone className="size-3 text-slate-400" /> {m.senderPhone}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMessageToDelete(m);
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Inquiry Details & Dispatch Action Center (col-span-7) */}
        <div className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[700px] lg:h-[750px] ${
          mobileShowDetail ? "flex" : "hidden lg:flex"
        }`}>
          {activeMessage ? (
            <>
              {/* Pane Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="size-3.5 text-[#0040DD]" />
                    <span>Back</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          activeMessage.tag === "Landing Page Form"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : activeMessage.tag === "Contact Page Form"
                            ? "bg-blue-100 text-[#0040DD] border border-blue-300"
                            : "bg-purple-100 text-purple-900 border border-purple-300"
                        }`}
                      >
                        {activeMessage.tag}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                        Received {new Date(activeMessage.date).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-display mt-1">
                      {activeMessage.subject}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(activeMessage.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    {activeMessage.unread ? "Mark as Read" : "Mark as Unread"}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(e, activeMessage.id)}
                    className={`p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeMessage.starred ? "text-amber-500" : "text-slate-400 hover:text-amber-500"
                    }`}
                    title={activeMessage.starred ? "Unstar" : "Star"}
                  >
                    <Star className="size-4" fill={activeMessage.starred ? "currentColor" : "none"} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageToDelete(activeMessage)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete inquiry from database"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Message Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Client Contact Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <User className="size-3.5 text-[#0040DD]" /> Client Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Full Name</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {activeMessage.senderName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Company / Organization</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {activeMessage.company || "Independent Renter / Retail"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Phone Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${activeMessage.senderPhone}`}
                          className="font-bold text-[#0040DD] hover:underline flex items-center gap-1"
                        >
                          <Phone className="size-3" />
                          {activeMessage.senderPhone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeMessage.senderPhone, "phone")}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title="Copy phone"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`mailto:${activeMessage.senderEmail}`}
                          className="font-bold text-[#0040DD] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                        >
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">{activeMessage.senderEmail}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeMessage.senderEmail, "email")}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title="Copy email"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Request Specifications */}
                {(activeMessage.equipmentRequested ||
                  activeMessage.rentalDuration ||
                  activeMessage.jobsiteLocation) && (
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200/80">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0040DD] mb-3 flex items-center gap-1.5">
                      <Truck className="size-3.5" /> Equipment Request Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {activeMessage.equipmentRequested && (
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Machine / Unit</span>
                          <span className="font-extrabold text-slate-900 block mt-0.5">
                            {activeMessage.equipmentRequested}
                          </span>
                        </div>
                      )}

                      {activeMessage.rentalDuration && (
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Requested Duration</span>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            {activeMessage.rentalDuration}
                          </span>
                        </div>
                      )}

                      {activeMessage.jobsiteLocation && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500 block text-[11px] font-medium">Jobsite / Pickup Point</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3.5 text-slate-400 shrink-0" />
                            {activeMessage.jobsiteLocation}
                          </span>
                        </div>
                      )}

                      {activeMessage.operatorRequired !== undefined && (
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Operator Preference</span>
                          <span className="font-semibold text-slate-800 block mt-0.5">
                            {activeMessage.operatorRequired ? "Certified Operator Requested" : "Self-Operated"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conversation Thread */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Submission &amp; Communication Thread
                  </h4>
                  <div className="space-y-3">
                    {activeMessage.thread.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                          t.sender === "client"
                            ? "bg-white border-slate-200 text-slate-800"
                            : "bg-blue-600 text-white border-blue-600 ml-6"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] opacity-80">
                          <span className="font-bold">
                            {t.sender === "client" ? activeMessage.senderName : "M3 Yard Dispatch"}
                          </span>
                          <span>{t.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line font-medium">{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canned Response Template Picker */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Quick Dispatch Templates
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CANNED_RESPONSES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReplyText(tpl.text)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply Form Footer */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a dispatcher reply or note to update this thread..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0040DD] focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] disabled:opacity-50 text-white text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Send className="size-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Inbox className="size-12 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 text-base">Select an Inquiry</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose an inquiry from the feed on the left to inspect customer details and respond.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Delete Inquiry Confirmation ── */}
      {messageToDelete && (
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
                  Delete Inbound Inquiry?
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Sender:</span>
                <span className="font-bold text-slate-900">{messageToDelete.senderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Source:</span>
                <span className="font-bold text-[#0040DD]">{messageToDelete.tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Subject:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {messageToDelete.subject}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Received:</span>
                <span className="text-slate-700">{formatDisplayDate(messageToDelete.date)}</span>
              </div>
            </div>

            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
              Warning: This inquiry thread will be permanently deleted from MongoDB and removed from the dispatch inbox.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Yes, Delete Inquiry</span>
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
