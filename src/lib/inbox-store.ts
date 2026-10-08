import type { DispatchMessageDoc } from "./api/inbox.functions";

export type MessageTag =
  | "General Inquire"
  | "Fleet Booking"
  | "Jobsite Delivery"
  | "Commercial Bid"
  | "Landing Page Form"
  | "Contact Page Form";

export interface ThreadItem {
  sender: "client" | "dispatch";
  text: string;
  timestamp: string;
}

export interface DispatchMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  company?: string | undefined;
  subject: string;
  preview: string;
  thread: ThreadItem[];
  date: string;
  unread: boolean;
  starred: boolean;
  tag: MessageTag;
  equipmentRequested?: string | undefined;
  rentalDuration?: string | undefined;
  jobsiteLocation?: string | undefined;
  operatorRequired?: boolean | undefined;
}

export const STORAGE_KEY_INBOX = "m3_rental_inbox_v1";

// Empty default inbox — real inquiries are created when clients submit forms on the site
const INITIAL_SEED_INBOX: DispatchMessage[] = [];

const DUMMY_MESSAGE_IDS = new Set(["msg-1", "msg-2", "msg-3", "msg-101", "msg-102", "msg-103"]);

export function getInboxMessages(): DispatchMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INBOX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Automatically purge any dummy seeds from localStorage
    const cleaned = parsed.filter((m) => m && !DUMMY_MESSAGE_IDS.has(m.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error("Error reading inbox from localStorage:", err);
    return [];
  }
}

export function saveInboxMessages(messages: DispatchMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(messages));
    window.dispatchEvent(new Event("m3-inbox-changed"));
  } catch (err) {
    console.error("Error saving inbox to localStorage:", err);
  }
}

/**
 * Called when a client submits a form from the Landing Page or Contact Page.
 * Adds the message to dispatch inbox and synchronizes with MongoDB.
 */
export function submitClientInquiry(input: {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  company?: string | undefined;
  equipmentRequested?: string | undefined;
  rentalDuration?: string | undefined;
  jobsiteLocation?: string | undefined;
  operatorRequired?: boolean | undefined;
  notes?: string | undefined;
  source: "landing_page" | "contact_page";
}): DispatchMessage {
  const now = new Date().toISOString();
  const id = `inq-${Date.now()}`;
  const tag: MessageTag =
    input.source === "contact_page" ? "Contact Page Form" : "Landing Page Form";

  const subject = input.equipmentRequested
    ? `${input.source === "contact_page" ? "Contact Page Request" : "Landing Page Inquiry"}: ${input.equipmentRequested}`
    : `Inquiry from ${input.source === "contact_page" ? "Contact Page" : "Landing Page"}`;

  const messageBody = [
    input.equipmentRequested ? `Equipment: ${input.equipmentRequested}` : null,
    input.rentalDuration ? `Duration: ${input.rentalDuration}` : null,
    input.jobsiteLocation ? `Jobsite: ${input.jobsiteLocation}` : null,
    input.operatorRequired !== undefined
      ? `Operator: ${input.operatorRequired ? "Operator Needed" : "Self-Operated"}`
      : null,
    input.notes ? `\nClient Notes:\n"${input.notes}"` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const newMsg: DispatchMessage = {
    id,
    senderName: input.senderName,
    senderEmail: input.senderEmail || "inquiry@m3rental.com",
    senderPhone: input.senderPhone,
    company: input.company,
    subject,
    preview: input.notes
      ? input.notes.slice(0, 95) + (input.notes.length > 95 ? "..." : "")
      : `${input.equipmentRequested || "Equipment inquiry"} (${input.rentalDuration || "Daily"})`,
    thread: [
      {
        sender: "client",
        text: messageBody || "No additional message text.",
        timestamp: now,
      },
    ],
    date: now,
    unread: true,
    starred: false,
    tag,
    equipmentRequested: input.equipmentRequested,
    rentalDuration: input.rentalDuration,
    jobsiteLocation: input.jobsiteLocation,
    operatorRequired: input.operatorRequired,
  };

  const current = getInboxMessages();
  const updated = [newMsg, ...current];
  saveInboxMessages(updated);

  // Sync to MongoDB database
  if (typeof window !== "undefined") {
    import("./api/inbox.functions").then(({ createMessageDb }) => {
      createMessageDb({
        data: {
          senderName: input.senderName,
          senderEmail: input.senderEmail || "inquiry@m3rental.com",
          senderPhone: input.senderPhone,
          company: input.company,
          subject,
          message: messageBody || "No additional message text.",
          tag: "Fleet Booking",
        },
      }).catch((err) => {
        console.warn("[DB] Could not sync inbound message to MongoDB:", err);
      });
    }).catch(() => {});
  }

  return newMsg;
}

/**
 * Permanently delete message from local storage and MongoDB database.
 */
export function deleteInboxMessage(id: string): { success: boolean } {
  const current = getInboxMessages();
  const filtered = current.filter((m) => m.id !== id);
  saveInboxMessages(filtered);

  if (typeof window !== "undefined") {
    import("./api/inbox.functions").then(({ deleteMessageDb }) => {
      deleteMessageDb({ data: { id } }).catch((err) => {
        console.warn("[DB] Could not delete message from MongoDB:", err);
      });
    }).catch(() => {});
  }

  return { success: true };
}

/**
 * Update message read, starred, or reply thread.
 */
export function updateInboxMessage(
  id: string,
  updates: { unread?: boolean; starred?: boolean; replyText?: string }
): void {
  const current = getInboxMessages();
  const now = new Date().toISOString();

  const next = current.map((m) => {
    if (m.id !== id) return m;

    const newThread = updates.replyText
      ? [
          ...m.thread,
          {
            sender: "dispatch" as const,
            text: updates.replyText,
            timestamp: now,
          },
        ]
      : m.thread;

    return {
      ...m,
      ...(updates.unread !== undefined ? { unread: updates.unread } : {}),
      ...(updates.starred !== undefined ? { starred: updates.starred } : {}),
      thread: newThread,
      ...(updates.replyText ? { date: now } : {}),
    };
  });

  saveInboxMessages(next);

  if (typeof window !== "undefined") {
    import("./api/inbox.functions").then(({ updateMessageDb }) => {
      updateMessageDb({
        data: {
          id,
          unread: updates.unread,
          starred: updates.starred,
          replyText: updates.replyText,
        },
      }).catch(() => {});
    }).catch(() => {});
  }
}

// Background auto-sync on client load
if (typeof window !== "undefined") {
  setTimeout(() => {
    import("./api/inbox.functions").then(({ getMessagesDb }) => {
      getMessagesDb()
        .then((res) => {
          if (res && res.success && Array.isArray(res.messages)) {
            try {
              const cleaned = (res.messages as any[]).filter(
                (m) => m && !DUMMY_MESSAGE_IDS.has(m.id)
              );
              localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(cleaned));
              window.dispatchEvent(new Event("m3-inbox-changed"));
            } catch {}
          }
        })
        .catch(() => {});
    }).catch(() => {});
  }, 100);
}

/**
 * Admin action: Purge all inbox messages from local storage and MongoDB.
 */
export function purgeAllInboxMessages(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_INBOX, "[]");
  window.dispatchEvent(new Event("m3-inbox-changed"));

  import("./api/inbox.functions").then(({ purgeAllMessagesDb }) => {
    purgeAllMessagesDb().catch((err) => {
      console.warn("[DB] Could not purge messages from MongoDB:", err);
    });
  }).catch(() => {});
}
