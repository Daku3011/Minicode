#!/bin/bash
set -e

echo "Starting MiniCode services..."

if [ "$1" = "celery-worker" ]; then
    echo "Starting Celery Worker..."
    exec celery -A worker.celery_app worker --loglevel=info --concurrency=4
elif [ "$1" = "celery-beat" ]; then
    echo "Starting Celery Beat..."
    exec celery -A worker.celery_app beat --loglevel=info -s /tmp/celerybeat-schedule
elif [ "$1" = "api" ]; then
    echo "Starting FastAPI Server..."
    exec gunicorn main:app \
        --workers 2 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:$PORT
else
    echo "Starting all services..."
    celery -A worker.celery_app worker --loglevel=info --concurrency=1 &
    gunicorn main:app \
        --workers 1 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:$PORT
fi
