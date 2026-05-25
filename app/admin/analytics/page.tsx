"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { TrendingUp, Users, Briefcase, DollarSign, RefreshCw } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState({ workers:0, employers:0, jobs:0, completed:0, openJobs:0, suspended:0, unverified:0, topCats: [] as any[] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const profilesSnap = await getDocs(collection(db,"profiles"));
    const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    const jobsSnap = await getDocs(collection(db,"jobs"));
    const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    const catCount: Record<string,number> = {};
    jobs.forEach((j: any) => { if (j.category) catCount[j.category] = (catCount[j.category]||0)+1; });
    const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([cat,count]) => ({ cat, count }));

    setData({
      workers:    profiles.filter(p => p.role === "worker").length,
      employers:  profiles.filter(p => p.role === "employer").length,
      jobs:       jobs.length,
      completed:  jobs.filter(j => j.status === "completed").length,
      openJobs:   jobs.filter(j => j.status === "open").length,
      suspended:  profiles.filter(p => p.suspended).length,
      unverified: profiles.filter(p => !p.nicVerified && p.role !== "admin" && p.role !== "superadmin").length,
      topCats,
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const stats = [
    { label:"Total Workers",    val: data.workers,    icon: Users,      color:"bg-blue-50 text-blue-600" },
    { label:"Total Employers",  val: data.employers,  icon: Users,      color:"bg-purple-50 text-purple-600" },
    { label:"Total Jobs",       val: data.jobs,       icon: Briefcase,  color:"bg-green-50 text-green-600" },
    { label:"Completed Jobs",   val: data.completed,  icon: TrendingUp, color:"bg-emerald-50 text-emerald-600" },
    { label:"Open Jobs",        val: data.openJobs,   icon: Briefcase,  color:"bg-orange-50 text-orange-600" },
    { label:"Suspended",        val: data.suspended,  icon: Users,      color:"bg-red-50 text-red-600" },
    { label:"Unverified Users", val: data.unverified, icon: Users,      color:"bg-amber-50 text-amber-600" },
    { label:"Completion Rate",  val: data.jobs ? `${Math.round((data.completed/data.jobs)*100)}%` : "0%", icon: TrendingUp, color:"bg-teal-50 text-teal-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform performance overview</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><RefreshCw size={18}/></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18}/>
                </div>
                <div className="font-heading text-2xl font-bold text-navy">{val}</div>
                <div className="text-gray-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {data.topCats.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-heading font-bold text-navy text-sm mb-4">Top Job Categories</h2>
              <div className="space-y-3">
                {data.topCats.map(({ cat, count }: any) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-400">{count} jobs</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-handza rounded-full transition-all"
                        style={{ width: `${Math.round((count / data.jobs) * 100)}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
