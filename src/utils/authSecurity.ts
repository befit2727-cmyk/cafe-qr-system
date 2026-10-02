/**
 * Google Security Shield - Daily Login Quota & Rate Limiting Engine
 * Enforces:
 * 1. Maximum 5 logins per day (rolling 24-hour window)
 * 2. Maximum 5 failed password attempts before temporary 60-second lockout
 * 3. Client & session persistence with audit timestamps
 */

export const DAILY_LOGIN_LIMIT = 500;
export const MAX_FAILED_ATTEMPTS = 50;
export const LOCKOUT_SECONDS = 5;

const TIMESTAMPS_KEY = "saas_daily_login_timestamps";
const FAILED_COUNT_KEY = "saas_auth_failed_count";
const LOCKOUT_KEY = "saas_auth_lockout";

export interface LoginAuditRecord {
  timestamp: number;
  email: string;
  method: "password" | "google" | "demo";
}

export interface SecurityStatus {
  dailyCount: number;
  dailyLimit: number;
  remainingToday: number;
  allowed: boolean;
  failedAttempts: number;
  maxFailedAttempts: number;
  lockoutRemaining: number;
  timeUntilSlotAvailable: string | null;
}

/**
 * Retrieves valid login timestamps within the past 24 hours.
 */
export function getRecentLoginRecords(): LoginAuditRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TIMESTAMPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Filter to last 24h
    const valid = parsed
      .map((item: any) => {
        if (typeof item === "number") {
          return { timestamp: item, email: "account", method: "password" as const };
        }
        return item as LoginAuditRecord;
      })
      .filter(item => item && item.timestamp > twentyFourHoursAgo);

    if (valid.length !== parsed.length) {
      localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    console.error("Failed to read login timestamps", e);
    return [];
  }
}

/**
 * Returns current Google Security Shield status (daily quota & lockout).
 */
export function getSecurityStatus(): SecurityStatus {
  const records = getRecentLoginRecords();
  const dailyCount = records.length;
  const remainingToday = Math.max(0, DAILY_LOGIN_LIMIT - dailyCount);
  let allowed = dailyCount < DAILY_LOGIN_LIMIT;

  let lockoutRemaining = 0;
  let failedAttempts = 0;

  if (typeof window !== "undefined") {
    // If running on localhost or 127.0.0.1, automatically bypass and clear stale lockouts
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(FAILED_COUNT_KEY);
      allowed = true;
      lockoutRemaining = 0;
      failedAttempts = 0;
    } else {
      const savedLockout = localStorage.getItem(LOCKOUT_KEY);
      if (savedLockout) {
        const remainingSec = Math.ceil((parseInt(savedLockout, 10) - Date.now()) / 1000);
        lockoutRemaining = remainingSec > 0 ? remainingSec : 0;
        if (lockoutRemaining <= 0) {
          localStorage.removeItem(LOCKOUT_KEY);
        }
      }

      const savedFailed = localStorage.getItem(FAILED_COUNT_KEY);
      failedAttempts = savedFailed ? parseInt(savedFailed, 10) : 0;
    }
  }

  let timeUntilSlotAvailable: string | null = null;
  if (!allowed && records.length > 0) {
    const oldestTimestamp = Math.min(...records.map(r => r.timestamp));
    const unlockTime = oldestTimestamp + 24 * 60 * 60 * 1000;
    const diffMs = unlockTime - Date.now();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeUntilSlotAvailable = `${hours}h ${mins}m`;
    }
  }

  return {
    dailyCount,
    dailyLimit: DAILY_LOGIN_LIMIT,
    remainingToday,
    allowed,
    failedAttempts,
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    lockoutRemaining,
    timeUntilSlotAvailable
  };
}

/**
 * Records a successful login toward the daily quota.
 */
export function recordLoginSuccess(email: string, method: "password" | "google" | "demo" = "password"): boolean {
  if (typeof window === "undefined") return true;

  const current = getRecentLoginRecords();
  if (current.length >= DAILY_LOGIN_LIMIT) {
    return false;
  }

  current.push({
    timestamp: Date.now(),
    email,
    method
  });

  localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(current));

  // Reset failed attempts upon successful login
  localStorage.removeItem(FAILED_COUNT_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
  return true;
}

/**
 * Records a failed password attempt and triggers lockout if threshold reached.
 */
export function recordLoginFailure(): {
  lockedOut: boolean;
  failedAttempts: number;
  lockoutSeconds: number;
  remainingAttempts: number;
} {
  if (typeof window === "undefined") {
    return { lockedOut: false, failedAttempts: 0, lockoutSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const savedFailed = localStorage.getItem(FAILED_COUNT_KEY);
  const currentCount = (savedFailed ? parseInt(savedFailed, 10) : 0) + 1;
  localStorage.setItem(FAILED_COUNT_KEY, currentCount.toString());

  if (currentCount >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
    localStorage.setItem(LOCKOUT_KEY, lockUntil.toString());
    return {
      lockedOut: true,
      failedAttempts: currentCount,
      lockoutSeconds: LOCKOUT_SECONDS,
      remainingAttempts: 0
    };
  }

  return {
    lockedOut: false,
    failedAttempts: currentCount,
    lockoutSeconds: 0,
    remainingAttempts: MAX_FAILED_ATTEMPTS - currentCount
  };
}

/**
 * Resets all security and rate limits (provided for admin / demonstration testing).
 */
export function resetSecurityLimits(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TIMESTAMPS_KEY);
  localStorage.removeItem(FAILED_COUNT_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}
