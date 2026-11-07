import { FileChartColumn } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function TaxManagement() {
  return <RecordManager kind="tax" title="Tax management" label="tax record" icon={FileChartColumn} description="Organise tax-year records and payments. This page is an organiser, not a tax filing tool or professional tax advice." />;
}