import { TrendingUp } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Investments() {
  return <RecordManager kind="investments" title="Investments" label="holding" icon={TrendingUp} description="Manually record holdings and valuations. Values are not live market prices; keep assets and investments separate to avoid double counting." />;
}