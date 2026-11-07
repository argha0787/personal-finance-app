import { Users } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function FamilyFinance() {
  return <RecordManager kind="family" title="Family finance" label="shared record" icon={Users} description="Keep optional household notes and shared records. Multi-user access and member permissions are not enabled in this version." />;
}