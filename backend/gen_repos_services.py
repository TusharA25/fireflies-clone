import os

BASE_DIR = "/Users/yuvrajsingh/Documents/devloper/firefiles/backend/app"

# --- REPOSITORIES ---
repos_code = """
import json
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import select, or_, and_, desc, asc
from typing import List, Optional, Tuple, TypeVar, Type
from datetime import datetime
from app.models.models import (
    Meeting, User, Participant, TranscriptSegment, Summary, ActionItem, Chapter, Tag, meeting_tag
)

T = TypeVar('T')

class BaseRepository:
    def __init__(self, session: Session):
        self.session = session

class MeetingRepository(BaseRepository):
    def get_by_id(self, meeting_id: str) -> Optional[Meeting]:
        stmt = select(Meeting).options(
            selectinload(Meeting.participants),
            selectinload(Meeting.tags),
            selectinload(Meeting.transcript),
            selectinload(Meeting.summary),
            selectinload(Meeting.action_items),
            selectinload(Meeting.chapters)
        ).where(Meeting.id == meeting_id)
        return self.session.execute(stmt).scalars().first()
        
    def list_meetings(
        self,
        page: int = 1,
        size: int = 10,
        search_title: Optional[str] = None,
        search_participant: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sort: str = "date_desc"
    ) -> Tuple[List[Meeting], int]:
        stmt = select(Meeting).options(
            selectinload(Meeting.participants),
            selectinload(Meeting.tags)
        )
        count_stmt = select(Meeting)

        conditions = []
        if search_title:
            conditions.append(Meeting.title.ilike(f"%{search_title}%"))
        
        if search_participant:
            # Need to join participants to filter by them
            stmt = stmt.outerjoin(Meeting.participants)
            count_stmt = count_stmt.outerjoin(Meeting.participants)
            conditions.append(Participant.name.ilike(f"%{search_participant}%"))
            
        if date_from:
            conditions.append(Meeting.date >= date_from)
        if date_to:
            conditions.append(Meeting.date <= date_to)

        if conditions:
            stmt = stmt.where(and_(*conditions))
            count_stmt = count_stmt.where(and_(*conditions))
            
        # Handle count - wait, count might need distinct if joining
        from sqlalchemy import func
        count_stmt = select(func.count(func.distinct(Meeting.id))).select_from(Meeting)
        if search_participant:
            count_stmt = count_stmt.outerjoin(Meeting.participants)
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
            
        total = self.session.execute(count_stmt).scalar() or 0

        # Group by / Distinct not strictly needed for the query unless participant joined, but safe
        if search_participant:
            stmt = stmt.distinct(Meeting.id)

        # Sorting
        if sort == "date_desc":
            stmt = stmt.order_by(desc(Meeting.date))
        elif sort == "date_asc":
            stmt = stmt.order_by(asc(Meeting.date))
        elif sort == "title_asc":
            stmt = stmt.order_by(asc(Meeting.title))

        # Pagination
        stmt = stmt.offset((page - 1) * size).limit(size)
        
        items = self.session.execute(stmt).scalars().all()
        return list(items), total

    def create(self, **kwargs) -> Meeting:
        meeting = Meeting(**kwargs)
        self.session.add(meeting)
        self.session.flush()
        return meeting

    def update(self, meeting: Meeting, **kwargs) -> Meeting:
        for k, v in kwargs.items():
            if v is not None:
                setattr(meeting, k, v)
        self.session.flush()
        return meeting

    def delete(self, meeting: Meeting):
        self.session.delete(meeting)
        self.session.flush()

class TagRepository(BaseRepository):
    def get_all(self) -> List[Tag]:
        return list(self.session.execute(select(Tag)).scalars().all())
    def create(self, **kwargs) -> Tag:
        t = Tag(**kwargs)
        self.session.add(t)
        self.session.flush()
        return t
    def get_by_id(self, tag_id: str) -> Optional[Tag]:
        return self.session.execute(select(Tag).where(Tag.id == tag_id)).scalars().first()

class ParticipantRepository(BaseRepository):
    def create(self, **kwargs) -> Participant:
        p = Participant(**kwargs)
        self.session.add(p)
        self.session.flush()
        return p

class TranscriptRepository(BaseRepository):
    def create_segment(self, **kwargs) -> TranscriptSegment:
        ts = TranscriptSegment(**kwargs)
        self.session.add(ts)
        self.session.flush()
        return ts
    def get_by_meeting(self, meeting_id: str) -> List[TranscriptSegment]:
        stmt = select(TranscriptSegment).where(TranscriptSegment.meeting_id == meeting_id).order_by(asc(TranscriptSegment.sequence))
        return list(self.session.execute(stmt).scalars().all())

class SummaryRepository(BaseRepository):
    def create(self, **kwargs) -> Summary:
        s = Summary(**kwargs)
        self.session.add(s)
        self.session.flush()
        return s

class ActionItemRepository(BaseRepository):
    def get_by_id(self, ai_id: str) -> Optional[ActionItem]:
        return self.session.execute(select(ActionItem).where(ActionItem.id == ai_id)).scalars().first()
    def create(self, **kwargs) -> ActionItem:
        ai = ActionItem(**kwargs)
        self.session.add(ai)
        self.session.flush()
        return ai
    def update(self, ai: ActionItem, **kwargs) -> ActionItem:
        for k, v in kwargs.items():
            if v is not None:
                setattr(ai, k, v)
        self.session.flush()
        return ai
    def delete(self, ai: ActionItem):
        self.session.delete(ai)
        self.session.flush()

class ChapterRepository(BaseRepository):
    def get_by_id(self, cid: str) -> Optional[Chapter]:
        return self.session.execute(select(Chapter).where(Chapter.id == cid)).scalars().first()
    def get_by_meeting(self, meeting_id: str) -> List[Chapter]:
        stmt = select(Chapter).where(Chapter.meeting_id == meeting_id).order_by(asc(Chapter.sequence))
        return list(self.session.execute(stmt).scalars().all())
    def create(self, **kwargs) -> Chapter:
        c = Chapter(**kwargs)
        self.session.add(c)
        self.session.flush()
        return c
    def update(self, c: Chapter, **kwargs) -> Chapter:
        for k, v in kwargs.items():
            if v is not None:
                setattr(c, k, v)
        self.session.flush()
        return c

"""

# --- SERVICES ---
services_code = """
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
from app.exceptions.handlers import NotFoundException

class MeetingService:
    def __init__(self, session: Session):
        self.repo = MeetingRepository(session)
        self.tag_repo = TagRepository(session)
        self.session = session

    def get_meeting(self, meeting_id: str):
        meeting = self.repo.get_by_id(meeting_id)
        if not meeting:
            raise NotFoundException("Meeting not found")
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
            raise NotFoundException("Tag not found")
        if tag not in meeting.tags:
            meeting.tags.append(tag)
            self.session.commit()
        return meeting

    def remove_tag(self, meeting_id: str, tag_id: str):
        meeting = self.get_meeting(meeting_id)
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise NotFoundException("Tag not found")
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
            raise NotFoundException("Meeting not found")
        return self.repo.get_by_meeting(meeting_id)
        
    def add_segment(self, meeting_id: str, data: TranscriptSegmentCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise NotFoundException("Meeting not found")
        ts = self.repo.create_segment(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return ts

class SummaryService:
    def __init__(self, session: Session):
        self.repo = SummaryRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session
        
    def create(self, meeting_id: str, data: SummaryCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise NotFoundException("Meeting not found")
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
        
    def create(self, meeting_id: str, data: ActionItemCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise NotFoundException("Meeting not found")
        ai = self.repo.create(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return ai
        
    def update(self, ai_id: str, data: ActionItemUpdate):
        ai = self.repo.get_by_id(ai_id)
        if not ai:
            raise NotFoundException("Action Item not found")
        self.repo.update(ai, **data.model_dump(exclude_unset=True))
        self.session.commit()
        return ai
        
    def delete(self, ai_id: str):
        ai = self.repo.get_by_id(ai_id)
        if not ai:
            raise NotFoundException("Action Item not found")
        self.repo.delete(ai)
        self.session.commit()

class ChapterService:
    def __init__(self, session: Session):
        self.repo = ChapterRepository(session)
        self.meeting_repo = MeetingRepository(session)
        self.session = session
        
    def get_by_meeting(self, meeting_id: str):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise NotFoundException("Meeting not found")
        return self.repo.get_by_meeting(meeting_id)

    def create(self, meeting_id: str, data: ChapterCreate):
        if not self.meeting_repo.get_by_id(meeting_id):
            raise NotFoundException("Meeting not found")
        c = self.repo.create(meeting_id=meeting_id, **data.model_dump())
        self.session.commit()
        return c
        
    def update(self, cid: str, data: ChapterUpdate):
        c = self.repo.get_by_id(cid)
        if not c:
            raise NotFoundException("Chapter not found")
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
"""
with open(f"{BASE_DIR}/repositories/repositories.py", "w") as f:
    f.write(repos_code)
with open(f"{BASE_DIR}/repositories/__init__.py", "a") as f:
    f.write("from .repositories import *\n")

with open(f"{BASE_DIR}/services/services.py", "w") as f:
    f.write(services_code)
with open(f"{BASE_DIR}/services/__init__.py", "a") as f:
    f.write("from .services import *\n")

print("Generated repositories and services.")
