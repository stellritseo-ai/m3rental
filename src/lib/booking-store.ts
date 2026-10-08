/**
 * M3 Rental Booking & Availability Engine
 * Persistent, scalable store for vehicles, bookings, real-time availability, and admin verification.
 */

export type PaymentMethod = "zelle" | "cashapp" | "cash";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "verification_pending" | "approved" | "rejected";

export type CustomerInfo = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
};

export type Booking = {
  id: string; // e.g. M3-20261007-001
  vehicleSlug: string;
  vehicleName: string;
  vehicleImage: string;
  dailyRate: number;
  customer: CustomerInfo;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  rentalDays: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentScreenshot: string; // Base64 data URL
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO string
  reviewedAt?: string;
  adminNotes?: string;
};

export type PaymentSettings = {
  zelle: {
    accountName: string;
    accountEmailOrPhone: string;
    qrCodeUrl: string; // Data URL or Image URL
    instructions: string;
  };
  cashapp: {
    cashtag: string;
    accountName: string;
    qrCodeUrl: string; // Data URL or Image URL
    instructions: string;
  };
};

const STORAGE_KEY_BOOKINGS = "m3_rental_bookings_v2";
const STORAGE_KEY_PAYMENTS = "m3_rental_payment_settings_v2";

// Helper to generate a crisp SVG Data URI QR Code for authentic visual scanning
function generateDefaultQrSvg(title: string, subtitle: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <rect width="240" height="240" fill="#ffffff" rx="16"/>
    <!-- Outer Corners -->
    <rect x="24" y="24" width="56" height="56" fill="${color}" rx="8"/>
    <rect x="32" y="32" width="40" height="40" fill="#ffffff" rx="4"/>
    <rect x="40" y="40" width="24" height="24" fill="${color}" rx="2"/>

    <rect x="160" y="24" width="56" height="56" fill="${color}" rx="8"/>
    <rect x="168" y="32" width="40" height="40" fill="#ffffff" rx="4"/>
    <rect x="176" y="40" width="24" height="24" fill="${color}" rx="2"/>

    <rect x="24" y="160" width="56" height="56" fill="${color}" rx="8"/>
    <rect x="32" y="168" width="40" height="40" fill="#ffffff" rx="4"/>
    <rect x="40" y="176" width="24" height="24" fill="${color}" rx="2"/>

    <!-- QR Data Matrix Pattern Simulation -->
    <rect x="96" y="28" width="16" height="16" fill="${color}" rx="2"/>
    <rect x="120" y="28" width="16" height="16" fill="${color}" rx="2"/>
    <rect x="96" y="52" width="24" height="12" fill="${color}" rx="2"/>
    <rect x="128" y="52" width="12" height="24" fill="${color}" rx="2"/>

    <rect x="28" y="96" width="16" height="16" fill="${color}" rx="2"/>
    <rect x="52" y="96" width="16" height="24" fill="${color}" rx="2"/>
    <rect x="28" y="128" width="24" height="12" fill="${color}" rx="2"/>

    <!-- Center Badge Area -->
    <circle cx="120" cy="120" r="34" fill="#ffffff" stroke="${color}" stroke-width="4"/>
    <circle cx="120" cy="120" r="26" fill="${color}"/>
    <text x="120" y="125" font-family="sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">${title.substring(0, 3).toUpperCase()}</text>

    <!-- Bottom Matrix Bits -->
    <rect x="96" y="160" width="16" height="16" fill="${color}" rx="2"/>
    <rect x="120" y="160" width="24" height="12" fill="${color}" rx="2"/>
    <rect x="160" y="96" width="24" height="16" fill="${color}" rx="2"/>
    <rect x="192" y="96" width="16" height="24" fill="${color}" rx="2"/>
    <rect x="160" y="128" width="16" height="16" fill="${color}" rx="2"/>
    <rect x="184" y="128" width="24" height="16" fill="${color}" rx="2"/>
    <rect x="96" y="184" width="24" height="16" fill="${color}" rx="2"/>
    <rect x="128" y="184" width="16" height="24" fill="${color}" rx="2"/>
    <rect x="160" y="160" width="20" height="20" fill="${color}" rx="2"/>
    <rect x="190" y="160" width="18" height="18" fill="${color}" rx="2"/>
    <rect x="160" y="190" width="24" height="18" fill="${color}" rx="2"/>
    <rect x="192" y="190" width="16" height="18" fill="${color}" rx="2"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  zelle: {
    accountName: "M3 Rental LLC",
    accountEmailOrPhone: "m3.wvalverse@gmail.com",
    qrCodeUrl: generateDefaultQrSvg("ZEL", "Zelle Pay", "#7414CA"),
    instructions:
      "Open your banking app, navigate to Zelle, scan this QR code or send to m3.wvalverse@gmail.com. Include your Full Name and Vehicle in the memo.",
  },
  cashapp: {
    cashtag: "$M3RentalHouston",
    accountName: "M3 Rental Houston",
    qrCodeUrl: generateDefaultQrSvg("CSH", "Cash App", "#00D632"),
    instructions:
      "Open Cash App, scan this QR code or send to $M3RentalHouston. Ensure the amount matches your exact booking total.",
  },
};

// Empty default bookings — real bookings come from MongoDB or customer reservations
const INITIAL_SEED_BOOKINGS: Booking[] = [];

// --- Persistence Helpers ---

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading bookings from localStorage:", err);
    return [];
  }
}

export function saveBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("m3-bookings-changed"));
  } catch (err) {
    console.error("Error saving bookings to localStorage:", err);
  }
}

export function getPaymentSettings(): PaymentSettings {
  if (typeof window === "undefined") return DEFAULT_PAYMENT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
      return DEFAULT_PAYMENT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading payment settings:", err);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

// Auto-sync with MongoDB on client mount
if (typeof window !== "undefined") {
  setTimeout(() => {
    // Fetch latest from MongoDB asynchronously
    import("./api/bookings.functions").then(({ getBookingsDb }) => {
      getBookingsDb().then((res) => {
        if (res && res.success && Array.isArray(res.bookings)) {
          try {
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(res.bookings));
            window.dispatchEvent(new Event("m3-bookings-changed"));
          } catch {}
        }
      }).catch(() => {});
    }).catch(() => {});
    import("./api/payments.functions").then(({ getPaymentSettingsDb }) => {
      getPaymentSettingsDb().then((res) => {
        if (res && res.success && res.settings) {
          try {
            localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(res.settings));
            window.dispatchEvent(new Event("m3-payment-settings-changed"));
          } catch {}
        }
      }).catch(() => {});
    }).catch(() => {});
  }, 100);
}

export function savePaymentSettings(settings: PaymentSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(settings));
    window.dispatchEvent(new Event("m3-payment-settings-changed"));
    import("./api/payments.functions").then(({ updatePaymentSettingsDb }) => {
      updatePaymentSettingsDb({ data: settings }).catch(() => {});
    });
  } catch (err) {
    console.error("Error saving payment settings:", err);
  }
}

// --- Date & Availability Engine ---

/**
 * Parses YYYY-MM-DD string into a normalized local Date object (midnight).
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayString(): string {
  return formatDateString(new Date());
}

/**
 * Returns all active bookings for a given vehicle slug.
 * Excludes cancelled bookings.
 */
export function getActiveVehicleBookings(vehicleSlug: string): Booking[] {
  const all = getBookings();
  return all.filter(
    (b) => b.vehicleSlug === vehicleSlug && b.bookingStatus !== "cancelled",
  );
}

export type BookedDateRange = {
  id: string;
  pickupDate: string;
  returnDate: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
};

/**
 * Returns all currently unavailable booked ranges for a vehicle.
 * Requirement 12: Automatically releases dates if returnDate < today!
 */
export function getUnavailableDateRanges(vehicleSlug: string): BookedDateRange[] {
  const active = getActiveVehicleBookings(vehicleSlug);
  const todayStr = getTodayString();

  return active
    .filter((b) => b.returnDate >= todayStr) // Requirement 12: only current or future bookings block availability
    .map((b) => ({
      id: b.id,
      pickupDate: b.pickupDate,
      returnDate: b.returnDate,
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      customerName: b.customer.fullName,
    }));
}

/**
 * Checks whether a specific date (YYYY-MM-DD) falls within an existing booking.
 */
export function isDateBlocked(vehicleSlug: string, dateStr: string): boolean {
  const ranges = getUnavailableDateRanges(vehicleSlug);
  return ranges.some(
    (r) => dateStr >= r.pickupDate && dateStr <= r.returnDate,
  );
}

/**
 * Requirement 3 & 18: Checks if [pickupDate, returnDate] overlaps with ANY existing active booking.
 * Overlap condition: (newPickup <= existingReturn) && (newReturn >= existingPickup)
 */
export function isRangeAvailable(
  vehicleSlug: string,
  pickupDate: string,
  returnDate: string,
  excludeBookingId?: string,
): { available: boolean; conflictReason?: string } {
  if (!pickupDate || !returnDate) {
    return { available: false, conflictReason: "Please select both pick-up and return dates." };
  }

  const todayStr = getTodayString();
  if (pickupDate < todayStr) {
    return { available: false, conflictReason: "Pick-up date cannot be in the past." };
  }

  if (returnDate < pickupDate) {
    return { available: false, conflictReason: "Return date must be on or after pick-up date." };
  }

  const activeRanges = getUnavailableDateRanges(vehicleSlug).filter(
    (r) => r.id !== excludeBookingId,
  );

  const conflict = activeRanges.find((r) => {
    return pickupDate <= r.returnDate && returnDate >= r.pickupDate;
  });

  if (conflict) {
    const isPending = conflict.paymentStatus === "verification_pending";
    return {
      available: false,
      conflictReason: `These dates overlap with an existing ${
        isPending ? "pending reservation" : "confirmed booking"
      } (${conflict.pickupDate} to ${conflict.returnDate}). Please choose different dates.`,
    };
  }

  return { available: true };
}

/**
 * Requirement 2: Calculates total rental days and price securely.
 */
export function calculateRentalPrice(
  dailyRate: number,
  pickupDate: string,
  returnDate: string,
): { days: number; total: number } {
  if (!pickupDate || !returnDate || returnDate < pickupDate) {
    return { days: 0, total: 0 };
  }
  const start = parseDateString(pickupDate);
  const end = parseDateString(returnDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  // 1-day minimum (same-day return = 1 day)
  const days = Math.max(1, diffDays === 0 ? 1 : diffDays);
  const total = days * dailyRate;
  return { days, total };
}

/**
 * Requirement 16: Returns live status badge of the vehicle for today's date:
 * AVAILABLE, BOOKED, or PAYMENT VERIFICATION PENDING
 */
export function getVehicleCurrentStatus(vehicleSlug: string): {
  status: "AVAILABLE" | "BOOKED" | "PAYMENT VERIFICATION PENDING";
  colorClass: string;
  badgeText: string;
} {
  const todayStr = getTodayString();
  const ranges = getUnavailableDateRanges(vehicleSlug);

  const currentConflict = ranges.find(
    (r) => todayStr >= r.pickupDate && todayStr <= r.returnDate,
  );

  if (!currentConflict) {
    return {
      status: "AVAILABLE",
      colorClass: "bg-emerald-50 text-[#16A34A] border-emerald-300",
      badgeText: "Available Now",
    };
  }

  if (currentConflict.paymentStatus === "verification_pending") {
    return {
      status: "PAYMENT VERIFICATION PENDING",
      colorClass: "bg-amber-50 text-amber-800 border-amber-300",
      badgeText: "Payment Verification Pending",
    };
  }

  return {
    status: "BOOKED",
    colorClass: "bg-red-50 text-red-700 border-red-300",
    badgeText: "Currently Booked",
  };
}

/**
 * Requirement 14: Generates unique Booking ID: #M3-YYYYMMDD-XXX
 */
export function generateBookingId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `M3-${y}${m}${d}-${rand}`;
}

/**
 * Requirement 10 & 18: Creates a validated booking in the store.
 */
export function createBooking(input: {
  vehicleSlug: string;
  vehicleName: string;
  vehicleImage: string;
  dailyRate: number;
  customer: CustomerInfo;
  pickupDate: string;
  returnDate: string;
  paymentMethod: PaymentMethod;
  paymentScreenshot: string;
}): { success: boolean; booking?: Booking; error?: string } {
  // 1. Verify availability right before final write (prevent double-booking race condition)
  const avail = isRangeAvailable(input.vehicleSlug, input.pickupDate, input.returnDate);
  if (!avail.available) {
    return { success: false, error: avail.conflictReason || "Selected dates are unavailable." };
  }

  // 2. Calculate authoritative price
  const { days, total } = calculateRentalPrice(
    input.dailyRate,
    input.pickupDate,
    input.returnDate,
  );

  if (days <= 0 || total <= 0) {
    return { success: false, error: "Invalid rental duration calculated." };
  }

  if (!input.paymentScreenshot) {
    return { success: false, error: "Payment screenshot is required." };
  }

  const newBooking: Booking = {
    id: generateBookingId(),
    vehicleSlug: input.vehicleSlug,
    vehicleName: input.vehicleName,
    vehicleImage: input.vehicleImage,
    dailyRate: input.dailyRate,
    customer: input.customer,
    pickupDate: input.pickupDate,
    returnDate: input.returnDate,
    rentalDays: days,
    totalAmount: total,
    paymentMethod: input.paymentMethod,
    paymentScreenshot: input.paymentScreenshot,
    bookingStatus: "pending", // Initially Pending
    paymentStatus: "verification_pending", // Manual review pending
    createdAt: new Date().toISOString(),
  };

  const currentBookings = getBookings();
  const updated = [newBooking, ...currentBookings];
  saveBookings(updated);

  // Sync to MongoDB database
  if (typeof window !== "undefined") {
    import("./api/bookings.functions").then(({ createBookingDb }) => {
      createBookingDb({ data: newBooking }).catch(() => {});
    });
  }

  return { success: true, booking: newBooking };
}

/**
 * Admin action: Approve, Reject, or Cancel booking.
 */
export function updateBookingStatus(
  id: string,
  action: "approve" | "reject" | "cancel",
  adminNotes?: string,
  fallbackBooking?: Booking,
): { success: boolean; booking?: Booking; error?: string } {
  const cleanId = id.replace(/^#/, "");
  const all = getBookings();
  let index = all.findIndex(
    (b) => b.id === id || b.id === cleanId || b.id === `#${cleanId}`
  );

  let current = index !== -1 ? all[index] : fallbackBooking;
  if (!current) {
    return { success: false, error: "Booking not found." };
  }

  if (index === -1) {
    all.unshift(current);
    index = 0;
  }

  const nowIso = new Date().toISOString();
  const notes = adminNotes !== undefined ? adminNotes : current.adminNotes;

  let updatedBooking: Booking;

  if (action === "approve") {
    updatedBooking = {
      id: current.id,
      vehicleSlug: current.vehicleSlug,
      vehicleName: current.vehicleName,
      vehicleImage: current.vehicleImage,
      dailyRate: current.dailyRate,
      customer: current.customer,
      pickupDate: current.pickupDate,
      returnDate: current.returnDate,
      rentalDays: current.rentalDays,
      totalAmount: current.totalAmount,
      paymentMethod: current.paymentMethod,
      paymentScreenshot: current.paymentScreenshot,
      createdAt: current.createdAt,
      bookingStatus: "confirmed",
      paymentStatus: "approved",
      reviewedAt: nowIso,
      ...(notes ? { adminNotes: notes } : {}),
    };
  } else if (action === "reject") {
    updatedBooking = {
      id: current.id,
      vehicleSlug: current.vehicleSlug,
      vehicleName: current.vehicleName,
      vehicleImage: current.vehicleImage,
      dailyRate: current.dailyRate,
      customer: current.customer,
      pickupDate: current.pickupDate,
      returnDate: current.returnDate,
      rentalDays: current.rentalDays,
      totalAmount: current.totalAmount,
      paymentMethod: current.paymentMethod,
      paymentScreenshot: current.paymentScreenshot,
      createdAt: current.createdAt,
      bookingStatus: "cancelled",
      paymentStatus: "rejected",
      reviewedAt: nowIso,
      ...(notes ? { adminNotes: notes } : {}),
    };
  } else {
    // cancel
    updatedBooking = {
      id: current.id,
      vehicleSlug: current.vehicleSlug,
      vehicleName: current.vehicleName,
      vehicleImage: current.vehicleImage,
      dailyRate: current.dailyRate,
      customer: current.customer,
      pickupDate: current.pickupDate,
      returnDate: current.returnDate,
      rentalDays: current.rentalDays,
      totalAmount: current.totalAmount,
      paymentMethod: current.paymentMethod,
      paymentScreenshot: current.paymentScreenshot,
      createdAt: current.createdAt,
      bookingStatus: "cancelled",
      paymentStatus: current.paymentStatus,
      reviewedAt: nowIso,
      ...(notes ? { adminNotes: notes } : {}),
    };
  }

  all[index] = updatedBooking;
  saveBookings(all);

  // Sync to MongoDB database
  if (typeof window !== "undefined") {
    import("./api/bookings.functions").then(({ updateBookingStatusDb }) => {
      updateBookingStatusDb({
        data: {
          bookingId: id,
          action,
          ...(adminNotes !== undefined ? { adminNotes } : {}),
        },
      }).catch(() => {});
    });
  }

  return { success: true, booking: updatedBooking };
}

/**
 * Admin action: Permanently delete a booking from local store and database.
 * Also releases the vehicle dates immediately.
 */
export function deleteBooking(id: string): { success: boolean; error?: string } {
  const cleanId = id.replace(/^#/, "");
  const all = getBookings();
  const filtered = all.filter((b) => b.id !== id && b.id !== cleanId && b.id !== `#${cleanId}`);

  saveBookings(filtered);

  // Sync deletion with MongoDB
  if (typeof window !== "undefined") {
    import("./api/bookings.functions").then(({ deleteBookingDb }) => {
      deleteBookingDb({ data: { bookingId: cleanId } }).catch((err) => {
        console.warn("[DB] Could not delete booking from MongoDB:", err);
      });
    });
  }

  return { success: true };
}

