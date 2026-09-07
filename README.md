# Firefiles

**Meeting Notes & Transcription Platform** — a Fireflies.ai-style application for recording, transcribing, and summarizing meetings.

> **Current Status:** Milestone 7 — production polish and authentication integration. See [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).

---

## Quick Start

### Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- API health: http://localhost:8000/api/health
- Swagger UI: http://localhost:8000/docs

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- App: http://localhost:3000

Register an account at `/register`, then sign in at `/login`. To seed development data, set `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` in your untracked `backend/.env` before running the seed script.

---

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS  |
| Language | TypeScript (strict)                               |
| Backend  | Python 3.11+, FastAPI, Pydantic v2               |
| ORM      | SQLAlchemy 2.x                                    |
| Database | SQLite (dev)                                      |
| API      | REST / JSON                                       |

---

## Project Structure

```
firefiles/
├── frontend/               # Next.js 14 App Router frontend
│   ├── app/                # Pages and layouts
│   ├── components/         # Reusable UI components (future)
│   ├── hooks/              # Custom React hooks
│   ├── lib/api/            # Centralized API client (all fetch calls live here)
│   └── types/              # Shared TypeScript interfaces
│
├── backend/                # FastAPI Python backend
│   ├── app/
│   │   ├── routes/         # HTTP handlers (no business logic)
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database queries (SQLAlchemy)
│   │   ├── models/         # ORM table models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── exceptions/     # Error types and handlers
│   │   ├── config.py       # Settings from environment
│   │   ├── database.py     # Engine, session, Base
│   │   └── main.py         # App bootstrap
│   └── tests/              # pytest test suite
│
├── docs/
│   ├── ARCHITECTURE.md     # System design and request flow
│   ├── API_DESIGN.md       # All planned endpoints (🟢/🔴 status)
│   ├── DATABASE_DESIGN.md  # Planned data model (⚠️ not implemented)
│   └── DEVELOPMENT.md      # Setup guide and commands
│
├── README.md
├── PROJECT_STATUS.md       # Current milestone, next steps
└── DECISIONS.md            # Architecture Decision Records (ADRs)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System design, request flow, env vars |
| [`docs/API_DESIGN.md`](./docs/API_DESIGN.md) | All REST endpoints with status |
| [`docs/DATABASE_DESIGN.md`](./docs/DATABASE_DESIGN.md) | Planned entity schema |
| [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) | Setup, scripts, troubleshooting |
| [`DECISIONS.md`](./DECISIONS.md) | Why key decisions were made |
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | What's done, what's next |

---

## Feature Roadmap
- [x] Meetings dashboard (list, search, filter, sort, pagination)
- [x] Meeting creation & deletion with toast notifications
- [x] Database & API foundation with seeded business meetings
- [x] Meeting detail workspace with sticky header & metadata
- [x] Interactive audio player with scrub bar, speed selector & volume
- [x] Interactive transcript viewer with speaker labels & timestamps
- [x] Click transcript segment → seek media player
- [x] Media player playback → active transcript segment synchronization
- [x] Case-insensitive transcript search with real-time match highlighting
- [x] Search match navigation (next/previous) with auto-scroll
- [x] Chapter / Topic navigation with real-time active indicators
- [x] AI summary and action-items CRUD
- [x] JWT registration, login, protected workspace routes, and logout
- [x] Persisted transcript comments and highlights
- [x] Global backend search and persisted meeting tags APIs
- [ ] PDF/Markdown export and real LLM-generated summaries
