from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config import settings
from app.dependencies import ALGORITHM


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
    return jwt.encode({"sub": str(user_id), "exp": expires_at}, settings.secret_key, algorithm=ALGORITHM)