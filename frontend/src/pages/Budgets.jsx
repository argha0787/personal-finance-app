import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { financeService } from "../services/financeService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";
import Modal from "../components/common/Modal.jsx";

function BudgetForm({ onClose, onSaved }) {
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try { await financeService.saveBudget({ category, period, limit_amount: Number(limit) }); await onSaved(); onClose(); }
    catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }
  return <Modal title="Create a category budget" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <label className="field"><span>Category</span><input required maxLength={80} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Groceries" /></label>
    <div className="form-row"><label className="field"><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annual">Annual</option></select></label><label className="field"><span>Planned amount</span><input required type="number" min="0.01" step="0.01" value={limit} onChange={(event) => setLimit(event.target.value)} /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save budget"}</button></div>
  </form></Modal>;
}

export default function Budgets() {
  const [items, setItems] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { const [budgets, dashboard] = await Promise.all([financeService.budgets(), financeService.dashboard()]); setItems(budgets); setCurrency(dashboard.currency); setError(""); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const planned = items.reduce((sum, item) => sum + Number(item.limit_amount), 0);
  const spent = items.reduce((sum, item) => sum + Number(item.spent), 0);
  async function remove() {
    try { await financeService.deleteBudget(deleting.id); setDeleting(null); await load(); }
    catch (requestError) { setError(requestError.message); setDeleting(null); }
  }
  return <section>
    <div className="page-heading"><div><p className="eyebrow">PLAN YOUR SPENDING</p><h1>Budgets</h1><p className="muted">Compare your category plans with recorded expenses.</p></div><button className="button button-primary" onClick={() => setAdding(true)}><Plus size={17} /> Add budget</button></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    <div className="summary-grid compact-grid"><article className="summary-card"><span>Planned</span><strong>{formatCurrency(planned, currency)}</strong></article><article className="summary-card"><span>Spent this period</span><strong>{formatCurrency(spent, currency)}</strong></article><article className="summary-card"><span>Remaining</span><strong>{formatCurrency(planned - spent, currency)}</strong></article></div>
    <div className="section-heading"><div><h2>Category allocations</h2><p className="muted">Alert levels are shown at 75%, 90% and 100% utilisation.</p></div></div>
    {loading ? <Loader label="Loading budgets" /> : items.length === 0 ? <div className="empty-state"><div className="empty-icon"><Plus size={22} /></div><h3>No budgets yet</h3><p>Set category limits to see your spending progress.</p><button className="button button-secondary" onClick={() => setAdding(true)}><Plus size={16} /> Create a budget</button></div> : <div className="budget-list">{items.map((item) => {
      const percentage = Number(item.limit_amount) ? Number(item.spent) / Number(item.limit_amount) * 100 : 0;
      return <article className="budget-row" key={item.id}><div className="budget-row-head"><div><strong>{item.category}</strong><span className="status-badge">{item.period}</span></div><button className="icon-button danger-icon" aria-label={`Delete ${item.category} budget`} onClick={() => setDeleting(item)}><Trash2 size={16} /></button></div><div className="progress-track"><span className={percentage >= 100 ? "progress-danger" : percentage >= 90 ? "progress-warning" : ""} style={{ width: `${Math.min(percentage, 100)}%` }} /></div><div className="budget-values"><span>{formatCurrency(item.spent, currency)} spent</span><span>{formatCurrency(item.limit_amount, currency)} planned · {percentage.toFixed(0)}%</span></div>{percentage >= 75 && <p className={`budget-alert ${percentage >= 100 ? "danger-text" : ""}`}><AlertTriangle size={14} />{percentage >= 100 ? "Over budget" : `${percentage.toFixed(0)}% used`}</p>}</article>;
    })}</div>}
    {adding && <BudgetForm onClose={() => setAdding(false)} onSaved={load} />}
    {deleting && <Modal title="Delete budget?" onClose={() => setDeleting(null)}><p className="muted">Remove the {deleting.category} budget? Recorded transactions will not be deleted.</p><div className="form-actions"><button className="button button-quiet" onClick={() => setDeleting(null)}>Cancel</button><button className="button button-danger" onClick={remove}>Delete budget</button></div></Modal>}
  </section>;
}