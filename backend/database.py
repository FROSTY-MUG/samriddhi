"""
database.py — Async SQLAlchemy engine & session factory for Supabase PostgreSQL.
Uses asyncpg as the underlying driver for non-blocking DB operations.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from config import get_settings

settings = get_settings()

# Create the async engine pointed at our Supabase PostgreSQL (or local PostGIS container)
try:
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
except Exception as e:
    print(f"[DB Engine Warning] Could not initialize asyncpg engine ({e}). Will run in resilient in-memory mode.")
    engine = None
    AsyncSessionLocal = None



async def get_db():
    """
    FastAPI dependency that yields an active database session per request.
    If the database is unreachable, safely yields None to allow fallback logic.
    """
    if AsyncSessionLocal is None:
        yield None
        return
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    except Exception as exc:
        print(f"[DB Warning] Could not connect to PostgreSQL ({exc}). Operating in resilient mode.")
        yield None

