/**
 * Multi-Tier Authentication Rate Limiting Engine
 *
 * Layers of Defense:
 * 1. IP Burst Protection: Max 15 attempts per 60 seconds per IP.
 * 2. Failed-Login Brute-Force Lockout: Max 5 failed attempts in 15 minutes
 *    per IP and per targeted account. 60-second temporary lockout on threshold.
 * 3. Google Security Shield Daily Quota: Max 5 successful logins per 24 hours per IP.
 * 4. Standard HTTP Header Generation: X-RateLimit-Limit, Remaining, Reset, Retry-After.
 */

const BURST_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_BURST_ATTEMPTS = 15;

const FAILED_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DAILY_LOGINS = 5;

class RateLimiter {
  constructor() {
    // ip -> [timestamps]
    this.ipBurstMap = new Map();

    // ip -> { count: number, firstFailedAt: number, lockedUntil: number }
    this.ipFailedMap = new Map();

    // email -> { count: number, firstFailedAt: number, lockedUntil: number }
    this.accountFailedMap = new Map();

    // ip -> [timestamps]
    this.dailySuccessMap = new Map();

    // Periodic sweep every 10 minutes to prevent unbounded memory growth
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Normalizes client IP address from express request
   */
  getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return String(forwarded).split(',')[0].trim();
    }
    let ip = req.socket?.remoteAddress || req.ip || '127.0.0.1';
    if (typeof ip === 'string') {
      if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
      }
      if (ip === '::1') {
        ip = '127.0.0.1';
      }
    }
    return ip;
  }

  /**
   * Checks whether a login attempt is allowed.
   *
   * @param {string} ip
   * @param {string} email
   * @returns {{ allowed: boolean, statusCode: number, error?: string, retryAfter?: number, security: object }}
   */
  checkLoginAllowed(ip, email) {
    const now = Date.now();
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Check IP lockout
    const ipFailState = this.ipFailedMap.get(ip);
    if (ipFailState && ipFailState.lockedUntil > now) {
      const retryAfter = Math.ceil((ipFailState.lockedUntil - now) / 1000);
      return {
        allowed: false,
        statusCode: 429,
        retryAfter,
        error: `Too many failed login attempts from this IP. Please try again in ${retryAfter} seconds.`,
        security: this.getSecurityStatus(ip, cleanEmail)
      };
    }

    // 2. Check Account lockout (prevent distributed attacks on a single account)
    if (cleanEmail) {
      const acctFailState = this.accountFailedMap.get(cleanEmail);
      if (acctFailState && acctFailState.lockedUntil > now) {
        const retryAfter = Math.ceil((acctFailState.lockedUntil - now) / 1000);
        return {
          allowed: false,
          statusCode: 429,
          retryAfter,
          error: `Too many failed login attempts for this account. Please try again in ${retryAfter} seconds.`,
          security: this.getSecurityStatus(ip, cleanEmail)
        };
      }
    }

    // 3. Check Burst rate (rapid requests per minute)
    const burstTimestamps = (this.ipBurstMap.get(ip) || []).filter(t => now - t < BURST_WINDOW_MS);
    this.ipBurstMap.set(ip, burstTimestamps);

    if (burstTimestamps.length >= MAX_BURST_ATTEMPTS) {
      const oldest = burstTimestamps[0] || now;
      const retryAfter = Math.ceil((oldest + BURST_WINDOW_MS - now) / 1000);
      return {
        allowed: false,
        statusCode: 429,
        retryAfter: Math.max(1, retryAfter),
        error: `Burst rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
        security: this.getSecurityStatus(ip, cleanEmail)
      };
    }

    // 4. Check Daily quota
    const dailyHistory = (this.dailySuccessMap.get(ip) || []).filter(t => now - t < DAILY_WINDOW_MS);
    this.dailySuccessMap.set(ip, dailyHistory);

    if (dailyHistory.length >= MAX_DAILY_LOGINS) {
      return {
        allowed: false,
        statusCode: 429,
        retryAfter: 3600,
        error: 'Daily login limit reached (5 logins per day maximum). Google Security Shield active. Try again tomorrow.',
        security: this.getSecurityStatus(ip, cleanEmail)
      };
    }

    return {
      allowed: true,
      statusCode: 200,
      security: this.getSecurityStatus(ip, cleanEmail)
    };
  }

  /**
   * Records a failed login attempt for IP and Email.
   */
  recordLoginFailure(ip, email) {
    const now = Date.now();
    const cleanEmail = (email || '').toLowerCase().trim();

    // Track IP failures
    let ipState = this.ipFailedMap.get(ip);
    if (!ipState || now - ipState.firstFailedAt > FAILED_WINDOW_MS) {
      ipState = { count: 1, firstFailedAt: now, lockedUntil: 0 };
    } else {
      ipState.count += 1;
    }

    if (ipState.count >= MAX_FAILED_ATTEMPTS) {
      ipState.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
    this.ipFailedMap.set(ip, ipState);

    // Track Account failures
    if (cleanEmail) {
      let acctState = this.accountFailedMap.get(cleanEmail);
      if (!acctState || now - acctState.firstFailedAt > FAILED_WINDOW_MS) {
        acctState = { count: 1, firstFailedAt: now, lockedUntil: 0 };
      } else {
        acctState.count += 1;
      }

      if (acctState.count >= MAX_FAILED_ATTEMPTS) {
        acctState.lockedUntil = now + LOCKOUT_DURATION_MS;
      }
      this.accountFailedMap.set(cleanEmail, acctState);
    }
  }

  /**
   * Records a successful login: resets failure counters and records daily count.
   */
  recordLoginSuccess(ip, email) {
    const now = Date.now();
    const cleanEmail = (email || '').toLowerCase().trim();

    // Reset failed attempt counts
    this.ipFailedMap.delete(ip);
    if (cleanEmail) {
      this.accountFailedMap.delete(cleanEmail);
    }

    // Record to daily log
    const history = (this.dailySuccessMap.get(ip) || []).filter(t => now - t < DAILY_WINDOW_MS);
    history.push(now);
    this.dailySuccessMap.set(ip, history);
  }

  /**
   * Track request for burst calculation
   */
  recordAttempt(ip) {
    const now = Date.now();
    const history = (this.ipBurstMap.get(ip) || []).filter(t => now - t < BURST_WINDOW_MS);
    history.push(now);
    this.ipBurstMap.set(ip, history);
  }

  /**
   * Returns current security metrics for an IP/email pair
   */
  getSecurityStatus(ip, email = '') {
    const now = Date.now();
    const cleanEmail = (email || '').toLowerCase().trim();

    const dailyHistory = (this.dailySuccessMap.get(ip) || []).filter(t => now - t < DAILY_WINDOW_MS);
    const dailyCount = dailyHistory.length;
    const remainingToday = Math.max(0, MAX_DAILY_LOGINS - dailyCount);

    const ipFailState = this.ipFailedMap.get(ip);
    const acctFailState = cleanEmail ? this.accountFailedMap.get(cleanEmail) : null;

    let lockoutRemaining = 0;
    if (ipFailState && ipFailState.lockedUntil > now) {
      lockoutRemaining = Math.max(lockoutRemaining, Math.ceil((ipFailState.lockedUntil - now) / 1000));
    }
    if (acctFailState && acctFailState.lockedUntil > now) {
      lockoutRemaining = Math.max(lockoutRemaining, Math.ceil((acctFailState.lockedUntil - now) / 1000));
    }

    const failedAttempts = Math.max(
      ipFailState ? ipFailState.count : 0,
      acctFailState ? acctFailState.count : 0
    );

    return {
      dailyLimit: MAX_DAILY_LOGINS,
      usedToday: dailyCount,
      remainingToday,
      allowed: dailyCount < MAX_DAILY_LOGINS && lockoutRemaining === 0,
      failedAttempts,
      maxFailedAttempts: MAX_FAILED_ATTEMPTS,
      lockoutRemaining
    };
  }

  /**
   * Resets limits for testing and development
   */
  resetLimits(ip, email = null) {
    if (ip) {
      this.ipBurstMap.delete(ip);
      this.ipFailedMap.delete(ip);
      this.dailySuccessMap.delete(ip);
    }
    if (email) {
      this.accountFailedMap.delete(email.toLowerCase().trim());
    } else {
      this.accountFailedMap.clear();
    }
    return { success: true, message: `Security limits reset for ${ip || 'all'}.` };
  }

  /**
   * Periodic garbage collection of expired entries
   */
  cleanup() {
    const now = Date.now();

    for (const [ip, timestamps] of this.ipBurstMap.entries()) {
      const valid = timestamps.filter(t => now - t < BURST_WINDOW_MS);
      if (valid.length === 0) this.ipBurstMap.delete(ip);
      else this.ipBurstMap.set(ip, valid);
    }

    for (const [ip, state] of this.ipFailedMap.entries()) {
      if (state.lockedUntil <= now && now - state.firstFailedAt > FAILED_WINDOW_MS) {
        this.ipFailedMap.delete(ip);
      }
    }

    for (const [email, state] of this.accountFailedMap.entries()) {
      if (state.lockedUntil <= now && now - state.firstFailedAt > FAILED_WINDOW_MS) {
        this.accountFailedMap.delete(email);
      }
    }

    for (const [ip, timestamps] of this.dailySuccessMap.entries()) {
      const valid = timestamps.filter(t => now - t < DAILY_WINDOW_MS);
      if (valid.length === 0) this.dailySuccessMap.delete(ip);
      else this.dailySuccessMap.set(ip, valid);
    }
  }
}

export const rateLimiter = new RateLimiter();
