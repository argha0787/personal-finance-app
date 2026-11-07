import { Shield } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Insurance() {
  return <RecordManager kind="insurance" title="Insurance" label="policy" icon={Shield} description="Organise policy type, coverage and renewal dates. The app does not determine whether coverage is adequate." />;
}