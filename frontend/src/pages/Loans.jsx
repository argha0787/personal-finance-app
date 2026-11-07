import { Banknote } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Loans() {
  return <RecordManager kind="loans" title="Loans" label="loan" icon={Banknote} description="Record lender, outstanding balance and repayment assumptions. Use the EMI calculator to explore fixed-rate scenarios." />;
}