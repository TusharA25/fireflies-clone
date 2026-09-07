import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal, init_db
from app.models.models import (
    Meeting, Participant, TranscriptSegment, Summary, ActionItem, Chapter, Tag, User, MeetingStatus
)

def seed_db():
    if settings.environment == "production":
        raise RuntimeError("Seed data is disabled in production")
    if not settings.seed_user_email or not settings.seed_user_password:
        raise RuntimeError("Set SEED_USER_EMAIL and SEED_USER_PASSWORD before seeding development data")
    init_db()
    db: Session = SessionLocal()
    
    # Check if we already have meetings
    if db.query(Meeting).count() > 0:
        print("Database already seeded.")
        return

    # User
    from app.security import hash_password
    user = User(
        email=settings.seed_user_email.strip().lower(),
        display_name="Test User",
        password_hash=hash_password(settings.seed_user_password),
    )
    db.add(user)
    db.commit()

    # Tags
    tag_product = Tag(name="Product", color="#FF0000")
    tag_engineering = Tag(name="Engineering", color="#00FF00")
    tag_marketing = Tag(name="Marketing", color="#0000FF")
    db.add_all([tag_product, tag_engineering, tag_marketing])
    db.commit()

    meetings_data = [
        {
            "title": "Weekly Product Sync",
            "date": datetime.datetime.now() - datetime.timedelta(days=1),
            "duration": 3600,
            "tags": [tag_product, tag_engineering],
            "participants": ["Alice", "Bob", "Charlie"],
            "summary": "Discussed the Q3 roadmap and feature priorities.",
            "actions": [("Alice", "Draft PRD for new feature"), ("Bob", "Review technical constraints")],
            "chapters": [("Intro", 0, 300), ("Roadmap", 300, 1800), ("Q&A", 1800, 3600)],
            "transcript": [
                ("Alice", "Let's start the meeting.", 0, 5000),
                ("Bob", "I agree, we have a lot to cover.", 5000, 10000)
            ]
        },
        {
            "title": "Marketing Campaign Kickoff",
            "date": datetime.datetime.now() - datetime.timedelta(days=2),
            "duration": 2400,
            "tags": [tag_marketing],
            "participants": ["Diana", "Eve"],
            "summary": "Kicked off the new social media campaign.",
            "actions": [("Diana", "Create ad creatives"), ("Eve", "Set up tracking pixels")],
            "chapters": [("Overview", 0, 1200), ("Execution", 1200, 2400)],
            "transcript": [
                ("Diana", "We need to focus on engagement.", 0, 6000),
                ("Eve", "I will set up the analytics.", 6000, 12000)
            ]
        },
        {
            "title": "Engineering Standup",
            "date": datetime.datetime.now() - datetime.timedelta(days=3),
            "duration": 900,
            "tags": [tag_engineering],
            "participants": ["Frank", "Grace", "Heidi"],
            "summary": "Daily sync on ongoing sprint tasks.",
            "actions": [("Frank", "Fix the login bug")],
            "chapters": [("Updates", 0, 900)],
            "transcript": [
                ("Frank", "I worked on the login page.", 0, 10000),
                ("Grace", "I am reviewing Frank's PR.", 10000, 20000)
            ]
        },
        {
            "title": "Design Review",
            "date": datetime.datetime.now() - datetime.timedelta(days=4),
            "duration": 1800,
            "tags": [tag_product],
            "participants": ["Ivan", "Judy"],
            "summary": "Reviewed mockups for the new dashboard.",
            "actions": [("Ivan", "Update color palette")],
            "chapters": [("Mockup Review", 0, 1800)],
            "transcript": [
                ("Ivan", "Here are the new designs.", 0, 5000),
                ("Judy", "The colors look a bit off.", 5000, 10000)
            ]
        },
        {
            "title": "Quarterly Planning",
            "date": datetime.datetime.now() - datetime.timedelta(days=5),
            "duration": 7200,
            "tags": [tag_product, tag_engineering, tag_marketing],
            "participants": ["Alice", "Bob", "Diana", "Frank"],
            "summary": "Planning for the next quarter goals.",
            "actions": [("Alice", "Publish OKRs"), ("Bob", "Allocate engineering resources")],
            "chapters": [("Retrospective", 0, 3600), ("Goals", 3600, 7200)],
            "transcript": [
                ("Alice", "Let's review last quarter.", 0, 5000),
                ("Bob", "We missed some engineering targets.", 5000, 10000)
            ]
        },
        {
            "title": "1:1 Sync",
            "date": datetime.datetime.now() - datetime.timedelta(days=6),
            "duration": 1800,
            "tags": [],
            "participants": ["Alice", "Grace"],
            "summary": "Discussed career growth and current project.",
            "actions": [("Grace", "Read the recommended book")],
            "chapters": [("Check-in", 0, 900), ("Career", 900, 1800)],
            "transcript": [
                ("Alice", "How are things going?", 0, 5000),
                ("Grace", "Pretty well, enjoying the new project.", 5000, 10000)
            ]
        }
    ]

    for data in meetings_data:
        m = Meeting(
            title=data["title"],
            date=data["date"],
            duration_sec=data["duration"],
            status=MeetingStatus.done,
            owner_id=user.id
        )
        for t in data["tags"]:
            m.tags.append(t)
        db.add(m)
        db.flush()

        part_map = {}
        for p_name in data["participants"]:
            p = Participant(meeting_id=m.id, name=p_name, speaker_id=f"Speaker_{p_name}")
            db.add(p)
            db.flush()
            part_map[p_name] = p.id

        sum_obj = Summary(
            meeting_id=m.id,
            overview=data["summary"],
            key_topics="[\"topic1\", \"topic2\"]"
        )
        db.add(sum_obj)

        for assignee, task in data["actions"]:
            ai = ActionItem(meeting_id=m.id, assignee=assignee, task=task)
            db.add(ai)

        for i, (title, start, end) in enumerate(data["chapters"]):
            c = Chapter(meeting_id=m.id, title=title, start_ms=start, end_ms=end, sequence=i)
            db.add(c)

        for i, (speaker, text, start, end) in enumerate(data["transcript"]):
            ts = TranscriptSegment(
                meeting_id=m.id,
                participant_id=part_map[speaker],
                text=text,
                start_ms=start,
                end_ms=end,
                sequence=i
            )
            db.add(ts)

    db.commit()
    print("Database seeded with 6 meetings.")

if __name__ == "__main__":
    seed_db()
