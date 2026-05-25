"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, Briefcase, UserCheck, Shield, LogOut, Menu, X, Crown, FileCheck, AlertTriangle, TrendingUp } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/workers",   label: "Workers",           icon: UserCheck },
  { href: "/admin/employers", label: "Employers",         icon: Users },
  { href: "/admin/jobs",      label: "Jobs",              icon: Briefcase },
  { href: "/admin/verify",    label: "Verify Queue",      icon: FileCheck },
  { href: "/admin/reports",   label: "Abuse Reports",     icon: AlertTriangle },
  { href: "/admin/analytics", label: "Analytics",         icon: TrendingUp },
  { href: "/admin/team",      label: "Team Access",       icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) { router.push("/auth/login"); return; }
      if (profile.role !== "admin" && profile.role !== "superadmin") router.push("/dashboard");
    }
  }, [user, profile, loading]);

  if (loading || !profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return <div className="min-h-screen bg-lgray flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin"/>
    </div>;
  }

  const isSuperAdmin = profile.role === "superadmin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-handza rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-white font-heading font-bold text-base">HANDZA</p>
              <p className="text-white/50 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            if (href === "/admin/team" && !isSuperAdmin) return null;
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                <Icon size={17}/>{label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-handza/30 rounded-full flex items-center justify-center">
              {isSuperAdmin ? <Crown size={14} className="text-handza"/> : <span className="text-white text-xs font-bold">{profile.fullName?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile.fullName}</p>
              <p className="text-white/40 text-xs capitalize">{profile.role}</p>
            </div>
          </div>
          <button onClick={async () => { await signOut(auth); router.push("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-xs transition-colors">
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Menu size={20}/></button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-navy">{navItems.find(n => n.href === pathname)?.label || "Admin"}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isSuperAdmin ? "bg-handza/10 text-handza" : "bg-navy/10 text-navy"}`}>
            {isSuperAdmin ? "Super Admin" : "Admin"}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
