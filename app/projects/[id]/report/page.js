"use client";
import ProjectShell from "@/components/ProjectShell";
import ReportPage from "@/components/ReportPage";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <ReportPage projectId={params.id} />
    </ProjectShell>
  );
}