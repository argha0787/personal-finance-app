import csv
from datetime import timezone
from io import StringIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"])


def spreadsheet_safe(value: str) -> str:
    return f"'{value}" if value.lstrip(" \t\r\n").startswith(("=", "+", "-", "@")) else value


@router.get("/transactions.csv")
def export_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> StreamingResponse:
    items = db.scalars(
        select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.occurred_at.desc())
    ).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Type", "Description", "Category", "Amount", "Payment method"])
    for item in items:
        writer.writerow([
            item.occurred_at.replace(tzinfo=timezone.utc).isoformat(),
            item.kind,
            spreadsheet_safe(item.description),
            spreadsheet_safe(item.category),
            str(item.amount),
            spreadsheet_safe(item.payment_method),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )