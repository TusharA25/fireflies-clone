import uuid
from httpx import AsyncClient

import app.models  # noqa: F401 — register SQLAlchemy models on Base
from app.database import init_db

init_db()


async def auth_headers(ac: AsyncClient) -> dict[str, str]:
    email = f"user-{uuid.uuid4().hex[:12]}@example.com"
    response = await ac.post(
        "/api/auth/register",
        json={"email": email, "password": "testpass123", "display_name": "Test User"},
    )
    assert response.status_code == 201, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
