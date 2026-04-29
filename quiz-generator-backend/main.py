import logging
import os
import signal
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database.database import engine, Base
from app.routers import quizzes, scores, generator, auth, editor, friends, notifications

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def ensure_schema_compatibility():
    """Backfill columns and normalize legacy types on older production databases."""
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500)"
        ))

        db_url = os.getenv("DATABASE_URL", "")
        if "sqlite" not in db_url:
            result = await conn.execute(text(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = 'notifications'
                  AND column_name = 'is_read'
                """
            ))
            column_type = result.scalar_one_or_none()

            if column_type and column_type != "boolean":
                logger.warning(
                    "Normalizing notifications.is_read from %s to boolean for legacy database compatibility",
                    column_type,
                )
                await conn.execute(text(
                    """
                    ALTER TABLE notifications
                    ALTER COLUMN is_read TYPE BOOLEAN
                    USING CASE WHEN is_read = 1 THEN TRUE ELSE FALSE END
                    """
                ))

            await conn.execute(text(
                "ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT FALSE"
            ))
            await conn.execute(text(
                "ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL"
            ))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up — creating database tables if needed")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_schema_compatibility()
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

API_PREFIX = "/api"

app.include_router(generator.router, prefix=API_PREFIX)
app.include_router(quizzes.router, prefix=API_PREFIX)
app.include_router(scores.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(editor.router, prefix=API_PREFIX)

from app.routers import users
app.include_router(users.router, prefix=API_PREFIX)

from app.routers import friends
app.include_router(friends.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)


@app.get("/api/ping")
async def ping():
    return {"ping": "pong"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
