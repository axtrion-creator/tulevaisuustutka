import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Tulevaisuustutka",
  description: "Heikkojen signaalien ja nousevien ilmiöiden tulevaisuustutka."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html lang="fi">
      <body>
        <SiteHeader isAdmin={profile?.role === "admin"} isSignedIn={Boolean(profile)} />
        <main>{children}</main>
      </body>
    </html>
  );
}
