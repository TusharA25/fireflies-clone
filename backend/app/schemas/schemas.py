from pydantic import BaseModel, ConfigDict, field_validator
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
    
    @field_validator('key_topics', mode='before')
    @classmethod
    def parse_key_topics(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v
        
    model_config = ConfigDict(from_attributes=True)

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
