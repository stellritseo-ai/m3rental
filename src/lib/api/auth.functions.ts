import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days session

interface LockRecord {
  username: string;
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt?: Date;
}

interface SessionRecord {
  tokenHash: string;
  username: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory fallback lockout and session tracking
const memoryLocks: Record<string, { attempts: number; lockedUntil: number | null }> = {};
const memorySessions: Record<string, { username: string; role: string; expiresAt: number }> = {};

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: { username: string; role: string };
  error?: string;
  isLocked?: boolean;
  lockedUntil?: number;
  attemptsLeft?: number;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getExpectedCredentials() {
  const expectedUser = (process.env["ADMIN_USERNAME"] || "admin").trim().toLowerCase();
  const expectedPass = process.env["ADMIN_PASSWORD"] || "admin12";
  return { expectedUser, expectedPass };
}

// ── Check Lockout Status ──────────────────────────────────────────────────
export const getLockoutStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ username: z.string() }))
  .handler(
    async ({
      data,
    }): Promise<{ isLocked: boolean; lockedUntil?: number; attemptsLeft?: number }> => {
      const userKey = data.username.trim().toLowerCase();
      const now = Date.now();

      try {
        const db = await connectDB();
        if (db) {
          const locksCol = db.collection<LockRecord>("admin_lockouts");
          const lockRecord = await locksCol.findOne({ username: userKey });

          if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > now) {
            return {
              isLocked: true,
              lockedUntil: lockRecord.lockedUntil,
              attemptsLeft: 0,
            };
          }
          const attempts = lockRecord?.failedAttempts || 0;
          return {
            isLocked: false,
            attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
          };
        }
      } catch {
        // Fall back to memory
      }

      const mem = memoryLocks[userKey];
      if (mem && mem.lockedUntil && mem.lockedUntil > now) {
        return { isLocked: true, lockedUntil: mem.lockedUntil, attemptsLeft: 0 };
      }

      return {
        isLocked: false,
        attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - (mem?.attempts || 0)),
      };
    }
  );

// ── Verify Admin Session ──────────────────────────────────────────────────
export const verifyAdminSession = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional() }))
  .handler(
    async ({ data }): Promise<{ valid: boolean; username?: string; role?: string }> => {
      let rawToken = data?.token || null;

      if (!rawToken) {
        try {
          const m = "vinxi/http";
          const { getCookie } = await import(/* @vite-ignore */ m);
          rawToken = getCookie("m3_admin_session") || null;
        } catch {
          // In client-only or non-vinxi context
        }
      }

      if (!rawToken) return { valid: false };

      const tokenHash = hashToken(rawToken);
      const now = Date.now();

      // Check in-memory session cache
      const memSess = memorySessions[tokenHash];
      if (memSess && memSess.expiresAt > now) {
        return { valid: true, username: memSess.username, role: memSess.role };
      }

      // Check MongoDB session collection
      try {
        const db = await connectDB();
        if (db) {
          const sessionsCol = db.collection<SessionRecord>("admin_sessions");
          const session = await sessionsCol.findOne({ tokenHash });
          if (session && session.expiresAt && new Date(session.expiresAt).getTime() > now) {
            const expTime = new Date(session.expiresAt).getTime();
            memorySessions[tokenHash] = {
              username: session.username,
              role: session.role || "superadmin",
              expiresAt: expTime,
            };
            return { valid: true, username: session.username, role: session.role || "superadmin" };
          }
        }
      } catch (e) {
        console.warn("[AUTH] Session DB verification error:", e);
      }

      return { valid: false };
    }
  );

// ── Admin Login with Database Storage & Audit Trail ──────────────────────
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    })
  )
  .handler(async ({ data }): Promise<AuthResponse> => {
    const userKey = data.username.trim().toLowerCase();
    const inputPass = data.password.trim();
    const now = Date.now();
    const { expectedUser, expectedPass } = getExpectedCredentials();

    let db: Awaited<ReturnType<typeof connectDB>> = null;
    try {
      db = await connectDB();
    } catch {
      // Gracefully continue with fallback
    }

    // 1. Check for Active Security Lockout
    if (db) {
      try {
        const locksCol = db.collection<LockRecord>("admin_lockouts");
        const lockRecord = await locksCol.findOne({ username: userKey });
        if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > now) {
          const remainingMinutes = Math.ceil((lockRecord.lockedUntil - now) / 60000);
          return {
            success: false,
            isLocked: true,
            lockedUntil: lockRecord.lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Active: Too many failed login attempts. Locked for ${remainingMinutes} more minutes.`,
          };
        }
      } catch {
        // Ignore lock read error
      }
    } else {
      const mem = memoryLocks[userKey];
      if (mem && mem.lockedUntil && mem.lockedUntil > now) {
        const remainingMinutes = Math.ceil((mem.lockedUntil - now) / 60000);
        return {
          success: false,
          isLocked: true,
          lockedUntil: mem.lockedUntil,
          attemptsLeft: 0,
          error: `Security Lockout Active: Too many failed login attempts. Locked for ${remainingMinutes} more minutes.`,
        };
      }
    }

    // 2. Validate Credentials
    // Checks if username matches 'admin' and password matches 'admin12'
    const isUserMatch = userKey === expectedUser || userKey === "admin";
    const isPassMatch = inputPass === expectedPass || inputPass === "admin12";

    if (!isUserMatch || !isPassMatch) {
      // Record failed attempt
      let attempts = 1;
      if (db) {
        try {
          const locksCol = db.collection<LockRecord>("admin_lockouts");
          const existing = await locksCol.findOne({ username: userKey });
          attempts = (existing?.failedAttempts || 0) + 1;
          const willLock = attempts >= MAX_FAILED_ATTEMPTS;
          const lockedUntilVal = willLock ? now + LOCKOUT_DURATION_MS : null;

          await locksCol.updateOne(
            { username: userKey },
            {
              $set: {
                username: userKey,
                failedAttempts: attempts,
                lockedUntil: lockedUntilVal,
                lastAttemptAt: new Date(),
              },
            },
            { upsert: true }
          );

          // Log security audit event in database
          await db.collection("admin_audit_logs").insertOne({
            event: "LOGIN_FAILURE",
            username: data.username,
            timestamp: new Date(),
            attempts,
            isLocked: willLock,
          });

          if (willLock && lockedUntilVal) {
            return {
              success: false,
              isLocked: true,
              lockedUntil: lockedUntilVal,
              attemptsLeft: 0,
              error: `Account locked for 15 minutes due to ${MAX_FAILED_ATTEMPTS} failed attempts.`,
            };
          }
        } catch {
          // Ignore DB write error
        }
      }

      // In-memory fallback
      const mem = memoryLocks[userKey] || { attempts: 0, lockedUntil: null };
      mem.attempts += 1;
      if (mem.attempts >= MAX_FAILED_ATTEMPTS) {
        mem.lockedUntil = now + LOCKOUT_DURATION_MS;
        memoryLocks[userKey] = mem;
        return {
          success: false,
          isLocked: true,
          lockedUntil: mem.lockedUntil,
          attemptsLeft: 0,
          error: `Account locked for 15 minutes due to ${MAX_FAILED_ATTEMPTS} failed attempts.`,
        };
      }
      memoryLocks[userKey] = mem;

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - mem.attempts;
      return {
        success: false,
        attemptsLeft: attemptsRemaining,
        error: `Invalid credentials. Please verify your username and password (${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining).`,
      };
    }

    // 3. Credentials are Valid -> Reset lockouts & Generate cryptographically secure token
    if (db) {
      try {
        await db.collection("admin_lockouts").deleteOne({ username: userKey });
      } catch {
        // Ignore
      }
    }
    delete memoryLocks[userKey];

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(now + SESSION_EXPIRY_MS);

    // Persist session to MongoDB
    if (db) {
      try {
        const sessionsCol = db.collection<SessionRecord>("admin_sessions");
        await sessionsCol.insertOne({
          tokenHash,
          username: "admin",
          role: "superadmin",
          createdAt: new Date(),
          expiresAt,
        });

        // Initialize admin user record in DB if not present
        await db.collection("admin_users").updateOne(
          { username: "admin" },
          {
            $set: {
              username: "admin",
              role: "superadmin",
              lastLoginAt: new Date(),
              isActive: true,
            },
          },
          { upsert: true }
        );

        // Record audit trail in database
        await db.collection("admin_audit_logs").insertOne({
          event: "LOGIN_SUCCESS",
          username: "admin",
          timestamp: new Date(),
        });
        console.log("[AUTH] Session and login audit successfully persisted to MongoDB");
      } catch (err) {
        console.warn("[AUTH] Failed writing session to DB:", err);
      }
    }

    // Update in-memory session cache
    memorySessions[tokenHash] = {
      username: "admin",
      role: "superadmin",
      expiresAt: expiresAt.getTime(),
    };

    // Set HTTP cookie in server context
    try {
      const m = "vinxi/http";
      const { setCookie } = await import(/* @vite-ignore */ m);
      setCookie("m3_admin_session", rawToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(SESSION_EXPIRY_MS / 1000),
      });
    } catch {
      // In non-vinxi runtime
    }

    return {
      success: true,
      token: rawToken,
      user: {
        username: "admin",
        role: "superadmin",
      },
    };
  });

// ── Admin Logout ──────────────────────────────────────────────────────────
export const logoutAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional() }))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    let rawToken = data?.token || null;

    try {
      const m = "vinxi/http";
      const { getCookie, deleteCookie } = await import(/* @vite-ignore */ m);
      if (!rawToken) rawToken = getCookie("m3_admin_session");
      deleteCookie("m3_admin_session", { path: "/" });
    } catch {
      // Ignore
    }

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      delete memorySessions[tokenHash];

      try {
        const db = await connectDB();
        if (db) {
          await db.collection("admin_sessions").deleteOne({ tokenHash });
          await db.collection("admin_audit_logs").insertOne({
            event: "LOGOUT",
            username: "admin",
            timestamp: new Date(),
          });
        }
      } catch {
        // Ignore DB error
      }
    }

    return { success: true };
  });
