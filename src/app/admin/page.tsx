import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
export default async function AdminPage() {
  redirect(await isAdmin() ? "/admin/frames" : "/admin/login");
}
