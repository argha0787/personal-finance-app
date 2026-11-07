from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def transaction_response(item: Transaction) -> dict[str, object]:
    return {
        "id": item.id,
        "account_id": item.account_id,
        "to_account_id": item.to_account_id,
        "kind": item.kind,
        "amount": item.amount,
        "description": item.description,
        "category": item.category,
        "payment_method": item.payment_method,
        "occurred_at": item.occurred_at.replace(tzinfo=timezone.utc).isoformat(),
        "essential": item.essential,
        "notes": item.notes,
    }


@router.get("")
def list_transactions(
    kind: str | None = Query(default=None, pattern="^(income|expense|transfer)$"),
    search: str | None = Query(default=None, max_length=100),
    start: datetime | None = None,
    end: datetime | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict[str, object]]:
    query = select(Transaction).where(Transaction.user_id == user.id)
    if kind:
        query = query.where(Transaction.kind == kind)
    if start:
        query = query.where(Transaction.occurred_at >= start)
    if end:
        query = query.where(Transaction.occurred_at <= end)
    if search:
        query = query.where(Transaction.description.ilike(f"%{search.strip()}%"))
    items = db.scalars(query.order_by(Transaction.occurred_at.desc()).limit(500)).all()
    return [transaction_response(item) for item in items]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    account_ids = {payload.account_id}
    if payload.to_account_id is not None:
        account_ids.add(payload.to_account_id)
    owned = set(db.scalars(select(Account.id).where(Account.id.in_(account_ids), Account.user_id == user.id)).all())
    if owned != account_ids:
        raise HTTPException(status_code=404, detail="One or more accounts could not be found.")
    data = payload.model_dump()
    if data["occurred_at"].tzinfo is not None:
        data["occurred_at"] = data["occurred_at"].astimezone(timezone.utc).replace(tzinfo=None)
    item = Transaction(user_id=user.id, **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return transaction_response(item)


@router.patch("/{transaction_id}")
def update_transaction(
    transaction_id: int,
    payload: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    item = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id)
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    account_ids = {payload.account_id}
    if payload.to_account_id is not None:
        account_ids.add(payload.to_account_id)
    owned = set(db.scalars(select(Account.id).where(Account.id.in_(account_ids), Account.user_id == user.id)).all())
    if owned != account_ids:
        raise HTTPException(status_code=404, detail="One or more accounts could not be found.")
    changes = payload.model_dump()
    if changes["occurred_at"].tzinfo is not None:
        changes["occurred_at"] = changes["occurred_at"].astimezone(timezone.utc).replace(tzinfo=None)
    for key, value in changes.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return transaction_response(item)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    item = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    db.delete(item)
    db.commit()