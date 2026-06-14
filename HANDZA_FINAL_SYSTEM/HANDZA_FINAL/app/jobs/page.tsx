"use client";
import {useEffect,useState,Suspense} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where,orderBy} from "firebase/firestore";
import {Search,MapPin,Briefcase,Zap} from "lucide-react";

const CATS=["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];
const ICONS:Record<string,string>={Plumbing:"🔧",Electrical:"⚡",Welding:"🔥",["Glass Fitting"]:"🪟",["Computer Repairs"]:"💻",Cleaning:"🧹",["Vehicle Washing"]:"🚗",Painting:"🎨",["Household Help"]:"🏠",Logistics:"📦"};

function JobsContent(){
  const params=useSearchParams();
  const [jobs,setJobs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState(params.get("category")||"");
  const [urgentOnly,setUrgentOnly]=useState(false);

  useEffect(()=>{load();},[]);
  async function load(){
    try{
      const snap=await getDocs(query(collection(db,"jobs"),where("status","==","open"),orderBy("createdAt","desc")));
      setJobs(snap.docs.map(d=>({id:d.id,...d.data()})));
    }catch{setJobs([]);}
    setLoading(false);
  }

  const filtered=jobs.filter(j=>{
    if(search&&!j.title?.toLowerCase().includes(search.toLowerCase())&&!j.location?.toLowerCase().includes(search.toLowerCase()))return false;
    if(category&&j.category!==category)return false;
    if(urgentOnly&&!j.isUrgent)return false;
    return true;
  });

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16">
      <div className="mb-6"><span className="text-handza font-semibold text-xs uppercase tracking-widest">Browse</span><h1 className="font-heading text-3xl font-bold text-navy mt-1">Available Jobs</h1><p className="text-gray-500 text-sm mt-1">Verified employers only</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="input-base pl-10" placeholder="Search jobs, skills, location..."/></div>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="input-base w-44"><option value="">All Categories</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <button onClick={()=>setUrgentOnly(!urgentOnly)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${urgentOnly?"bg-red-500 text-white":"bg-red-50 text-red-600"}`}><Zap size={14}/>Urgent Only</button>
      </div>
      <p className="text-gray-500 text-sm mb-4">{filtered.length} jobs found</p>
      {loading?<div className="text-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin mx-auto"/></div>:
      filtered.length===0?<div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Briefcase size={32} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400">No jobs found</p></div>:
      <div className="space-y-3">{filtered.map(job=>(
        <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-handza-light transition-all">
          <div className="w-12 h-12 bg-handza-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">{ICONS[job.category]||"💼"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1"><span className="font-bold text-navy text-sm">{job.title}</span>{job.isUrgent&&<span className="badge badge-red">🔥 Urgent</span>}<span className="badge badge-navy">{job.category}</span></div>
            <div className="text-gray-400 text-xs flex items-center gap-2"><span>By {job.employerName}</span><span className="flex items-center gap-1"><MapPin size={11}/>{job.location}</span></div>
          </div>
          <div className="text-right flex-shrink-0"><div className="text-handza font-bold text-base">LKR {job.payRate}/{job.payType}</div><span className="badge badge-green mt-1">Open</span></div>
        </Link>
      ))}</div>}
    </div></div>
  );
}
export default function JobsPage(){return<Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}><JobsContent/></Suspense>;}
