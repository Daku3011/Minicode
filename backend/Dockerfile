# ============================================
# Stage 1: Build dependencies
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies for psycopg2 and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Production image
# ============================================
FROM python:3.12-slim AS production

# Install runtime dependencies only (libpq for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Remove any local dev files that slipped through
RUN rm -f minicode.db .env

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check for Render / load balancers
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ============================================
# Run with Gunicorn + Uvicorn workers
# WEB_CONCURRENCY controls worker count (default: 4)
# Gunicorn manages worker lifecycle, restarts, and graceful shutdowns
# ============================================
ENV WEB_CONCURRENCY=4
ENV PORT=8000

CMD ["sh", "-c", "gunicorn main:app \
    --workers ${WEB_CONCURRENCY} \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT} \
    --timeout 120 \
    --graceful-timeout 30 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --access-logfile - \
    --error-logfile -"]
