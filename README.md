# 📰 Al-Mada Newspaper Platform

**Last Updated:** June 9, 2026 (UI Redesign & Navigation Submenus)

An elegant, high-performance, decoupled full-stack digital publication platform engineered for the **Al-Mada Newspaper**. The system leverages **Next.js**, **Prisma ORM**, and a highly sophisticated, secure **API Database Bridge** that mirrors the Supabase Client SDK to achieve perfect decoupling between public rendering and administrative management layers.

---

## 🚀 Architecture Overview

The platform uses a modular, multi-app design to enforce security, ensure scaling boundaries, and completely decouple public presentation pages from administrative mutations.

```
                  ┌────────────────────────┐
                  │   Public Web Portal    │ (Next.js - Port 3001)
                  │      (web app)         │
                  └───────────┬────────────┘
                              │
                              │ 1. Executes Supabase-style query chain
                              │ 2. Proxies POST payload with x-api-token signature
                              ▼
                  ┌────────────────────────┐
                  │ Admin Gateway Proxy    │ (Next.js - Port 3000)
                  │   (/api/db & Prisma)   │
                  └───────────┬────────────┘
                              │
                              │ 3. Validates token/JWT & runs query
                              ▼
                  ┌────────────────────────┐
                  │  PostgreSQL Database   │ (Local / Railway Cloud)
                  └────────────────────────┘
```

### Core Architecture Components:

1. **`web` App (Public Portal)**:
   * Serves article layouts, dynamic video/reel galleries, podcast streams, interactive polls, and real-time commentary.
   * Completely sandboxed from direct database credentials.
   * Leverages a mock client SDK that captures standard SQL/Supabase commands and securely proxies them to the database gateway.

2. **`admin` App (Administrative Panel)**:
   * Dedicated workspace for editors, journalists, media managers, and administrators.
   * Houses the direct database proxy dispatcher (`/api/db`) and handles direct communication with PostgreSQL using the **Prisma Client**.
   * Directs media processing and persistent disk writes.

3. **`prisma` Layer (Core Database)**:
   * Holds the canonical system schema, seeding scripts, and relational database migrations.

---

## ⚡ The Genius Database Proxy Bridge

To achieve database-agnostic security on the public-facing client without refactoring high-volume query components, the platform runs a custom-designed **Supabase Mock Client SDK**:

### Query Translation Flow:
1. **Frontend Query Calling**:
   A standard query is initiated anywhere in the public portal:
   ```typescript
   const { data } = await supabase
     .from('news')
     .select('*')
     .eq('status', 'PUBLISHED')
     .order('publish_date', { ascending: false })
     .limit(10);
   ```

2. **Client-Side Interceptor (`web/src/utils/supabase/client.ts`)**:
   Instead of reaching Supabase Cloud, the client captures query parameters in a custom thenable chain and translates them into a JSON query instruction payload:
   ```json
   {
     "table": "news",
     "action": "select",
     "filters": { "status": "PUBLISHED" },
     "order": { "field": "publish_date", "direction": "desc" },
     "limit": 10
   }
   ```

3. **Secure Web API Forwarder (`web/src/app/api/db/route.ts`)**:
   * Client-side calls are proxied locally to avoid token exposure.
   * Server-side rendering (SSR/RSC) dispatches the payload directly to the Admin Gateway.
   * Requests are signed with a secure server-to-server header:
     `x-api-token: process.env.API_SECRET_TOKEN`

4. **Admin Gateway & Dispatcher (`admin/src/app/api/db/route.ts`)**:
   * Inspects the inbound request, validating either the `x-api-token` secret header or the active administrative session JWT cookie.
   * Hands query instructions to `dispatchDbQuery()` which parses filters (including negative matches and relational tables like `polls -> options`), converts them into Prisma instructions, executes the query, and maps response data into standard Supabase-like `{ data, error }` envelopes.

---

## 📂 Core Folder Structure

```
injaz/
├── admin/                  # Administrative Panel & Database Proxy App
│   ├── src/
│   │   ├── app/            # Next.js 15 App router (Auth, Dashboard, DB & Upload APIs)
│   │   ├── components/     # UI elements (shadcn/radix) & editorial widgets
│   │   └── utils/          # JWT auth, Prisma instances, and db-dispatcher query parser
│   └── public/             # Dev assets & local file uploads directory
├── web/                    # Client Portal Web App
│   ├── src/
│   │   ├── app/            # Next.js 15 App router (News, Videos, Reels, DB proxy route)
│   │   ├── components/     # Premium client widgets & layout sections
│   │   └── utils/          # Client-side and server-side Supabase client mock bridge
│   └── public/             # Static public assets
├── prisma/                 # Prisma DB migrations, database configuration, and seeds
└── .env                    # Shared database parameters
```

---

## 🛠️ Local Environment Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: Local running server (port `5432`)

### 1. Database Initialization
Create a PostgreSQL database named `mada_db` and apply the schema:
```bash
# Set up environment parameters
cp .env.example .env

# Run migrations to build tables and establish relations
npx prisma migrate dev

# Seed database with base categories, mock articles, and the default admin user
npx prisma db seed
```
*Standard Admin Credentials:*
* **Email**: `admin@almada.com`
* **Password**: `admin@almada`

### 2. Configure Local Environments
Ensure respective `.env.local` files match local execution addresses:

**For Admin (`admin/.env.local`):**
```env
DATABASE_URL="postgresql://postgres:admin123@127.0.0.1:5432/mada_db?schema=public"
DIRECT_URL="postgresql://postgres:admin123@127.0.0.1:5432/mada_db?schema=public"
API_SECRET_TOKEN="7f1a8e9b6c0d4e3f2a1b9c8d7e6f5a4b"
```

**For Web (`web/.env.local`):**
```env
ADMIN_API_URL="http://127.0.0.1:3000"
API_SECRET_TOKEN="7f1a8e9b6c0d4e3f2a1b9c8d7e6f5a4b"
```

### 3. Run Servers
Spin up development servers concurrently on assigned ports:
```bash
# Start the Admin Database Proxy Panel (Port 3000)
cd admin
npm run dev

# In a new terminal tab, start the Public Portal (Port 3001)
cd web
npm run dev
```

---

## 🌐 Production Deployment Topology

The production setup is hosted on **Railway Cloud** with zero dependencies on external cloud database wrappers:

### Cloud Environment Architecture:
* **Admin Instance**: Processes database access directly using Railway’s PostgreSQL service. Hosted at `https://al-mada-newspaper-production.up.railway.app`.
* **Web Instance**: Queries the production Admin proxy securely over the server-to-server endpoint, completely masking all direct SQL credentials.
* **Persistent Media Storage**: Configured via the `MEDIA_UPLOAD_DIR` variable on the Admin instance, directing file streams to persistent disk shares or custom Nginx volume mounts.
* **Asset Rewrites**: Production proxy traffic to `/uploads/*` seamlessly points back to the live Admin asset endpoint using custom rewrite hooks in `web/next.config.ts`.
