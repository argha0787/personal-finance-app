import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { financeService } from "../services/financeService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/common/Loader.jsx";
import Modal from "../components/common/Modal.jsx";

function AccountForm({ account, defaultCurrency, onClose, onSaved }) {
  const [values, setValues] = useState({
    name: account?.name ?? "",
    account_type: account?.account_type ?? "bank",
    currency: account?.currency ?? defaultCurrency,
    opening_balance: account?.opening_balance ?? "0",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { ...values, opening_balance: Number(values.opening_balance) };
      if (account) await financeService.updateAccount(account.id, body);
      else await financeService.createAccount(body);
      await onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }
  return <Modal title={account ? "Edit account" : "Add account"} onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <label className="field"><span>Account name</span><input required maxLength={120} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} placeholder="e.g. Everyday account" /></label>
    <div className="form-row"><label className="field"><span>Type</span><select value={values.account_type} onChange={(event) => setValues({ ...values, account_type: event.target.value })}>{["cash", "bank", "savings", "credit", "other"].map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label><label className="field"><span>Currency</span><input required minLength={3} maxLength={3} value={values.currency} onChange={(event) => setValues({ ...values, currency: event.target.value.toUpperCase() })} /></label></div>
    <label className="field"><span>Opening balance</span><input required type="number" step="0.01" value={values.opening_balance} onChange={(event) => setValues({ ...values, opening_balance: event.target.value })} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save account"}</button></div>
  </form></Modal>;
}

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, dashboard] = await Promise.all([financeService.accounts(), financeService.dashboard()]);
      setAccounts(list);
      setCurrency(dashboard.currency);
      setError("");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const balance = accounts.reduce((total, account) => total + Number(account.balance || 0), 0);
  async function remove() {
    setBusy(true);
    try { await financeService.deleteAccount(deleting.id); setDeleting(null); await load(); }
    catch (requestError) { setError(requestError.message); setDeleting(null); }
    finally { setBusy(false); }
  }
  return <section>
    <div className="page-heading"><div><p className="eyebrow">MONEY FLOW</p><h1>Accounts</h1><p className="muted">Keep your recorded cash and account balances in one place.</p></div><button className="button button-primary" onClick={() => setEditing(null)}><Plus size={17} /> Add account</button></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    <div className="summary-grid compact-grid"><article className="summary-card"><span>Recorded balances</span><strong>{formatCurrency(balance, currency)}</strong><small>Calculated from opening balances and ledger entries</small></article><article className="summary-card"><span>Accounts</span><strong>{accounts.length}</strong><small>Manually recorded · no bank connection</small></article></div>
    <div className="section-heading"><div><h2>Your accounts</h2><p className="muted">Transfers between your own accounts don’t count as income or spending.</p></div></div>
    {loading ? <Loader label="Loading accounts" /> : accounts.length === 0 ? <div className="empty-state"><div className="empty-icon"><Wallet size={22} /></div><h3>No accounts added</h3><p>Create a cash or bank account before adding transactions.</p><button className="button button-secondary" onClick={() => setEditing(null)}><Plus size={16} /> Add account</button></div> : <div className="account-grid">{accounts.map((account) => <article className="account-card" key={account.id}><div className="account-card-top"><span className="record-icon"><Building2 size={19} /></span><span className="status-badge">{account.account_type}</span></div><strong>{account.name}</strong><span className="muted">Opening {formatCurrency(account.opening_balance, account.currency)}</span><div className="account-balance">{formatCurrency(account.balance, account.currency)}</div><div className="record-actions"><button className="icon-button" aria-label={`Edit ${account.name}`} onClick={() => setEditing(account)}><Pencil size={16} /></button><button className="icon-button danger-icon" aria-label={`Delete ${account.name}`} onClick={() => setDeleting(account)}><Trash2 size={16} /></button></div></article>)}</div>}
    {editing !== undefined && <AccountForm account={editing || undefined} defaultCurrency={user?.currency ?? "INR"} onClose={() => setEditing(undefined)} onSaved={load} />}
    {deleting && <Modal title="Delete account?" onClose={() => setDeleting(null)}><p className="muted">Delete “{deleting.name}”? Accounts with transactions cannot be deleted.</p><div className="form-actions"><button className="button button-quiet" onClick={() => setDeleting(null)}>Cancel</button><button className="button button-danger" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete account"}</button></div></Modal>}
  </section>;
}