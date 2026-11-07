from datetime import date, datetime, time, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import extract, select, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate

router = APIRouter(prefix="/budgets", tags=["budgets"])


def usage(db: Session, user_id: int, category: str, period: str) -> Decimal:
    today = date.today()
    query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.user_id == user_id,
        Transaction.kind == "expense",
        Transaction.category == category,
    )
    if period == "monthly":
        query = query.where(
            extract("year", Transaction.occurred_at) == today.year,
            extract("month", Transaction.occurred_at) == today.month,
        )
    elif period == "weekly":
        start = today - timedelta(days=today.weekday())
        query = query.where(
            Transaction.occurred_at >= datetime.combine(start, time.min),
            Transaction.occurred_at < datetime.combine(start + timedelta(days=7), time.min),
        )
    else:
        query = query.where(extract("year", Transaction.occurred_at) == today.year)
    return Decimal(db.scalar(query) or 0)


@router.get("")
def list_budgets(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, object]]:
    items = db.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.category)).all()
    return [
        {
            "id": item.id,
            "category": item.category,
            "period": item.period,
            "limit_amount": item.limit_amount,
            "spent": usage(db, user.id, item.category, item.period),
        }
        for item in items
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def save_budget(
    payload: BudgetCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, object]:
    item = db.scalar(
        select(Budget).where(
            Budget.user_id == user.id,
            Budget.category == payload.category,
            Budget.period == payload.period,
        )
    )
    if item is None:
        item = Budget(user_id=user.id, **payload.model_dump())
        db.add(item)
    else:
        item.limit_amount = payload.limit_amount
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "category": item.category,
        "period": item.period,
        "limit_amount": item.limit_amount,
        "spent": usage(db, user.id, item.category, item.period),
    }


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    item = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Budget not found.")
    db.delete(item)
    db.commit()