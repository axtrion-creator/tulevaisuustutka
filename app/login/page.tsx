import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile } from "@/lib/auth/admin";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="page-shell">
      <div className="container max-w-md">
        <div className="rounded-lg border border-[#D8E2F0] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3168CE]">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#0D2956]">Kirjaudu sisään</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
