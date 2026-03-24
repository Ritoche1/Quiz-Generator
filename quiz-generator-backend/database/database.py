from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set, using sqlite database")
    DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Connection pool settings for production stability:
# - pool_size: max persistent connections
# - max_overflow: extra connections allowed under load
# - pool_recycle: recycle connections after 30 min to avoid stale connections
# - pool_pre_ping: test connections before use to detect broken ones
engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

# SQLite doesn't support pool configuration
if "sqlite" not in DATABASE_URL:
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_recycle": 1800,
    })

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
    class_=AsyncSession,
)

Base = declarative_base()


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()
