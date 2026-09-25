"""
database.py — Async SQLAlchemy engine & session factory for Supabase PostgreSQL.
Uses asyncpg as the underlying driver for non-blocking DB operations.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from config import get_settings

settings = get_settings()

# Create the async engine pointed at our Supabase PostgreSQL (or local PostGIS container)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),  # Log SQL in dev mode only
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Detect stale connections before use
)

# Session factory — each request gets its own isolated session
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session per request.
    Automatically commits on success and rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
