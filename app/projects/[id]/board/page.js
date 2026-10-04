"use client";
import ProjectShell from "@/components/ProjectShell";
import ProductResearchBoard from "@/components/ProductResearchBoard";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <ProductResearchBoard />
    </ProjectShell>
  );
}
