import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/AdminLogin";
export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin/frames");
  return <AdminLogin />;
}
