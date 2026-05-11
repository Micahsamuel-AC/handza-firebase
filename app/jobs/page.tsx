"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { Search, MapPin, Clock, Zap, Filter, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

function JobsContent() {
  const params = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [payType, setPayType] = useState("");

  useEffect(() => { loadJobs(); }, [category, payType]);

  async function loadJobs() {
    setLoading(true);
    try {
      let q = query(collection(db, "jobs"), where("status","==","open"), orderBy("createdAt","desc"));
      const snap = await getDocs(q);
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (category) data = data.filter((j:any) => j.category === category);
      if (payType) data = data.filter((j:any) => j.payType === payType);
      if (search) data = data.filter((j:any) => j.title?.toLowerCase().includes(search.toLowerCase()));
      setJobs(data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = search ? jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.description?.toLowerCase().includes(search.toLowerCase())) : jobs;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="bg-navy pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-handza font-semibold text-sm uppercase tracking-widest">Find Work</span>
          <h1 className="font-heading text-4xl font-bold text-white mt-2 mb-3">Browse Open Jobs</h1>
          <p className="text-white/60 mb-8">Find flexible, hourly opportunities near you</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search jobs (e.g. electrician, painting...)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none shadow-xl"/>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <Filter size={16} className="text-gray-500 mt-2"/>
          <select value={category} onChange={e=>{setCategory(e.target.value);}}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="">All Categories</option>
            {SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={payType} onChange={e=>setPayType(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="">All Pay Types</option>
            <option value="hourly">Hourly</option>
            <option value="fixed">Fixed Price</option>
          </select>
          {(category||payType||search) && (
            <button onClick={()=>{setCategory("");setPayType("");setSearch("");}} className="text-sm text-handza font-semibold hover:underline">Clear filters</button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Zap size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="font-heading font-semibold text-lg">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm card-hover border border-transparent hover:border-handza/20 group">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-navy/10 text-navy text-xs font-semibold px-3 py-1 rounded-lg">{job.category}</span>
                  {job.isUrgent && <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1"><Zap size={10}/>Urgent</span>}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg mb-2 group-hover:text-handza transition-colors leading-tight">{job.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={11}/>{job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/>Just posted</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-handza font-heading font-bold text-lg">LKR {job.payRate?.toLocaleString()}</span>
                    <span className="text-gray-400 text-xs ml-1">/{job.payType==="hourly"?"hr":"fixed"}</span>
                  </div>
                  <Link href={`/jobs/${job.id}`} className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-handza transition-colors">
                    Apply <ArrowRight size={12}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}><JobsContent/></Suspense>;
}
