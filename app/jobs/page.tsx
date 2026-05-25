"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Search, MapPin, Clock, Zap, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const CATS = ["All","Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

export default function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs]     = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db,"jobs"), where("status","==","open")));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const sorted = data.sort((a,b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0);
      });
      setJobs(sorted); setFiltered(sorted); setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let list = [...jobs];
    if (search) list = list.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase()));
    if (cat !== "All") list = list.filter(j => j.category === cat);
    if (urgentOnly) list = list.filter(j => j.isUrgent);
    setFiltered(list);
  }, [jobs, search, cat, urgentOnly]);

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="text-handza font-semibold text-xs uppercase tracking-widest">Marketplace</span>
            <h1 className="font-heading text-3xl font-bold text-navy mt-1">Available Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">{jobs.length} open jobs across Sri Lanka</p>
          </div>
          {profile?.role === "employer" && (
            <Link href="/jobs/new" className="btn-primary py-3">
              <Briefcase size={16}/> Post a Job
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search jobs, skills, location..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-base pl-10"/>
            </div>
            <button onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                urgentOnly ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600 hover:border-red-400"
              }`}>
              <Zap size={15}/> Urgent Only
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  cat === c ? "bg-navy text-white" : "bg-lgray text-gray-600 hover:bg-navy/10"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Briefcase size={40} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-400">No jobs found. Try different filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(j => (
              <Link key={j.id} href={`/jobs/${j.id}`}
                className="job-card flex items-center justify-between gap-4 block group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${j.isUrgent ? "bg-red-50" : "bg-handza-light"}`}>
                    <Briefcase size={18} className={j.isUrgent ? "text-red-500" : "text-handza"}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy text-sm group-hover:text-handza transition-colors truncate">{j.title}</p>
                      {j.isUrgent && <span className="badge badge-red text-xs">🔥 Urgent</span>}
                      <span className="badge badge-navy text-xs">{j.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11}/>{j.location}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11}/>By {j.employerName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-handza font-bold text-sm">LKR {j.payRate}</p>
                    <p className="text-gray-400 text-xs">per {j.payType}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-navy transition-colors"/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
