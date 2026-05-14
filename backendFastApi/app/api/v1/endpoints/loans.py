from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.models.enums import LoanStatus, UserRole
from app.models.loan import Loan
from app.models.loan_file import LoanFile
from app.schemas.loan import LoanCreate, LoanDeposit, LoanDetail, LoanRead, LoanUpdateStatus
from app.services.loan_service import create_loan, deposit_loan, ensure_loan_access, update_loan_status
from app.services.storage_service import storage_service

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("", response_model=LoanRead, status_code=status.HTTP_201_CREATED)
async def request_loan(
    db: DbSession,
    current_user: CurrentUser,
    amount: Annotated[Decimal, Form(gt=0)],
    number_of_installments: Annotated[int, Form(ge=1, le=120)],
    payment_start_date: Annotated[date, Form()],
    bank_account_id: Annotated[int, Form()],
    comment: Annotated[str | None, Form()] = None,
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> Loan:
    payload = LoanCreate(
        amount=amount,
        number_of_installments=number_of_installments,
        payment_start_date=payment_start_date,
        bank_account_id=bank_account_id,
        comment=comment,
    )
    return await create_loan(db, current_user, payload, files)


@router.get("", response_model=list[LoanRead])
def list_loans(
    db: DbSession,
    current_user: CurrentUser,
    status_filter: LoanStatus | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    user_id: int | None = None,
) -> list[Loan]:
    stmt = select(Loan).options(
        selectinload(Loan.files), 
        selectinload(Loan.deposit_receipt),
        selectinload(Loan.user),
        selectinload(Loan.bank_account)
    ).order_by(Loan.created_at.desc())
    if current_user.role != UserRole.ADMIN:
        stmt = stmt.where(Loan.user_id == current_user.id)
    elif user_id:
        stmt = stmt.where(Loan.user_id == user_id)
    if status_filter:
        stmt = stmt.where(Loan.status == status_filter)
    if date_from:
        stmt = stmt.where(Loan.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Loan.created_at < date_to)
    return list(db.scalars(stmt))


@router.get("/{loan_id}", response_model=LoanDetail)
def get_loan(db: DbSession, current_user: CurrentUser, loan_id: int) -> Loan:
    loan = db.scalar(
        select(Loan)
        .where(Loan.id == loan_id)
        .options(selectinload(Loan.files), selectinload(Loan.deposit_receipt), selectinload(Loan.user), selectinload(Loan.bank_account))
    )
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    ensure_loan_access(current_user, loan)
    return loan


@router.patch("/{loan_id}/status", response_model=LoanRead)
def change_loan_status(db: DbSession, _: AdminUser, loan_id: int, payload: LoanUpdateStatus) -> Loan:
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    return update_loan_status(db, loan, payload)


@router.post("/{loan_id}/files", response_model=LoanRead)
async def upload_loan_files(
    db: DbSession,
    current_user: CurrentUser,
    loan_id: int,
    files: Annotated[list[UploadFile], File()],
) -> Loan:
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    ensure_loan_access(current_user, loan)
    for file in files:
        path, mime_type, original_name = await storage_service.save_upload(file, f"loans/{loan.id}")
        db.add(LoanFile(loan_id=loan.id, original_name=original_name, path=path, mime_type=mime_type))
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/deposit", response_model=LoanRead)
async def register_deposit(
    db: DbSession,
    _: AdminUser,
    loan_id: int,
    detail: Annotated[str, Form()],
    deposit_date: Annotated[date, Form()],
    admin_observations: Annotated[str | None, Form()] = None,
    receipt: Annotated[UploadFile | None, File()] = None,
) -> Loan:
    loan = db.scalar(select(Loan).where(Loan.id == loan_id).options(selectinload(Loan.user), selectinload(Loan.deposit_receipt)))
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    payload = LoanDeposit(detail=detail, deposit_date=deposit_date, admin_observations=admin_observations)
    return await deposit_loan(db, loan, payload, receipt)
