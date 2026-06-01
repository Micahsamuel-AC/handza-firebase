import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";

export const metadata: Metadata = {
  title: "HANDZA — Connecting the Right Hands to the Right Work",
  description: "Sri Lanka's on-demand labour marketplace. Find verified workers or flexible jobs instantly.",
  keywords: "Sri Lanka labour marketplace, hire workers, find jobs, plumber, electrician, cleaning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LangProvider>
          <AuthProvider>{children}</AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
