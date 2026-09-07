# Architecture Decision Records (ADRs)

---

## ADR-001: SQLite for Development Database

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** The project needs a database for local development with zero external dependencies. The first milestone is foundation only; no production deployment is planned yet.

**Decision:** Use SQLite as the development database, configured via `DATABASE_URL=sqlite:///./firefiles.db`.

**Consequences:**
- ✅ Zero-config — no Docker or external service needed
- ✅ Database file lives in `backend/` directory, inspectable with DB Browser for SQLite
- ⚠️ SQLite lacks full-text search, concurrent writes, and some Postgres-specific features
- ⚠️ When this moves to production, `DATABASE_URL` should be swapped to PostgreSQL; SQLAlchemy abstracts the difference

---

## ADR-002: SQLAlchemy 2.x with Declarative Base

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** The project needs an ORM. SQLAlchemy 1.x and 2.x have significantly different APIs.

**Decision:** Use SQLAlchemy 2.x with `declarative_base()` and `sessionmaker`. Use the 2.x `Mapped[]` + `mapped_column()` style in all models (Milestone 2+).

**Consequences:**
- ✅ Modern, type-annotated ORM syntax
- ✅ Async-capable (`AsyncSession`) without rewriting queries if needed later
- ⚠️ SQLAlchemy 2.x docs and Stack Overflow answers are less common than 1.x examples; always verify version

---

## ADR-003: Pydantic v2 + pydantic-settings

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** FastAPI is tightly coupled to Pydantic. Pydantic v1 and v2 are not API-compatible.

**Decision:** Use Pydantic v2 throughout. Use `pydantic-settings` (`BaseSettings`) for all configuration, reading from `.env` files.

**Consequences:**
- ✅ Significant performance improvement over Pydantic v1
- ✅ Config validation with type safety (wrong env var → crash on startup with a clear message)
- ⚠️ `model_config = SettingsConfigDict(...)` replaces the old `class Config:` inner class — do not mix styles

---

## ADR-004: Next.js 14 App Router

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** Next.js supports both the legacy Pages Router and the modern App Router. New projects should use App Router.

**Decision:** Use Next.js 14 App Router exclusively. All pages live under `app/`. No `pages/` directory.

**Consequences:**
- ✅ React Server Components, `layout.tsx`, `loading.tsx`, `error.tsx` conventions
- ✅ Easier nested layouts for future dashboard/sidebar UI
- ⚠️ Client components that use hooks must explicitly declare `'use client'` at the top

---

## ADR-005: Centralized API Client (`lib/api/`)

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** Fetch calls scattered across components make base URL changes, error handling, and auth token injection painful.

**Decision:** All API calls live in `frontend/lib/api/`. The base `client.ts` provides `get()`, `post()`, `put()`, `patch()`, `del()`. Each resource has its own module (e.g., `meetings.ts`, `health.ts`). No component or hook may call `fetch()` directly.

**Consequences:**
- ✅ Single place to add auth headers, logging, retries
- ✅ Easy to mock in tests
- ⚠️ Requires discipline — code reviewers must enforce the rule

---

## ADR-006: No Root `package.json`

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** A monorepo root `package.json` could be added to run both frontend and backend together (e.g., with `concurrently`). However, the backend is Python, not Node.

**Decision:** No root `package.json`. Frontend and backend are independent projects run separately. A `Makefile` or `docker-compose.yml` may be added later if orchestration is needed.

**Consequences:**
- ✅ Simpler dependency isolation; no accidental cross-contamination
- ⚠️ Developers must start frontend and backend in separate terminals (documented in `docs/DEVELOPMENT.md`)

---

## ADR-007: Strict Layered Architecture (Routes → Services → Repositories)

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** FastAPI makes it easy to put database queries directly inside route handlers. This creates tightly coupled, untestable code.

**Decision:** Enforce a strict three-layer separation:
1. **Routes** — only parse requests, call services, return responses
2. **Services** — all business logic, orchestration, validation beyond schema
3. **Repositories** — all SQLAlchemy queries; no business logic

**Consequences:**
- ✅ Each layer is independently testable (mock the layer below)
- ✅ Easy to swap SQLAlchemy for another ORM without touching routes
- ⚠️ More boilerplate per resource; worth it as the codebase grows

---

## ADR-008: System Font Stack Instead of Google Fonts

- **Date:** 2026-09-07
- **Status:** Accepted

**Context:** `next/font/google` fetches font CSS at build time over the network. In sandboxed CI environments or offline builds, this fails with `ENOTFOUND fonts.googleapis.com`.

**Decision:** Use Tailwind's `font-sans` utility class, which resolves to the OS system font stack (`-apple-system`, `Segoe UI`, `Roboto`, etc.). Google Fonts can be added later once the project is deployed to an environment with unrestricted network access.

**Consequences:**
- ✅ Builds succeed in any network environment
- ⚠️ Typography differs slightly between macOS, Windows, and Linux — acceptable for a development foundation
