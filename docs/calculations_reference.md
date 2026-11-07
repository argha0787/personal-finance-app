# Calculation reference

All authoritative calculations run on the backend. Currency values are stored
as fixed-precision decimals; chart rendering may convert values to JavaScript
numbers for display.

## Implemented

- **Account balance** = opening balance + income − expense − outgoing transfers
  + incoming transfers.
- **Period savings** = recorded income − recorded expenses. Transfers are
  excluded. **Savings rate** = savings ÷ income × 100 when income is non-zero;
  otherwise it is reported as unavailable.
- **Budget remaining** = limit − recorded expenses for the budget category and
  period. Utilisation is capped visually at 100%; the amount may exceed the
  limit.
- **Net worth** = recorded account balances + asset records + investment
  records − liability records − loan records. Avoid duplicate asset/investment
  entries and do not enter account cash as a second asset.
- **EMI** for principal `P`, monthly rate `r` and `n` instalments:
  `P × r × (1+r)^n / ((1+r)^n − 1)`. Annual rate is divided by 12; a zero rate
  uses `P / n`. The calculator assumes a fixed rate and monthly on-time
  payments and is an estimate, not a lender quote.
- **Forecast page** projects current cash plus a repeated monthly savings amount
  with an editable annual growth assumption. It does not model debt, investment
  returns, taxes, cash timing or uncertainty bands.

## Not yet implemented

XIRR, CAGR, SIP/SWP, tax, retirement, inflation-adjusted forecasts, portfolio
risk, emergency-fund coverage, health-score weighting and historical net-worth
trends need separately specified and tested assumptions before being displayed
as authoritative.