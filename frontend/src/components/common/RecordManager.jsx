import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import { financeService } from "../../services/financeService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";
import Loader from "./Loader.jsx";
import Modal from "./Modal.jsx";

const fieldSets = {
  assets: [
    { key: "asset_class", label: "Asset class", placeholder: "Property, cash, vehicle…" },
    { key: "valuation_date", label: "Valuation date", type: "date" },
    { key: "liquidity", label: "Liquidity", type: "select", options: ["Liquid", "Less liquid", "Illiquid"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  liabilities: [
    { key: "debt_type", label: "Debt type", placeholder: "Home, personal, card…" },
    { key: "interest_rate", label: "Interest rate (%)", type: "number" },
    { key: "due_date", label: "Next due date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  goals: [
    { key: "current_amount", label: "Already saved", type: "number" },
    { key: "target_date", label: "Target date", type: "date" },
    { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  loans: [
    { key: "lender", label: "Lender" },
    { key: "interest_rate", label: "Annual interest rate (%)", type: "number" },
    { key: "monthly_emi", label: "Monthly EMI", type: "number" },
    { key: "next_due_date", label: "Next due date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  investments: [
    { key: "instrument", label: "Instrument / asset class" },
    { key: "invested_amount", label: "Invested amount", type: "number" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "as_of_date", label: "Valuation date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  insurance: [
    { key: "provider", label: "Provider" },
    { key: "policy_type", label: "Policy type" },
    { key: "coverage", label: "Coverage amount", type: "number" },
    { key: "renewal_date", label: "Renewal date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  tax: [
    { key: "financial_year", label: "Financial year" },
    { key: "record_type", label: "Record type" },
    { key: "tax_paid", label: "Tax paid / TDS", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  business: [
    { key: "movement_type", label: "Movement type", type: "select", options: ["Owner salary", "Drawings", "Dividend", "Transfer", "Other"] },
    { key: "date", label: "Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  family: [
    { key: "member", label: "Family member" },
    { key: "category", label: "Shared category" },
    { key: "date", label: "Date", type: "date" },
    { key: "notes", label: "Sharing / permissions note", type: "textarea" },
  ],
  retirement: [
    { key: "retirement_age", label: "Retirement age", type: "number" },
    { key: "monthly_contribution", label: "Monthly contribution", type: "number" },
    { key: "assumed_return", label: "Assumed annual return (%)", type: "number" },
    { key: "notes", label: "Assumptions / notes", type: "textarea" },
  ],
  notifications: [
    { key: "due_date", label: "Due date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Upcoming", "Paid", "Dismissed"] },
    { key: "notes", label: "Reminder details", type: "textarea" },
  ],
};

function RecordForm({ kind, record, onClose, onSaved }) {
  const fields = fieldSets[kind] ?? [];
  const [name, setName] = useState(record?.name ?? "");
  const [amount, setAmount] = useState(record?.amount ?? "");
  const [details, setDetails] = useState(() => Object.fromEntries(fields.map((field) => [field.key, record?.details?.[field.key] ?? ""])));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const cleanedDetails = Object.fromEntries(Object.entries(details).filter(([, value]) => value !== ""));
    if (kind === "goals") cleanedDetails.current_amount = Number(cleanedDetails.current_amount || 0);
    try {
      if (record) {
        const history = ["assets", "investments"].includes(kind) && Number(record.amount) !== Number(amount)
          ? [...(record.details?.valuation_history ?? []), { amount: Number(record.amount), as_of: new Date().toISOString() }]
          : record.details?.valuation_history;
        if (history) cleanedDetails.valuation_history = history;
        await financeService.updateRecord(kind, record.id, { name, amount: Number(amount), details: cleanedDetails });
      } else {
        await financeService.createRecord(kind, { name, amount: Number(amount || 0), details: cleanedDetails });
      }
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={record ? "Edit record" : "Add record"} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field"><span>{kind === "goals" ? "Goal name" : "Name"}</span><input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field"><span>{kind === "goals" ? "Target amount" : kind === "liabilities" || kind === "loans" ? "Outstanding amount" : "Current value / amount"}</span><input required type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        {fields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            {field.type === "textarea" ? (
              <textarea rows="3" value={details[field.key]} onChange={(event) => setDetails({ ...details, [field.key]: event.target.value })} />
            ) : field.type === "select" ? (
              <select value={details[field.key]} onChange={(event) => setDetails({ ...details, [field.key]: event.target.value })}>
                <option value="">Select…</option>
                {field.options.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : (
              <input type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "0.01" : undefined} value={details[field.key]} onChange={(event) => setDetails({ ...details, [field.key]: event.target.value })} />
            )}
          </label>
        ))}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save record"}</button></div>
      </form>
    </Modal>
  );
}

export default function RecordManager({ kind, title, description, label = "record", icon: Icon }) {
  const { user } = useAuth();
  const currency = user?.currency ?? "INR";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await financeService.records(kind));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [kind]);
  useEffect(() => { load(); }, [load]);

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await financeService.deleteRecord(kind, deleting.id);
      setDeleting(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">PERSONAL FINANCE</p><h1>{title}</h1><p className="muted">{description}</p></div>
        <button className="button button-primary" onClick={() => setEditing(null)}><Plus size={17} /> Add {label}</button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="summary-grid compact-grid">
        <article className="summary-card"><span>Total {title.toLowerCase()}</span><strong>{formatCurrency(total, currency)}</strong><small>{items.length} {items.length === 1 ? label : `${label}s`} recorded</small></article>
        <article className="summary-card"><span>Latest update</span><strong className="summary-date">{items[0] ? formatDate(items[0].created_at) : "—"}</strong><small>Based on your saved records</small></article>
      </div>
      <div className="section-heading"><div><h2>{title} records</h2><p className="muted">Values are manually entered unless a source is explicitly shown.</p></div></div>
      {loading ? <Loader label={`Loading ${title.toLowerCase()}`} /> : items.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{Icon ? <Icon size={22} /> : <Plus size={22} />}</div><h3>No {title.toLowerCase()} yet</h3><p>Add your first record to start building your financial picture.</p><button className="button button-secondary" onClick={() => setEditing(null)}><Plus size={16} /> Add {label}</button></div>
      ) : (
        <div className="records-list">
          {items.map((item) => {
            const goalProgress = kind === "goals" ? Math.min(100, Number(item.amount) ? Number(item.details?.current_amount || 0) / Number(item.amount) * 100 : 0) : 0;
            const remaining = kind === "goals" ? Math.max(0, Number(item.amount) - Number(item.details?.current_amount || 0)) : 0;
            const targetDate = kind === "goals" && item.details?.target_date ? new Date(item.details.target_date) : null;
            const monthsRemaining = targetDate && !Number.isNaN(targetDate.getTime())
              ? Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / (30.4375 * 24 * 60 * 60 * 1000)))
              : null;
            return (
              <article className="record-row" key={item.id}>
                <div className={`record-icon record-${kind}`} aria-hidden="true">{kind === "liabilities" || kind === "loans" ? <ArrowDownRight size={19} /> : <ArrowUpRight size={19} />}</div>
                <div className="record-main"><strong>{item.name}</strong><span>{item.details?.asset_class || item.details?.debt_type || item.details?.instrument || item.details?.provider || item.details?.lender || item.details?.financial_year || item.details?.member || item.details?.status || item.details?.priority || "Personal record"}</span>
                  {kind === "goals" && <div className="progress-track"><span style={{ width: `${goalProgress}%` }} /></div>}
                </div>
                <div className="record-amount"><strong>{formatCurrency(item.amount, currency)}</strong>{kind === "goals" && <span>{goalProgress.toFixed(0)}% saved</span>}{monthsRemaining && <span>{formatCurrency(remaining / monthsRemaining, currency)} / month · no returns</span>}</div>
                <div className="record-actions"><button className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}><Pencil size={16} /></button><button className="icon-button danger-icon" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={16} /></button></div>
              </article>
            );
          })}
        </div>
      )}
      {editing !== undefined && <RecordForm kind={kind} record={editing || undefined} onClose={() => setEditing(undefined)} onSaved={load} />}
      {deleting && <Modal title="Delete this record?" onClose={() => setDeleting(null)}><p className="muted">“{deleting.name}” will be permanently removed. This can’t be undone.</p><div className="form-actions"><button className="button button-quiet" onClick={() => setDeleting(null)}>Cancel</button><button className="button button-danger" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete record"}</button></div></Modal>}
    </section>
  );
}
