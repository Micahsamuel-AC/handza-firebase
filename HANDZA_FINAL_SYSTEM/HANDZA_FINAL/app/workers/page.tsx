"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where} from "firebase/firestore";
import {Search,Star,CheckCircle,MapPin} from "lucide-react";

export default function WorkersPage(){
  const [workers,setWorkers]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [skillFilter,setSkillFilter]=useState("");
  const [availOnly,setAvailOnly]=useState(false);

  useEffect(()=>{load();},[]);
  async function load(){
    const profSnap=await getDocs(query(collection(db,"profiles"),where("role","==","worker")));
    const profs=profSnap.docs.map(d=>({id:d.id,...d.data()} as any));
    const wpSnap=await getDocs(collection(db,"workerProfiles"));
    const wps:Record<string,any>={};wpSnap.docs.forEach(d=>wps[d.id]=d.data());
    setWorkers(profs.map(p=>({...p,wp:wps[p.id]||{}})));
    setLoading(false);
  }

  const filtered=workers.filter(w=>{
    if(search&&!w.fullName?.toLowerCase().includes(search.toLowerCase())&&!w.location?.toLowerCase().includes(search.toLowerCase()))return false;
    if(skillFilter&&!w.wp?.skills?.includes(skillFilter))return false;
    if(availOnly&&!w.wp?.isAvailable)return false;
    return true;
  });

  const SKILLS=["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16">
      <div className="mb-6"><span className="text-handza font-semibold text-xs uppercase tracking-widest">Browse</span><h1 className="font-heading text-3xl font-bold text-navy mt-1">Find Skilled Workers</h1><p className="text-gray-500 text-sm mt-1">All workers are ID-verified and rated by employers</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="input-base pl-10" placeholder="Search by name or location..."/></div>
        <select value={skillFilter} onChange={e=>setSkillFilter(e.target.value)} className="input-base w-44"><option value="">All Skills</option>{SKILLS.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <button onClick={()=>setAvailOnly(!availOnly)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${availOnly?"bg-green-500 text-white":"bg-lgray text-gray-600"}`}>⚡ Available Now</button>
      </div>
      <p className="text-gray-500 text-sm mb-4">{filtered.length} workers found</p>
      {loading?<div className="text-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin mx-auto"/></div>:
      filtered.length===0?<div className="text-center py-20"><p className="text-gray-400">No workers found</p></div>:
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(w=>(
          <Link key={w.id} href={`/workers/${w.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-navy-light transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative"><div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-lg">{w.fullName?.[0]}</div>{w.wp?.isAvailable&&<div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"/>}</div>
              <div><div className="flex items-center gap-1.5"><span className="font-bold text-navy text-sm">{w.fullName}</span>{w.nicVerified&&<CheckCircle size={13} className="text-green-500"/>}</div>{w.location&&<div className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={11}/>{w.location}</div>}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(w.wp?.skills||[]).slice(0,2).map((s:string)=><span key={s} className="badge badge-navy">{s}</span>)}
              {w.wp?.isAvailable&&<span className="badge badge-green">● Available</span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">{w.wp?.rating>0?<><Star size={13} className="text-yellow-400 fill-yellow-400"/><span className="text-sm font-semibold text-navy">{w.wp.rating}</span><span className="text-gray-400 text-xs">({w.wp.totalReviews||0})</span></>:<span className="text-gray-400 text-xs">New worker</span>}</div>
              {w.wp?.hourlyRate>0&&<span className="text-handza font-bold text-sm">LKR {w.wp.hourlyRate}/hr</span>}
            </div>
          </Link>
        ))}
      </div>}
    </div></div>
  );
}
