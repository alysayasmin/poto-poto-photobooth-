import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminFrames } from "@/components/AdminFrames";
export default async function FramesPage() {
  if (!await isAdmin()) redirect("/admin/login");
  return <AdminFrames />;
}
