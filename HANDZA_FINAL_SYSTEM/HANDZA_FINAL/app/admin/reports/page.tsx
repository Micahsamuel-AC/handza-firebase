"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,doc,updateDoc} from "firebase/firestore";
import {AlertTriangle} from "lucide-react";

export default function AdminReportsPage(){
  const [reports,setReports]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){const snap=await getDocs(collection(db,"reports"));setReports(snap.docs.map(d=>({id:d.id,...d.data()})));setLoading(false);}
  async function action(id:string,status:string){await updateDoc(doc(db,"reports",id),{status});load();}
  async function suspendReported(reportId:string,userId:string){await updateDoc(doc(db,"profiles",userId),{suspended:true});await updateDoc(doc(db,"reports",reportId),{status:"actioned"});load();}
  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Abuse Reports</h1>
      {reports.length===0?<p className="text-gray-400 text-sm text-center py-12">No reports submitted.</p>:
      reports.map(r=>(
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
          <div className="flex items-start gap-3 mb-3"><div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0"><AlertTriangle size={16} className="text-red-500"/></div>
          <div className="flex-1"><p className="font-semibold text-navy text-sm">{r.reportedName||"Unknown user"}</p><p className="text-gray-500 text-xs mt-0.5">{r.description||r.reason}</p><p className="text-gray-400 text-xs mt-1">Reported by: {r.reporterName}</p></div>
          <span className={`badge ${r.status==="pending"?"badge-amber":"badge-navy"}`}>{r.status}</span></div>
          {r.status==="pending"&&<div className="flex gap-2"><button onClick={()=>suspendReported(r.id,r.reportedUserId)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-500">🚫 Suspend User</button><button onClick={()=>action(r.id,"reviewed")} className="btn-secondary text-xs py-1.5 px-3">✓ Mark Reviewed</button><button onClick={()=>action(r.id,"dismissed")} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">Dismiss</button></div>}
        </div>
      ))}
    </div>
  );
}
