import StaffChatPanel from './StaffChatPanel';
import StaffCopilotPanel from './StaffCopilotPanel';

export default function StaffSupportPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 h-[calc(100vh-150px)]">
      <StaffChatPanel />
      <StaffCopilotPanel />
    </div>
  );
}
