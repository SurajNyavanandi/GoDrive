# 🛠️ Backend Developer Guide & Ecosystem Cheat-Sheet

This guide lists performance rules, pre-integrated services, and the **top recommended free-tier cloud services and packages** across common backend domains. Use this as a reference guide to save research time on new projects.

---

## ⚡ 1. Essential Commands & Health Check

| Task | Command | Description |
|---|---|---|
| **Start Development** | `npm run dev` | Runs backend with Vite middleware on port 3000. |
| **Start Standalone Prod** | `npm start` | Runs production Node.js server. |
| **Check Health Endpoint** | `curl http://localhost:3000/api/health` | Returns server status, uptime, and database connection. |

---

## 🎁 2. Generous Free-Tier Third-Party Services

| Service | Free Tier Allocation | Best For | Pre-Wired Location |
|---|---|---|---|
| **Resend** | **3,000 emails/month** (100/day) | Transactional email (Welcome, OTP, Invoices) | `backend/services/resendService.js` |
| **MSG91** | Free initial trial credits | Phone SMS & Voice OTP verification | `backend/services/msg91Service.js` |
| **Razorpay** | **100% Free Sandbox Mode** | Card, UPI, NetBanking payments & webhooks | `backend/services/razorpayService.js` |
| **MongoDB Atlas** | **512MB Perpetual Free (M0)** | Primary document database | `backend/config/db.js` |
| **Google Gemini API** | **Free tier via AI Studio** | AI features, text generation, data extraction | `@google/genai` SDK |
| **Upstash Redis** | **10,000 requests/day free** | Distributed rate limiting, session cache | Serverless Redis |
| **Uploadthing / Cloudinary** | **2GB / 25 credits free** | Image & document uploads, avatar hosting | Media storage |
| **Sentry** | **5,000 errors/month free** | Real-time crash reporting & exception tracing | Error tracking |

---

## 📦 3. Recommended Packages by Category

When extending the backend, use these battle-tested packages:

### 1. File Uploads & Object Storage
| Package | Description | Install Command |
|---|---|---|
| **Multer** *(Pre-installed)* | Node.js middleware for handling `multipart/form-data`. | `multer` |
| **Cloudinary SDK** | Automatic image compression, cropping, and CDN delivery (25GB free tier). | `npm i cloudinary` |
| **@aws-sdk/client-s3** | Direct upload to AWS S3, Cloudflare R2, or MinIO. | `npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` |

### 2. Scheduled Jobs & Queues
| Package | Description | Install Command |
|---|---|---|
| **node-cron** | Lightweight in-memory cron jobs (daily reports, cleanup tasks). | `npm i node-cron` |
| **BullMQ** | High-throughput distributed background job queue powered by Redis. | `npm i bullmq` |

### 3. Real-Time & WebSockets
| Package | Description | Install Command |
|---|---|---|
| **Socket.io** | Real-time bidirectional event-based communication (live chat, notifications). | `npm i socket.io socket.io-client` |
| **ws** | Ultra-fast, minimal native WebSocket implementation. | `npm i ws` |

### 4. AI & LLM Integrations
| Package | Description | Install Command |
|---|---|---|
| **@google/genai** | Official Google GenAI SDK for Gemini 2.5 and 3.7 Flash models. | `npm i @google/genai` |
| **openai** | Official SDK for OpenAI GPT models and Whisper audio transcription. | `npm i openai` |

### 5. Logging & Monitoring
| Package | Description | Install Command |
|---|---|---|
| **Pino** | Super fast JSON logger with low overhead. | `npm i pino pino-pretty` |
| **@sentry/node** | Production error monitoring and performance tracing. | `npm i @sentry/node` |

---

## 🔒 4. Backend Performance & Security Best Practices

### A. Database Indexing
Always index query filters, foreign keys, and sorting fields in Mongoose:
```javascript
// Compound index for user items sorted by date
itemSchema.index({ user: 1, createdAt: -1 });

// Full text search index
itemSchema.index({ title: 'text', description: 'text' });
```

### B. Input Validation via Zod Middleware
Never trust raw `req.body`. Use the included `validateMiddleware.js`:
```javascript
const { validate, z } = require('../middleware/validateMiddleware');

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/signup', validate(userSchema), signupHandler);
```

### C. Standardized API Responses
Always respond with the helper methods in `backend/utils/apiResponse.js`:
```javascript
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 200 / 201 Success
return successResponse(res, { user }, 'User retrieved successfully', 200);

// 400 / 401 / 404 / 500 Error
return errorResponse(res, 'Item not found', 404);
```

### D. Offline Database Fail-Safe
All backend controllers in this template check if MongoDB is active and seamlessly fall back to sandbox in-memory data if offline, allowing frontend and UI development to proceed without local database dependencies.
