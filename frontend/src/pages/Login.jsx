import { useState } from "react";
import { ArrowRight, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { await login(email, password); navigate("/", { replace: true }); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-card">
    <Link className="brand auth-brand" to="/"><span className="brand-mark">L</span><span>ledgerly</span></Link>
    <p className="eyebrow">WELCOME BACK</p><h1>Sign in</h1><p className="muted">Your complete financial picture, in one place.</p>
    <form className="form-stack auth-form" onSubmit={submit}>
      <label className="field"><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <ArrowRight size={17} /></button>
    </form>
    <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    <p className="privacy-note"><WalletCards size={15} /> Sign in to view your private financial workspace.</p>
  </section></main>;
}