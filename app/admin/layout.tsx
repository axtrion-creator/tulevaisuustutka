import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  if (!profile) {
    redirect("/login");
  }

  return children;
}
