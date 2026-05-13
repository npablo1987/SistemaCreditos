from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_token(subject: str | int, expires_delta: timedelta, secret_key: str, token_type: str) -> str:
    expire = datetime.now(UTC) + expires_delta
    payload: dict[str, Any] = {"exp": expire, "sub": str(subject), "type": token_type}
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)


def create_access_token(subject: str | int) -> str:
    return create_token(
        subject,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        settings.SECRET_KEY,
        "access",
    )


def create_refresh_token(subject: str | int) -> str:
    return create_token(
        subject,
        timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
        settings.REFRESH_SECRET_KEY,
        "refresh",
    )


def decode_token(token: str, secret_key: str, expected_type: str) -> int:
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise ValueError("Invalid token type")
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError) as exc:
        raise ValueError("Invalid token") from exc
