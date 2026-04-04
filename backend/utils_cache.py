import os
import redis as sync_redis
import logging

logger = logging.getLogger(__name__)

# Global cache version for the leaderboard
LEADERBOARD_CACHE_VERSION = 1

def get_redis_sync():
    """Get a synchronous Redis connection."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
        return sync_redis.from_url(redis_url, decode_responses=True)
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return None

def invalidate_leaderboard_cache():
    """Invalidate the leaderboard cache by incrementing the version in Redis."""
    global LEADERBOARD_CACHE_VERSION
    r = get_redis_sync()
    if r:
        try:
            LEADERBOARD_CACHE_VERSION = r.incr("minicode:leaderboard_version")
            logger.info(f"Leaderboard cache invalidated. New version: {LEADERBOARD_CACHE_VERSION}")
            return LEADERBOARD_CACHE_VERSION
        except Exception as e:
            logger.error(f"Failed to increment leaderboard version in Redis: {e}")
    
    # Fallback to local increment if Redis is unavailable
    LEADERBOARD_CACHE_VERSION += 1
    return LEADERBOARD_CACHE_VERSION
