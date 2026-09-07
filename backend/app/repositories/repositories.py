
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
    def get_by_meeting(self, meeting_id: str) -> Optional[Summary]:
        return self.session.execute(
            select(Summary).where(Summary.meeting_id == meeting_id)
        ).scalars().first()

    def create(self, **kwargs) -> Summary:
        s = Summary(**kwargs)
        self.session.add(s)
        self.session.flush()
        return s

class ActionItemRepository(BaseRepository):
    def get_by_id(self, ai_id: str) -> Optional[ActionItem]:
        return self.session.execute(select(ActionItem).where(ActionItem.id == ai_id)).scalars().first()
    def get_by_meeting(self, meeting_id: str) -> List[ActionItem]:
        stmt = select(ActionItem).where(ActionItem.meeting_id == meeting_id).order_by(asc(ActionItem.created_at if hasattr(ActionItem, 'created_at') else ActionItem.id))
        return list(self.session.execute(stmt).scalars().all())
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

