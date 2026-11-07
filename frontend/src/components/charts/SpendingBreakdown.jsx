import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency.js";

const COLORS = ["#2dd4bf", "#60a5fa", "#a78bfa", "#f59e0b", "#f87171", "#34d399"];

export default function SpendingBreakdown({ data, currency, period }) {
  return (
    <article className="panel spending-panel">
      <div className="panel-heading"><div><h2>Spending breakdown</h2><p className="muted">By category · {period}</p></div><Link className="text-link" to="/expenses">Details</Link></div>
      {data.length === 0 ? <div className="chart-empty">Your spending categories will appear here.</div> : (
        <>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="category" innerRadius={64} outerRadius={88} paddingAngle={3} stroke="none">
                  {data.map((item, index) => <Cell key={item.category} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#151d2b", border: "1px solid #253247", borderRadius: 10, color: "#e8eef7" }} formatter={(value) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="category-legend">{data.slice(0, 5).map((item, index) => <div key={item.category}><i style={{ background: COLORS[index % COLORS.length] }} /><span>{item.category}</span><strong>{formatCurrency(item.amount, currency)}</strong></div>)}</div>
        </>
      )}
    </article>
  );
}
