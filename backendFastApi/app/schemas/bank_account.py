from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class BankAccountBase(BaseModel):
    bank_name: str = Field(..., max_length=120)
    account_type: str = Field(..., max_length=80)
    account_number: str = Field(..., max_length=80)
    holder_name: str = Field(..., max_length=180)
    holder_document_id: str = Field(..., max_length=40)


class BankAccountCreate(BankAccountBase):
    pass


class BankAccountUpdate(BaseModel):
    bank_name: str | None = Field(default=None, max_length=120)
    account_type: str | None = Field(default=None, max_length=80)
    account_number: str | None = Field(default=None, max_length=80)
    holder_name: str | None = Field(default=None, max_length=180)
    holder_document_id: str | None = Field(default=None, max_length=40)


class BankAccountRead(ORMBase, BankAccountBase):
    id: int
    user_id: int
    created_at: datetime
