import os

BASE_DIR = "/Users/yuvrajsingh/Documents/devloper/firefiles/backend/app"

routes_code = """
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas.schemas import (
    MeetingOut, MeetingDetailOut, MeetingCreate, MeetingUpdate, MeetingListResponse,
    TranscriptSegmentOut, TranscriptSegmentCreate, SummaryOut, SummaryCreate,
    ActionItemOut, ActionItemCreate, ActionItemUpdate, ChapterOut, ChapterCreate, ChapterUpdate,
    TagOut, TagCreate
)
from app.services.services import (
    MeetingService, TranscriptService, SummaryService, ActionItemService, ChapterService, TagService
)

api_router = APIRouter()

# --- MEETINGS ---
@api_router.get("/meetings", response_model=MeetingListResponse)
def list_meetings(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None, description="Title search"),
    participant: Optional[str] = Query(None, description="Participant search"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    sort: str = Query("date_desc", regex="^(date_desc|date_asc|title_asc)$"),
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    return service.list_meetings(page, size, q, participant, date_from, date_to, sort)

@api_router.post("/meetings", response_model=MeetingDetailOut, status_code=status.HTTP_201_CREATED)
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    service = MeetingService(db)
    return service.create_meeting(data)

@api_router.get("/meetings/{id}", response_model=MeetingDetailOut)
def get_meeting(id: str, db: Session = Depends(get_db)):
    service = MeetingService(db)
    return service.get_meeting(id)

@api_router.put("/meetings/{id}", response_model=MeetingDetailOut)
def update_meeting(id: str, data: MeetingUpdate, db: Session = Depends(get_db)):
    service = MeetingService(db)
    return service.update_meeting(id, data)

@api_router.delete("/meetings/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(id: str, db: Session = Depends(get_db)):
    service = MeetingService(db)
    service.delete_meeting(id)

# --- TAGS ---
@api_router.get("/tags", response_model=List[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return TagService(db).list_tags()

@api_router.post("/tags", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    return TagService(db).create(data)

@api_router.post("/meetings/{id}/tags", response_model=MeetingDetailOut)
def add_tag_to_meeting(id: str, tag_id: str, db: Session = Depends(get_db)):
    return MeetingService(db).add_tag(id, tag_id)

@api_router.delete("/meetings/{id}/tags/{tag_id}", response_model=MeetingDetailOut)
def remove_tag_from_meeting(id: str, tag_id: str, db: Session = Depends(get_db)):
    return MeetingService(db).remove_tag(id, tag_id)

# --- TRANSCRIPTS ---
@api_router.get("/meetings/{id}/transcript", response_model=List[TranscriptSegmentOut])
def get_transcript(id: str, db: Session = Depends(get_db)):
    return TranscriptService(db).get_by_meeting(id)

@api_router.post("/meetings/{id}/transcript", response_model=TranscriptSegmentOut, status_code=status.HTTP_201_CREATED)
def create_transcript_segment(id: str, data: TranscriptSegmentCreate, db: Session = Depends(get_db)):
    return TranscriptService(db).add_segment(id, data)

# --- SUMMARY ---
@api_router.post("/meetings/{id}/summary", response_model=SummaryOut, status_code=status.HTTP_201_CREATED)
def create_summary(id: str, data: SummaryCreate, db: Session = Depends(get_db)):
    return SummaryService(db).create(id, data)

# --- ACTION ITEMS ---
@api_router.post("/meetings/{id}/action-items", response_model=ActionItemOut, status_code=status.HTTP_201_CREATED)
def create_action_item(id: str, data: ActionItemCreate, db: Session = Depends(get_db)):
    return ActionItemService(db).create(id, data)

@api_router.put("/meetings/{id}/action-items/{aid}", response_model=ActionItemOut)
def update_action_item(id: str, aid: str, data: ActionItemUpdate, db: Session = Depends(get_db)):
    # Note: Using AI id directly
    return ActionItemService(db).update(aid, data)

@api_router.delete("/meetings/{id}/action-items/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(id: str, aid: str, db: Session = Depends(get_db)):
    ActionItemService(db).delete(aid)

# --- CHAPTERS ---
@api_router.get("/meetings/{id}/chapters", response_model=List[ChapterOut])
def get_chapters(id: str, db: Session = Depends(get_db)):
    return ChapterService(db).get_by_meeting(id)

@api_router.post("/meetings/{id}/chapters", response_model=ChapterOut, status_code=status.HTTP_201_CREATED)
def create_chapter(id: str, data: ChapterCreate, db: Session = Depends(get_db)):
    return ChapterService(db).create(id, data)

@api_router.put("/meetings/{id}/chapters/{cid}", response_model=ChapterOut)
def update_chapter(id: str, cid: str, data: ChapterUpdate, db: Session = Depends(get_db)):
    return ChapterService(db).update(cid, data)

"""

with open(f"{BASE_DIR}/routes/api.py", "w") as f:
    f.write(routes_code)
with open(f"{BASE_DIR}/routes/__init__.py", "a") as f:
    f.write("from .api import api_router\n")

print("Generated routes.")
