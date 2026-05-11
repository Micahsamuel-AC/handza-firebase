"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { Search, MapPin, Star, Zap, Filter, MessageSquare } from "lucide-react";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => { loadWorkers(); }, [availableOnly]);

  async function loadWorkers() {
    setLoading(true);
    try {
      let q: any = collection(db, "workerProfiles");
      if (availableOnly) q = query(q, where("isAvailable","==",true));
      const wpSnap = await getDocs(q);
      const workers = await Promise.all(wpSnap.docs.map(async (d: any) => {
        const data = d.data() as Record<string, any>;
        const wp: Record<string, any> = { id: d.id, ...data };
        const profSnap = await getDocs(query(collection(db, "profiles"), where("__name__","==",d.id)));
        const prof: any = profSnap.empty ? null : { id: profSnap.docs[0].id, ...(profSnap.docs[0].data() as Record<string,any>) };
        return { ...wp, profile: prof };
      }));
      setWorkers(workers.filter(w => w.profile));
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = workers.filter(w => {
    if (search && !w.profile?.fullName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (skill && !w.skills?.includes(skill)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="bg-navy pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-handza font-semibold text-sm uppercase tracking-widest">Find Workers</span>
          <h1 className="font-heading text-4xl font-bold text-white mt-2 mb-3">Verified Workers</h1>
          <p className="text-white/60 mb-8">Browse verified, rated workers available near you</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none shadow-xl"/>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <Filter size={16} className="text-gray-500 mt-2"/>
          <select value={skill} onChange={e=>setSkill(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="">All Skills</option>
            {SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm cursor-pointer hover:border-green-400 transition-colors">
            <input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)} className="accent-green-500"/>
            <span className="text-green-600 font-semibold">● Available Now</span>
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Zap size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="font-heading font-semibold text-lg">No workers found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <div key={w.id} className="bg-white rounded-2xl p-6 shadow-sm card-hover border border-transparent hover:border-handza/20 group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg flex-shrink-0">
                    {w.profile?.fullName?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-navy group-hover:text-handza transition-colors">{w.profile?.fullName || "Worker"}</p>
                    {w.profile?.location && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin size={10}/>{w.profile.location}</p>}
                  </div>
                  {w.isAvailable && <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">● Live</span>}
                </div>

                {w.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {w.skills.slice(0,3).map((s:string) => (
                      <span key={s} className="bg-lgray text-navy text-xs font-semibold px-2.5 py-1 rounded-lg">{s}</span>
                    ))}
                    {w.skills.length > 3 && <span className="text-gray-400 text-xs py-1">+{w.skills.length-3} more</span>}
                  </div>
                )}

                {w.profile?.bio && <p className="text-gray-500 text-xs line-clamp-2 mb-4">{w.profile.bio}</p>}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {w.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
                        <Star size={13} fill="currentColor"/>{Number(w.rating).toFixed(1)}
                        <span className="text-gray-400 text-xs font-normal">({w.totalReviews})</span>
                      </span>
                    )}
                    {w.hourlyRate > 0 && <span className="text-handza font-bold text-sm">LKR {w.hourlyRate}/hr</span>}
                  </div>
                  <Link href={`/messages?to=${w.id}`} className="flex items-center gap-1.5 text-xs font-semibold bg-navy text-white px-3 py-2 rounded-xl hover:bg-handza transition-colors">
                    <MessageSquare size={13}/> Message
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
