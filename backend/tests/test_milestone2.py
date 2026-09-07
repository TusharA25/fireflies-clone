import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        if response.status_code == 404:
            # maybe it's just /health
            response = await ac.get("/health")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_meetings_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/meetings")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

@pytest.mark.asyncio
async def test_create_meeting():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Test Meeting",
            "date": "2023-10-10T10:00:00Z",
            "duration_sec": 3600
        }
        response = await ac.post("/api/meetings", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Meeting"
        meeting_id = data["id"]

        # Get meeting
        resp_get = await ac.get(f"/api/meetings/{meeting_id}")
        assert resp_get.status_code == 200

@pytest.mark.asyncio
async def test_create_tag():
    import uuid
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"name": f"Test Tag {uuid.uuid4()}", "color": "#000000"}
        response = await ac.post("/api/tags", json=payload)
        assert response.status_code == 201


@pytest.mark.asyncio
async def test_meeting_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/meetings/nonexistent-id")
        assert resp.status_code == 404

@pytest.mark.asyncio
async def test_update_delete_meeting():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create
        resp = await ac.post("/api/meetings", json={"title": "To Update", "date": "2023-10-10T10:00:00Z"})
        m_id = resp.json()["id"]
        # Update
        resp = await ac.put(f"/api/meetings/{m_id}", json={"title": "Updated Title"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"
        # Delete
        resp = await ac.delete(f"/api/meetings/{m_id}")
        assert resp.status_code == 204
        # Verify 404
        resp = await ac.get(f"/api/meetings/{m_id}")
        assert resp.status_code == 404

@pytest.mark.asyncio
async def test_transcript():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/meetings", json={"title": "Transcript Test", "date": "2023-10-10T10:00:00Z"})
        m_id = resp.json()["id"]
        
        # Add segment
        seg = {"text": "Hello world", "start_ms": 0, "end_ms": 1000, "sequence": 0}
        resp = await ac.post(f"/api/meetings/{m_id}/transcript", json=seg)
        assert resp.status_code == 201
        
        # Get
        resp = await ac.get(f"/api/meetings/{m_id}/transcript")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

@pytest.mark.asyncio
async def test_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/meetings", json={"title": "Sum Test", "date": "2023-10-10T10:00:00Z"})
        m_id = resp.json()["id"]
        
        sum_data = {"overview": "Great meeting", "key_topics": ["topic1"]}
        resp = await ac.post(f"/api/meetings/{m_id}/summary", json=sum_data)
        assert resp.status_code == 201

@pytest.mark.asyncio
async def test_action_item():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/meetings", json={"title": "AI Test", "date": "2023-10-10T10:00:00Z"})
        m_id = resp.json()["id"]
        
        ai_data = {"task": "Do this"}
        resp = await ac.post(f"/api/meetings/{m_id}/action-items", json=ai_data)
        assert resp.status_code == 201
        ai_id = resp.json()["id"]
        
        resp = await ac.put(f"/api/meetings/{m_id}/action-items/{ai_id}", json={"completed": True})
        assert resp.status_code == 200
        assert resp.json()["completed"] is True
        
        resp = await ac.delete(f"/api/meetings/{m_id}/action-items/{ai_id}")
        assert resp.status_code == 204

@pytest.mark.asyncio
async def test_chapters():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/meetings", json={"title": "Chapter Test", "date": "2023-10-10T10:00:00Z"})
        m_id = resp.json()["id"]
        
        ch_data = {"title": "Intro", "start_ms": 0, "sequence": 0}
        resp = await ac.post(f"/api/meetings/{m_id}/chapters", json=ch_data)
        assert resp.status_code == 201
        ch_id = resp.json()["id"]
        
        resp = await ac.put(f"/api/meetings/{m_id}/chapters/{ch_id}", json={"title": "Introduction"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Introduction"

        resp = await ac.get(f"/api/meetings/{m_id}/chapters")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

@pytest.mark.asyncio
async def test_validation_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/meetings", json={"title": "No Date"}) # missing date
        assert resp.status_code == 422
