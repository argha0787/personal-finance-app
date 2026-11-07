import { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { apiRequest } from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const calculators = {
  emi: {
    title: "Loan EMI",
    description: "Estimate a fixed monthly payment from principal, annual rate and term.",
    endpoint: "/calculators/emi",
    primary: "monthly_payment",
    fields: [["principal", "Loan principal", "number", "0.01"], ["annual_rate", "Annual interest rate (%)", "number", "0"], ["months", "Term (months)", "number", "1"]],
    money: ["monthly_payment", "total_payment", "total_interest"],
    labels: { monthly_payment: "Monthly payment", total_payment: "Total repayment", total_interest: "Total interest" },
  },
  compound: {
    title: "Compound interest",
    description: "Estimate a lump sum's future value under a fixed compounding assumption.",
    endpoint: "/calculators/compound-interest",
    primary: "future_value",
    fields: [["principal", "Starting amount", "number", "0.01"], ["annual_rate", "Annual rate (%)", "number", "0"], ["years", "Years", "number", "1"], ["compounds_per_year", "Compounding periods per year", "number", "1"]],
    money: ["future_value", "growth"],
    labels: { future_value: "Estimated future value", growth: "Estimated growth" },
  },
  sip: {
    title: "Monthly investment (SIP)",
    description: "Illustrate the value of regular monthly contributions at a constant assumed return.",
    endpoint: "/calculators/sip",
    primary: "future_value",
    fields: [["monthly_contribution", "Monthly contribution", "number", "0.01"], ["annual_rate", "Assumed annual return (%)", "number", "0"], ["months", "Term (months)", "number", "1"]],
    money: ["future_value", "invested_amount", "estimated_growth"],
    labels: { future_value: "Estimated future value", invested_amount: "Total contributions", estimated_growth: "Estimated growth" },
  },
  inflation: {
    title: "Inflation impact",
    description: "Compare today's purchasing power with an illustrative inflation assumption.",
    endpoint: "/calculators/inflation",
    primary: "estimated_future_cost",
    fields: [["amount", "Amount", "number", "0.01"], ["annual_inflation", "Annual inflation (%)", "number", "0"], ["years", "Years", "number", "1"]],
    money: ["today_value_of_future_amount"],
    labels: { estimated_future_cost: "Future cost of today's amount", today_value_of_future_amount: "Today's value of that future amount" },
  },
  roi: {
    title: "Simple return on investment",
    description: "Calculate simple gain or loss from an initial and current value.",
    endpoint: "/calculators/roi",
    primary: "roi_percent",
    fields: [["initial_value", "Initial value", "number", "0.01"], ["current_value", "Current value", "number", "0"]],
    money: ["gain_or_loss"],
    labels: { gain_or_loss: "Gain or loss", roi_percent: "Simple ROI" },
  },
};

export default function Calculators() {
  const [calculator, setCalculator] = useState("emi");
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const config = calculators[calculator];

  async function calculate(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = Object.fromEntries(config.fields.map(([key, , type]) => [key, type === "number" ? Number(values[key]) : values[key]]));
      setResult(await apiRequest(config.endpoint, { method: "POST", body: JSON.stringify(payload) }));
    } catch (requestError) { setError(requestError.message); setResult(null); }
    finally { setLoading(false); }
  }

  function choose(key) {
    setCalculator(key);
    setValues({});
    setResult(null);
    setError("");
  }

  return <section><div className="page-heading"><div><p className="eyebrow">TOOLS</p><h1>Calculators</h1><p className="muted">Explore scenarios with their assumptions visible.</p></div><span className="metric-icon blue"><Calculator size={22} /></span></div>
    <div className="calculator-tabs" role="tablist" aria-label="Financial calculators">{Object.entries(calculators).map(([key, item]) => <button key={key} type="button" role="tab" aria-selected={calculator === key} className={calculator === key ? "active" : ""} onClick={() => choose(key)}>{item.title}</button>)}</div>
    <div className="calculator-layout"><article className="panel calculator-form"><h2>{config.title}</h2><p className="muted">{config.description}</p><form className="form-stack" onSubmit={calculate}>
      {config.fields.map(([key, label, type, min]) => <label className="field" key={key}><span>{label}</span><input required type={type} min={min} max={key.includes("rate") || key.includes("inflation") ? "100" : undefined} step={key === "months" || key === "years" || key === "compounds_per_year" ? "1" : "0.01"} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /></label>)}
      {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? "Calculating…" : "Calculate"}</button>
    </form></article>
    <article className="panel calculator-result"><p className="eyebrow">ESTIMATE</p>{result ? <><span className="muted">{config.labels[config.primary] ?? config.primary}</span><strong className="result-number">{config.primary === "roi_percent" ? `${result[config.primary]}%` : formatCurrency(result[config.primary])}</strong>{config.money.filter((key) => key !== config.primary).map((key) => <div className="result-line" key={key}><span>{config.labels[key]}</span><strong>{formatCurrency(result[key])}</strong></div>)}<p className="assumption-text">{result.assumption}</p></> : <div className="chart-empty"><Calculator size={22} /><p>Enter assumptions to see an estimate.</p></div>}<div className="notice notice-info"><Info size={16} /><span>Estimates are not guarantees. Results depend on the assumptions shown and may exclude fees, taxes or timing.</span></div></article></div>
  </section>;
}