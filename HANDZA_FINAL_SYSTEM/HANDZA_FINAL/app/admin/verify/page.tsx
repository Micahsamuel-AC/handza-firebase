"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where,doc,updateDoc} from "firebase/firestore";
import {FileText,CheckCircle,XCircle} from "lucide-react";

export default function AdminVerifyPage(){
  const [pending,setPending]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){const snap=await getDocs(query(collection(db,"profiles"),where("nicPending","==",true)));setPending(snap.docs.map(d=>({id:d.id,...d.data()})));setLoading(false);}
  async function approve(id:string){await updateDoc(doc(db,"profiles",id),{nicVerified:true,nicPending:false});load();}
  async function reject(id:string){await updateDoc(doc(db,"profiles",id),{nicVerified:false,nicPending:false,nicRejected:true});load();}
  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">Verification Queue</h1>
      <p className="text-gray-500 text-sm mb-6">{pending.length} pending NIC verifications</p>
      {pending.length===0?<p className="text-gray-400 text-sm text-center py-12">All caught up! No pending verifications.</p>:
      pending.map(p=>(
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3"><div className="w-11 h-11 bg-navy rounded-xl flex items-center justify-center text-white font-bold">{p.fullName?.[0]}</div><div><p className="font-semibold text-navy">{p.fullName}</p><p className="text-gray-400 text-xs">{p.email} · <span className="capitalize">{p.role}</span></p></div></div>
            {p.nicDocumentUrl&&<a href={p.nicDocumentUrl} target="_blank" rel="noreferrer" className="text-handza text-sm font-semibold flex items-center gap-1"><FileText size={14}/>View NIC →</a>}
          </div>
          <div className="flex gap-2"><button onClick={()=>approve(p.id)} className="btn-primary text-sm py-2 px-4 bg-green-500 hover:bg-green-600"><CheckCircle size={14}/>Approve</button><button onClick={()=>reject(p.id)} className="text-sm font-semibold px-4 py-2 rounded-full bg-red-50 text-red-500"><XCircle size={14} className="inline mr-1"/>Reject</button></div>
        </div>
      ))}
    </div>
  );
}
