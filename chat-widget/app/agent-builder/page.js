import { Suspense } from "react";
import DashboardLayout from "../../components/AgentBuilder/DashboardLayout";

function AgentBuilderContent() {
  return (
    <DashboardLayout>
      {/* Default content will be shown by the layout */}
    </DashboardLayout>
  );
}

export default function AgentBuilderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentBuilderContent />
    </Suspense>
  );
}
