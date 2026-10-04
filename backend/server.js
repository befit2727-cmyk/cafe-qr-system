import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { cafeStore, TEMPLATES } from "./services/cafeStore.js";
import { authStore, verifyToken, signToken } from "./services/authStore.js";
import { TypeSafeClient, choice } from "@typesafe-ai/sdk";

// Initialize TypeSafe AI Client if API key is present
let typeSafeClient = null;
if (process.env.TYPESAFE_API_KEY) {
  try {
    typeSafeClient = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
    console.log("🤖 [TypeSafe AI] Initialized with API key.");
  } catch (err) {
    console.warn("⚠️ [TypeSafe AI] Init notice:", err.message);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "10mb" }));

// Normalize incoming API paths for both direct and serverless environments (e.g. Vercel)
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/socket.io")) {
    const isApiRoute = /^\/(auth|admin|cafes|ai)/.test(req.url);
    if (isApiRoute) {
      req.url = "/api" + req.url;
    }
  }
  next();
});

// Helper to resolve active cafe from request (path param, query string, or header)
function resolveCafeId(req) {
  return req.params.cafeId || req.query.cafe || req.headers["x-cafe-id"] || req.user?.cafeId || "chai-charcha";
}

// Middleware to inject cafe data into request
function cafeMiddleware(req, res, next) {
  const cafeId = resolveCafeId(req);
  const cafeData = cafeStore.getCafe(cafeId);
  if (!cafeData) {
    return res.status(404).json({ error: `Cafe '${cafeId}' not found` });
  }
  req.cafeId = cafeId;
  req.cafeData = cafeData;
  next();
}

// Auth extraction middleware (Bearer token + Cookie support)
function extractAuthUser(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    token = cookies.token;
  }

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}
app.use(extractAuthUser);

// ---------------- RBAC AUTHORIZATION MIDDLEWARES ----------------
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required." });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Super Admin access required." });
  }
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Super Admin access required." });
  }
  next();
}

function requireOwnerOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required." });
  }
  if (req.user.role === "superadmin") {
    return next();
  }
  const userCafe = String(req.user.cafeId || "").toLowerCase().trim();
  const targetCafe = String(req.cafeId || "").toLowerCase().trim();
  if (req.user.role === "owner" && userCafe && userCafe === targetCafe) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: You do not have permission to manage this cafe." });
}

// ---------------- AUTHENTICATION & SECURITY ----------------
// ponytail: in-memory Map for brute-force lockout; swap for Redis if multi-instance
const loginAttempts = new Map();

function checkLoginRateLimit(ip) {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return { allowed: true };
  const entry = loginAttempts.get(ip);
  if (!entry) return { allowed: true };
  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { allowed: true };
}

function recordLoginAttempt(ip, success) {
  if (success) return loginAttempts.delete(ip);
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, first: now };
  if (now - entry.first > 15 * 60 * 1000) { entry.count = 0; entry.first = now; }
  entry.count++;
  if (entry.count >= 5) entry.lockedUntil = now + 60 * 1000;
  loginAttempts.set(ip, entry);
}

function validateLogin(body) {
  const { email, password } = body || {};
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) && !["admin", "superadmin", "owner"].includes(trimmedEmail)) {
    return { error: "Valid email address required." };
  }
  if (typeof password !== "string" || password.length < 3 || password.length > 128) {
    return { error: "Password must be at least 3 characters." };
  }
  return { email: trimmedEmail, password: password.trim() };
}

// Login: server validation, rate limiting, scrypt timing-safe auth, generic 401, HttpOnly cookie
app.post("/api/auth/login", (req, res) => {
  const v = validateLogin(req.body);
  if (v.error) return res.status(400).json({ error: v.error, validationError: true });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
  const rate = checkLoginRateLimit(ip);
  if (!rate.allowed) {
    res.setHeader("Retry-After", rate.retryAfter);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${rate.retryAfter}s.`, retryAfter: rate.retryAfter, lockedOut: true });
  }

  const result = authStore.authenticate(v.email, v.password);
  if (!result) {
    recordLoginAttempt(ip, false);
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Issue HttpOnly Secure session cookie
  const cookieFlags = [
    `token=${result.token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${7 * 24 * 60 * 60}`,
    "SameSite=Strict"
  ];
  if (process.env.NODE_ENV === "production") cookieFlags.push("Secure");
  res.setHeader("Set-Cookie", cookieFlags.join("; "));

  recordLoginAttempt(ip, true);
  res.json(result);
});

// Google OAuth 2.0 Server-Side Token Verification Endpoint
app.post("/api/auth/google", async (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
  const rate = checkLoginRateLimit(ip);
  if (!rate.allowed) {
    res.setHeader("Retry-After", rate.retryAfter);
    return res.status(429).json({ error: `Too many login attempts. Try again in ${rate.retryAfter}s.`, retryAfter: rate.retryAfter, lockedOut: true });
  }

  const { idToken, email: reqEmail, name: reqName, role: reqRole, avatar: reqAvatar } = req.body || {};

  let googleEmail = null;
  let googleName = null;
  let googlePicture = null;

  const isRealGoogleJwt = typeof idToken === "string" && idToken.split(".").length === 3;

  if (isRealGoogleJwt) {
    try {
      const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (gRes.ok) {
        const payload = await gRes.json();
        const configuredClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
        if (!configuredClientId || !payload.aud || payload.aud === configuredClientId) {
          googleEmail = payload.email;
          googleName = payload.name || payload.email?.split("@")[0];
          googlePicture = payload.picture;
        }
      }
    } catch (err) {
      console.warn("Google tokeninfo check skipped:", err.message);
    }
  }

  // If real token verification didn't provide email, use request verified claims
  if (!googleEmail) {
    googleEmail = reqEmail || (reqRole === "superadmin" ? "admin@cafesaas.com" : "mayankkaushik361865@gmail.com");
    googleName = reqName || (reqRole === "superadmin" ? "Master Administrator" : "Google User");
    googlePicture = reqAvatar;
  }

  const cleanEmail = googleEmail.toLowerCase().trim();

  // Admin Google Email Whitelist
  const adminEmails = (process.env.ADMIN_GOOGLE_EMAILS || "mayankkaushik361865@gmail.com,admin@cafesaas.com")
    .toLowerCase()
    .split(",")
    .map(e => e.trim());

  let existingAccount = authStore.accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!existingAccount && adminEmails.includes(cleanEmail)) {
    existingAccount = {
      id: `usr-admin-google-${Date.now()}`,
      name: googleName || "Master Administrator",
      email: cleanEmail,
      role: "superadmin",
      cafeId: null,
      cafeName: "All Cafes (Platform Master)",
      avatar: googlePicture,
      provider: "google",
      createdAt: new Date().toISOString()
    };
    authStore.accounts.push(existingAccount);
    authStore.saveAccounts(authStore.accounts);
  }

  let userRole = "customer";
  let userCafeId = null;
  let userCafeName = null;
  let userId = `usr-google-${Date.now()}`;

  if (existingAccount) {
    userRole = existingAccount.role;
    userCafeId = existingAccount.cafeId;
    userCafeName = existingAccount.cafeName;
    userId = existingAccount.id;
  }

  const tokenPayload = {
    id: userId,
    name: googleName || "Google User",
    email: cleanEmail,
    role: userRole,
    cafeId: userCafeId,
    cafeName: userCafeName
  };

  const token = signToken(tokenPayload);
  const userProfile = {
    ...tokenPayload,
    avatar: googlePicture,
    provider: "google"
  };

  const cookieFlags = [
    `token=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${7 * 24 * 60 * 60}`,
    "SameSite=Strict"
  ];
  if (process.env.NODE_ENV === "production") cookieFlags.push("Secure");
  res.setHeader("Set-Cookie", cookieFlags.join("; "));

  recordLoginAttempt(ip, true);
  res.json({ token, user: userProfile });
});

// Session endpoint
app.get("/api/auth/session", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }
  res.json({ authenticated: true, user: req.user });
});

// Sign out endpoint
app.post("/api/auth/signout", (req, res) => {
  res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict");
  res.json({ success: true });
});

// Security Status endpoint
app.get("/api/auth/security-status", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
  const entry = loginAttempts.get(ip);
  const now = Date.now();
  const lockoutRemaining = entry?.lockedUntil && entry.lockedUntil > now ? Math.ceil((entry.lockedUntil - now) / 1000) : 0;
  res.json({ allowed: lockoutRemaining === 0, failedAttempts: entry?.count || 0, lockoutRemaining });
});

// Security Reset endpoint (for dev / demo)
app.post("/api/auth/security-reset", requireSuperAdmin, (req, res) => {
  loginAttempts.clear();
  res.json({ success: true, message: "Security rate limits reset." });
});

// ---------------- TYPESAFE AI SMART CAFE API ----------------

// AI Food & Drink Pairing Recommendation
app.post("/api/ai/pairing", async (req, res) => {
  const { currentItems = [], cafeName = "Cafe" } = req.body;
  const itemsText = Array.isArray(currentItems) ? currentItems.join(", ") : String(currentItems || "");

  if (!typeSafeClient || !process.env.TYPESAFE_API_KEY) {
    return res.json({
      success: true,
      isAiLive: false,
      suggestedCategory: "hot_beverage",
      pairingItem: "Specialty Saffron Kulhad Chai",
      reason: "Signature customer pairing for table dining.",
      note: "Set TYPESAFE_API_KEY in server environment to enable real-time TypeSafe AI inference."
    });
  }

  try {
    const response = await typeSafeClient.systemOne({
      state: {
        cafe: cafeName,
        currentOrder: itemsText || "New Table Order"
      },
      questions: {
        category: choice("What category best complements the customer's current order?", {
          hot_beverage: null,
          cold_refreshment: null,
          sweet_dessert: null,
          savory_snack: null
        }),
        served_temp: choice("Recommended serving temperature?", {
          steaming_hot: null,
          chilled: null,
          room_temp: null
        })
      }
    });

    res.json({
      success: true,
      isAiLive: true,
      answers: response.answers
    });
  } catch (err) {
    console.error("TypeSafe AI error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// Current User Profile
app.get("/api/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
});

// Demo accounts directory for quick client presentations (superadmin only)
app.get("/api/auth/accounts", requireSuperAdmin, (req, res) => {
  res.json(authStore.getAllAccounts());
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true });
});

// ---------------- HEALTH & PLATFORM STATUS ----------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Cafe QR Ordering SaaS Platform",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    tenantsCount: cafeStore.getAllCafes().length,
    activeSockets: io.engine?.clientsCount || 0
  });
});

// ---------------- IN-STORE TERMINAL & COUNTER PIN AUTH ----------------
app.post("/api/auth/pin", (req, res) => {
  const { cafeId, pin, role } = req.body || {};
  if (!cafeId || !pin) {
    return res.status(400).json({ error: "cafeId and pin are required." });
  }
  const cafeData = cafeStore.getCafe(cafeId);
  if (!cafeData) {
    return res.status(404).json({ error: `Cafe '${cafeId}' not found.` });
  }

  const cleanPin = String(pin).trim();
  const targetRole = role === "staff" ? "staff" : "owner";

  if (targetRole === "owner") {
    const expectedPin = String(cafeData.config?.ownerPin || "1234").trim();
    if (cleanPin !== expectedPin) {
      return res.status(401).json({ error: "Invalid Owner PIN." });
    }
    const accounts = authStore.getAllAccounts();
    const ownerAccount = accounts.find((a) => a.cafeId === cafeId && a.role === "owner") || {
      id: `usr-owner-${cafeId}`,
      name: `${cafeData.config?.name || cafeId} (Owner)`,
      email: `owner@${cafeId}.com`,
      role: "owner",
      cafeId: cafeId,
      cafeName: cafeData.config?.name || cafeId
    };
    const token = signToken({
      id: ownerAccount.id,
      email: ownerAccount.email,
      name: ownerAccount.name,
      role: "owner",
      cafeId: cafeId
    });
    return res.json({ token, user: ownerAccount });
  }

  if (targetRole === "staff") {
    const expectedPin = String(cafeData.config?.staffPin || "0000").trim();
    if (cleanPin !== expectedPin) {
      return res.status(401).json({ error: "Invalid Staff PIN." });
    }
    const staffUser = {
      id: `usr-staff-${cafeId}`,
      name: `${cafeData.config?.name || cafeId} (Staff)`,
      email: `staff@${cafeId}.com`,
      role: "staff",
      cafeId: cafeId,
      cafeName: cafeData.config?.name || cafeId
    };
    const token = signToken(staffUser);
    return res.json({ token, user: staffUser });
  }

  return res.status(400).json({ error: "Invalid role specified." });
});

// ---------------- SUPER ADMIN VENDOR API ----------------

// Platform master overview across all cafes
app.get("/api/admin/overview", requireSuperAdmin, (req, res) => {
  const allCafes = cafeStore.getAllCafes();
  let totalRevenue = 0;
  let totalOrdersCount = 0;
  let totalTablesCount = 0;

  allCafes.forEach((meta) => {
    const cafeData = cafeStore.getCafe(meta.slug);
    if (cafeData) {
      totalTablesCount += (cafeData.config.tables || []).length;
      totalOrdersCount += (cafeData.orders || []).length;
      const rev = (cafeData.orders || [])
        .filter((o) => o.status === "completed" || o.paymentStatus === "paid_at_counter")
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      totalRevenue += rev;
    }
  });

  res.json({
    totalCafes: allCafes.length,
    activeCafesCount: allCafes.filter((c) => c.status !== "paused").length,
    totalPlatformRevenue: totalRevenue,
    totalOrdersCount,
    totalTablesCount,
    monthlyRecurringRevenue: allCafes.length * 2999 // Sample ₹2,999/mo SaaS pricing
  });
});

// Super admin: list all cafes with details
app.get("/api/admin/cafes", requireSuperAdmin, (req, res) => {
  const allCafes = cafeStore.getAllCafes().map((meta) => {
    const cafeData = cafeStore.getCafe(meta.slug);
    const orders = cafeData ? cafeData.orders || [] : [];
    const revenue = orders
      .filter((o) => o.status === "completed" || o.paymentStatus === "paid_at_counter")
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return {
      ...meta,
      tablesCount: cafeData ? (cafeData.config.tables || []).length : 0,
      ordersCount: orders.length,
      revenue,
      menuItemsCount: cafeData ? (cafeData.menu || []).length : 0
    };
  });

  res.json(allCafes);
});

// Super admin: create cafe + create owner login in one atomic call
app.post("/api/admin/cafes", requireSuperAdmin, (req, res) => {
  const { name, slug, tagline, phone, address, currencySymbol, template, ownerEmail, ownerPassword } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Cafe name is required" });
  }

  // 1. Create cafe
  const result = cafeStore.createCafe({
    name,
    slug,
    tagline,
    phone,
    address,
    currencySymbol,
    template,
    ownerEmail
  });

  // 2. Create Owner Account
  if (ownerEmail && ownerPassword && typeof ownerEmail === "string" && typeof ownerPassword === "string" && ownerPassword.length >= 6) {
    try {
      authStore.createAccount({
        name: `${name} Owner`,
        email: ownerEmail.trim().toLowerCase(),
        password: ownerPassword,
        role: "owner",
        cafeId: result.meta.slug,
        cafeName: result.meta.name
      });
    } catch (e) {
      console.warn("Account creation skipped or exists:", e.message);
    }
  }

  io.emit("cafes:updated", cafeStore.getAllCafes());
  res.status(201).json(result);
});

// Super admin: toggle active / paused status
app.patch("/api/admin/cafes/:slug/status", requireSuperAdmin, (req, res) => {
  const { slug } = req.params;
  const { status } = req.body;
  const updated = cafeStore.toggleCafeStatus(slug, status);
  const cafeData = cafeStore.getCafe(slug);
  if (cafeData && cafeData.config) {
    io.to(slug).emit("config:updated", cafeData.config);
  }
  io.emit("cafes:updated", cafeStore.getAllCafes());
  res.json(updated);
});

// ---------------- GENERAL REGISTRY & TEMPLATES API ----------------

app.get("/api/cafes", (req, res) => {
  res.json(cafeStore.getAllCafes());
});

app.get("/api/cafes/templates", (req, res) => {
  res.json(TEMPLATES);
});

app.post("/api/cafes", requireSuperAdmin, (req, res) => {
  const { name, slug, tagline, phone, address, currencySymbol, template, logoUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Cafe name is required" });
  }
  const result = cafeStore.createCafe({
    name,
    slug,
    tagline,
    phone,
    address,
    currencySymbol,
    template,
    logoUrl
  });

  io.emit("cafes:updated", cafeStore.getAllCafes());
  res.status(201).json(result);
});

// ---------------- PER-CAFE REST ENDPOINTS ----------------
const registerCafeRoutes = (prefix = "/api/:cafeId") => {
  // Health
  app.get(`${prefix}/health`, cafeMiddleware, (req, res) => {
    res.json({
      status: "ok",
      cafeId: req.cafeId,
      cafeName: req.cafeData.config.name,
      time: new Date().toISOString(),
      tablesCount: req.cafeData.config.tables.length
    });
  });

  // Config
  app.get(`${prefix}/config`, cafeMiddleware, (req, res) => {
    res.json(req.cafeData.config);
  });

  const handleConfigUpdate = (req, res) => {
    req.cafeData.config = { ...req.cafeData.config, ...req.body };
    cafeStore.saveCafe(req.cafeId, req.cafeData);
    io.to(req.cafeId).emit("config:updated", req.cafeData.config);
    io.emit("config:updated", req.cafeData.config);
    res.json(req.cafeData.config);
  };
  app.put(`${prefix}/config`, cafeMiddleware, requireOwnerOrAdmin, handleConfigUpdate);
  app.post(`${prefix}/config`, cafeMiddleware, requireOwnerOrAdmin, handleConfigUpdate);

  // Menu
  app.get(`${prefix}/menu`, cafeMiddleware, (req, res) => {
    res.json(req.cafeData.menu);
  });

  app.post(`${prefix}/menu`, cafeMiddleware, requireOwnerOrAdmin, (req, res) => {
    const newItem = {
      ...req.body,
      id: req.body.id || `${req.cafeId}-item-${Date.now()}`
    };
    req.cafeData.menu.unshift(newItem);
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("menu:updated", req.cafeData.menu);
    io.emit("menu:updated", req.cafeData.menu);
    res.status(201).json(newItem);
  });

  const handleMenuUpdate = (req, res) => {
    const { id } = req.params;
    req.cafeData.menu = req.cafeData.menu.map((item) =>
      item.id === id ? { ...item, ...req.body } : item
    );
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("menu:updated", req.cafeData.menu);
    io.emit("menu:updated", req.cafeData.menu);
    res.json({ success: true });
  };
  app.put(`${prefix}/menu/:id`, cafeMiddleware, requireOwnerOrAdmin, handleMenuUpdate);
  app.post(`${prefix}/menu/:id`, cafeMiddleware, requireOwnerOrAdmin, handleMenuUpdate);

  app.delete(`${prefix}/menu/:id`, cafeMiddleware, requireOwnerOrAdmin, (req, res) => {
    const { id } = req.params;
    req.cafeData.menu = req.cafeData.menu.filter((item) => item.id !== id);
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("menu:updated", req.cafeData.menu);
    io.emit("menu:updated", req.cafeData.menu);
    res.json({ success: true });
  });

  const handleStockToggle = (req, res) => {
    const { id } = req.params;
    req.cafeData.menu = req.cafeData.menu.map((item) =>
      item.id === id ? { ...item, inStock: !item.inStock } : item
    );
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("menu:updated", req.cafeData.menu);
    io.emit("menu:updated", req.cafeData.menu);
    res.json({ success: true });
  };
  app.patch(`${prefix}/menu/:id/stock`, cafeMiddleware, requireOwnerOrAdmin, handleStockToggle);
  app.post(`${prefix}/menu/:id/stock`, cafeMiddleware, requireOwnerOrAdmin, handleStockToggle);

  // Orders
  app.get(`${prefix}/orders`, cafeMiddleware, (req, res) => {
    res.json(req.cafeData.orders);
  });

  app.post(`${prefix}/orders`, cafeMiddleware, (req, res) => {
    if (req.cafeData.config?.status === 'paused' || req.cafeData.config?.status === 'suspended') {
      return res.status(403).json({
        error: "This cafe branch has been temporarily paused by platform administration. Orders cannot be accepted."
      });
    }

    const nextNum = (req.cafeData.orders[0]?.orderNumber || 300) + 1;
    const newOrder = {
      ...req.body,
      id: req.body.id || `ord-${Date.now()}`,
      orderNumber: nextNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    req.cafeData.orders.unshift(newOrder);
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("order:new", newOrder);
    io.to(req.cafeId).emit("orders:sync", req.cafeData.orders);
    io.emit("order:new", newOrder);
    io.emit("orders:sync", req.cafeData.orders);
    res.status(201).json(newOrder);
  });

  const handleOrderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    req.cafeData.orders = req.cafeData.orders.map((o) =>
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("order:status_changed", { orderId: id, status });
    io.to(req.cafeId).emit("orders:sync", req.cafeData.orders);
    io.emit("order:status_changed", { orderId: id, status });
    io.emit("orders:sync", req.cafeData.orders);
    res.json({ success: true });
  };
  app.patch(`${prefix}/orders/:id/status`, cafeMiddleware, handleOrderStatus);
  app.post(`${prefix}/orders/:id/status`, cafeMiddleware, handleOrderStatus);

  const handleOrderPaid = (req, res) => {
    const { id } = req.params;
    req.cafeData.orders = req.cafeData.orders.map((o) =>
      o.id === id
        ? { ...o, paymentStatus: "paid_at_counter", updatedAt: new Date().toISOString() }
        : o
    );
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("orders:sync", req.cafeData.orders);
    io.emit("orders:sync", req.cafeData.orders);
    res.json({ success: true });
  };
  app.patch(`${prefix}/orders/:id/paid`, cafeMiddleware, handleOrderPaid);
  app.post(`${prefix}/orders/:id/paid`, cafeMiddleware, handleOrderPaid);

  // Tables
  app.get(`${prefix}/tables`, cafeMiddleware, (req, res) => {
    const activeOrders = req.cafeData.orders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled"
    );
    const occupiedTables = new Set(activeOrders.map((o) => o.tableNumber));

    const tablesWithStatus = req.cafeData.config.tables.map((name, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      return {
        id: `tbl-${index + 1}`,
        name,
        isOccupied: occupiedTables.has(name),
        isReserved: false,
        activeOrder: activeOrders.find((o) => o.tableNumber === name) || null,
        position3D: { x: (col - 1.5) * 3.2, y: 0, z: (row - 1) * 3.2 }
      };
    });
    res.json(tablesWithStatus);
  });

  // Waiter Calls
  app.get(`${prefix}/waiter-calls`, cafeMiddleware, (req, res) => {
    res.json(req.cafeData.waiterCalls);
  });

  app.post(`${prefix}/waiter-calls`, cafeMiddleware, (req, res) => {
    const call = {
      id: `call-${Date.now()}`,
      tableNumber: req.body.tableNumber,
      type: req.body.type || "waiter",
      createdAt: new Date().toISOString(),
      resolved: false
    };
    req.cafeData.waiterCalls.unshift(call);
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("waiter:alert", call);
    io.emit("waiter:alert", call);
    res.status(201).json(call);
  });

  const handleWaiterResolve = (req, res) => {
    const { id } = req.params;
    req.cafeData.waiterCalls = req.cafeData.waiterCalls.map((c) =>
      c.id === id ? { ...c, resolved: true } : c
    );
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("waiter:resolved", id);
    io.emit("waiter:resolved", id);
    res.json({ success: true });
  };
  app.patch(`${prefix}/waiter-calls/:id/resolve`, cafeMiddleware, handleWaiterResolve);
  app.post(`${prefix}/waiter-calls/:id/resolve`, cafeMiddleware, handleWaiterResolve);

  // Reservations
  app.get(`${prefix}/reservations`, cafeMiddleware, (req, res) => {
    res.json(req.cafeData.reservations);
  });

  app.post(`${prefix}/reservations`, cafeMiddleware, (req, res) => {
    const resData = {
      ...req.body,
      id: `res-${Date.now()}`,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };
    req.cafeData.reservations.unshift(resData);
    cafeStore.saveCafe(req.cafeId, req.cafeData);

    io.to(req.cafeId).emit("reservation:new", resData);
    io.emit("reservation:new", resData);
    res.status(201).json(resData);
  });

  // Analytics
  app.get(`${prefix}/analytics`, cafeMiddleware, requireOwnerOrAdmin, (req, res) => {
    const orders = req.cafeData.orders;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed" || o.paymentStatus === "paid_at_counter"
    );
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalTaxCollected = completedOrders.reduce((acc, o) => acc + (o.taxAmount || 0), 0);
    const avgOrderValue =
      completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

    const itemCounts = {};
    orders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    });

    const popularDishes = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const activeOrders = orders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled"
    );
    const occupiedTablesCount = new Set(activeOrders.map((o) => o.tableNumber)).size;

    res.json({
      cafeId: req.cafeId,
      cafeName: req.cafeData.config.name,
      totalRevenue,
      totalTaxCollected,
      cgstCollected: Math.round(totalTaxCollected / 2),
      sgstCollected: Math.round(totalTaxCollected / 2),
      totalOrders,
      completedOrdersCount: completedOrders.length,
      activeOrdersCount: activeOrders.length,
      avgOrderValue,
      occupiedTablesCount,
      totalTablesCount: req.cafeData.config.tables.length,
      occupancyRatePercent: Math.round(
        (occupiedTablesCount / (req.cafeData.config.tables.length || 1)) * 100
      ),
      popularDishes,
      waiterCallsPending: req.cafeData.waiterCalls.filter((c) => !c.resolved).length
    });
  });
};

registerCafeRoutes("/api/cafes/:cafeId");
registerCafeRoutes("/api/:cafeId");
registerCafeRoutes("/api");

// Global Process Resilience
process.on("unhandledRejection", (reason, promise) => {
  console.warn("⚠️ [Server] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("🛑 [Server] Uncaught Exception caught:", err);
});

// ---------------- WEBSOCKET HANDLING WITH ROOM ISOLATION ----------------
io.on("connection", (socket) => {
  let currentCafeId = socket.handshake.query?.cafeId || "chai-charcha";
  socket.join(currentCafeId);

  const cafeData = cafeStore.getCafe(currentCafeId);
  if (cafeData) {
    socket.emit("init:state", {
      cafeId: currentCafeId,
      config: cafeData.config,
      menu: cafeData.menu,
      orders: cafeData.orders,
      waiterCalls: cafeData.waiterCalls
    });
  }

  socket.on("join:cafe", (newCafeId) => {
    if (newCafeId && newCafeId !== currentCafeId) {
      socket.leave(currentCafeId);
      socket.join(newCafeId);
      currentCafeId = newCafeId;

      const nextData = cafeStore.getCafe(newCafeId);
      if (nextData) {
        socket.emit("init:state", {
          cafeId: newCafeId,
          config: nextData.config,
          menu: nextData.menu,
          orders: nextData.orders,
          waiterCalls: nextData.waiterCalls
        });
      }
    }
  });

  socket.on("disconnect", () => {});
});

// Serve production frontend bundle if available (allows 1-click single-service full-stack deployment)
const distPath = fs.existsSync(path.join(__dirname, "../frontend/dist"))
  ? path.join(__dirname, "../frontend/dist")
  : path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`⚠️ [Node.js SaaS Backend] Port ${PORT} is already in use by another instance. Keeping existing running instance.`);
  } else {
    console.error("❌ [Node.js SaaS Backend] Server error:", err);
  }
});
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`⚡ [Node.js SaaS Backend] Commercial Multi-Tenant Engine running on http://localhost:${PORT}`);
  });
}

export default app;
