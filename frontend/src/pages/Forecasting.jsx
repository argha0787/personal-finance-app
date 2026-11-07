import { useEffect, useState } from "react";
import { Info, TrendingUp } from "lucide-react";
import { financeService } from "../services/financeService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";

export default function Forecasting() {
  const [data, setData] = useState(null);
  const [months, setMonths] = useState(12);
  const [growth, setGrowth] = useState(3);
  const [error, setError] = useState("");
  useEffect(() => { financeService.dashboard().then(setData).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!data) return <Loader label="Loading recorded cash flow" />;
  const monthlySavings = Number(data.summary.savings);
  const currentCash = Number(data.summary.cash_balance);
  const projected = currentCash + Array.from({ length: Number(months) }, (_, index) => monthlySavings * (1 + Number(growth) / 100) ** (index / 12)).reduce((a, b) => a + b, 0);
  return <section><div className="page-heading"><div><p className="eyebrow">SCENARIOS</p><h1>Forecasting</h1><p className="muted">Explore a simple scenario using the current month’s recorded savings.</p></div><span className="metric-icon purple"><TrendingUp size={22} /></span></div>
    <div className="forecast-layout"><article className="panel"><h2>Assumptions</h2><p className="muted">Change the assumptions to see an illustrative result.</p><div className="form-stack"><label className="field"><span>Projection period (months)</span><input type="number" min="1" max="600" value={months} onChange={(event) => setMonths(event.target.value)} /></label><label className="field"><span>Annual savings growth (%)</span><input type="number" min="-100" max="100" step="0.1" value={growth} onChange={(event) => setGrowth(event.target.value)} /></label><div className="notice notice-info"><Info size={16} /><span>Assumes this month’s savings continue and grow at the entered rate. Actual income, expenses and returns can differ.</span></div></div></article>
      <article className="panel forecast-result"><p className="eyebrow">ILLUSTRATIVE SCENARIO · {months} MONTHS</p><span className="muted">Cash balance plus assumed savings</span><strong>{formatCurrency(projected, data.currency)}</strong><p className="muted">Starting recorded cash: {formatCurrency(currentCash, data.currency)}</p><p className="muted">Monthly savings input: {formatCurrency(monthlySavings, data.currency)}</p></article></div>
  </section>;
}