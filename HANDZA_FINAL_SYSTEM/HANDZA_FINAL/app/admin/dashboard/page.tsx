"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where} from "firebase/firestore";
import {Users,Briefcase,FileCheck,AlertCircle} from "lucide-react";

export default function AdminDashboard(){
  const [stats,setStats]=useState({workers:0,employers:0,jobs:0,pending:0});
  const [recent,setRecent]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{load();},[]);
  async function load(){
    const [workers,employers,jobs,pending,allProfiles]=await Promise.all([
      getDocs(query(collection(db,"profiles"),where("role","==","worker"))),
      getDocs(query(collection(db,"profiles"),where("role","==","employer"))),
      getDocs(collection(db,"jobs")),
      getDocs(query(collection(db,"profiles"),where("nicPending","==",true))),
      getDocs(collection(db,"profiles")),
    ]);
    setStats({workers:workers.size,employers:employers.size,jobs:jobs.size,pending:pending.size});
    const recentList=allProfiles.docs.map(d=>({id:d.id,...d.data()} as any)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5);
    setRecent(recentList);
    setLoading(false);
  }

  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[{icon:Users,label:"Total Workers",val:stats.workers},{icon:Briefcase,label:"Total Employers",val:stats.employers},{icon:FileCheck,label:"Total Jobs",val:stats.jobs},{icon:AlertCircle,label:"Pending Verify",val:stats.pending}].map(({icon:Icon,label,val})=>(
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><div className="w-9 h-9 bg-navy-light rounded-xl flex items-center justify-center mb-3"><Icon size={18} className="text-navy"/></div><div className="font-heading text-2xl font-bold text-navy">{val}</div><div className="text-gray-500 text-xs mt-0.5">{label}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-heading font-bold text-navy text-sm mb-4">Recent Registrations</h2>
        {recent.length===0?<p className="text-gray-400 text-sm text-center py-4">No registrations yet</p>:
        recent.map(p=>(
          <div key={p.id} className="flex items-center gap-3 p-3 bg-lgray rounded-xl mb-2"><div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">{p.fullName?.[0]}</div><div className="flex-1"><p className="font-semibold text-navy text-sm">{p.fullName}</p><p className="text-gray-400 text-xs capitalize">{p.role}</p></div><span className={`badge ${p.nicVerified?"badge-green":"badge-amber"}`}>{p.nicVerified?"Verified":"Pending"}</span></div>
        ))}
      </div>
    </div>
  );
}
