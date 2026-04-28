import logging
import os
import signal
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.database import engine, Base
from app.routers import quizzes, scores, generator, auth, editor, friends, notifications

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up — creating database tables if needed")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    yield
    # Shutdown — dispose engine to release all pooled connections
    logger.info("Shutting down — disposing database engine")
    await engine.dispose()
    logger.info("Database engine disposed")


app = FastAPI(lifespan=lifespan)

# CORS configuration — origins from environment or sensible defaults
_default_origins = [
    "http://localhost:83",
    "http://localhost:3000",
]
_env_origins = os.getenv("CORS_ORIGINS", "")
if _env_origins:
    cors_origins = [o.strip() for o in _env_origins.split(",") if o.strip()]
else:
    cors_origins = _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

os.makedirs("/app/uploads/avatars", exist_ok=True)
os.makedirs("/app/uploads/covers", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.include_router(generator.router)
app.include_router(quizzes.router)
app.include_router(scores.router)
app.include_router(auth.router)
app.include_router(editor.router)

from app.routers import users
app.include_router(users.router)

from app.routers import friends
app.include_router(friends.router)
app.include_router(notifications.router)


@app.get("/api/ping")
async def ping():
    return {"ping": "pong"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
