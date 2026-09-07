
import json
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import select, or_, and_, desc, asc, func
from typing import List, Optional, Tuple, TypeVar, Type
from datetime import datetime
from app.models.models import (
    Meeting, User, Participant, TranscriptSegment, Summary, ActionItem, Chapter, Tag, meeting_tag,
    TranscriptHighlight, TranscriptComment
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
        sort: str = "date_desc",
        tag_id: Optional[str] = None,
        owner_id: Optional[str] = None,
    ) -> Tuple[List[Meeting], int]:
        stmt = select(Meeting).options(
            selectinload(Meeting.participants),
            selectinload(Meeting.tags)
        )

        conditions = []
        needs_participant_join = bool(search_participant)
        if owner_id:
            conditions.append(Meeting.owner_id == owner_id)

        if search_title:
            conditions.append(Meeting.title.ilike(f"%{search_title}%"))
        
        if needs_participant_join:
            stmt = stmt.outerjoin(Meeting.participants)
            conditions.append(Participant.name.ilike(f"%{search_participant}%"))
            
        if date_from:
            conditions.append(Meeting.date >= date_from)
        if date_to:
            conditions.append(Meeting.date <= date_to)

        # Tag filtering via subquery to avoid duplicates from join
        if tag_id:
            tag_meeting_ids = (
                select(meeting_tag.c.meeting_id)
                .where(meeting_tag.c.tag_id == tag_id)
                .scalar_subquery()
            )
            conditions.append(Meeting.id.in_(tag_meeting_ids))

        if conditions:
            stmt = stmt.where(and_(*conditions))
            
        # Count with distinct
        count_stmt = select(func.count(func.distinct(Meeting.id))).select_from(Meeting)
        if needs_participant_join:
            count_stmt = count_stmt.outerjoin(Meeting.participants)
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
            
        total = self.session.execute(count_stmt).scalar() or 0

        if needs_participant_join:
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

    def search_transcripts(
        self,
        query: str,
        page: int = 1,
        size: int = 20,
        owner_id: Optional[str] = None,
    ) -> Tuple[List[dict], int]:
        """
        Database-side transcript text search. Returns flat dicts with meeting context.
        No Python-side filtering — all done in SQLAlchemy/SQLite.
        """
        pattern = f"%{query}%"

        # Join transcript_segments -> meetings -> (optional) participants
        stmt = (
            select(
                TranscriptSegment.id.label("segment_id"),
                TranscriptSegment.text.label("snippet"),
                TranscriptSegment.start_ms,
                Meeting.id.label("meeting_id"),
                Meeting.title.label("meeting_title"),
                Meeting.date.label("meeting_date"),
                Participant.name.label("participant_name"),
            )
            .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
            .outerjoin(Participant, TranscriptSegment.participant_id == Participant.id)
            .where(TranscriptSegment.text.ilike(pattern))
            .order_by(desc(Meeting.date), asc(TranscriptSegment.start_ms))
        )

        count_stmt = (
            select(func.count())
            .select_from(TranscriptSegment)
            .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
            .where(TranscriptSegment.text.ilike(pattern))
        )

        if owner_id:
            owner_filter = Meeting.owner_id == owner_id
            stmt = stmt.where(owner_filter)
            count_stmt = count_stmt.where(owner_filter)

        total = self.session.execute(count_stmt).scalar() or 0
        rows = self.session.execute(stmt.offset((page - 1) * size).limit(size)).mappings().all()

        results = []
        for row in rows:
            results.append({
                "meeting_id": row["meeting_id"],
                "meeting_title": row["meeting_title"],
                "meeting_date": row["meeting_date"],
                "segment_id": row["segment_id"],
                "start_ms": row["start_ms"],
                "snippet": row["snippet"],
                "participant_name": row["participant_name"],
            })
        return results, total

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

class UserRepository(BaseRepository):
    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.session.execute(select(User).where(User.id == user_id)).scalars().first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.execute(select(User).where(User.email == email)).scalars().first()

    def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.session.add(user)
        self.session.flush()
        return user


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
    def get_by_id(self, segment_id: str) -> Optional[TranscriptSegment]:
        return self.session.execute(select(TranscriptSegment).where(TranscriptSegment.id == segment_id)).scalars().first()

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
        stmt = select(ActionItem).where(ActionItem.meeting_id == meeting_id).order_by(asc(ActionItem.created_at))
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


class HighlightRepository(BaseRepository):
    def get_by_meeting(self, meeting_id: str) -> List[TranscriptHighlight]:
        stmt = select(TranscriptHighlight).where(
            TranscriptHighlight.meeting_id == meeting_id
        ).order_by(asc(TranscriptHighlight.created_at))
        return list(self.session.execute(stmt).scalars().all())

    def get_by_id(self, highlight_id: str) -> Optional[TranscriptHighlight]:
        return self.session.execute(
            select(TranscriptHighlight).where(TranscriptHighlight.id == highlight_id)
        ).scalars().first()

    def get_by_segment(self, meeting_id: str, segment_id: str) -> Optional[TranscriptHighlight]:
        return self.session.execute(
            select(TranscriptHighlight).where(
                and_(
                    TranscriptHighlight.meeting_id == meeting_id,
                    TranscriptHighlight.segment_id == segment_id
                )
            )
        ).scalars().first()

    def create(self, **kwargs) -> TranscriptHighlight:
        h = TranscriptHighlight(**kwargs)
        self.session.add(h)
        self.session.flush()
        return h

    def delete(self, highlight: TranscriptHighlight) -> None:
        self.session.delete(highlight)
        self.session.flush()


class CommentRepository(BaseRepository):
    def get_by_meeting(self, meeting_id: str) -> List[TranscriptComment]:
        stmt = select(TranscriptComment).where(
            TranscriptComment.meeting_id == meeting_id
        ).order_by(asc(TranscriptComment.created_at))
        return list(self.session.execute(stmt).scalars().all())

    def get_by_id(self, comment_id: str) -> Optional[TranscriptComment]:
        return self.session.execute(
            select(TranscriptComment).where(TranscriptComment.id == comment_id)
        ).scalars().first()

    def create(self, **kwargs) -> TranscriptComment:
        c = TranscriptComment(**kwargs)
        self.session.add(c)
        self.session.flush()
        return c

    def delete(self, comment: TranscriptComment) -> None:
        self.session.delete(comment)
        self.session.flush()
