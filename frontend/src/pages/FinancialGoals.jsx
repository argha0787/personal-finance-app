import { Target } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function FinancialGoals() {
  return <RecordManager kind="goals" title="Financial goals" label="goal" icon={Target} description="Set targets and dates, record contributions and review progress. Any projected return is an estimate, not a guarantee." />;
}