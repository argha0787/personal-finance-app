from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    period: str = Field(default="monthly", pattern="^(weekly|monthly|annual)$")
    limit_amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)

    @field_validator("category")
    @classmethod
    def trim_category(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Category must contain at least one non-space character.")
        return normalized