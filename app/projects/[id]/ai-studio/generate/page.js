"use client";
import ProjectShell from "@/components/ProjectShell";
import { AiHeader, AiGenerator } from "@/components/AiStudio";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <div className="content-wrap" style={{ paddingTop: 24 }}>
        <AiHeader projectId={params.id} view="generate" />
        <div style={{ height: 16 }} />
        <AiGenerator projectId={params.id} />
      </div>
    </ProjectShell>
  );
}
