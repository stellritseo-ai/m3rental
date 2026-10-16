/**
 * Client-safe constants & types for the "Sell Your Equipment" feature.
 * Shared by the public /sell page, the dashboard and the server functions.
 */

export const SELL_STATUSES = [
  "new",
  "contacted",
  "negotiating",
  "accepted",
  "purchased",
  "rejected",
] as const;
export type SellStatus = (typeof SELL_STATUSES)[number];

export const SELL_CONDITIONS = ["excellent", "good", "fair", "needs-repair"] as const;
export type SellCondition = (typeof SELL_CONDITIONS)[number];

export const CONTACT_METHODS = ["call", "text", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const MAX_SELL_IMAGES = 8;

export interface SellListingDoc {
  id: string;
  title: string;
  category: string;
  make?: string | undefined;
  model?: string | undefined;
  year?: string | undefined;
  condition: SellCondition;
  usage?: string | undefined; // hours / mileage
  serialNumber?: string | undefined;
  location: string;
  description: string;
  askingPrice: number;
  negotiable: boolean;
  images: string[]; // Cloudinary URLs
  seller: {
    name: string;
    phone: string;
    email: string;
    company?: string | undefined;
    preferredContact: ContactMethod;
    bestTime?: string | undefined;
  };
  status: SellStatus;
  offerAmount?: number | undefined;
  adminNotes?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export const CONDITION_META: Record<SellCondition, { label: string; desc: string; tone: string }> = {
  excellent: {
    label: "Excellent",
    desc: "Like new, fully serviced",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  good: {
    label: "Good",
    desc: "Normal wear, runs great",
    tone: "bg-blue-50 text-[#0040DD] border-blue-200",
  },
  fair: {
    label: "Fair",
    desc: "Visible wear, works",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  "needs-repair": {
    label: "Needs Repair",
    desc: "Mechanical or body issues",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export const STATUS_META: Record<SellStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "New", tone: "bg-blue-50 text-[#0040DD] border-blue-200", dot: "bg-[#0040DD]" },
  contacted: { label: "Contacted", tone: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  negotiating: { label: "Negotiating", tone: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  accepted: { label: "Deal Agreed", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  purchased: { label: "Purchased", tone: "bg-slate-900 text-white border-slate-900", dot: "bg-white" },
  rejected: { label: "Declined", tone: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export const CONTACT_LABEL: Record<ContactMethod, string> = {
  call: "Phone Call",
  text: "Text Message",
  email: "Email",
};
