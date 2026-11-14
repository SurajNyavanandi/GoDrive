# Mana Drivers (GoDrive) - Production-Grade Platform

Production-ready MERN platform for on-demand chauffeurs and drivers in Hyderabad. Designed for high availability, zero-latency local fallback, enterprise security hardening, and high-conversion ad attribution (Google Ads & Meta Ads).

---

## Architecture Overview

```
GoDrive26/
├── .env.example             # Complete environment configuration template
├── docker-compose.yml       # Production-ready Compose (MongoDB, API, Web)
├── .github/workflows/ci.yml # Automated CI pipeline (lint, tests, build)
├── backend/                 # Node.js + Express + MongoDB REST API
│   ├── config/              # Centralized Zod env validation & DB connection pooling
│   ├── controllers/         # API business logic & error handling
│   ├── middleware/          # Security headers, JWT/Admin auth, rate limiting, Zod validation
│   ├── models/              # Mongoose schemas (User, Driver, Booking, Pricing, Review)
│   ├── routes/              # Express route declarations
│   ├── services/            # Dual-layer storage (MongoDB + in-memory fallback), MSG91, Cloudinary
│   ├── tests/               # Native Node.js test runner integration test suite
│   ├── utils/               # Structured Pino logger, magic-byte upload validation, API responses
│   └── server.js            # Express server, request ID tracing, graceful shutdown
└── frontend/                # React 19 + Vite + Tailwind CSS SPA
    ├── src/
    │   ├── components/      # UI Views, Portals, Common Atoms, 3D Canvas
    │   ├── services/        # Preconfigured Axios instance with JWT refresh interceptor
    │   ├── utils/           # Typed API wrappers, analytics tracking, formatting
    │   ├── tests/           # Vitest + React Testing Library component tests
    │   └── App.jsx          # Role management, routing, UTM attribution capture
    ├── Dockerfile           # Multi-stage Docker build with Nginx
    └── nginx.conf           # Gzip compression, security headers, SPA fallback
```

---

## Key Features & Production Hardening

### 1. Secrets & Environment Validation
- Validated at startup via **Zod schema** (`backend/config/env.js`). Missing or malformed production variables trigger fail-fast behavior with detailed diagnostic logs.
- Single, unified root `.env` configuration shared between frontend (`VITE_*`) and backend (`PORT`, `MONGO_URI`, `JWT_SECRET`, etc.).

### 2. Dual-Layer Storage Engine
- **Active Database**: Fully indexed MongoDB schemas via Mongoose for high-throughput queries (`phone`, `licenseNo`, `status`, `driverType`, `isApproved`, compound lookup indexes).
- **Graceful Sandbox Fallback**: If MongoDB Atlas or network connectivity is degraded, the service smoothly falls back to local in-memory storage, ensuring zero downtime for customers.

### 3. Authentication & IDOR Protection
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Session Tokens**: JWT access tokens (7-day default) paired with 30-day refresh tokens via `POST /api/auth/refresh`.
- **Role Enforcement**: Strict server-side verification (`protectAdmin`, `protect`) preventing frontend-only authorization bypasses.
- **IDOR Protection**: Drivers can only view and update their own records (`verifyDriverOwnership`).

### 4. Security & DDoS Mitigation
- **Security Headers**: Integrated `helmet` with custom CSP and cross-origin controls.
- **CORS Protection**: Restricted to explicit production origins defined in `ALLOWED_ORIGINS` (wildcards prohibited with credentials).
- **Rate Limiting**: Tiered IP rate limiters using `express-rate-limit` (General: 300 req/15min, Auth/OTP: 10 req/15min).
- **Upload Hardening**: File uploads verified by **magic-byte signature inspection** preventing MIME-spoofing attacks.
- **NoSQL Injection Guard**: Parameter type-checking, Zod input validation, and sanitization on all endpoints.

### 5. Distributed Tracing & Observability
- **Request Tracing**: `X-Request-Id` automatically injected on every incoming request and propagated to client responses.
- **Structured Logging**: Structured JSON logging powered by `pino` with automatic redaction of sensitive credentials, passwords, and OTPs.
- **Liveness & Readiness**: Comprehensive health monitoring via `GET /health` and `GET /api/health/live`.

---

## Getting Started

### Prerequisites
- **Node.js**: v20+ (Node v22 or v24 recommended)
- **npm**: v10+
- **Docker & Docker Compose** (optional, for containerized execution)

### 1. Installation
Clone the repository and install all monorepo dependencies:
```bash
git clone <repo-url>
cd GoDrive26
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your credentials (see [.env.example](file:///.env.example) for documentation of every key).

### 3. Running Locally
Start both backend API and frontend Vite development server:
```bash
# Start backend server
npm run dev:backend

# Start frontend dev server
npm run dev:frontend
```

---

## Testing & Quality Assurance

### Run Full Test Suite (Backend & Frontend)
```bash
npm test
```

### Run Backend Integration Tests
Tests authentication lifecycles, health probes, driver pagination, IDOR security, and booking validation:
```bash
npm run test:backend
```

### Run Frontend Component Tests
Tests React components, error boundary fallbacks, button states, and accessible navigation:
```bash
npm run test:frontend
```

### Code Formatting & Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

---

## Cloud Deployment (Render + Vercel)

### 1. Backend Deployment: Render (Web Service)
1. **Create Web Service**: In your [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service** and connect your GitHub repository.
2. **Build & Start Settings**:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
3. **Environment Variables on Render**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default, Render sets this dynamically)
   - `MONGO_URI` (or `MONGODB_URI`): `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/manadrivers?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_min_32_characters`
   - `JWT_EXPIRE`: `7d`
   - `ADMIN_EMAIL`: `admin@example.com`
   - `ADMIN_API_KEY`: `your_secure_admin_api_key_32_chars`
   - `CLIENT_URL`: `https://<your-project>.vercel.app`
   - `ALLOWED_ORIGINS`: `https://<your-project>.vercel.app,https://manadrivers.com`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (from Cloudinary dashboard)
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`: (from Resend dashboard)
   - `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`: (from MSG91 dashboard)
4. **Initial Data Seeding (Optional)**:
   In Render Shell or locally targeting your Atlas URI:
   ```bash
   npm run seed --workspace=backend
   ```

### 2. Frontend Deployment: Vercel (React SPA)
1. **Import Project**: In your [Vercel Dashboard](https://vercel.com), click **Add New...** -> **Project** and select your repository.
2. **Framework & Root Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables on Vercel**:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
   - `VITE_BACKEND_API_URL`: `https://<your-render-service>.onrender.com`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_live_your_key_id`
4. **SPA Rewrites**: Pre-configured in `frontend/vercel.json` to handle client-side routing and cache headers.

### Order of Deployment

1. **Step 1 — MongoDB Atlas Setup**:
   - Create a database user with read/write permissions.
   - Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit Render's dynamic IP range.
   - Copy your connection string (`mongodb+srv://...`).

2. **Step 2 — Deploy Backend First (Render)**:
   - Create Web Service with root directory `backend`, build command `npm install`, start command `npm start`.
   - Provide `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, etc. Leave `CLIENT_URL` empty or set to temporary value.
   - Deploy and copy the live backend URL: `https://<your-service>.onrender.com`.
   - Test health check: `https://<your-service>.onrender.com/health`.

3. **Step 3 — Deploy Frontend (Vercel)**:
   - Import project in Vercel with root directory `frontend`, build command `npm run build`, output directory `dist`.
   - Add environment variable `VITE_API_URL=https://<your-service>.onrender.com/api`.
   - Click **Deploy** and copy your production Vercel URL: `https://<your-project>.vercel.app`.

4. **Step 4 — Update CORS & Redeploy Backend (Render)**:
   - Return to your Render Dashboard -> Environment.
   - Set `CLIENT_URL=https://<your-project>.vercel.app` and `ALLOWED_ORIGINS=https://<your-project>.vercel.app`.
   - Render automatically restarts the service with the updated CORS configuration.

---

## Docker Deployment (Local or VPS)

To spin up the entire production stack (MongoDB 7 + Node.js API + Nginx Static Frontend) with a single command:
```bash
docker compose up -d --build
```

- **Frontend Application**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

To view container logs:
```bash
docker compose logs -f
```

To gracefully tear down the stack:
```bash
docker compose down
```

---

## Production Deployment Checklist

1. [ ] **Rotate Passwords & API Keys**: Replace placeholder secrets in `.env` with strong random values:
   - Generate secure JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Generate secure Admin API key: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`
2. [ ] **MongoDB Atlas Whitelist**: Ensure hosting provider IP addresses (AWS, Render, GCP, DigitalOcean) are whitelisted in MongoDB Atlas Network Access.
3. [ ] **CORS Origins**: Set `ALLOWED_ORIGINS=https://manadrivers.com,https://www.manadrivers.com` in production `.env`.
4. [ ] **Payment Webhooks**: Configure Razorpay webhook secret in `RAZORPAY_WEBHOOK_SECRET` pointing to `/api/payment/verify`.
5. [ ] **Reverse Proxy SSL**: Terminate TLS/SSL (HTTPS) at Nginx or Cloudflare edge, passing `X-Forwarded-Proto: https`.
