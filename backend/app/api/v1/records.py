from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.financial_record import FinancialRecord
from app.models.user import User
from app.schemas.record import RecordCreate, RecordUpdate

router = APIRouter(prefix="/records", tags=["financial records"])
ALLOWED_KINDS = {
    "assets",
    "liabilities",
    "goals",
    "loans",
    "investments",
    "insurance",
    "tax",
    "business",
    "family",
    "retirement",
    "notifications",
}


def validate_kind(kind: str) -> None:
    if kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=404, detail="This record type is not supported.")


def to_response(record: FinancialRecord) -> dict[str, object]:
    return {
        "id": record.id,
        "kind": record.kind,
        "name": record.name,
        "amount": record.amount,
        "details": record.details,
        "created_at": record.created_at,
    }


@router.get("/{kind}")
def list_records(
    kind: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[dict[str, object]]:
    validate_kind(kind)
    items = db.scalars(
        select(FinancialRecord)
        .where(FinancialRecord.user_id == user.id, FinancialRecord.kind == kind)
        .order_by(FinancialRecord.created_at.desc())
        .limit(500)
    ).all()
    return [to_response(item) for item in items]


@router.post("/{kind}", status_code=status.HTTP_201_CREATED)
def create_record(
    kind: str,
    payload: RecordCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    validate_kind(kind)
    record = FinancialRecord(
        user_id=user.id,
        kind=kind,
        name=payload.name.strip(),
        amount=payload.amount,
        details=payload.model_dump(mode="json")["details"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return to_response(record)


@router.patch("/{kind}/{record_id}")
def update_record(
    kind: str,
    record_id: int,
    payload: RecordUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    validate_kind(kind)
    record = db.scalar(
        select(FinancialRecord).where(
            FinancialRecord.id == record_id,
            FinancialRecord.kind == kind,
            FinancialRecord.user_id == user.id,
        )
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found.")
    changes = payload.model_dump(exclude_unset=True, exclude_none=True, mode="json")
    for key, value in changes.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return to_response(record)


@router.delete("/{kind}/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    kind: str,
    record_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    validate_kind(kind)
    record = db.scalar(
        select(FinancialRecord).where(
            FinancialRecord.id == record_id,
            FinancialRecord.kind == kind,
            FinancialRecord.user_id == user.id,
        )
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found.")
    db.delete(record)
    db.commit()
