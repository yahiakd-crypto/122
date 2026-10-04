"use client";
import ProjectShell from "@/components/ProjectShell";
import AIParameters from "@/components/AIParameters";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <div style={{ paddingBottom: 40 }}>
        <AIParameters />
      </div>
    </ProjectShell>
  );
}