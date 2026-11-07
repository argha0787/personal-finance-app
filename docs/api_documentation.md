# API documentation

Base path: `/api/v1`. Interactive OpenAPI docs are available at `/docs` while
the API is running. Except for health and authentication entry points, routes
require the signed HTTP-only `access_token` cookie. JSON errors use FastAPI's
`detail` field.

## Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account and start session |
| POST | `/auth/login` | Sign in and start session |
| POST | `/auth/logout` | Clear session cookie |
| GET | `/auth/me` | Read current user's profile |
| PATCH | `/users/me` | Change preferred currency |

## Core finance

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/accounts` | List or create accounts |
| PATCH, DELETE | `/accounts/{id}` | Edit or delete an account without transactions |
| GET, POST | `/transactions` | List/filter or create income, expense or transfer |
| PATCH, DELETE | `/transactions/{id}` | Edit or delete a ledger entry |
| GET, POST | `/budgets` | List category budget usage or create/update a limit |
| DELETE | `/budgets/{id}` | Remove a budget |
| GET | `/dashboard` | Dashboard summary, recent activity and six-month cash flow |
| GET, POST | `/records/{kind}` | List/create supported manual finance records |
| PATCH, DELETE | `/records/{kind}/{id}` | Update/delete an owned record |

Record kinds: `assets`, `liabilities`, `goals`, `loans`, `investments`,
`insurance`, `tax`, `business`, `family`, `retirement`, and `notifications`.
Record details are flexible JSON in this early release.

## Tools and integrations

| Method | Path | Purpose |
|---|---|---|
| POST | `/calculators/emi` | Estimate fixed-rate monthly EMI |
| GET | `/reports/transactions.csv` | Download a spreadsheet-safe transaction CSV |
| POST | `/ai/ask` | Ask Gemini about verified dashboard summary data |
| GET | `/health` | Basic API liveness |

The AI route returns `503` if no backend `GEMINI_API_KEY` is configured and
explicit provider errors otherwise. The browser never receives the provider
key. Transfers require two distinct accounts owned by the current user.