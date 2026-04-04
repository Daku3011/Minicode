# ============================================
# Stage 1: Build dependencies
# ============================================
FROM python:3.12-alpine AS builder

WORKDIR /build

# Install build dependencies for psycopg2 and bcrypt
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev \
    libffi-dev

COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Production image
# ============================================
FROM python:3.12-alpine AS production

# Install runtime dependencies only (libpq for psycopg2)
RUN apk add --no-cache \
    libpq \
    curl \
    bash

# Create non-root user for security
RUN addgroup --system --gid 1000 appuser && \
    adduser --system --uid 1000 --ingroup appuser --shell /bin/bash --home /home/appuser --disabled-password appuser

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
    CMD curl -f http://localhost:${PORT}/health || exit 1

# ============================================
# Stage 3: Startup
# ============================================
USER root
COPY start.sh .
RUN chmod +x start.sh
USER appuser

ENV WEB_CONCURRENCY=1
ENV PORT=8000

CMD ["./start.sh"]
