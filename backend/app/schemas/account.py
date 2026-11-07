from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    account_type: str = Field(default="cash", max_length=40)
    currency: str = Field(default="INR", pattern="^[A-Za-z]{3}$")
    opening_balance: Decimal = Field(default=Decimal("0"), max_digits=14, decimal_places=2)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    account_type: str | None = Field(default=None, max_length=40)
    currency: str | None = Field(default=None, pattern="^[A-Za-z]{3}$")
    opening_balance: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        return value.upper() if value else value