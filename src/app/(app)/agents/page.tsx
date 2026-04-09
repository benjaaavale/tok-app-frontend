"use client";

import { AgentSettings } from "@/components/settings/AgentSettings";
import { KnowledgeSections } from "@/components/settings/KnowledgeSections";

export default function AgentsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
      <AgentSettings />
      <KnowledgeSections />
    </div>
  );
}
