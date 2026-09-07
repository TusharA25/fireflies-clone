# Architecture — Firefiles

## Overview

Firefiles is a full-stack Meeting Notes & Transcription Platform.
The frontend is a Next.js 14 App Router application; the backend is a FastAPI service.
They communicate exclusively over REST/JSON. There is no server-side rendering of backend data —
the frontend fetches everything client-side via `lib/api/`.

---

## Request Flow

```
Browser
  │
  │  HTTP GET/POST/PUT/DELETE  (JSON)
  ▼
Next.js Frontend  (port 3000)
  │
  │  lib/api/client.ts  ──►  NEXT_PUBLIC_API_URL (http://localhost:8000)
  │
  ▼
FastAPI Backend  (port 8000)
  │
  ├── app/routes/      ← HTTP layer only; no business logic
  │       │
  │       ▼
  ├── app/services/    ← Business logic, orchestration
  │       │
  │       ▼
  ├── app/repositories/ ← All SQLAlchemy queries
  │       │
  │       ▼
  └── SQLAlchemy ORM
          │
          ▼
       SQLite  (firefiles.db)
```

---

## Tech Stack

| Layer      | Technology                                   | Version  |
|------------|----------------------------------------------|----------|
| Frontend   | Next.js (App Router)                         | 14.x     |
| UI         | React + Tailwind CSS                         | 18 / 3.4 |
| Language   | TypeScript (strict)                          | 5.x      |
| Backend    | FastAPI                                      | 0.111+   |
| Language   | Python                                       | 3.11+    |
| ORM        | SQLAlchemy 2.x (declarative)                 | 2.0+     |
| Validation | Pydantic v2 + pydantic-settings              | 2.x      |
| Database   | SQLite                                       | —        |
| HTTP client| httpx (tests only)                           | 0.27+    |

---

## Directory Layout

```
firefiles/
├── frontend/
│   ├── app/              # Next.js App Router pages + layouts
│   ├── components/       # Reusable React components (future)
│   ├── hooks/            # Custom React hooks (useHealth, etc.)
│   ├── lib/
│   │   └── api/          # Centralized API client — all fetch() calls live here
│   └── types/            # Shared TypeScript interfaces
│
├── backend/
│   ├── app/
│   │   ├── routes/       # FastAPI routers — HTTP only, no logic
│   │   ├── services/     # Business logic layer
│   │   ├── repositories/ # Database query layer (SQLAlchemy)
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── exceptions/   # Custom exception types + handlers
│   │   ├── utils/        # Shared helpers
│   │   ├── config.py     # App settings via pydantic-settings
│   │   ├── database.py   # Engine, SessionLocal, Base, get_db()
│   │   └── main.py       # FastAPI app entry point
│   └── tests/
│
└── docs/                 # All architecture / design documentation
```

---

## CORS Configuration

The backend allows requests from `http://localhost:3000` (Next.js dev server).
Configured in `app/main.py` via `CORSMiddleware`.
Allowed origins are read from `CORS_ORIGINS` in `.env`.

To add more origins, edit `backend/.env`:
```
CORS_ORIGINS=["http://localhost:3000","https://your-domain.com"]
```

---

## Frontend API Client Contract

All API calls **must** go through `frontend/lib/api/client.ts`.
No component, hook, or page may call `fetch()` directly.

```
lib/api/
  client.ts      ← base request(), ApiError, get/post/put/patch/del helpers
  health.ts      ← checkHealth()
  meetings.ts    ← (planned) CRUD for meetings
  ...
```

---

## Environment Variables

| Variable              | Side     | Description                        |
|-----------------------|----------|------------------------------------|
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the FastAPI backend    |
| `DATABASE_URL`        | Backend  | SQLAlchemy DB URL                  |
| `ENVIRONMENT`         | Backend  | `development` or `production`      |
| `CORS_ORIGINS`        | Backend  | JSON array of allowed origins      |
