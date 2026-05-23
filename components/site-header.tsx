import Link from "next/link";
import { LogIn, Radar, Shield } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/radar", label: "Tutka" },
  { href: "/signals", label: "Signaalit" },
  { href: "/method", label: "Method" }
];

export function SiteHeader({ isAdmin, isSignedIn }: { isAdmin: boolean; isSignedIn: boolean }) {
  return (
    <header className="border-b border-[#D8E2F0] bg-white">
      <div className="container flex min-h-16 flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#0D2956]">
          <Radar size={24} className="text-[#0A3A8F]" />
          Tulevaisuustutka
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-[#40516D] hover:bg-[#EEF3FB]">
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link href="/admin" className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#0A3A8F] hover:bg-[#EEF3FB]">
              <Shield size={16} /> Admin
            </Link>
          ) : null}
          {isSignedIn ? (
            <form action={signOut}>
              <button className="focus-ring rounded-md border border-[#B9C9E4] px-3 py-2 text-sm font-semibold text-[#0D2956]">
                Ulos
              </button>
            </form>
          ) : (
            <Link href="/login" className="focus-ring inline-flex items-center gap-2 rounded-md border border-[#B9C9E4] px-3 py-2 text-sm font-semibold text-[#0D2956]">
              <LogIn size={16} /> Kirjaudu
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
