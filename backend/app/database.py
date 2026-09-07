from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(
    settings.database_url, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _ensure_sqlite_columns() -> None:
    """Add newly introduced nullable columns without dropping existing tables."""
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    if "transcript_comments" in tables:
        existing = {col["name"] for col in inspector.get_columns("transcript_comments")}
        if "author_name" not in existing:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE transcript_comments ADD COLUMN author_name VARCHAR"))

    if "users" in tables:
        existing = {col["name"] for col in inspector.get_columns("users")}
        if "password_hash" not in existing:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))


def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()
