import { Bell } from "lucide-react";
import RecordManager from "../components/common/RecordManager.jsx";

export default function Notifications() {
  return <RecordManager kind="notifications" title="Notifications" label="reminder" icon={Bell} description="Keep manually entered reminders for bills and due dates. Automatic notifications are not configured yet." />;
}