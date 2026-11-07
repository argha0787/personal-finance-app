import { useState } from "react";
import { Download, FileChartColumn, Info } from "lucide-react";
import { apiUrl } from "../services/api.js";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function exportCsv() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl("/reports/transactions.csv"), { credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Could not export your transactions.");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "transactions.csv";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      setSuccess("Your transaction export has been downloaded.");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return <section><div className="page-heading"><div><p className="eyebrow">INSIGHTS</p><h1>Reports</h1><p className="muted">Export and review the financial records you’ve entered.</p></div></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}{success && <div className="notice notice-success" role="status">{success}</div>}
    <article className="report-card panel"><div className="report-icon"><FileChartColumn size={22} /></div><div className="report-description"><h2>Transaction ledger</h2><p className="muted">A CSV export of your transaction dates, types, descriptions, categories and amounts.</p><span className="status-badge">CSV · all recorded transactions</span></div><button className="button button-secondary" disabled={loading} onClick={exportCsv}><Download size={17} /> {loading ? "Preparing…" : "Export CSV"}</button></article>
    <div className="notice notice-info"><Info size={17} /><span>Exported records contain sensitive financial information. Store and share them carefully. Other report formats and previews are not available yet.</span></div>
  </section>;
}