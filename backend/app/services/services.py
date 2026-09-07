
import json
import math
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.repositories import (
    MeetingRepository, TagRepository, ParticipantRepository, 
    TranscriptRepository, SummaryRepository, ActionItemRepository, ChapterRepository
)
from app.schemas.schemas import (
    MeetingCreate, MeetingUpdate, TagCreate, TranscriptSegmentCreate, 
    SummaryCreate, ActionItemCreate, ActionItemUpdate, ChapterCreate, ChapterUpdate
)
from fastapi import HTTPException

class MeetingService:
    def __init__(self, session: Session):
        self.repo = MeetingRepository(session)
        self.tag_repo = TagRepository(session)
        self.session = session

    def get_meeting(self, meeting_id: str):
        meeting = self.repo.get_by_id(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return meeting

    def list_meetings(
        self,
        page: int,
        size: int,
        search_title: str = None,
        search_participant: str = None,
        date_from: datetime = None,
        date_to: datetime = None,
        sort: str = "date_desc"
    ):
        items, total = self.repo.list_meetings(
            page=page, size=size, search_title=search_title,
            search_participant=search_participant, date_from=date_from,
            date_to=date_to, sort=sort
        )
        pages = math.ceil(total / size) if size > 0 else 0
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }

    def create_meeting(self, data: MeetingCreate):
        meeting = self.repo.create(**data.model_dump())
        self.session.commit()
        return self.get_meeting(meeting.id)

    def update_meeting(self, meeting_id: str, data: MeetingUpdate):
        meeting = self.get_meeting(meeting_id)
        self.repo.update(meeting, **data.model_dump(exclude_unset=True))
        self.session.commit()
        return self.get_meeting(meeting.id)

    def delete_meeting(self, meeting_id: str):
        meeting = self.get_meeting(meeting_id)
        self.repo.delete(meeting)
        self.session.commit()

    def add_tag(self, meeting_id: str, tag_id: str):
        meeting = self.get_meeting(meeting_id)
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        if tag not in meeting.tags:
            meeting.tags.append(tag)
            self.session.commit()
        return meeting

    def remove_tag(self, meeting_id: str, tag_id: str):
        meeting = self.get_meeting(meeting_id)
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        if tag in meeting.tags:
            meeting.tags.remove(tag)
            self.session.commit()
        return meeting

class TranscriptService:
    def __init__(self, session: Session):
        self.repo = TranscriptRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session
    
    def get_by_meeting(self, meeting_id: str):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        return self.repo.get_by_meeting(meeting_id)
        
    def add_segment(self, meeting_id: str, data: TranscriptSegmentCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        ts = self.repo.create_segment(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return ts

class SummaryService:
    def __init__(self, session: Session):
        self.repo = SummaryRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session

    def get(self, meeting_id: str):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        return self.repo.get_by_meeting(meeting_id)
        
    def create(self, meeting_id: str, data: SummaryCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        dump = data.model_dump()
        dump["key_topics"] = json.dumps(dump["key_topics"])
        s = self.repo.create(meeting_id=meeting_id, **dump)
        self.session.commit()
        return s

class ActionItemService:
    def __init__(self, session: Session):
        self.repo = ActionItemRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session

    def get_by_meeting(self, meeting_id: str):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        return self.repo.get_by_meeting(meeting_id)
        
    def create(self, meeting_id: str, data: ActionItemCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        ai = self.repo.create(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return ai
        
    def update(self, ai_id: str, data: ActionItemUpdate):
        ai = self.repo.get_by_id(ai_id)
        if not ai:
            raise HTTPException(status_code=404, detail="Action Item not found")
        self.repo.update(ai, **data.model_dump(exclude_unset=True))
        self.session.commit()
        return ai
        
    def delete(self, ai_id: str):
        ai = self.repo.get_by_id(ai_id)
        if not ai:
            raise HTTPException(status_code=404, detail="Action Item not found")
        self.repo.delete(ai)
        self.session.commit()

class ChapterService:
    def __init__(self, session: Session):
        self.repo = ChapterRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session
        
    def get_by_meeting(self, meeting_id: str):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        return self.repo.get_by_meeting(meeting_id)

    def create(self, meeting_id: str, data: ChapterCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise HTTPException(status_code=404, detail="Meeting not found")
        c = self.repo.create(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return c
        
    def update(self, cid: str, data: ChapterUpdate):
        c = self.repo.get_by_id(cid)
        if not c:
            raise HTTPException(status_code=404, detail="Chapter not found")
        self.repo.update(c, **data.model_dump(exclude_unset=True))
        self.session.commit()
        return c

class TagService:
    def __init__(self, session: Session):
        self.repo = TagRepository(session)
        self.session = session

    def list_tags(self):
        return self.repo.get_all()

    def create(self, data: TagCreate):
        t = self.repo.create(**data.model_dump())
        self.session.commit()
        return t
