import os
import redis as sync_redis
import logging

logger = logging.getLogger(__name__)

# Global cache version for the leaderboard
REDIS_CLIENT_SYNC = None

def get_redis_sync():
    """Get a synchronous Redis connection."""
    global REDIS_CLIENT_SYNC
    if REDIS_CLIENT_SYNC is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            REDIS_CLIENT_SYNC = sync_redis.from_url(redis_url, decode_responses=True)
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            return None
    return REDIS_CLIENT_SYNC

def leaderboard_cache_key_builder(func, *args, **kwargs):
    """Generate a cache key for the leaderboard using the global version in Redis."""
    r = get_redis_sync()
    version = 0
    if r:
        try:
            v = r.get("minicode:leaderboard_version")
            if v:
                version = int(v)
        except Exception as e:
            logger.error(f"Failed to fetch leaderboard version from Redis: {e}")
    
    period = kwargs.get("period", "global")
    return f"leaderboard:v{version}:{func.__name__}:{period}"

def invalidate_leaderboard_cache():
    """Invalidate the leaderboard cache by incrementing the version in Redis."""
    r = get_redis_sync()
    if r:
        try:
            new_version = r.incr("minicode:leaderboard_version")
            logger.info(f"Leaderboard cache invalidated. New version: {new_version}")
            return new_version
        except Exception as e:
            logger.error(f"Failed to increment leaderboard version in Redis: {e}")
            return 0
    return 0
