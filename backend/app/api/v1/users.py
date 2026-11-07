from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.account import Account
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me")
def update_preferences(
    payload: dict[str, str],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    currency = payload.get("currency", user.currency).upper()
    if len(currency) != 3 or not currency.isalpha():
        raise HTTPException(status_code=422, detail="Currency must be a three-letter code.")
    other_currency = db.scalar(select(Account.currency).where(Account.user_id == user.id, Account.currency != currency).limit(1))
    if other_currency:
        raise HTTPException(
            status_code=409,
            detail=f"Your accounts use {other_currency}. Currency changes do not convert stored amounts.",
        )
    user.currency = currency
    db.commit()
    return {"currency": user.currency}