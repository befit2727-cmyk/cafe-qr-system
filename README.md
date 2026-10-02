# ☕ Chai & Charcha — Multi-Tenant Commercial Cafe SaaS Platform

Enterprise-grade full-stack cafe ordering platform featuring Customer 3D Menu & Ordering, Kitchen Display System (KDS), Owner Studio & Standee Generator, and SuperAdmin Multi-Tenant Management.

---

## Architecture Overview (Separated Monorepo)

```text
cafe-qr-system/
├── backend/                  # Standalone Node.js & Express API Service
│   ├── data/                 # JSON multi-tenant database & accounts
│   ├── services/             # AuthStore (scrypt), CafeStore, RateLimiter
│   ├── server.js             # HTTP & Socket.io server entry
│   ├── package.json          # Independent backend dependencies
│   ├── Dockerfile            # Container deployment for Render/Railway/Fly
│   └── .env.example          # Backend environment variables
│
├── frontend/                 # Standalone React + Vite + TypeScript Application
│   ├── public/               # Static assets & PWA manifest
│   ├── src/                  # Components, 3D WebGL engine, context
│   ├── index.html            # Application entrypoint
│   ├── vite.config.ts        # Dynamic proxy configuration
│   ├── package.json          # Independent frontend dependencies
│   ├── Dockerfile            # Production container build
│   └── .env.example          # Frontend environment variables
│
├── api/                      # Vercel serverless gateway
│   └── index.js              # Bridges Vercel edge routes to backend
│
├── run.js                    # Concurrent dev runner for both services
├── docker-compose.yml        # Multi-container orchestration
├── render.yaml               # 1-Click Render.com deployment spec
├── vercel.json               # Vercel routing, headers & CSP
└── package.json              # Monorepo workspaces coordinator
```

---

## Enterprise Security Standards

1. Zero Client-Side Credential Exposure:
   - No demo accounts, auto-fill shortcuts, or exposed PINs on customer menus or login screens.
2. Strict Cryptographic Authentication:
   - Passwords hashed with scrypt and unique cryptographic salts with constant-time equality comparisons (crypto.timingSafeEqual) to prevent timing attacks.
3. Role-Based Access Control (RBAC):
   - Customer: Access to menu, 3D customizer, cart, live order tracking, waiter calling.
   - Staff: Dedicated Kitchen Display System (KDS) protected by private Staff PIN.
   - Owner: Dedicated Owner Studio protected by private Owner PIN or Owner credentials.
   - Super Admin: Multi-tenant vendor platform protected by scrypt-hashed credentials or Google Workspace Admin OAuth.
4. Google Identity Services (OAuth 2.0):
   - Official GIS SDK integration with server-side ID token verification via https://oauth2.googleapis.com/tokeninfo.

---

## Running Locally

```bash
# Install all dependencies (workspaces)
npm install

# Run both backend (5000) and frontend (3000) concurrently
npm run dev

# Or run services independently
npm --prefix backend run dev    # Backend only
npm --prefix frontend run dev   # Frontend only
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

---

## Production Deployment

- Live Production URL: https://cafe-one-beta.vercel.app
- API Health Endpoint: https://cafe-one-beta.vercel.app/api/health
