from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class TransactionCreate(BaseModel):
    account_id: int
    to_account_id: int | None = None
    kind: Literal["income", "expense", "transfer"]
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    description: str = Field(min_length=1, max_length=200)
    category: str = Field(default="Uncategorised", max_length=80)
    payment_method: str = Field(default="Other", max_length=40)
    occurred_at: datetime
    essential: bool = False
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("description", "category", "payment_method")
    @classmethod
    def trim_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("This field must contain at least one non-space character.")
        return normalized

    @model_validator(mode="after")
    def validate_transfer(self) -> "TransactionCreate":
        if self.kind == "transfer" and self.to_account_id is None:
            raise ValueError("Transfers require a destination account.")
        if self.kind != "transfer" and self.to_account_id is not None:
            raise ValueError("Only transfers may have a destination account.")
        if self.kind == "transfer" and self.to_account_id == self.account_id:
            raise ValueError("A transfer must use two different accounts.")
        return self