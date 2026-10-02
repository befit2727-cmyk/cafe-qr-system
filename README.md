# ? Aroma / Velvet Bean Cafe - Table QR Ordering, Booking & Management System

> **A turnkey, zero-maintenance web application for cafes and restaurants.**
> Customers scan a table QR code to browse the digital menu, place orders directly to the kitchen, request the bill, or reserve tables. Cafe staff manage orders in real time via a Kitchen Display System (KDS), and Cafe Owners manage dishes, photo uploads, pricing, table QR codes, and sales analytics.

---

## ?? Key Highlights & Why It Costs $0 to Run
- **100% Free Hosting**: Deploy in 1 click to **Vercel**, **Netlify**, or **Cloudflare Pages** on their permanent free tiers.
- **Zero Database Costs / Zero Maintenance**:
  - Uses browser-native LocalStorage + `BroadcastChannel` API for instant, cross-tab real-time synchronization.
  - An optional **Supabase Free Tier** integration is included (`src/supabase/`) for multi-device cloud syncing across different physical phones/iPads with zero monthly fees.
- **Ready to Sell to Cafe Owners**:
  - Fully white-label: change cafe name, currency symbol (`$`, `?`, `€`, `£`, `AED`, etc.), tax rate, and Wi-Fi password in 1 click.
  - Built-in **Printable Table Stand Generator**: Generates high-resolution QR tent cards ready to print on standard A4 paper.
  - Role-Based Access Control with PIN protection.

---

## ?? Role Access & PINs

| Role | Access URL / Switcher | Description | Default PIN |
|---|---|---|---|
| **Customer** | `/?table=Table%201` | Mobile-first menu, customizations (size, milk, sugar), cart, live order tracking, call waiter, table booking | None (Open access) |
| **Kitchen / Staff** | Top Switcher -> Kitchen | Live Kitchen Display System (KDS), new order chimes, advance status (Pending -> Cooking -> Served -> Paid), table calls | `0000` (or `1234`) |
| **Cafe Owner** | Top Switcher -> Owner | Sales analytics, Menu CRUD with photo uploads, Table QR Studio & tent card printing, branding & PIN settings | `1234` |

*Note: You can change the Owner and Staff PINs anytime in the Owner Settings tab.*

---

## ?? Quick Start (Local Run)

```bash
# 1. Navigate to the project directory
cd C:\Users\Dell\.gemini\antigravity\scratch\cafe-qr-system

# 2. Run the development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## ?? How Customer Table QR Scanning Works

1. Each table in the cafe gets its own unique QR code from the **QR Studio** (e.g. `?table=Table 1`, `?table=Table 2`, `?table=Patio 1`).
2. When a customer points their phone camera at the QR code on Table 4:
   - The digital menu loads with Table 4 pre-selected.
   - The customer browses categories, dietary filters (Veg, Gluten-free, Popular), customizes items (e.g. Oat milk, less sweet), and places the order.
   - The order lands in the kitchen display system within milliseconds, accompanied by an audio alert chime.
   - The customer sees an interactive 4-stage live tracker: `Received ??` -> `Cooking ?????` -> `Served ???` -> `Completed ?`.

---

## ?? How to Sell This to Cafe Owners

### Pitch to Cafe Owners:
1. **Save 20-30% on labor**: Customers order directly from their phone; waiters only need to deliver the food.
2. **Increase Average Order Value by 15-25%**: High-resolution food photography and easy add-ons (extra shot, oat milk, desserts) encourage larger orders.
3. **Turn Tables Faster**: Customers can order seconds after sitting down and can request the bill with 1 tap.
4. **No hardware investment**: Runs on any existing iPad, tablet, laptop, or smartphone already in the cafe.

### Suggested Pricing Models You Can Charge:
- **Setup Fee**: $200 – $500 (one-time setup for configuring their menu, uploading photos, and printing table tent cards).
- **Monthly Subscription**: $29 – $49/month for hosting, support, and updates.
- **Your Cost**: **$0/month** (since Vercel and Supabase free tiers cover thousands of orders/month).

---

## ?? 1-Click Free Cloud Deployment (Vercel / Netlify)

### Option A: Vercel (Recommended)
1. Push this folder to a GitHub repository or upload via [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Click **Deploy**. Your live URL will be available immediately (e.g., `https://my-cafe.vercel.app`).

### Option B: Optional Supabase Cloud Sync
If the cafe owner wants separate physical devices (e.g., customer mobile phones on cellular data syncing with a kitchen iPad connected to cafe Wi-Fi):
1. Create a free database at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and paste the contents of `src/supabase/supabase-schema.sql`.
3. Put your project URL and Anon Key into `src/supabase/supabaseClient.ts`.
