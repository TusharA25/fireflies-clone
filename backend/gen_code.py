import os
import textwrap

BASE_DIR = "/Users/yuvrajsingh/Documents/devloper/firefiles/backend/app"
TESTS_DIR = "/Users/yuvrajsingh/Documents/devloper/firefiles/backend/tests"

# --- MODELS ---
models_code = """
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, Table, Column, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from app.database import Base

meeting_tag = Table(
    "meeting_tag",
    Base.metadata,
    Column("meeting_id", String(36), ForeignKey("meetings.id"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id"), primary_key=True),
)

class MeetingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    done = "done"

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    meetings: Mapped[List["Meeting"]] = relationship("Meeting", back_populates="owner")

class Meeting(Base):
    __tablename__ = "meetings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, index=True)
    date: Mapped[datetime] = mapped_column(DateTime)
    duration_sec: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[MeetingStatus] = mapped_column(Enum(MeetingStatus), default=MeetingStatus.done)
    owner_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner: Mapped[Optional["User"]] = relationship("User", back_populates="meetings")
    participants: Mapped[List["Participant"]] = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    transcript: Mapped[List["TranscriptSegment"]] = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summary: Mapped[Optional["Summary"]] = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items: Mapped[List["ActionItem"]] = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    chapters: Mapped[List["Chapter"]] = relationship("Chapter", back_populates="meeting", cascade="all, delete-orphan")
    tags: Mapped[List["Tag"]] = relationship("Tag", secondary=meeting_tag, back_populates="meetings")

class Participant(Base):
    __tablename__ = "participants"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id"))
    name: Mapped[str] = mapped_column(String)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    speaker_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="participants")
    segments: Mapped[List["TranscriptSegment"]] = relationship("TranscriptSegment", back_populates="participant")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id"))
    participant_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("participants.id"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    start_ms: Mapped[int] = mapped_column(Integer)
    end_ms: Mapped[int] = mapped_column(Integer)
    sequence: Mapped[int] = mapped_column(Integer)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="transcript")
    participant: Mapped[Optional["Participant"]] = relationship("Participant", back_populates="segments")

class Summary(Base):
    __tablename__ = "summaries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id"), unique=True)
    overview: Mapped[str] = mapped_column(Text)
    key_topics: Mapped[str] = mapped_column(Text) # storing JSON as string for SQLite simplicity
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="summary")

class ActionItem(Base):
    __tablename__ = "action_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id"))
    assignee: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    task: Mapped[str] = mapped_column(Text)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="action_items")

class Chapter(Base):
    __tablename__ = "chapters"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id"))
    title: Mapped[str] = mapped_column(String)
    start_ms: Mapped[int] = mapped_column(Integer)
    end_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="chapters")

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    color: Mapped[str] = mapped_column(String)

    meetings: Mapped[List["Meeting"]] = relationship("Meeting", secondary=meeting_tag, back_populates="tags")
"""

with open(f"{BASE_DIR}/models/models.py", "w") as f:
    f.write(models_code)

with open(f"{BASE_DIR}/models/__init__.py", "w") as f:
    f.write("from .models import *\n")


# --- SCHEMAS ---
schemas_code = """
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from app.models.models import MeetingStatus
import json

class TagBase(BaseModel):
    name: str
    color: str
class TagCreate(TagBase): pass
class TagOut(TagBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    speaker_id: Optional[str] = None
class ParticipantCreate(ParticipantBase): pass
class ParticipantOut(ParticipantBase):
    id: str
    meeting_id: str
    model_config = ConfigDict(from_attributes=True)

class TranscriptSegmentBase(BaseModel):
    text: str
    start_ms: int
    end_ms: int
    sequence: int
    participant_id: Optional[str] = None
class TranscriptSegmentCreate(TranscriptSegmentBase): pass
class TranscriptSegmentOut(TranscriptSegmentBase):
    id: str
    meeting_id: str
    model_config = ConfigDict(from_attributes=True)

class SummaryBase(BaseModel):
    overview: str
    key_topics: List[str]
class SummaryCreate(SummaryBase): pass
class SummaryOut(SummaryBase):
    id: str
    meeting_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def model_validate(cls, obj: Any) -> 'SummaryOut':
        if isinstance(obj, dict):
            return super().model_validate(obj)
        obj_dict = {
            "id": obj.id,
            "meeting_id": obj.meeting_id,
            "overview": obj.overview,
            "key_topics": json.loads(obj.key_topics) if obj.key_topics else [],
            "created_at": obj.created_at
        }
        return super().model_validate(obj_dict)

class ActionItemBase(BaseModel):
    task: str
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False
class ActionItemCreate(ActionItemBase): pass
class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
class ActionItemOut(ActionItemBase):
    id: str
    meeting_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ChapterBase(BaseModel):
    title: str
    start_ms: int
    end_ms: Optional[int] = None
    sequence: int
class ChapterCreate(ChapterBase): pass
class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    start_ms: Optional[int] = None
    end_ms: Optional[int] = None
    sequence: Optional[int] = None
class ChapterOut(ChapterBase):
    id: str
    meeting_id: str
    model_config = ConfigDict(from_attributes=True)

class MeetingBase(BaseModel):
    title: str
    date: datetime
    duration_sec: Optional[int] = None
    audio_url: Optional[str] = None
    status: MeetingStatus = MeetingStatus.done
    owner_id: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration_sec: Optional[int] = None
    audio_url: Optional[str] = None
    status: Optional[MeetingStatus] = None

class MeetingOut(MeetingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantOut] = []
    tags: List[TagOut] = []
    model_config = ConfigDict(from_attributes=True)

class MeetingDetailOut(MeetingOut):
    transcript: List[TranscriptSegmentOut] = []
    summary: Optional[SummaryOut] = None
    action_items: List[ActionItemOut] = []
    chapters: List[ChapterOut] = []

class MeetingListResponse(BaseModel):
    items: List[MeetingOut]
    total: int
    page: int
    size: int
    pages: int
"""
with open(f"{BASE_DIR}/schemas/schemas.py", "w") as f:
    f.write(schemas_code)

with open(f"{BASE_DIR}/schemas/__init__.py", "a") as f:
    f.write("from .schemas import *\n")

print("Generated models and schemas.")
