import { redirect } from "next/navigation";

export default function ProjectHome({ params }) {
  redirect(`/projects/${params.id}/product`);
}