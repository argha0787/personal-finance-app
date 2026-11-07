from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.main import app
from app import models  # noqa: F401


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    test_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db() -> Generator[Session, None, None]:
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def register(client: TestClient, email: str = "owner@example.com") -> TestClient:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Finance Owner", "email": email, "password": "valid-password-123"},
    )
    assert response.status_code == 201
    return client


def test_registration_normalizes_profile_fields(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "  Finance Owner  ", "email": " OWNER@EXAMPLE.COM ", "password": "valid-password-123"},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Finance Owner"
    assert response.json()["email"] == "owner@example.com"
    assert client.post(
        "/api/v1/auth/register",
        json={"name": "   ", "email": "second@example.com", "password": "valid-password-123"},
    ).status_code == 422


def test_registration_ledger_transfers_and_dashboard(client: TestClient) -> None:
    register(client)
    first = client.post("/api/v1/accounts", json={"name": "Main", "currency": "INR", "opening_balance": 1000})
    second = client.post("/api/v1/accounts", json={"name": "Savings", "currency": "INR", "opening_balance": 0})
    assert first.status_code == second.status_code == 201
    main_id, savings_id = first.json()["id"], second.json()["id"]

    assert client.post(
        "/api/v1/transactions",
        json={"account_id": main_id, "kind": "income", "amount": 5000, "description": "Salary", "occurred_at": "2026-11-07T10:00:00"},
    ).status_code == 201
    assert client.post(
        "/api/v1/transactions",
        json={"account_id": main_id, "kind": "expense", "amount": 1200, "description": "Groceries", "category": "Food", "occurred_at": "2026-11-07T11:00:00"},
    ).status_code == 201
    assert client.post(
        "/api/v1/transactions",
        json={"account_id": main_id, "to_account_id": savings_id, "kind": "transfer", "amount": 700, "description": "Move to savings", "occurred_at": "2026-11-07T12:00:00"},
    ).status_code == 201

    dashboard = client.get("/api/v1/dashboard")
    assert dashboard.status_code == 200
    summary = dashboard.json()["summary"]
    assert float(summary["income"]) == 5000
    assert float(summary["expenses"]) == 1200
    assert float(summary["cash_balance"]) == 4800
    assert float(summary["savings"]) == 3800
    assert len(client.get("/api/v1/transactions?kind=transfer").json()) == 1


def test_users_cannot_access_another_users_records(client: TestClient) -> None:
    register(client, "first@example.com")
    account = client.post("/api/v1/accounts", json={"name": "Main", "currency": "INR", "opening_balance": 0}).json()
    transaction = client.post(
        "/api/v1/transactions",
        json={"account_id": account["id"], "kind": "expense", "amount": 5, "description": "Private", "occurred_at": "2026-11-07T10:00:00"},
    ).json()
    client.post("/api/v1/auth/logout")
    register(client, "second@example.com")
    assert client.delete(f"/api/v1/transactions/{transaction['id']}").status_code == 404
    assert client.get("/api/v1/transactions").json() == []


def test_transfer_requires_a_distinct_owned_destination(client: TestClient) -> None:
    register(client)
    account = client.post("/api/v1/accounts", json={"name": "Main", "currency": "INR", "opening_balance": 0}).json()
    response = client.post(
        "/api/v1/transactions",
        json={"account_id": account["id"], "to_account_id": account["id"], "kind": "transfer", "amount": 1, "description": "Invalid", "occurred_at": "2026-11-07T10:00:00"},
    )
    assert response.status_code == 422


def test_emi_calculator_handles_zero_interest(client: TestClient) -> None:
    response = client.post(
        "/api/v1/calculators/emi",
        json={"principal": "1200.00", "annual_rate": "0", "months": 12},
    )
    assert response.status_code == 200
    assert response.json()["monthly_payment"] == "100.00"
    assert response.json()["total_interest"] == "0.00"


def test_budget_usage_and_record_data_are_user_scoped(client: TestClient) -> None:
    register(client)
    account = client.post("/api/v1/accounts", json={"name": "Main", "currency": "INR", "opening_balance": 0}).json()
    assert client.post(
        "/api/v1/transactions",
        json={"account_id": account["id"], "kind": "expense", "amount": 125, "description": "Groceries", "category": "Food", "occurred_at": "2026-11-07T10:00:00"},
    ).status_code == 201
    budget = client.post("/api/v1/budgets", json={"category": "Food", "period": "monthly", "limit_amount": 500})
    assert budget.status_code == 201
    assert float(budget.json()["spent"]) == 125
    goal = client.post("/api/v1/records/goals", json={"name": "Emergency fund", "amount": 1000, "details": {"current_amount": 250}})
    assert goal.status_code == 201
    assert client.get("/api/v1/records/goals").json()[0]["name"] == "Emergency fund"
    client.post("/api/v1/auth/logout")
    register(client, "other@example.com")
    assert client.get("/api/v1/records/goals").json() == []
    assert client.get("/api/v1/budgets").json() == []


def test_csv_export_escapes_spreadsheet_formulas(client: TestClient) -> None:
    register(client)
    account = client.post("/api/v1/accounts", json={"name": "Main", "currency": "INR", "opening_balance": 0}).json()
    client.post(
        "/api/v1/transactions",
        json={"account_id": account["id"], "kind": "expense", "amount": 1, "description": "=1+1", "category": "@SUM", "occurred_at": "2026-11-07T10:00:00"},
    )
    exported = client.get("/api/v1/reports/transactions.csv")
    assert exported.status_code == 200
    assert "'=1+1" in exported.text
    assert "'@SUM" in exported.text
