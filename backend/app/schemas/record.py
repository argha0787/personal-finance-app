from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field, field_validator


class RecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=14, decimal_places=2)
    details: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def trim_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Name must contain at least one non-space character.")
        return normalized


class RecordUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    amount: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    details: dict[str, Any] | None = None

    @field_validator("name")
    @classmethod
    def trim_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Name must contain at least one non-space character.")
        return normalized
