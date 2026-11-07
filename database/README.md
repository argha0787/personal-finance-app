# Database resources

`schema.sql` is a PostgreSQL reference for the initial application tables.
The authoritative migration workflow is under `backend/migrations/`; run
`alembic upgrade head` from the backend folder.

SQLite is used by default for local development. Set `DATABASE_URL` in the
backend environment to a PostgreSQL SQLAlchemy URL for deployment. Never commit
database files or seed files containing real personal financial information.

No sample user or financial records are inserted by default. Create a user
through the registration endpoint and enter your own records.