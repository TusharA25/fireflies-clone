from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routes import health
from .exceptions.handlers import not_found_handler, internal_server_error_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    import app.models
    init_db()
    yield


app = FastAPI(
    title="Firefiles API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(404, not_found_handler)
app.add_exception_handler(500, internal_server_error_handler)

app.include_router(health.router)
from .routes.api import api_router
app.include_router(api_router, prefix="/api")

