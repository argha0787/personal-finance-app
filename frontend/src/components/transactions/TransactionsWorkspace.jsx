import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { financeService } from "../../services/financeService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";
import Loader from "../common/Loader.jsx";
import Modal from "../common/Modal.jsx";

function localDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function localDateTimeFrom(value) {
  if (!value) return localDateTime();
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function TransactionForm({ accounts, transaction, initialKind, onClose, onSaved }) {
  const [values, setValues] = useState(() => ({
    kind: transaction?.kind ?? initialKind ?? "expense",
    amount: transaction?.amount ?? "",
    description: transaction?.description ?? "",
    category: transaction?.category ?? "",
    account_id: transaction?.account_id ?? accounts[0]?.id ?? "",
    to_account_id: transaction?.to_account_id ?? "",
    payment_method: transaction?.payment_method ?? "UPI",
    occurred_at: localDateTimeFrom(transaction?.occurred_at),
    essential: transaction?.essential ?? false,
    notes: transaction?.notes ?? "",
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...values,
      amount: Number(values.amount),
      account_id: Number(values.account_id),
      to_account_id: values.kind === "transfer" ? Number(values.to_account_id) : null,
      occurred_at: new Date(values.occurred_at).toISOString(),
      category: values.category || (values.kind === "income" ? "Income" : values.kind === "transfer" ? "Transfer" : "Uncategorised"),
    };
    try {
      if (transaction) await financeService.updateTransaction(transaction.id, body);
      else await financeService.createTransaction(body);
      await onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={transaction ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field"><span>Type</span><select value={values.kind} onChange={(event) => change("kind", event.target.value)}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></select></label>
        <label className="field"><span>Description</span><input required maxLength={200} value={values.description} onChange={(event) => change("description", event.target.value)} placeholder="What was this for?" /></label>
        <div className="form-row">
          <label className="field"><span>Amount</span><input required type="number" min="0.01" step="0.01" value={values.amount} onChange={(event) => change("amount", event.target.value)} /></label>
          <label className="field"><span>Date and time</span><input required type="datetime-local" value={values.occurred_at} onChange={(event) => change("occurred_at", event.target.value)} /></label>
        </div>
        <label className="field"><span>{values.kind === "transfer" ? "From account" : "Account"}</span><select required value={values.account_id} onChange={(event) => change("account_id", event.target.value)}><option value="">Select an account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
        {values.kind === "transfer" && <label className="field"><span>To account</span><select required value={values.to_account_id} onChange={(event) => change("to_account_id", event.target.value)}><option value="">Select destination account</option>{accounts.filter((account) => account.id !== Number(values.account_id)).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}
        <div className="form-row">
          <label className="field"><span>Category</span><input maxLength={80} value={values.category} onChange={(event) => change("category", event.target.value)} placeholder="e.g. Housing" /></label>
          <label className="field"><span>Payment method</span><select value={values.payment_method} onChange={(event) => change("payment_method", event.target.value)}>{["UPI", "Cash", "Debit card", "Credit card", "Bank transfer", "Other"].map((method) => <option key={method}>{method}</option>)}</select></label>
        </div>
        {values.kind === "expense" && <label className="checkbox-field"><input type="checkbox" checked={values.essential} onChange={(event) => change("essential", event.target.checked)} /><span>Essential spending</span></label>}
        <label className="field"><span>Notes <small>Optional</small></span><textarea rows="2" maxLength={2000} value={values.notes} onChange={(event) => change("notes", event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {accounts.length === 0 && <p className="form-error">Create an account first to record a transaction.</p>}
        <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving || accounts.length === 0}>{saving ? "Saving…" : transaction ? "Save changes" : "Add transaction"}</button></div>
      </form>
    </Modal>
  );
}

export default function TransactionsWorkspace({ presetKind }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [kind, setKind] = useState(presetKind ?? "");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const currency = user?.currency ?? "INR";

  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [transactions, accountList] = await Promise.all([
        financeService.transactions({ kind, search: query.trim() }),
        financeService.accounts(),
      ]);
      setItems(transactions);
      setAccounts(accountList);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [kind, query]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const accountNames = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);
  const totals = items.reduce((result, item) => {
    if (item.kind === "income") result.income += Number(item.amount);
    if (item.kind === "expense") result.expenses += Number(item.amount);
    return result;
  }, { income: 0, expenses: 0 });

  async function remove() {
    setBusy(true);
    try {
      await financeService.deleteTransaction(deleting.id);
      setDeleting(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  const title = presetKind === "income" ? "Income" : presetKind === "expense" ? "Expenses" : "Transactions";
  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">MONEY FLOW</p><h1>{title}</h1><p className="muted">{presetKind === "income" ? "Track received and expected money." : presetKind === "expense" ? "Understand where your money goes." : "One clear ledger for every movement of money."}</p></div>
        <button className="button button-primary" onClick={() => setEditing(null)}><Plus size={17} /> Add {presetKind === "income" ? "income" : presetKind === "expense" ? "expense" : "transaction"}</button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="summary-grid compact-grid">
        <article className="summary-card"><span>Money in · filtered results</span><strong>{formatCurrency(totals.income, currency)}</strong></article>
        <article className="summary-card"><span>Money out · filtered results</span><strong>{formatCurrency(totals.expenses, currency)}</strong></article>
        <article className="summary-card"><span>Net movement</span><strong>{formatCurrency(totals.income - totals.expenses, currency)}</strong></article>
      </div>
      <div className="toolbar">
        <label className="search-field"><Search size={17} /><input aria-label="Search transaction descriptions" placeholder="Search descriptions" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        {!presetKind && <label className="filter-field"><span className="sr-only">Transaction type</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option><option value="transfer">Transfers</option></select></label>}
        <span className="muted toolbar-count">{items.length} records</span>
      </div>
      {loading ? <Loader label="Loading transactions" /> : items.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><ArrowLeftRight size={22} /></div><h3>No matching transactions</h3><p>Add an entry or adjust your search filters.</p><button className="button button-secondary" onClick={() => setEditing(null)}><Plus size={16} /> Add transaction</button></div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Transactions list. Scroll horizontally to view all columns." tabIndex={0}>
          <table><thead><tr><th>Description</th><th>Category</th><th>Account</th><th>Date</th><th>Type</th><th className="align-right">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{items.map((item) => {
              const transfer = item.kind === "transfer";
              const Icon = transfer ? ArrowLeftRight : item.kind === "income" ? ArrowDownLeft : ArrowUpRight;
              return <tr key={item.id}>
                <td><div className="transaction-title"><span className={`transaction-icon ${item.kind}`}><Icon size={15} /></span><span><strong>{item.description}</strong><small>{item.payment_method ?? (transfer ? "Internal transfer" : "")}</small></span></div></td>
                <td>{item.category}</td><td>{accountNames.get(item.account_id) ?? "Account"}</td><td>{formatDate(item.occurred_at)}</td>
                <td><span className={`status-badge ${item.kind}`}>{transfer ? "Transfer" : item.kind}</span></td>
                <td className={`align-right amount-${item.kind}`}>{item.kind === "income" ? "+" : item.kind === "expense" ? "−" : ""}{formatCurrency(item.amount, currency)}</td>
                <td><div className="row-actions"><button className="icon-button" aria-label={`Edit ${item.description}`} onClick={() => setEditing(item)}><Pencil size={15} /></button><button className="icon-button danger-icon" aria-label={`Delete ${item.description}`} onClick={() => setDeleting(item)}><Trash2 size={15} /></button></div></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
      {editing !== undefined && <TransactionForm accounts={accounts} transaction={editing || undefined} initialKind={presetKind} onClose={() => setEditing(undefined)} onSaved={load} />}
      {deleting && <Modal title="Delete transaction?" onClose={() => setDeleting(null)}><p className="muted">This will permanently remove “{deleting.description}”. Account balances and dashboard totals will update.</p><div className="form-actions"><button className="button button-quiet" onClick={() => setDeleting(null)}>Cancel</button><button className="button button-danger" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete transaction"}</button></div></Modal>}
    </section>
  );
}
