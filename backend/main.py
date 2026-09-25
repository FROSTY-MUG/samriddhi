"""
main.py — Production Entry Point Alias
Exposes `app` from `app.py` for Gunicorn/Uvicorn deployment compatibility.
"""
from app import app

# Export for ASGI servers
__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
