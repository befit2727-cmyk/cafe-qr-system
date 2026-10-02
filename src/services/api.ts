import { DEFAULT_CAFES } from "../data/defaultCafes";

export const API_SERVER = typeof window !== "undefined"
  ? (import.meta.env.VITE_API_URL as string) || (window.location.hostname === "localhost" ? "http://localhost:5000" : "")
  : "http://localhost:5000";

export const API_BASE = API_SERVER ? `${API_SERVER}/api` : "/api";

let currentCafeId = typeof window !== "undefined"
  ? new URLSearchParams(window.location.search).get("cafe") || localStorage.getItem("active_cafe_id") || "chai-charcha"
  : "chai-charcha";

export function setActiveApiCafe(cafeId: string) {
  currentCafeId = cafeId;
  if (typeof window !== "undefined") {
    localStorage.setItem("active_cafe_id", cafeId);
  }
}

export function getActiveApiCafe(): string {
  return currentCafeId;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("saas_auth_token") : null;
  const headers: Record<string, string> = {
    "x-cafe-id": currentCafeId,
    ...customHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      return await res.json();
    }
  } catch {
    // Return fallback if Node.js server is not reachable
  }
  return fallback;
}

export async function postData<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Silent fallback
  }
  return null;
}

export async function putData<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Silent fallback
  }
  return null;
}

export async function deleteData(endpoint: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    // Silent fallback
  }
  return false;
}

export async function fetchCafesList(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/cafes`);
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_CAFES;
}

export async function createNewCafe(cafeData: {
  name: string;
  slug?: string;
  tagline?: string;
  template?: string;
  phone?: string;
  address?: string;
  currencySymbol?: string;
}): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/cafes`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(cafeData)
    });
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      return await res.json();
    }
  } catch {}
  
  // Client-side fallback creation
  const slug = cafeData.slug || cafeData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    meta: {
      id: slug,
      slug,
      name: cafeData.name,
      city: "Custom Location",
      tagline: cafeData.tagline || "Fresh Gourmet & Drinks",
      logoUrl: "🏪",
      currencySymbol: cafeData.currencySymbol || "₹",
      address: cafeData.address || "Main Street",
      phone: cafeData.phone || "+91 99999 00000",
      template: cafeData.template || "chai-cafe",
      ownerEmail: `owner@${slug}.com`,
      status: "active",
      plan: "Premium Pro",
      monthlySales: 0
    }
  };
}

