"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Search, MapPin, Star, CheckCircle, Filter, Zap } from "lucide-react";
import Link from "next/link";

const SKILLS = ["All","Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

export default function WorkersPage() {
  const [workers, setWorkers]   = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [skill, setSkill]       = useState("All");
  const [availOnly, setAvailOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const profilesSnap = await getDocs(query(collection(db,"profiles"), where("role","==","worker")));
      const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const wpSnap = await getDocs(collection(db,"workerProfiles"));
      const wpMap: Record<string,any> = {};
      wpSnap.docs.forEach(d => { wpMap[d.data().userId] = d.data(); });
      const merged = profiles.filter(p => !p.suspended).map(p => ({ ...p, wp: wpMap[p.id] || {} }));
      setWorkers(merged); setFiltered(merged); setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let list = [...workers];
    if (search) list = list.filter(w => w.fullName?.toLowerCase().includes(search.toLowerCase()) || w.location?.toLowerCase().includes(search.toLowerCase()));
    if (skill !== "All") list = list.filter(w => w.wp?.skills?.includes(skill));
    if (availOnly) list = list.filter(w => w.wp?.isAvailable);
    setFiltered(list);
  }, [workers, search, skill, availOnly]);

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16">
        <div className="mb-8">
          <span className="text-handza font-semibold text-xs uppercase tracking-widest">Marketplace</span>
          <h1 className="font-heading text-3xl font-bold text-navy mt-1">Find Skilled Workers</h1>
          <p className="text-gray-500 text-sm mt-1">All workers are ID-verified and rated by employers</p>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search by name or location..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10"/>
            </div>
            <button onClick={() => setAvailOnly(!availOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                availOnly ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-600 hover:border-green-400"
              }`}>
              <Zap size={15}/> Available Now
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SKILLS.map(s => (
              <button key={s} onClick={() => setSkill(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  skill === s ? "bg-navy text-white" : "bg-lgray text-gray-600 hover:bg-navy/10"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} worker{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Workers grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Search size={40} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-400">No workers found. Try different filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <div key={w.id} className="worker-card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {w.fullName?.[0]}
                    </div>
                    {w.wp?.isAvailable && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"/>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-navy text-sm truncate">{w.fullName}</p>
                      {w.nicVerified && <CheckCircle size={13} className="text-green-500 flex-shrink-0"/>}
                    </div>
                    {w.location && (
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={11}/>{w.location}
                      </p>
                    )}
                  </div>
                  {w.wp?.isAvailable && (
                    <span className="badge badge-green text-xs flex-shrink-0">Available</span>
                  )}
                </div>

                {/* Skills */}
                {w.wp?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {w.wp.skills.slice(0,3).map((s: string) => (
                      <span key={s} className="badge badge-navy text-xs">{s}</span>
                    ))}
                    {w.wp.skills.length > 3 && (
                      <span className="text-xs text-gray-400 self-center">+{w.wp.skills.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Rate + rating */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {w.wp?.hourlyRate > 0 && (
                      <span className="text-handza font-bold text-sm">LKR {w.wp.hourlyRate}/hr</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {w.wp?.rating > 0 ? (
                      <>
                        <Star size={13} className="text-yellow-400 fill-yellow-400"/>
                        <span className="text-xs font-semibold text-gray-700">{w.wp.rating}</span>
                        <span className="text-xs text-gray-400">({w.wp.totalReviews})</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">New worker</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
