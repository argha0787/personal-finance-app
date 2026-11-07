from decimal import Decimal


def inflation_adjusted_value(amount: Decimal, annual_inflation_percent: Decimal, years: int) -> Decimal:
    return amount / (Decimal(1) + annual_inflation_percent / Decimal(100)) ** years