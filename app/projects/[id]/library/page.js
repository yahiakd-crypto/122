"use client";
import ProjectShell from "@/components/ProjectShell";
import WorkspaceLibrary from "@/components/WorkspaceLibrary";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <WorkspaceLibrary projectId={params.id} fullPage />
    </ProjectShell>
  );
}
