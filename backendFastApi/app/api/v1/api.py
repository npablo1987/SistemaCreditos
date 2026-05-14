from fastapi import APIRouter

from app.api.v1.endpoints import auth, bank_accounts, installments, loans, reports, users, settings

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(bank_accounts.router)
api_router.include_router(loans.router)
api_router.include_router(installments.router)
api_router.include_router(reports.router)
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
