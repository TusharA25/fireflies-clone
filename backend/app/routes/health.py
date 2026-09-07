from fastapi import APIRouter
from ..schemas.health import HealthResponse

router = APIRouter(prefix="/api")

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")
