# ============================================================
# SamriddhiAI Backend — Production Dockerfile
# ============================================================
# Uses python:3.11-slim for minimal image size (~120MB).
# Runs Gunicorn as the process manager with Uvicorn workers
# for multi-core async concurrency.
# ============================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system-level dependencies required by asyncpg and PostGIS bindings
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
COPY . .

# Expose the port (Railway/Render inject PORT dynamically)
EXPOSE 8000

# Production CMD: Gunicorn manages Uvicorn workers for multi-core concurrency
# Falls back to PORT env var injected by Railway/Render, defaults to 8000
CMD gunicorn main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
