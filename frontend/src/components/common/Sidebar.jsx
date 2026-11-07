import {
  Activity, ArrowLeftRight, Banknote, BarChart3, BriefcaseBusiness, Calculator, ChartNoAxesCombined,
  CircleHelp, FileChartColumn, HandCoins, HeartPulse, House, Landmark, LifeBuoy, PiggyBank,
  ReceiptText, Settings, Shield, Sparkles, Target, TrendingUp, Users, WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { NAVIGATION_GROUPS } from "../../utils/constants.js";

const icons = {
  Dashboard: ChartNoAxesCombined, Transactions: ArrowLeftRight, Income: TrendingUp,
  Expenses: ReceiptText, Budgets: PiggyBank, Accounts: WalletCards, Assets: Landmark,
  Liabilities: HandCoins, "Net worth": BarChart3, "Financial health": HeartPulse,
  Goals: Target, Loans: Banknote, Investments: TrendingUp, "Tax management": FileChartColumn,
  Insurance: Shield, Retirement: LifeBuoy, "Calculators": Calculator, Forecasting: Activity,
  "AI assistant": Sparkles, Reports: FileChartColumn, Notifications: CircleHelp,
  "Business finance": BriefcaseBusiness, "Family finance": Users, Settings, "Household": House,
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav aria-label="Main navigation">
        {NAVIGATION_GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="sidebar-label">{group.label}</p>
            {group.links.map(([label, path]) => {
              const Icon = icons[label] ?? CircleHelp;
              return <NavLink key={path} to={path} end={path === "/"}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></NavLink>;
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom"><span className="security-dot" />Your data stays private</div>
    </aside>
  );
}