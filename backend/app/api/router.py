from fastapi import APIRouter
from fastapi import APIRouter

from app.api.v1 import accounts, ai, auth, budgets, calculators, dashboard, records, reports, transactions, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(accounts.router)
api_router.include_router(transactions.router)
api_router.include_router(budgets.router)
api_router.include_router(records.router)
api_router.include_router(dashboard.router)
api_router.include_router(calculators.router)
api_router.include_router(reports.router)
api_router.include_router(ai.router)


@api_router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}