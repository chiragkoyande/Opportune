# OPPORTUNE V4 — Backend (Node.js & TypeScript)

Production-grade backend and database integration for **OPPORTUNE V4**, aggregating engineering jobs, internships, hackathons, and coding contests.

---

## 🚀 Fixed Tech Stack

- **Runtime**: Node.js v22+
- **Language**: TypeScript 5.8+ (Strict ES2022 / NodeNext)
- **Framework**: Express.js with Helmet and CORS
- **Database**: PostgreSQL (Supabase-ready) via native connection pooling (`pg`)
- **Authentication**: Supabase Auth (JWT verification & RBAC)
- **Caching**: Redis (`ioredis`) with fail-open graceful degradation
- **Validation**: Zod schema validation
- **Scheduler**: `node-cron` scheduled at `00:00 IST` (`Asia/Kolkata`)
- **Logging**: Pino structured logging
- **Testing**: Vitest + Supertest

---

## 🛡️ Controlled Ingestion Pipeline

```
CRAWL → STAGE → NORMALIZE → VALIDATE → DEDUPLICATE → EXPIRY CHECK → PUBLISH
```

1. **Crawl**: Fetches opportunities from ATS platforms (Greenhouse, Lever, Ashby, Workday), Devfolio, Unstop, Codeforces, LeetCode, and CodeChef.
2. **Stage**: Saves raw unprocessed payload into `crawl_run_items`.
3. **Normalize**: Standardizes salary, stipend, and locations (India-focused).
4. **Validate**: Enforces mandatory fields; **strictly rejects fabricated data**.
5. **Deduplicate**: Deterministic SHA-256 fingerprinting.
6. **Expiry Check**: Flags past deadlines without destructive deletes.
7. **Publish**: Atomic promotion into public tables; **never replaces good production data on partial failure**.

---

## 📂 Project Directory Structure

```
backend/
├── src/
│   ├── index.ts               # Server entry point & graceful shutdown
│   ├── app.ts                 # Express setup, middleware, error handlers
│   ├── config/                # Zod environment, Pino logger, Redis, Supabase
│   ├── types/                 # Domain types matching frontend contracts
│   ├── database/              # Schema DDL & connection pooling
│   ├── middleware/            # Auth, Zod validation, error handler
│   ├── routes/v1/             # /api/v1 (jobs, internships, hackathons, contests, etc.)
│   ├── services/              # Business logic & caching layer
│   ├── crawler/               # Pipeline, deduplication, normalizers, validators
│   ├── scheduler/             # 00:00 IST cron scheduler
│   └── tests/                 # Vitest + Supertest test suite
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Tests
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```

The API will be accessible at `http://localhost:8000/api/v1` and health check at `http://localhost:8000/health`.

### 4. Build for Production
```bash
npm run build
npm start
```
