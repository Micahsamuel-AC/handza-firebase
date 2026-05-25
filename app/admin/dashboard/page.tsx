"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Users, Briefcase, UserCheck, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalWorkers: number;
  totalEmployers: number;
  totalJobs: number;
  pendingVerifications: number;
  suspendedAccounts: number;
  activeJobs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalWorkers: 0, totalEmployers: 0, totalJobs: 0,
    pendingVerifications: 0, suspendedAccounts: 0, activeJobs: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profiles = await getDocs(collection(db, "profiles"));
        const all = profiles.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        const workers   = all.filter(p => p.role === "worker");
        const employers = all.filter(p => p.role === "employer");
        const pending   = all.filter(p => !p.nicVerified && p.role !== "admin" && p.role !== "superadmin");
        const suspended = all.filter(p => p.suspended);

        const jobsSnap = await getDocs(collection(db, "jobs"));
        const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const activeJobs = jobs.filter(j => j.status === "open" || j.status === "in_progress");

        setStats({
          totalWorkers: workers.length,
          totalEmployers: employers.length,
          totalJobs: jobs.length,
          pendingVerifications: pending.length,
          suspendedAccounts: suspended.length,
          activeJobs: activeJobs.length,
        });

        // Recent 6 users
        const sorted = all
          .filter(p => p.role !== "admin" && p.role !== "superadmin")
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 6);
        setRecentUsers(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Workers",    value: stats.totalWorkers,       icon: UserCheck,      color: "bg-blue-50 text-blue-600",   href: "/admin/workers"   },
    { label: "Total Employers",  value: stats.totalEmployers,     icon: Users,          color: "bg-purple-50 text-purple-600", href: "/admin/employers" },
    { label: "Total Jobs",       value: stats.totalJobs,          icon: Briefcase,      color: "bg-green-50 text-green-600", href: "/admin/jobs"      },
    { label: "Active Jobs",      value: stats.activeJobs,         icon: TrendingUp,     color: "bg-orange-50 text-orange-600", href: "/admin/jobs"    },
    { label: "Pending Verify",   value: stats.pendingVerifications, icon: Clock,        color: "bg-amber-50 text-amber-600", href: "/admin/workers"   },
    { label: "Suspended",        value: stats.suspendedAccounts,  icon: AlertTriangle,  color: "bg-red-50 text-red-600",     href: "/admin/workers"   },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-navy">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and quick actions</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-navy text-sm">Recent Registrations</h2>
          <div className="flex gap-2">
            <Link href="/admin/workers" className="text-xs text-handza hover:underline">View workers</Link>
            <span className="text-gray-300">·</span>
            <Link href="/admin/employers" className="text-xs text-handza hover:underline">View employers</Link>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {recentUsers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No users yet</p>
          ) : recentUsers.map(user => (
            <div key={user.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                  <span className="text-navy text-xs font-bold">{user.fullName?.charAt(0) || "?"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  user.role === "worker"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600"
                }`}>{user.role}</span>
                {user.suspended && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Suspended</span>
                )}
                {!user.nicVerified && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Unverified</span>
                )}
                {user.nicVerified && !user.suspended && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
