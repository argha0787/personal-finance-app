import { LifeBuoy } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Retirement() {
  return <RecordManager kind="retirement" title="Retirement" label="retirement plan" icon={LifeBuoy} description="Record savings and assumptions. Future values are illustrative estimates and depend on uncertain returns, inflation and lifespan." />;
}