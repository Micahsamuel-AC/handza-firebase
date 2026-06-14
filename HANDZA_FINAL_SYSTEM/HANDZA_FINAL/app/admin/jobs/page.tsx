"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,doc,deleteDoc} from "firebase/firestore";
import {Trash2} from "lucide-react";

export default function AdminJobsPage(){
  const [jobs,setJobs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){const snap=await getDocs(collection(db,"jobs"));setJobs(snap.docs.map(d=>({id:d.id,...d.data()})));setLoading(false);}
  async function remove(id:string){if(!confirm("Remove this job post?"))return;await deleteDoc(doc(db,"jobs",id));load();}
  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Manage Jobs</h1>
      <div className="space-y-2">
        {jobs.map(j=>(
          <div key={j.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]"><p className="font-semibold text-navy text-sm">{j.title}</p><p className="text-gray-400 text-xs">By {j.employerName} · LKR {j.payRate}/{j.payType} · {j.category}</p></div>
            <span className={`badge ${j.status==="open"?"badge-green":j.status==="in_progress"?"badge-navy":"badge-orange"}`}>{j.status?.replace("_"," ")}</span>
            <button onClick={()=>remove(j.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-500"><Trash2 size={12} className="inline mr-1"/>Remove</button>
          </div>
        ))}
        {jobs.length===0&&<p className="text-gray-400 text-sm text-center py-8">No jobs found</p>}
      </div>
    </div>
  );
}
