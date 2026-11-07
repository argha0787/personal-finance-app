import { HandCoins } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Liabilities() {
  return <RecordManager kind="liabilities" title="Liabilities" label="liability" icon={HandCoins} description="Track outstanding balances, interest and due dates. Record loan schedules separately in Loans if you need repayment details." />;
}