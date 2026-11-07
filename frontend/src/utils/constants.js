export const TRANSACTION_TYPES = ["income", "expense", "transfer"];

export const NAVIGATION_GROUPS = [
  {
    label: "Overview",
    links: [
      ["Dashboard", "/"],
      ["Transactions", "/transactions"],
    ],
  },
  {
    label: "Cash flow",
    links: [
      ["Income", "/income"],
      ["Expenses", "/expenses"],
      ["Budgets", "/budgets"],
      ["Accounts", "/accounts"],
    ],
  },
  {
    label: "Wealth",
    links: [
      ["Assets", "/assets"],
      ["Liabilities", "/liabilities"],
      ["Net worth", "/net-worth"],
      ["Financial health", "/financial-health"],
      ["Goals", "/goals"],
      ["Loans", "/loans"],
      ["Investments", "/investments"],
    ],
  },
  {
    label: "Plan & learn",
    links: [
      ["Tax management", "/tax-management"],
      ["Insurance", "/insurance"],
      ["Retirement", "/retirement"],
      ["Calculators", "/calculators"],
      ["Forecasting", "/forecasting"],
      ["AI assistant", "/ai-assistant"],
      ["Reports", "/reports"],
      ["Notifications", "/notifications"],
      ["Business finance", "/business-finance"],
      ["Family finance", "/family-finance"],
      ["Settings", "/settings"],
    ],
  },
];