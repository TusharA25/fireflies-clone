# Database Design

> 
> Only the SQLAlchemy `Base`, `engine`, and `SessionLocal` exist today.
> No tables are created until models are added in Milestone 2.

---

## Entity Overview

```
User ──────────────── Meeting ─────────────── TranscriptSegment
                         │
                         ├─── Participant
                         ├─── Summary
                         ├─── ActionItem
                         ├─── Chapter
                         ├─── MeetingTag ──── Tag
                         └─── Comment / Highlight
```

---

## Entities

### User 
| Column       | Type        | Notes                          |
|--------------|-------------|--------------------------------|
| id           | UUID (PK)   | auto-generated                 |
| email        | String      | unique, indexed                |
| display_name | String      |                                |
| avatar_url   | String      | nullable                       |
| created_at   | DateTime    | server default = now           |
| updated_at   | DateTime    | updated on save                |

---

### Meeting 
| Column        | Type        | Notes                          |
|---------------|-------------|--------------------------------|
| id            | UUID (PK)   |                                |
| title         | String      | indexed                        |
| date          | DateTime    | when the meeting occurred      |
| duration_sec  | Integer     | nullable                       |
| audio_url     | String      | nullable — media placeholder   |
| status        | Enum        | `pending`, `processing`, `done`|
| owner_id      | UUID (FK)   | → User.id                      |
| created_at    | DateTime    |                                |
| updated_at    | DateTime    |                                |

---

### Participant 
| Column     | Type      | Notes                  |
|------------|-----------|------------------------|
| id         | UUID (PK) |                        |
| meeting_id | UUID (FK) | → Meeting.id           |
| name       | String    |                        |
| email      | String    | nullable               |
| speaker_id | String    | label, e.g. "Speaker 1"|

---

### TranscriptSegment 
| Column         | Type      | Notes                          |
|----------------|-----------|--------------------------------|
| id             | UUID (PK) |                                |
| meeting_id     | UUID (FK) | → Meeting.id                   |
| participant_id | UUID (FK) | → Participant.id, nullable     |
| text           | Text      |                                |
| start_ms       | Integer   | offset from meeting start (ms) |
| end_ms         | Integer   |                                |
| sequence       | Integer   | ordering within meeting        |

---

### Summary 
| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| id           | UUID (PK) |                                |
| meeting_id   | UUID (FK) | → Meeting.id, unique           |
| overview     | Text      | AI/mock paragraph summary      |
| key_topics   | JSON      | list of strings                |
| created_at   | DateTime  |                                |

---

### ActionItem 
| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| id           | UUID (PK) |                                |
| meeting_id   | UUID (FK) | → Meeting.id                   |
| assignee     | String    | nullable                       |
| task         | Text      |                                |
| due_date     | Date      | nullable                       |
| completed    | Boolean   | default false                  |
| created_at   | DateTime  |                                |

---

### Chapter 
| Column     | Type      | Notes                          |
|------------|-----------|--------------------------------|
| id         | UUID (PK) |                                |
| meeting_id | UUID (FK) | → Meeting.id                   |
| title      | String    |                                |
| start_ms   | Integer   |                                |
| end_ms     | Integer   | nullable                       |
| sequence   | Integer   |                                |

---

### Tag 
| Column | Type      | Notes           |
|--------|-----------|-----------------|
| id     | UUID (PK) |                 |
| name   | String    | unique, indexed |
| color  | String    | hex color code  |

---

### MeetingTag 
Association table (many-to-many between Meeting and Tag).

| Column     | Type      | Notes            |
|------------|-----------|------------------|
| meeting_id | UUID (FK) | → Meeting.id, PK |
| tag_id     | UUID (FK) | → Tag.id, PK     |

---

### Comment / Highlight 
| Column     | Type      | Notes                                |
|------------|-----------|--------------------------------------|
| id         | UUID (PK) |                                      |
| meeting_id | UUID (FK) | → Meeting.id                         |
| segment_id | UUID (FK) | → TranscriptSegment.id, nullable     |
| author     | String    |                                      |
| text       | Text      |                                      |
| type       | Enum      | `comment` or `highlight`             |
| created_at | DateTime  |                                      |

---

## Implementation Notes (for Milestone 2)

- All models inherit from `app.database.Base`
- Use `sqlalchemy.orm.mapped_column` and `Mapped[]` (SQLAlchemy 2.x style)
- UUIDs generated with `uuid.uuid4` at the Python layer, stored as `String(36)` in SQLite
- Add Alembic for migrations before any production data is stored
