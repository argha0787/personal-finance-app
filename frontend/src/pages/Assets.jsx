import { Landmark } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Assets() {
  return <RecordManager kind="assets" title="Assets" label="asset" icon={Landmark} description="Record what you own, its estimated value and when it was last reviewed. Keep investment holdings in Investments rather than entering them twice." />;
}