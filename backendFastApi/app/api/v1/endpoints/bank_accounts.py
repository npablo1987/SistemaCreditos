from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.bank_account import BankAccount
from app.models.enums import UserRole
from app.schemas.bank_account import BankAccountCreate, BankAccountRead, BankAccountUpdate

router = APIRouter(prefix="/bank-accounts", tags=["bank accounts"])


def _get_account(db: DbSession, current_user: CurrentUser, account_id: int) -> BankAccount:
    account = db.get(BankAccount, account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuenta bancaria no encontrada")
    if current_user.role != UserRole.ADMIN and account.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return account


@router.post("", response_model=BankAccountRead, status_code=status.HTTP_201_CREATED)
def create_account(db: DbSession, current_user: CurrentUser, payload: BankAccountCreate) -> BankAccount:
    account = BankAccount(user_id=current_user.id, **payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("", response_model=list[BankAccountRead])
def list_accounts(db: DbSession, current_user: CurrentUser, user_id: int | None = None) -> list[BankAccount]:
    stmt = select(BankAccount)
    if current_user.role == UserRole.ADMIN and user_id:
        stmt = stmt.where(BankAccount.user_id == user_id)
    elif current_user.role != UserRole.ADMIN:
        stmt = stmt.where(BankAccount.user_id == current_user.id)
    return list(db.scalars(stmt))


@router.get("/{account_id}", response_model=BankAccountRead)
def get_account(db: DbSession, current_user: CurrentUser, account_id: int) -> BankAccount:
    return _get_account(db, current_user, account_id)


@router.put("/{account_id}", response_model=BankAccountRead)
def update_account(db: DbSession, current_user: CurrentUser, account_id: int, payload: BankAccountUpdate) -> BankAccount:
    account = _get_account(db, current_user, account_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(db: DbSession, current_user: CurrentUser, account_id: int) -> None:
    account = _get_account(db, current_user, account_id)
    db.delete(account)
    db.commit()
