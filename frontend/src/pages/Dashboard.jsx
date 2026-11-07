import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import CashFlowChart from "../components/charts/CashFlowChart.jsx";
import SpendingBreakdown from "../components/charts/SpendingBreakdown.jsx";
import { financeService } from "../services/financeService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatDate.js";
import Loader from "../components/common/Loader.jsx";

function MetricCard({ label, value, note, href, icon: Icon, tone = "" }) {
  const content = <><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18} /></span></div><strong>{value}</strong><small>{note}</small></>;
  return href ? <Link className="summary-card metric-card" to={href}>{content}</Link> : <article className="summary-card metric-card">{content}</article>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_month");
  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await financeService.dashboard(period)); setError(""); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader label="Putting your finances together" />;
  if (error) return <div className="notice notice-error" role="alert">{error}<button className="button button-secondary" onClick={load}>Try again</button></div>;

  const { summary, currency, period: periodLabel } = data;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const transactionIcon = (kind) => kind === "income" ? ArrowDownLeft : kind === "expense" ? ArrowUpRight : ArrowLeftRight;
  return (
    <section className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div><p className="eyebrow">YOUR FINANCIAL OVERVIEW</p><h1>{greeting}</h1><p className="muted">Here’s your financial picture for <strong>{periodLabel}</strong>.</p></div>
        <div className="heading-actions"><label className="period-picker"><span className="sr-only">Dashboard period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="this_week">This week</option><option value="this_month">This month</option><option value="last_month">Last month</option><option value="this_year">This year</option></select></label><Link className="button button-primary" to="/transactions?new=1"><Plus size={17} /> Add transaction</Link></div>
      </div>
      <div className="summary-grid dashboard-metrics">
        <MetricCard label="Net worth" value={formatCurrency(summary.net_worth, currency)} note="Assets minus liabilities" href="/net-worth" icon={WalletCards} tone="teal" />
        <MetricCard label="Income" value={formatCurrency(summary.income, currency)} note={`${periodLabel} · recorded`} href="/income" icon={ArrowDownLeft} tone="blue" />
        <MetricCard label="Expenses" value={formatCurrency(summary.expenses, currency)} note={`${periodLabel} · recorded`} href="/expenses" icon={ArrowUpRight} tone="orange" />
        <MetricCard label="Savings rate" value={summary.savings_rate === null ? "Not enough data" : `${summary.savings_rate.toFixed(1)}%`} note={summary.savings_rate === null ? "Record income to calculate" : `${formatCurrency(summary.savings, currency)} saved in this period`} href="/financial-health" icon={ArrowLeftRight} tone="purple" />
      </div>
      <div className="dashboard-grid">
        <CashFlowChart data={data.cash_flow} currency={currency} />
        <SpendingBreakdown data={data.spending} currency={currency} period={periodLabel} />
        <article className="panel">
          <div className="panel-heading"><div><h2>Budget progress</h2><p className="muted">Category plans · selected period</p></div><Link className="text-link" to="/budgets">Manage</Link></div>
          {data.budgets.length === 0 ? <div className="inline-empty"><p>No budgets set yet.</p><Link className="button button-secondary button-small" to="/budgets">Create a budget</Link></div> : <div className="budget-list dashboard-budgets">{data.budgets.slice(0, 4).map((budget) => <div className="budget-row" key={budget.id}><div className="budget-row-head"><strong>{budget.category}</strong><span>{formatCurrency(budget.spent, currency)} / {formatCurrency(budget.limit_amount, currency)}</span></div><div className="progress-track"><span className={budget.progress >= 100 ? "progress-danger" : budget.progress >= 90 ? "progress-warning" : ""} style={{ width: `${budget.progress}%` }} /></div></div>)}</div>}
        </article>
        <article className="panel">
          <div className="panel-heading"><div><h2>Recent activity</h2><p className="muted">Your latest recorded transactions</p></div><Link className="text-link" to="/transactions">View all</Link></div>
          {data.recent_transactions.length === 0 ? <div className="inline-empty"><p>Nothing recorded yet. Start with a transaction.</p><Link className="button button-secondary button-small" to="/transactions?new=1">Add transaction</Link></div> : <div className="activity-list">{data.recent_transactions.slice(0, 5).map((item) => { const Icon = transactionIcon(item.kind); return <div className="activity-row" key={item.id}><span className={`transaction-icon ${item.kind}`}><Icon size={16} /></span><div className="activity-description"><strong>{item.description}</strong><span>{item.category} · {formatDate(item.occurred_at)}</span></div><strong className={`amount-${item.kind}`}>{item.kind === "income" ? "+" : item.kind === "expense" ? "−" : ""}{formatCurrency(item.amount, currency)}</strong></div>; })}</div>}
        </article>
      </div>
      <p className="data-note">Totals are based on records you’ve entered. Transfers between your accounts are excluded from income and expenses.</p>
    </section>
  );
}