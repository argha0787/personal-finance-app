import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { financeService } from "../services/financeService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";

export default function NetWorth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { financeService.dashboard().then(setData).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!data) return <Loader label="Calculating recorded net worth" />;
  const { summary, currency } = data;
  return <section><div className="page-heading"><div><p className="eyebrow">YOUR WEALTH</p><h1>Net worth</h1><p className="muted">A point-in-time estimate from your saved records and account balances.</p></div></div>
    <article className="net-worth-hero"><span>Recorded net worth</span><strong>{formatCurrency(summary.net_worth, currency)}</strong><small>Assets minus liabilities · update valuations to keep this figure current</small></article>
    <div className="summary-grid"><Link className="summary-card metric-card" to="/assets"><div className="metric-top"><span>Assets & cash</span><span className="metric-icon teal"><ArrowUpRight size={18} /></span></div><strong>{formatCurrency(summary.assets, currency)}</strong><small>Includes accounts and investment records</small></Link><Link className="summary-card metric-card" to="/liabilities"><div className="metric-top"><span>Liabilities</span><span className="metric-icon orange"><ArrowDownRight size={18} /></span></div><strong>{formatCurrency(summary.liabilities, currency)}</strong><small>Recorded debt balances</small></Link><Link className="summary-card metric-card" to="/accounts"><div className="metric-top"><span>Cash accounts</span><span className="metric-icon blue"><WalletCards size={18} /></span></div><strong>{formatCurrency(summary.cash_balance, currency)}</strong><small>Opening balance plus ledger movements</small></Link></div>
    <div className="notice notice-info">Historical snapshots are not yet stored. This view reflects current records only. Avoid entering the same holding both as an asset and as an investment.</div>
  </section>;
}