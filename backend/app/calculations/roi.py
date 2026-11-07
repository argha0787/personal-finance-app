from decimal import Decimal


def return_on_investment(initial_value: Decimal, current_value: Decimal) -> Decimal:
    return (current_value - initial_value) / initial_value * Decimal(100)