# Project overview

Ledgerly is a React/Vite frontend backed by a FastAPI API. The API is the source
of truth for authenticated records and financial calculations; the browser
does not connect directly to the database.

## Current working scope

The first usable release includes account registration/login, account records,
income/expense/transfer entries, category budgets, dashboard rollups, basic
assets/liabilities/goals/loans/investments and other manual record organisers,
an EMI calculator, a simple scenario page, CSV export and optional Gemini
summary Q&A.

The shared layout and all named modules are navigable. Some modules intentionally
use a common manual-record manager: tax, retirement, family/business,
insurance, loans and investments do not yet have specialised calculations,
automations or domain workflows. Financial-health ratios are limited to the
figures currently available. Read the UI caveats on those pages.

Not implemented: bank aggregation, statement import, receipt/document uploads,
market prices, multi-user household permissions, scheduled notifications,
historical balance snapshots, tax filing/rule updates, account recovery,
background jobs, and a production deployment pipeline.

## Structure

- `frontend/src/components/` — app shell, shared controls and finance modules
- `frontend/src/pages/` — routes and page composition
- `frontend/src/services/` — authenticated API calls
- `backend/app/api/v1/` — authentication, ledger and feature endpoints
- `backend/app/models/` — SQLAlchemy tables
- `backend/app/schemas/` — request validation
- `backend/app/calculations/` and `backend/app/analytics/` — server-side math
- `backend/migrations/` — Alembic migration environment and revisions
- `database/` — reference SQL

## Data flow

The browser sends same-origin-credentialed requests to FastAPI. The API checks
the HTTP-only session cookie, validates inputs, applies ownership rules, and
reads/writes through SQLAlchemy. Money values use decimal database columns.
For Gemini questions, only the user's question and a small verified dashboard
summary are sent to the configured provider from the backend.