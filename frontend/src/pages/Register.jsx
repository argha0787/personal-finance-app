import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { await register(name, email, password); navigate("/", { replace: true }); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-card">
    <Link className="brand auth-brand" to="/"><span className="brand-mark">L</span><span>ledgerly</span></Link>
    <p className="eyebrow">YOUR MONEY, MADE CLEAR</p><h1>Create your account</h1><p className="muted">Start with a private workspace for your finances.</p>
    <form className="form-stack auth-form" onSubmit={submit}>
      <label className="field"><span>Name</span><input autoComplete="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="field"><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="field"><span>Password</span><input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /><small>Use at least 10 characters.</small></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"} <ArrowRight size={17} /></button>
    </form>
    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
  </section></main>;
}