"use client";
import ProjectShell from "@/components/ProjectShell";
import ProductSetup from "@/components/ProductSetup";

export default function Page({ params }) {
  const { id } = params;
  return (
    <ProjectShell projectId={id} currentNum={0}>
      <ProductSetup projectId={id} />
    </ProjectShell>
  );
}