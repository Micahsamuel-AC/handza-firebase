"use client";
import {useState} from "react";
import {doc,updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {useAuth} from "@/lib/auth-context";
import {Users,Briefcase,ArrowLeftRight} from "lucide-react";
export default function RoleSwitcher({onSwitch}:{onSwitch?:(r:"worker"|"employer")=>void}) {
  const {user,profile,refreshProfile} = useAuth();
  const [switching,setSwitching] = useState(false);
  if (!profile?.roles || profile.roles.length < 2) return null;
  const active = profile.activeRole || profile.role;
  const isWorker = active==="worker";
  async function sw() {
    if (!user||switching) return;
    setSwitching(true);
    const next = isWorker?"employer":"worker";
    await updateDoc(doc(db,"profiles",user.uid),{activeRole:next});
    await refreshProfile();
    onSwitch?.(next as any);
    setSwitching(false);
  }
  return (
    <div className="flex items-center gap-2 bg-lgray rounded-2xl p-1">
      <button onClick={()=>!isWorker&&sw()} disabled={switching}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all ${isWorker?"bg-handza text-white shadow-sm":"text-gray-500 hover:text-navy"}`}>
        <Users size={15}/>Worker
      </button>
      <ArrowLeftRight size={13} className="text-gray-400"/>
      <button onClick={()=>isWorker&&sw()} disabled={switching}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all ${!isWorker?"bg-navy text-white shadow-sm":"text-gray-500 hover:text-navy"}`}>
        <Briefcase size={15}/>Employer
      </button>
      {switching&&<div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"/>}
    </div>
  );
}
