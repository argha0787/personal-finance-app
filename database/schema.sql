-- Reference schema for PostgreSQL. Apply the Alembic migration in backend/migrations
-- for the authoritative upgrade/downgrade workflow.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR'
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    account_type VARCHAR(40) NOT NULL DEFAULT 'cash',
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0
);
CREATE INDEX ix_accounts_user_id ON accounts(user_id);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    kind VARCHAR(16) NOT NULL CHECK (kind IN ('income', 'expense', 'transfer')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Uncategorised',
    payment_method VARCHAR(40) NOT NULL DEFAULT 'Other',
    occurred_at TIMESTAMP NOT NULL,
    essential BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    CHECK ((kind = 'transfer' AND to_account_id IS NOT NULL AND to_account_id <> account_id)
        OR (kind <> 'transfer' AND to_account_id IS NULL))
);
CREATE INDEX ix_transactions_user_id ON transactions(user_id);
CREATE INDEX ix_transactions_account_id ON transactions(account_id);
CREATE INDEX ix_transactions_kind ON transactions(kind);
CREATE INDEX ix_transactions_occurred_at ON transactions(occurred_at);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly', 'annual')),
    limit_amount NUMERIC(14, 2) NOT NULL CHECK (limit_amount > 0),
    CONSTRAINT uq_budget_user_category_period UNIQUE (user_id, category, period)
);
CREATE INDEX ix_budgets_user_id ON budgets(user_id);

CREATE TABLE financial_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(32) NOT NULL,
    name VARCHAR(160) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    details JSON NOT NULL DEFAULT '{}'::json,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_financial_records_user_id ON financial_records(user_id);
CREATE INDEX ix_financial_records_kind ON financial_records(kind);