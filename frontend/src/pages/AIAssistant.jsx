import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { financeService } from "../services/financeService.js";

const suggestions = ["Summarise my spending this month", "How is my savings rate calculated?", "What should I review in my budget?"];

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setQuestion("");
    setError("");
    setLoading(true);
    try {
      const response = await financeService.askAi(text);
      setMessages((current) => [...current, { role: "assistant", text: response.answer, source: response.source }]);
    } catch (requestError) {
      setError(requestError.message);
    } finally { setLoading(false); }
  }
  return <section><div className="page-heading"><div><p className="eyebrow">INSIGHTS</p><h1>AI assistant</h1><p className="muted">Ask questions about your verified financial summary.</p></div><span className="metric-icon purple"><Sparkles size={22} /></span></div>
    <div className="notice notice-info privacy-info"><Sparkles size={17} /><span>Only your dashboard summary and this question are sent to the configured AI provider. Never include account numbers, credentials or identity documents. AI answers can be incomplete and are not financial advice.</span></div>
    <div className="chat-panel panel"><div className="chat-messages" aria-live="polite">
      {messages.length === 0 && <div className="chat-welcome"><span className="metric-icon purple"><Bot size={23} /></span><h2>How can I help you understand your finances?</h2><p className="muted">Answers use the summary recorded in this app—not live bank or market data.</p><div className="suggestion-list">{suggestions.map((item) => <button key={item} className="suggestion-chip" onClick={() => setQuestion(item)}>{item}</button>)}</div></div>}
      {messages.map((message, index) => <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><strong>{message.role === "assistant" ? "Ledgerly assistant" : "You"}</strong><p>{message.text}</p>{message.source && <small>{message.source}</small>}</article>)}
      {loading && <div className="chat-message assistant"><strong>Ledgerly assistant</strong><p className="muted">Thinking…</p></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div><form className="chat-input" onSubmit={ask}><textarea aria-label="Ask the financial assistant" rows="2" maxLength="1200" placeholder="Ask about your financial summary…" value={question} onChange={(event) => setQuestion(event.target.value)} /><button className="button button-primary" aria-label="Send question" disabled={!question.trim() || loading}><Send size={17} /> Send</button></form></div>
  </section>;
}