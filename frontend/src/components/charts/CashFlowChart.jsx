import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function CashFlowChart({ data, currency }) {
  const isEmpty = data.every((point) => point.income === 0 && point.expenses === 0);
  return (
    <article className="panel chart-panel">
      <div className="panel-heading">
        <div><h2>Cash flow</h2><p className="muted">Income and spending over recent months</p></div>
        <span className="chart-legend"><i className="legend-income" /> Income <i className="legend-expense" /> Expenses</span>
      </div>
      {isEmpty ? <div className="chart-empty">Add transactions to see your cash flow over time.</div> : (
        <div className="chart-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.24} /><stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} /></linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.18} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#253247" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8290a4", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} width={44} />
              <Tooltip contentStyle={{ background: "#151d2b", border: "1px solid #253247", borderRadius: 10, color: "#e8eef7" }} formatter={(value, name) => [formatCurrency(value, currency), name === "income" ? "Income" : "Expenses"]} />
              <Area type="monotone" dataKey="income" stroke="#2dd4bf" fill="url(#incomeFill)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="url(#expenseFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
