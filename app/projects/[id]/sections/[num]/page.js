"use client";
import ProjectShell from "@/components/ProjectShell";
import SectionWorkspace from "@/components/SectionWorkspace";

export default function Page({ params }) {
  const num = Number(params.num);
  if (num < 1 || num > 17) return <div className="content-wrap"><p>Section must be between 1 and 17.</p></div>;
  return (
    <ProjectShell projectId={params.id} currentNum={num}>
      <SectionWorkspace num={num} />
    </ProjectShell>
  );
}