import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { financeService } from "../services/financeService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";

export default function FinancialHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { financeService.dashboard().then(setData).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!data) return <Loader label="Reviewing recorded indicators" />;
  const { summary, currency } = data;
  const expenses = Number(summary.expenses);
  const income = Number(summary.income);
  const rate = summary.savings_rate;
  const indicators = [
    ["Savings rate", rate === null ? "Not enough data" : `${rate.toFixed(1)}%`, "Savings ÷ income. A zero-income period is not assigned a misleading zero."],
    ["Expense ratio", income ? `${(expenses / income * 100).toFixed(1)}%` : "Not enough data", "Recorded expenses ÷ recorded income for the current period."],
    ["Monthly savings", formatCurrency(summary.savings, currency), "Income less expenses; transfers between owned accounts are excluded."],
    ["Recorded net worth", formatCurrency(summary.net_worth, currency), "Current recorded assets and account balances less recorded liabilities."],
  ];
  return <section><div className="page-heading"><div><p className="eyebrow">UNDERSTAND YOUR MONEY</p><h1>Financial health</h1><p className="muted">An explainable view of your recorded indicators—not a universal pass/fail score.</p></div><span className="metric-icon teal"><HeartPulse size={22} /></span></div>
    <div className="notice notice-info">There isn’t enough data to calculate emergency coverage, investment performance or debt ratios yet. Add records to see more. This page does not provide a financial health score.</div>
    <div className="health-grid">{indicators.map(([label, value, explanation]) => <article className="panel health-card" key={label}><span className="eyebrow">{label.toUpperCase()}</span><strong>{value}</strong><p className="muted">{explanation}</p></article>)}</div>
  </section>;
}