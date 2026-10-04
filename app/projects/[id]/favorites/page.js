"use client";
import ProjectShell from "@/components/ProjectShell";
import FavoritesPage from "@/components/FavoritesPage";

export default function Page({ params }) {
  return (
    <ProjectShell projectId={params.id} currentNum={0}>
      <FavoritesPage projectId={params.id} />
    </ProjectShell>
  );
}