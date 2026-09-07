# API Design — Firefiles

All endpoints are prefixed with `/api`.
Interactive documentation is available at `http://localhost:8000/docs` (Swagger UI).

## Authentication 🟢 IMPLEMENTED

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register and receive a bearer token (`201`) |
| POST | `/api/auth/login` | Sign in and receive a bearer token |
| GET | `/api/auth/me` | Return the authenticated user |

Except for health, register, and login, API endpoints require `Authorization: Bearer <access_token>`. Missing, expired, or invalid tokens return `401`. Meetings and their child resources are accessible only to their owner; cross-user access returns `404`.

---

## Health

### 🟢 IMPLEMENTED

| Method | Path          | Description      |
|--------|---------------|------------------|
| GET    | /api/health   | Service liveness |

**Response `200`:**
```json
{ "status": "ok" }
```

---

## Meetings 🟢 IMPLEMENTED

| Method | Path                  | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /api/meetings         | List all meetings (paginated)  |
| POST   | /api/meetings         | Create a new meeting           |
| GET    | /api/meetings/{id}    | Get single meeting by ID       |
| PUT    | /api/meetings/{id}    | Update meeting metadata        |
| DELETE | /api/meetings/{id}    | Delete meeting                 |

**GET /api/meetings — Query params:**
- `q` — full-text search
- `sort` — `date_desc` (default), `date_asc`, `title_asc`
- `page` — 1-indexed
- `size` — default 10, maximum 100
- `participant`, `date_from`, `date_to`, and `tag_id` — additional filters

**POST /api/meetings — Request body:**
```json
{
  "title": "Q3 Planning",
  "date": "2026-09-07T10:00:00Z",
  "duration_sec": 3600
}
```

**GET /api/meetings — Response `200`:**
```json
{
  "items": [ { "id": "...", "title": "...", "date": "...", "status": "done" } ],
  "total": 42,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

---

## Transcripts 🟢 IMPLEMENTED

| Method | Path                                      | Description                  |
|--------|-------------------------------------------|------------------------------|
| GET    | /api/meetings/{id}/transcript             | Full transcript (all segments)|
| POST   | /api/meetings/{id}/transcript             | Create a transcript segment |

**Segment shape:**
```json
{
  "id": "...",
  "speaker": "Speaker 1",
  "text": "Hello everyone.",
  "start_ms": 1200,
  "end_ms": 3400
}
```

---

## Summaries 🟢 IMPLEMENTED

| Method | Path                        | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | /api/meetings/{id}/summary  | Get AI/mock summary for meeting |
| POST   | /api/meetings/{id}/summary  | Generate/regenerate summary      |

**Response:**
```json
{
  "overview": "The team discussed Q3 targets...",
  "key_topics": ["budget", "hiring", "roadmap"]
}
```

---

## Action Items 🟢 IMPLEMENTED

| Method | Path                                       | Description           |
|--------|--------------------------------------------|-----------------------|
| GET    | /api/meetings/{id}/action-items            | List action items      |
| POST   | /api/meetings/{id}/action-items            | Create action item     |
| PUT    | /api/meetings/{id}/action-items/{aid}      | Update action item     |
| DELETE | /api/meetings/{id}/action-items/{aid}      | Delete action item     |

---

## Chapters 🟢 IMPLEMENTED

| Method | Path                            | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/meetings/{id}/chapters     | List chapters        |
| POST   | /api/meetings/{id}/chapters     | Create chapter       |
| PUT    | /api/meetings/{id}/chapters/{cid} | Update chapter     |

---

## Tags 🟢 IMPLEMENTED

| Method | Path                              | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | /api/tags                         | List all tags                |
| POST   | /api/tags                         | Create tag                   |
| POST   | /api/meetings/{id}/tags           | Attach tag to meeting        |
| DELETE | /api/meetings/{id}/tags/{tag_id}  | Detach tag from meeting      |

---

## Search 🟢 IMPLEMENTED

| Method | Path         | Description                                |
|--------|--------------|--------------------------------------------|
| GET    | /api/search?q=...  | Global search across meetings + transcripts |

**Query params:** `q` (required), `page`, `size`

---

## Highlights and Comments 🟢 IMPLEMENTED

| Resource | Paths |
|---|---|
| Highlights | `GET`, `POST /api/meetings/{id}/highlights`; `DELETE /api/meetings/{id}/highlights/{hid}` |
| Comments | `GET`, `POST /api/meetings/{id}/comments`; `DELETE /api/meetings/{id}/comments/{comment_id}` |

---

## Error Response Shape

All error responses use a consistent envelope:
```json
{ "detail": "Human-readable error message" }
```

| Status | Meaning               |
|--------|-----------------------|
| 400    | Validation error      |
| 401    | Missing, invalid, or expired token |
| 409    | Duplicate registration |
| 404    | Resource not found    |
| 422    | Pydantic parse error  |
| 500    | Internal server error |
