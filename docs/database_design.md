# Database design

The application uses SQLAlchemy models and Alembic migrations. The current
initial migration is `backend/migrations/versions/0001_initial_schema.py`;
`database/schema.sql` is a PostgreSQL reference schema. Apply changes with
`alembic upgrade head` from `backend/`.

## Tables

- **users** — login identity, password hash and preferred display currency.
- **accounts** — manually recorded account name/type/currency/opening balance.
- **transactions** — the central ledger. Each row is income, expense or an
  internal transfer, with a source account and optional destination account.
- **budgets** — category limits by period, unique per user/category/period.
- **financial_records** — user-scoped details for manually tracked assets,
  liabilities, goals, loans, investments, insurance, tax and other modules.
  `amount` uses fixed precision; `details` stores non-monetary module fields.

All records are scoped to a user by foreign key. Amounts use `NUMERIC(14, 2)`,
not floating point. Timestamps are stored in UTC as naive database values and
serialized as UTC ISO strings at the API boundary.

## Accounting rules

Income increases an account and contributes to money-in. Expenses reduce an
account and contribute to money-out. A transfer reduces the source account and
increases the destination, but is not income or an expense. Account balances
are calculated from the opening balance and ledger rather than separately
maintained counters.

Recorded assets and investments both contribute to total assets. Do not enter a
holding in both collections. Account balances represent cash/bank accounts;
avoid adding those same balances a second time as assets. All accounts must
match the profile currency because exchange conversion is not implemented.

Financial-record details are flexible JSON for the early product stage; they
are not a replacement for validated, specialised domain tables. Historical
asset valuations and net-worth snapshots are not yet persisted. The
transactions CSV export escapes spreadsheet formula prefixes.

## Local database

SQLite is the default for local development. PostgreSQL uses the psycopg 3
driver and is recommended for deployment. Foreign-key ownership is checked in
the API as well as represented by database constraints. Configure backups and
test restore procedures before using real financial records.
