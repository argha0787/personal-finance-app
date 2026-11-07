from decimal import Decimal


def calculate_emi(principal: Decimal, annual_rate_percent: Decimal, months: int) -> tuple[Decimal, Decimal, Decimal]:
    monthly_rate = annual_rate_percent / Decimal(1200)
    if monthly_rate == 0:
        payment = principal / months
    else:
        factor = (Decimal(1) + monthly_rate) ** months
        payment = principal * monthly_rate * factor / (factor - Decimal(1))
    total_payment = payment * months
    return payment, total_payment, total_payment - principal