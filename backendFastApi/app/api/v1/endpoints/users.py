from fastapi import APIRouter, HTTPException, status
from sqlalchemy import or_, select

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.models.user import User
from app.repositories.user_repository import create_user, list_users, update_user
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


def _ensure_unique(db: DbSession, data: UserCreate | UserUpdate, user_id: int | None = None) -> None:
    checks = []
    if getattr(data, "email", None):
        checks.append(User.email == data.email)
    if getattr(data, "username", None):
        checks.append(User.username == data.username)
    if getattr(data, "document_id", None):
        checks.append(User.document_id == data.document_id)
    if not checks:
        return
    stmt = select(User).where(or_(*checks))
    if user_id is not None:
        stmt = stmt.where(User.id != user_id)
    if db.scalar(stmt):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email, username o documento ya existe")


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_new_user(db: DbSession, _: AdminUser, payload: UserCreate) -> User:
    _ensure_unique(db, payload)
    return create_user(db, payload)


@router.get("", response_model=list[UserRead])
def read_users(db: DbSession, _: AdminUser, skip: int = 0, limit: int = 100) -> list[User]:
    return list_users(db, skip, limit)


@router.get("/me", response_model=UserRead)
def read_profile(current_user: CurrentUser) -> User:
    return current_user


@router.get("/{user_id}", response_model=UserRead)
def read_user(db: DbSession, _: AdminUser, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_existing_user(db: DbSession, _: AdminUser, user_id: int, payload: UserUpdate) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    _ensure_unique(db, payload, user_id)
    return update_user(db, user, payload)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(db: DbSession, _: AdminUser, user_id: int) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
