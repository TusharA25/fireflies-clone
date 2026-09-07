# Development Guide — Firefiles

## Prerequisites

| Tool       | Version  | Install                        |
|------------|----------|--------------------------------|
| Node.js    | 18+      | https://nodejs.org             |
| npm        | 9+       | bundled with Node.js           |
| Python     | 3.11+    | https://python.org             |
| git        | any      | https://git-scm.com            |

---

## Quick Start

### 1 — Clone & enter repo
```bash
git clone <repo-url>
cd firefiles
```

### 2 — Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy env (already done; edit if needed)
cp .env.example .env

# Start dev server (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend is now at:
- API:   http://localhost:8000/api/health
- Docs:  http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3 — Frontend
```bash
cd frontend
npm install

# Copy env (already done; edit if needed)
cp .env.example .env.local

npm run dev
```

Frontend is now at: http://localhost:3000

---

## Environment Variables

### Frontend (`frontend/.env.local`)
| Variable              | Default                  | Description                    |
|-----------------------|--------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`  | Base URL for all API requests  |

### Backend (`backend/.env`)
| Variable        | Default                         | Description                          |
|-----------------|---------------------------------|--------------------------------------|
| `DATABASE_URL`  | `sqlite:///./firefiles.db`      | SQLAlchemy database URL              |
| `ENVIRONMENT`   | `development`                   | `development` or `production`        |
| `CORS_ORIGINS`  | `["http://localhost:3000"]`     | JSON array of allowed CORS origins   |

---

## Available Scripts

### Frontend
```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run start    # Start production server (after build)
npm run lint     # ESLint check
```

### Backend
```bash
# (activate venv first)
uvicorn app.main:app --reload          # Dev server with reload
uvicorn app.main:app --host 0.0.0.0   # Listen on all interfaces

pytest tests/ -v                        # Run all tests
pytest tests/ -v -k test_health        # Run specific test
```

---

## Project Structure Reference

```
frontend/
  app/            # Next.js App Router — pages and layouts
  components/     # Shared React components (add here, not in app/)
  hooks/          # Custom React hooks
  lib/api/        # ALL fetch() calls live here — never scatter them
  types/          # TypeScript interfaces shared across the app

backend/
  app/
    routes/       # FastAPI routers — thin HTTP handlers only
    services/     # Business logic — called by routes
    repositories/ # Database access — called by services
    models/       # SQLAlchemy ORM table definitions
    schemas/      # Pydantic input/output schemas
    exceptions/   # Custom errors and global handlers
    utils/        # Shared utility functions
    config.py     # All config from environment variables
    database.py   # DB engine, session, Base
    main.py       # App bootstrap
  tests/          # pytest test suite
```

---

## Adding a New API Endpoint

1. **Schema** — add request/response Pydantic models in `app/schemas/<resource>.py`
2. **Model** — add SQLAlchemy model in `app/models/<resource>.py`, import in `models/__init__.py`
3. **Repository** — add DB queries in `app/repositories/<resource>.py`
4. **Service** — add business logic in `app/services/<resource>.py`
5. **Route** — add FastAPI router in `app/routes/<resource>.py`; register it in `main.py`
6. **Frontend client** — add `lib/api/<resource>.ts` using the `get/post/put/del` helpers
7. **Test** — add `tests/test_<resource>.py`

---

## Troubleshooting

| Problem                              | Fix                                                         |
|--------------------------------------|-------------------------------------------------------------|
| `CORS error` in browser              | Check `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000` |
| `Cannot find module 'autoprefixer'`  | Run `npm install` in `frontend/`                            |
| Port 8000 already in use             | `lsof -ti :8000 | xargs kill -9`                           |
| `pydantic_settings` import error     | Make sure `pydantic-settings` is installed (`pip install`)  |
| SQLite DB not created                | Backend `init_db()` runs on startup; check uvicorn logs     |
