from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.account import Account
from app.models.budget import Budget
from app.models.financial_record import FinancialRecord
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _month_bounds(month: date) -> tuple[datetime, datetime]:
    start = datetime.combine(month.replace(day=1), time.min)
    next_month = (month.replace(day=28) + timedelta(days=4)).replace(day=1)
    return start, datetime.combine(next_month, time.min)


def _money(value: Decimal | int | float | None) -> Decimal:
    return Decimal(value or 0).quantize(Decimal("0.01"))


@router.get("")
def dashboard(
    period: Literal["this_week", "this_month", "last_month", "this_year"] = Query(default="this_month"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    today = date.today()
    if period == "this_week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=7)
    elif period == "last_month":
        end_date = today.replace(day=1)
        start_date = (end_date - timedelta(days=1)).replace(day=1)
    elif period == "this_year":
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(year=today.year + 1, month=1, day=1)
    else:
        start_date = today.replace(day=1)
        end_date = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
    start = datetime.combine(start_date, time.min)
    end = datetime.combine(end_date, time.min)
    all_transactions = db.scalars(select(Transaction).where(Transaction.user_id == user.id)).all()
    month_transactions = [item for item in all_transactions if start <= item.occurred_at < end]
    income = sum((item.amount for item in month_transactions if item.kind == "income"), Decimal(0))
    expenses = sum((item.amount for item in month_transactions if item.kind == "expense"), Decimal(0))

    account_items = db.scalars(select(Account).where(Account.user_id == user.id)).all()
    balances: dict[int, Decimal] = {item.id: item.opening_balance for item in account_items}
    for item in all_transactions:
        if item.kind == "income":
            balances[item.account_id] += item.amount
        elif item.kind == "expense":
            balances[item.account_id] -= item.amount
        elif item.kind == "transfer":
            balances[item.account_id] -= item.amount
            if item.to_account_id in balances:
                balances[item.to_account_id] += item.amount
    cash_balance = sum(balances.values(), Decimal(0))

    records = db.scalars(select(FinancialRecord).where(FinancialRecord.user_id == user.id)).all()
    sums: dict[str, Decimal] = defaultdict(Decimal)
    goals: list[dict[str, object]] = []
    for item in records:
        sums[item.kind] += item.amount
        if item.kind == "goals":
            current = Decimal(str(item.details.get("current_amount", 0)))
            target = item.amount
            goals.append({
                "id": item.id,
                "name": item.name,
                "target": target,
                "current": current,
                "progress": min(100, float(current / target * 100)) if target > 0 else 0,
            })
    assets = sums["assets"] + sums["investments"]
    liabilities = sums["liabilities"] + sums["loans"]
    month_savings = income - expenses

    chart_months = []
    for offset in range(5, -1, -1):
        month = (today.replace(day=1) - timedelta(days=offset * 28)).replace(day=1)
        month_start, month_end = _month_bounds(month)
        rows = [item for item in all_transactions if month_start <= item.occurred_at < month_end]
        chart_months.append({
            "month": month.strftime("%b"),
            "income": float(sum((row.amount for row in rows if row.kind == "income"), Decimal(0))),
            "expenses": float(sum((row.amount for row in rows if row.kind == "expense"), Decimal(0))),
        })

    category_totals: dict[str, Decimal] = defaultdict(Decimal)
    for item in month_transactions:
        if item.kind == "expense":
            category_totals[item.category] += item.amount
    spending = [
        {"category": category, "amount": float(amount)}
        for category, amount in sorted(category_totals.items(), key=lambda pair: pair[1], reverse=True)
    ]

    budget_rows = db.scalars(select(Budget).where(Budget.user_id == user.id)).all()
    budget_summary = []
    for budget in budget_rows:
        spent = category_totals[budget.category]
        budget_summary.append({
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "spent": spent,
            "remaining": budget.limit_amount - spent,
            "progress": min(100, float(spent / budget.limit_amount * 100)) if budget.limit_amount else 0,
        })

    latest = sorted(all_transactions, key=lambda item: item.occurred_at, reverse=True)[:8]
    return {
        "currency": user.currency,
        "period": (
            f"{start_date.strftime('%b %d')} – {(end_date - timedelta(days=1)).strftime('%b %d, %Y')}"
            if period == "this_week"
            else start_date.strftime("%B %Y") if period in {"this_month", "last_month"}
            else str(start_date.year)
        ),
        "period_key": period,
        "summary": {
            "net_worth": _money(cash_balance + assets - liabilities),
            "assets": _money(cash_balance + assets),
            "liabilities": _money(liabilities),
            "income": _money(income),
            "expenses": _money(expenses),
            "savings": _money(month_savings),
            "savings_rate": float(month_savings / income * 100) if income else None,
            "cash_balance": _money(cash_balance),
            "investments": _money(sums["investments"]),
        },
        "cash_flow": chart_months,
        "spending": spending,
        "budgets": budget_summary,
        "goals": goals[:5],
        "recent_transactions": [
            {
                "id": item.id,
                "kind": item.kind,
                "amount": item.amount,
                "description": item.description,
                "category": item.category,
                "occurred_at": item.occurred_at.replace(tzinfo=timezone.utc).isoformat(),
            }
            for item in latest
        ],
    }