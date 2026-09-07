import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.conftest import auth_headers


@pytest.mark.asyncio
async def test_comment_crud_and_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        headers = await auth_headers(ac)
        meeting_resp = await ac.post(
            "/api/meetings",
            json={"title": "Comment Test Meeting", "date": "2023-10-10T10:00:00Z"},
            headers=headers,
        )
        assert meeting_resp.status_code == 201
        meeting_id = meeting_resp.json()["id"]

        segment_resp = await ac.post(
            f"/api/meetings/{meeting_id}/transcript",
            json={"text": "Let's discuss the launch plan", "start_ms": 0, "end_ms": 1500, "sequence": 0},
            headers=headers,
        )
        assert segment_resp.status_code == 201
        segment_id = segment_resp.json()["id"]

        empty_resp = await ac.post(
            f"/api/meetings/{meeting_id}/comments",
            json={"segment_id": segment_id, "text": "   "},
            headers=headers,
        )
        assert empty_resp.status_code == 422

        missing_meeting = await ac.get("/api/meetings/does-not-exist/comments", headers=headers)
        assert missing_meeting.status_code == 404

        created = await ac.post(
            f"/api/meetings/{meeting_id}/comments",
            json={
                "segment_id": segment_id,
                "text": "  Flag this for follow-up  ",
                "author_name": "Alex Chen",
            },
            headers=headers,
        )
        assert created.status_code == 201
        comment = created.json()
        assert comment["meeting_id"] == meeting_id
        assert comment["segment_id"] == segment_id
        assert comment["text"] == "Flag this for follow-up"
        assert comment["author_name"] == "Alex Chen"
        comment_id = comment["id"]

        wrong_segment = await ac.post(
            f"/api/meetings/{meeting_id}/comments",
            json={"segment_id": "missing-segment", "text": "orphan comment"},
            headers=headers,
        )
        assert wrong_segment.status_code == 404

        listed = await ac.get(f"/api/meetings/{meeting_id}/comments", headers=headers)
        assert listed.status_code == 200
        items = listed.json()
        assert len(items) == 1
        assert items[0]["id"] == comment_id

        missing_comment = await ac.delete(f"/api/meetings/{meeting_id}/comments/missing-id", headers=headers)
        assert missing_comment.status_code == 404

        deleted = await ac.delete(f"/api/meetings/{meeting_id}/comments/{comment_id}", headers=headers)
        assert deleted.status_code == 204

        after_delete = await ac.get(f"/api/meetings/{meeting_id}/comments", headers=headers)
        assert after_delete.status_code == 200
        assert after_delete.json() == []
