from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.deps import AdminUser, DbSession
from app.models.enums import LoanStatus
from app.models.installment import Installment
from app.models.loan import Loan
from app.schemas.report import ReportSummary, MonthlyReport
from app.crud import loan_settings as crud_settings

router = APIRouter(prefix="/reports", tags=["reports"])


def _summary(db: DbSession, start: date, end: date, period: str) -> ReportSummary:
    start_dt = datetime.combine(start, datetime.min.time(), tzinfo=UTC)
    end_dt = datetime.combine(end, datetime.min.time(), tzinfo=UTC)
    total_lent = db.scalar(select(func.coalesce(func.sum(Loan.amount), 0)).where(Loan.created_at >= start_dt, Loan.created_at < end_dt))
    total_paid = db.scalar(select(func.coalesce(func.sum(Installment.amount), 0)).where(Installment.payment_date >= start, Installment.payment_date < end))
    active_loans = db.scalar(select(func.count(Loan.id)).where(Loan.status == LoanStatus.DEPOSITADO))
    finished_loans = db.scalar(select(func.count(Loan.id)).where(Loan.status == LoanStatus.TERMINADO))
    return ReportSummary(
        period=period,
        total_lent=Decimal(total_lent or 0),
        total_paid=Decimal(total_paid or 0),
        active_loans=active_loans or 0,
        finished_loans=finished_loans or 0,
    )


@router.get("/monthly", response_model=MonthlyReport)
def monthly_report(db: DbSession, _: AdminUser, year: int | None = None, month: int | None = None) -> MonthlyReport:
    today = date.today()
    year = year or today.year
    month = month or today.month
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    start_dt = datetime.combine(start, datetime.min.time(), tzinfo=UTC)
    end_dt = datetime.combine(end, datetime.min.time(), tzinfo=UTC)
    
    # Obtener configuración para calcular intereses
    settings = crud_settings.get_loan_settings(db)
    interest_rate = float(settings.interest_rate)
    
    # Total prestado en el mes
    total_loaned = db.scalar(
        select(func.coalesce(func.sum(Loan.amount), 0))
        .where(Loan.created_at >= start_dt, Loan.created_at < end_dt, Loan.status == LoanStatus.DEPOSITADO)
    ) or 0
    
    # Total pagado en el mes
    total_paid = db.scalar(
        select(func.coalesce(func.sum(Installment.amount), 0))
        .where(Installment.payment_date >= start, Installment.payment_date < end, Installment.is_paid == True)
    ) or 0
    
    # Intereses ganados (aproximado)
    interest_earned = float(total_loaned) * interest_rate
    
    # Cuotas pendientes
    pending_installments = db.scalar(
        select(func.count(Installment.id))
        .where(Installment.is_paid == False)
    ) or 0
    
    # Préstamos aprobados en el mes
    loans_approved = db.scalar(
        select(func.count(Loan.id))
        .where(Loan.created_at >= start_dt, Loan.created_at < end_dt, Loan.status == LoanStatus.DEPOSITADO)
    ) or 0
    
    # Préstamos rechazados en el mes
    loans_rejected = db.scalar(
        select(func.count(Loan.id))
        .where(Loan.created_at >= start_dt, Loan.created_at < end_dt, Loan.status == LoanStatus.TERMINADO)
    ) or 0
    
    months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return MonthlyReport(
        month=months[month - 1],
        year=year,
        total_loaned=Decimal(total_loaned),
        total_paid=Decimal(total_paid),
        interest_earned=Decimal(interest_earned),
        pending_installments=pending_installments,
        loans_approved=loans_approved,
        loans_rejected=loans_rejected,
    )


@router.get("/weekly", response_model=ReportSummary)
def weekly_report(db: DbSession, _: AdminUser, start_date: date | None = None) -> ReportSummary:
    start = start_date or (date.today() - timedelta(days=date.today().weekday()))
    end = start + timedelta(days=7)
    return _summary(db, start, end, f"{start.isoformat()}:{end.isoformat()}")


@router.get("/dashboard", response_model=ReportSummary)
def dashboard_summary(db: DbSession, admin: AdminUser) -> ReportSummary:
    today = date.today()
    start = date(today.year, today.month, 1)
    end = date(today.year + 1, 1, 1) if today.month == 12 else date(today.year, today.month + 1, 1)
    return _summary(db, start, end, f"{today.year:04d}-{today.month:02d}")
