from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_username_or_email(db: Session, identifier: str) -> User | None:
    return db.scalar(select(User).where(or_(User.username == identifier, User.email == identifier)))


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return list(db.scalars(select(User).offset(skip).limit(limit)))


def create_user(db: Session, obj_in: UserCreate) -> User:
    data = obj_in.model_dump()
    password = data.pop("password")
    db_obj = User(**data, hashed_password=get_password_hash(password))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_user(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    data = obj_in.model_dump(exclude_unset=True)
    if password := data.pop("password", None):
        db_obj.hashed_password = get_password_hash(password)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
