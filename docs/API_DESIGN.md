# API Design — Firefiles

All endpoints are prefixed with `/api`.
Interactive documentation is available at `http://localhost:8000/docs` (Swagger UI).

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
- `limit` — default 20

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
  "limit": 20
}
```

---

## Participants 🟢 IMPLEMENTED

| Method | Path                                    | Description             |
|--------|-----------------------------------------|-------------------------|
| GET    | /api/meetings/{id}/participants         | List participants        |
| POST   | /api/meetings/{id}/participants         | Add participant          |
| DELETE | /api/meetings/{id}/participants/{pid}   | Remove participant       |

---

## Transcripts 🟢 IMPLEMENTED

| Method | Path                                      | Description                  |
|--------|-------------------------------------------|------------------------------|
| GET    | /api/meetings/{id}/transcript             | Full transcript (all segments)|
| GET    | /api/meetings/{id}/transcript?q=keyword   | Searched/filtered transcript |

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
| GET    | /api/search  | Global search across meetings + transcripts |

**Query params:** `q` (required), `type` (`meetings`, `transcripts`, `all`)

---

## Error Response Shape

All error responses use a consistent envelope:
```json
{ "detail": "Human-readable error message" }
```

| Status | Meaning               |
|--------|-----------------------|
| 400    | Validation error      |
| 404    | Resource not found    |
| 422    | Pydantic parse error  |
| 500    | Internal server error |
