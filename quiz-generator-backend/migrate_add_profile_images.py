"""
Migration: add avatar_url and cover_url columns to the users table.
Run once against the live database:
  docker exec quiz-db psql -U quizuser -d quizdb -f /dev/stdin < migrate_add_profile_images.py
Or directly:
  python migrate_add_profile_images.py
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://quizuser:quizpass@localhost:5432/quizdb",
)

async def migrate():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500)"
        ))
    await engine.dispose()
    print("Migration complete: avatar_url and cover_url added to users table.")

if __name__ == "__main__":
    asyncio.run(migrate())
