import { BriefcaseBusiness } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function BusinessFinance() {
  return <RecordManager kind="business" title="Business finance" label="movement" icon={BriefcaseBusiness} description="Record business-related withdrawals and personal transfers. Transfers are not new income; this is not full bookkeeping software." />;
}