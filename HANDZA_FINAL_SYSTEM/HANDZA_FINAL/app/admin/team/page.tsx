"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where,doc,updateDoc} from "firebase/firestore";
import {useAuth} from "@/lib/auth-context";
import {Search,ShieldOff} from "lucide-react";

export default function AdminTeamPage(){
  const {profile}=useAuth();
  const [team,setTeam]=useState<any[]>([]);
  const [search,setSearch]=useState("");
  const [results,setResults]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const isSuper=profile?.role==="superadmin";

  useEffect(()=>{load();},[]);
  async function load(){
    const snap=await getDocs(query(collection(db,"profiles"),where("role","in",["admin","superadmin"])));
    setTeam(snap.docs.map(d=>({id:d.id,...d.data()})));
    setLoading(false);
  }
  async function searchUsers(){
    if(!search.trim())return;
    const snap=await getDocs(collection(db,"profiles"));
    setResults(snap.docs.map(d=>({id:d.id,...d.data()})).filter((p:any)=>p.email?.toLowerCase().includes(search.toLowerCase())||p.fullName?.toLowerCase().includes(search.toLowerCase())));
  }
  async function grant(id:string){await updateDoc(doc(db,"profiles",id),{role:"admin"});setResults([]);setSearch("");load();}
  async function revoke(id:string){await updateDoc(doc(db,"profiles",id),{role:"worker"});load();}

  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Team Access</h1>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><span className="badge badge-orange mb-2 inline-flex">Super Admin</span><p className="text-gray-500 text-xs leading-relaxed">Full access — manage team, verify, suspend, all permissions.</p></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><span className="badge badge-navy mb-2 inline-flex">Admin</span><p className="text-gray-500 text-xs leading-relaxed">Verify, suspend, edit workers/employers/jobs. Cannot manage team.</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-heading font-bold text-navy text-sm mb-4">Current Team ({team.length})</h2>
        {team.map(m=>(
          <div key={m.id} className="flex items-center gap-3 p-3 bg-lgray rounded-xl mb-2">
            <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">{m.fullName?.[0]}</div>
            <div className="flex-1"><p className="font-semibold text-navy text-sm">{m.fullName}</p><p className="text-gray-400 text-xs">{m.email}</p></div>
            <span className={`badge ${m.role==="superadmin"?"badge-orange":"badge-navy"}`}>{m.role}</span>
            {isSuper&&m.role==="admin"&&<button onClick={()=>revoke(m.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-500"><ShieldOff size={12} className="inline mr-1"/>Revoke</button>}
          </div>
        ))}
      </div>
      {isSuper&&(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-heading font-bold text-navy text-sm mb-4">Add Team Member</h2>
          <div className="flex gap-2 mb-3"><div className="relative flex-1"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchUsers()} className="input-base pl-10" placeholder="Search by name or email..."/></div><button onClick={searchUsers} className="btn-secondary">Search</button></div>
          {results.map(r=>(
            <div key={r.id} className="flex items-center gap-3 p-3 bg-lgray rounded-xl mb-2"><div className="w-9 h-9 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm">{r.fullName?.[0]}</div><div className="flex-1"><p className="font-semibold text-navy text-sm">{r.fullName}</p><p className="text-gray-400 text-xs">{r.email}</p></div><button onClick={()=>grant(r.id)} className="btn-primary text-xs py-1.5 px-3">Grant Admin</button></div>
          ))}
        </div>
      )}
    </div>
  );
}
