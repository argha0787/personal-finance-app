# Ledgerly — Personal Finance

A private, single-user-first personal finance workspace. The frontend is React
and Vite; the API is FastAPI with SQLAlchemy and supports SQLite for local
development or PostgreSQL for deployment.

## What works today

- Email registration, sign-in and sign-out using an HTTP-only session cookie.
- Accounts and a central income/expense/transfer ledger. Transfers between
  owned accounts are excluded from income and expense totals.
- Category budgets, manually valued assets and liabilities, goals, loans,
  investments, insurance, tax and other record types.
- Dashboard cash flow, spending categories, recent activity and budget usage.
- Net-worth and basic financial-health views, EMI estimate, CSV transaction
  export, and an optional Gemini assistant that receives only a summary.
- Responsive dark interface, validation, empty/loading/error states and reduced
  motion preference.

Tax, retirement, family/business, insurance and investment records are currently
manual organisers rather than specialised workflows. There is no bank sync,
market pricing, tax filing, multi-user sharing, automatic reminders, historical
valuation snapshots or AI action-taking. Forecasts are illustrative only.
See [Project overview](./docs/project_overview.md) and
[API documentation](./docs/api_documentation.md).

## Requirements

- Node.js 20.19+ and npm
- Python 3.10+
- PostgreSQL 15+ for deployment (SQLite is the default local database)

## Configure and run on Windows

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend\.env`. Generate a unique session secret rather than using the
example value:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Set `SECRET_KEY` to that output. The Gemini key is optional; set
`GEMINI_API_KEY` **only in this backend `.env`**, never in React, source
control, screenshots or logs. If a key has been shared in chat or another
untrusted place, revoke it and use a replacement. Set `GEMINI_MODEL` to a
model enabled for the key.

For PostgreSQL, set `DATABASE_URL` to a SQLAlchemy URL such as
`postgresql+psycopg://user:password@localhost:5432/personal_finance` and create
the database first. Keep passwords URL-encoded and private.

Apply the schema and start the API from the `backend` directory:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

API health: `http://localhost:8000/api/v1/health`. Interactive docs:
`http://localhost:8000/docs`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`, create an account, and add at least one account
before recording transactions. The frontend API base URL is
`VITE_API_BASE_URL`; Gemini credentials are not a frontend setting.

## Tests and production build

```powershell
cd backend
python -m pytest tests -q
cd ..\frontend
npm run build
```

Before deployment, use HTTPS, set a strong private `SECRET_KEY`, set
`COOKIE_SECURE=true`, configure `FRONTEND_ORIGINS` to the exact trusted
frontend origin(s), use PostgreSQL, apply Alembic migrations, and configure
backups. The app does not yet include account recovery, rate limiting, or
automated backup operations.

## Project layout

- `frontend/` — React UI, shared components, routes and API services
- `backend/` — FastAPI API, models, validation, calculations and integrations
- `backend/migrations/` — Alembic schema migrations
- `database/` — reference SQL schema and database notes
- `docs/` — design, API, calculation and security guides
- `storage/` — reserved local document/export folders; uploads are not enabled
