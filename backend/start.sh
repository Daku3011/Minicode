#!/bin/bash

# ==============================================================================
# MiniCode Zero-Cost Startup Script
# This script runs both the API server and the Celery worker in one process
# to fit within Render's Free Web Service tier.
# ==============================================================================

# Start the Celery Worker in the background
# We use --concurrency=1 to stay within memory limits (512MB)
echo "Starting Celery Worker..."
celery -A worker.celery_app worker --loglevel=info --concurrency=1 &

# Start the FastAPI Server
# We use WEB_CONCURRENCY=1 for the free tier
echo "Starting FastAPI Server..."
gunicorn main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT
