from decimal import Decimal


def compound_future_value(principal: Decimal, annual_rate_percent: Decimal, years: int, compounds_per_year: int) -> Decimal:
    rate_per_period = annual_rate_percent / Decimal(100 * compounds_per_year)
    periods = years * compounds_per_year
    return principal * (Decimal(1) + rate_per_period) ** periods