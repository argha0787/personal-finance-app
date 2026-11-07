from decimal import Decimal


def sip_future_value(monthly_contribution: Decimal, annual_rate_percent: Decimal, months: int) -> Decimal:
    monthly_rate = annual_rate_percent / Decimal(1200)
    if monthly_rate == 0:
        return monthly_contribution * months
    factor = (Decimal(1) + monthly_rate) ** months
    return monthly_contribution * (factor - Decimal(1)) / monthly_rate