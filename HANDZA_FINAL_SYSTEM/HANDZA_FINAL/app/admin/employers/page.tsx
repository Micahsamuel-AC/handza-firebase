"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where,doc,updateDoc} from "firebase/firestore";
import {Search,Ban} from "lucide-react";

export default function AdminEmployersPage(){
  const [list,setList]=useState<any[]>([]);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{load();},[]);
  async function load(){
    const snap=await getDocs(query(collection(db,"profiles"),where("role","==","employer")));
    setList(snap.docs.map(d=>({id:d.id,...d.data()})));
    setLoading(false);
  }
  async function verify(id:string){await updateDoc(doc(db,"profiles",id),{nicVerified:true,nicPending:false});load();}
  async function suspend(id:string,current:boolean){await updateDoc(doc(db,"profiles",id),{suspended:!current});load();}

  const filtered=list.filter(w=>!search||w.fullName?.toLowerCase().includes(search.toLowerCase())||w.email?.toLowerCase().includes(search.toLowerCase()));
  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Manage Employers</h1>
      <div className="relative mb-5 max-w-md"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="input-base pl-10" placeholder="Search employers..."/></div>
      <div className="space-y-2">
        {filtered.map(w=>(
          <div key={w.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 bg-handza rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">{w.fullName?.[0]}</div>
            <div className="flex-1 min-w-[160px]"><p className="font-semibold text-navy text-sm">{w.fullName}</p><p className="text-gray-400 text-xs">{w.email} · {w.location||"No location"}</p></div>
            <span className={`badge ${w.suspended?"badge-red":w.nicVerified?"badge-green":"badge-amber"}`}>{w.suspended?"Suspended":w.nicVerified?"Verified":"Pending"}</span>
            {!w.nicVerified&&<button onClick={()=>verify(w.id)} className="btn-primary text-xs py-1.5 px-3">✓ Verify</button>}
            <button onClick={()=>suspend(w.id,w.suspended)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${w.suspended?"bg-green-50 text-green-600":"bg-red-50 text-red-500"}`}><Ban size={12} className="inline mr-1"/>{w.suspended?"Unsuspend":"Suspend"}</button>
          </div>
        ))}
        {filtered.length===0&&<p className="text-gray-400 text-sm text-center py-8">No employers found</p>}
      </div>
    </div>
  );
}
