"use client";
import ProjectShell from "@/components/ProjectShell";
import AIOfficeMap from "@/components/AIOfficeMap";

export default function OfficePage({ params }) {
  const { id } = params;
  return (
    <ProjectShell projectId={id} currentNum={0}>
      <AIOfficeMap projectId={id} />
    </ProjectShell>
  );
}
