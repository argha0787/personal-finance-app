from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.account import AccountCreate, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["accounts"])


def account_response(account: Account, balance: object | None = None) -> dict[str, object]:
    return {
        "id": account.id,
        "name": account.name,
        "account_type": account.account_type,
        "currency": account.currency,
        "opening_balance": account.opening_balance,
        "balance": account.opening_balance if balance is None else balance,
    }


@router.get("")
def list_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, object]]:
    accounts = db.scalars(select(Account).where(Account.user_id == user.id).order_by(Account.name)).all()
    account_ids = [account.id for account in accounts]
    transactions = db.scalars(
        select(Transaction).where(Transaction.user_id == user.id, Transaction.account_id.in_(account_ids))
    ).all() if account_ids else []
    incoming_transfers = db.scalars(
        select(Transaction).where(Transaction.user_id == user.id, Transaction.to_account_id.in_(account_ids))
    ).all() if account_ids else []
    balances = {account.id: account.opening_balance for account in accounts}
    for item in transactions:
        if item.kind == "income":
            balances[item.account_id] += item.amount
        elif item.kind == "expense" or item.kind == "transfer":
            balances[item.account_id] -= item.amount
    for item in incoming_transfers:
        balances[item.to_account_id] += item.amount
    return [account_response(account, balances[account.id]) for account in accounts]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_account(
    payload: AccountCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, object]:
    if payload.currency.upper() != user.currency:
        raise HTTPException(status_code=422, detail="Account currency must match your profile currency. No currency conversion is applied.")
    account = Account(user_id=user.id, **payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account_response(account)


@router.patch("/{account_id}")
def update_account(
    account_id: int,
    payload: AccountUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == user.id))
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if changes.get("currency", user.currency) != user.currency:
        raise HTTPException(status_code=422, detail="Account currency must match your profile currency. No currency conversion is applied.")
    for key, value in changes.items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account_response(account)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == user.id))
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")
    if db.scalar(
        select(Transaction.id)
        .where(or_(Transaction.account_id == account.id, Transaction.to_account_id == account.id))
        .limit(1)
    ):
        raise HTTPException(status_code=409, detail="This account has transactions. Archive it instead of deleting it.")
    db.delete(account)
    db.commit()