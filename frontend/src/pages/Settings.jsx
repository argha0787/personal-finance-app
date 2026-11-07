import { useEffect, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { financeService } from "../services/financeService.js";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { reducedMotion, setReducedMotion } = useTheme();
  const [currency, setCurrency] = useState(user?.currency ?? "INR");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setCurrency(user?.currency ?? "INR"), [user]);
  async function saveCurrency(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    try { const preferences = await financeService.updatePreferences({ currency }); updateUser(preferences); setStatus("Currency preference saved."); }
    catch (requestError) { setError(requestError.message); }
  }
  return <section><div className="page-heading"><div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="muted">Manage display preferences for your personal workspace.</p></div><span className="metric-icon blue"><SlidersHorizontal size={22} /></span></div>
    {status && <div className="notice notice-success" role="status"><Check size={16} />{status}</div>}{error && <div className="notice notice-error" role="alert">{error}</div>}
    <div className="settings-panels"><article className="panel settings-panel"><h2>Preferences</h2><p className="muted">Used for displaying amounts and dates in the app.</p><form className="settings-form" onSubmit={saveCurrency}><label className="field"><span>Default currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value)}>{["INR", "USD", "EUR", "GBP", "CAD", "AUD"].map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary">Save preferences</button></form></article>
      <article className="panel settings-panel"><h2>Appearance & accessibility</h2><p className="muted">The app uses its dark financial dashboard theme.</p><label className="setting-toggle"><span><strong>Reduce motion</strong><small>Limit non-essential interface transitions.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label></article>
      <article className="panel settings-panel"><h2>Privacy & data</h2><p className="muted">Your financial records are attached to your signed-in account. Use CSV export from Reports to download your ledger.</p><span className="status-badge">Bank connections are not enabled</span></article>
    </div>
  </section>;
}