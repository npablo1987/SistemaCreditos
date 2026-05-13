from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole
from app.schemas.common import ORMBase


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=80)
    phone: str | None = Field(default=None, max_length=40)
    document_id: str = Field(..., min_length=3, max_length=40)
    role: UserRole = UserRole.USER
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=80)
    phone: str | None = Field(default=None, max_length=40)
    document_id: str | None = Field(default=None, min_length=3, max_length=40)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(ORMBase):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    phone: str | None
    document_id: str
    role: UserRole
    is_active: bool
    created_at: datetime
