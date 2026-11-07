from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.calculations.compound_interest import compound_future_value
from app.calculations.emi import calculate_emi as compute_emi
from app.calculations.inflation import inflation_adjusted_value
from app.calculations.roi import return_on_investment
from app.calculations.sip import sip_future_value

router = APIRouter(prefix="/calculators", tags=["calculators"])
CENT = Decimal("0.01")


def money(value: Decimal) -> str:
    return str(value.quantize(CENT, rounding=ROUND_HALF_UP))


class EmiRequest(BaseModel):
    principal: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    annual_rate: Decimal = Field(ge=0, le=100, max_digits=6, decimal_places=3)
    months: int = Field(gt=0, le=1200)


@router.post("/emi")
def calculate_emi(payload: EmiRequest) -> dict[str, str]:
    payment, total, interest = compute_emi(payload.principal, payload.annual_rate, payload.months)
    return {
        "monthly_payment": money(payment),
        "total_payment": money(total),
        "total_interest": money(interest),
        "assumption": "Fixed annual rate converted to a monthly rate; payments are made monthly.",
    }


class CompoundRequest(BaseModel):
    principal: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    annual_rate: Decimal = Field(ge=0, le=100, max_digits=6, decimal_places=3)
    years: int = Field(gt=0, le=100)
    compounds_per_year: int = Field(default=12, ge=1, le=365)


@router.post("/compound-interest")
def calculate_compound_interest(payload: CompoundRequest) -> dict[str, str]:
    value = compound_future_value(payload.principal, payload.annual_rate, payload.years, payload.compounds_per_year)
    return {
        "future_value": money(value),
        "growth": money(value - payload.principal),
        "assumption": f"Fixed annual rate compounded {payload.compounds_per_year} times each year.",
    }


class SipRequest(BaseModel):
    monthly_contribution: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    annual_rate: Decimal = Field(ge=0, le=100, max_digits=6, decimal_places=3)
    months: int = Field(gt=0, le=1200)


@router.post("/sip")
def calculate_sip(payload: SipRequest) -> dict[str, str]:
    value = sip_future_value(payload.monthly_contribution, payload.annual_rate, payload.months)
    invested = payload.monthly_contribution * payload.months
    return {
        "future_value": money(value),
        "invested_amount": money(invested),
        "estimated_growth": money(value - invested),
        "assumption": "Fixed monthly contributions at the end of each month; return is constant and not guaranteed.",
    }


class InflationRequest(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    annual_inflation: Decimal = Field(ge=0, le=100, max_digits=6, decimal_places=3)
    years: int = Field(gt=0, le=100)


@router.post("/inflation")
def calculate_inflation(payload: InflationRequest) -> dict[str, str]:
    adjusted = inflation_adjusted_value(payload.amount, payload.annual_inflation, payload.years)
    future_cost = compound_future_value(payload.amount, payload.annual_inflation, payload.years, 1)
    return {
        "today_value_of_future_amount": money(adjusted),
        "estimated_future_cost": money(future_cost),
        "assumption": "Uses a constant annual inflation assumption; actual inflation varies.",
    }


class RoiRequest(BaseModel):
    initial_value: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    current_value: Decimal = Field(ge=0, max_digits=14, decimal_places=2)


@router.post("/roi")
def calculate_roi(payload: RoiRequest) -> dict[str, str]:
    return {
        "roi_percent": str(return_on_investment(payload.initial_value, payload.current_value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
        "gain_or_loss": money(payload.current_value - payload.initial_value),
        "assumption": "Simple return on the entered values; excludes fees, taxes, and timing of cash flows.",
    }