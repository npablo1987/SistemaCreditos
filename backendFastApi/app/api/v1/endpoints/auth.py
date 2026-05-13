from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi import Depends

from app.api.deps import DbSession
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password
from app.models.user import User
from app.repositories.user_repository import get_by_username_or_email
from app.schemas.token import RefreshTokenRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(db: DbSession, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = get_by_username_or_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password) or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña inválidos")
    return Token(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.post("/refresh", response_model=Token)
def refresh_token(db: DbSession, payload: RefreshTokenRequest) -> Token:
    try:
        user_id = decode_token(payload.refresh_token, settings.REFRESH_SECRET_KEY, "refresh")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inválido")
    return Token(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))
