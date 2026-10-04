# 🔐 Cafe QR SaaS — Credentials, API Keys & Security Directory

This dedicated folder stores all necessary API keys, OAuth client configurations, and environment secrets for your SaaS platform.

---

## 📂 Files in this Folder

1. **`google_oauth_setup.json`**
   * Contains exact configuration for Google Cloud Console (Consent screen settings, Authorized Javascript Origins, Authorized Redirect URIs, and Developer email).
2. **`environment_keys.json`**
   * Central reference for all environment variables across Local Development and Vercel Production.

---

## 🚀 How to Set Up Your Free Google Login (Step-by-Step)

### Step 1: Google Cloud Console Setup
1. Visit: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create project: **`Cafe QR System`**.
3. Go to **OAuth consent screen**:
   * User Type: **External**
   * App name: **`Cafe QR Ordering`**
   * Developer Email: **`mayankkaushik361865@gmail.com`**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**:
   * Application type: **Web application**
   * Name: **`Cafe Web Client`**
   * **Authorized JavaScript origins**:
     * `https://cafe-one-beta.vercel.app`
     * `http://localhost:3000`
     * `http://localhost:5000`
5. Click **Create** and copy your **Client ID** (ends with `.apps.googleusercontent.com`).

---

### Step 2: Paste Your Client ID in Environment Files

#### 1. Local Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=antigravity_cafe_saas_ultra_secret_key_2026
ADMIN_GOOGLE_EMAILS=mayankkaushik361865@gmail.com,admin@cafesaas.com
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

#### 2. Local Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

#### 3. Production Cloud (Vercel):
* Go to your Vercel Project Settings → **Environment Variables**:
  * `VITE_GOOGLE_CLIENT_ID`: `PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`
  * `GOOGLE_CLIENT_ID`: `PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`
  * `ADMIN_GOOGLE_EMAILS`: `mayankkaushik361865@gmail.com,admin@cafesaas.com`
  * `JWT_SECRET`: `antigravity_cafe_saas_ultra_secret_key_2026`

---

## 🛡️ Security Guarantees & Role Isolation

* **Diners / Customers**: When any customer logs in with their personal Gmail, they are **strictly assigned `customer` role**. They can never access Owner or SuperAdmin controls.
* **Super Admin**: Only emails listed in `ADMIN_GOOGLE_EMAILS` (e.g. `mayankkaushik361865@gmail.com`) automatically receive **Super Admin** platform access.
* **Master Credentials**:
  * Master SuperAdmin Email: `admin@cafesaas.com`
  * Master Password: `admin123`
* **Dependency Health**: `0 vulnerabilities` in production runtime (`npm audit --omit=dev`).
* **Headers Active**: Strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
