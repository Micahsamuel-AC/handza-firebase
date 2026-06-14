"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db} from "@/lib/firebase";
import {collection,query,where,getDocs,orderBy,doc,updateDoc,writeBatch} from "firebase/firestore";
import {Bell,CheckCheck} from "lucide-react";

export default function NotificationsPage(){
  const router=useRouter();
  const {user,loading:authLoading}=useAuth();
  const [notifs,setNotifs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{if(!authLoading&&!user){router.push("/auth/login");return;}if(user)load();},[user,authLoading]);
  async function load(){
    if(!user)return;
    try{
      const snap=await getDocs(query(collection(db,"notifications"),where("userId","==",user.uid),orderBy("createdAt","desc")));
      setNotifs(snap.docs.map(d=>({id:d.id,...d.data()})));
    }catch{setNotifs([]);}
    setLoading(false);
  }
  async function markRead(id:string){await updateDoc(doc(db,"notifications",id),{read:true});setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));}
  async function markAllRead(){
    const batch=writeBatch(db);
    notifs.filter(n=>!n.read).forEach(n=>batch.update(doc(db,"notifications",n.id),{read:true}));
    await batch.commit();setNotifs(p=>p.map(n=>({...n,read:true})));
  }
  const unread=notifs.filter(n=>!n.read).length;

  if(authLoading||loading)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div><span className="text-handza font-semibold text-xs uppercase tracking-widest">Inbox</span><h1 className="font-heading text-3xl font-bold text-navy mt-1">Notifications</h1>{unread>0&&<p className="text-orange-500 text-sm font-semibold mt-1">{unread} unread</p>}</div>
        {unread>0&&<button onClick={markAllRead} className="btn-secondary text-sm py-2"><CheckCheck size={14}/>Mark all read</button>}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifs.length===0?<div className="text-center py-16"><Bell size={32} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No notifications yet</p></div>:
        notifs.map(n=>(
          <button key={n.id} onClick={()=>!n.read&&markRead(n.id)} className={`w-full flex items-start gap-3 p-4 border-b border-gray-50 last:border-0 hover:bg-lgray transition-colors text-left ${!n.read?"bg-navy/3":""}`}>
            <div className="w-9 h-9 bg-navy-light rounded-xl flex items-center justify-center flex-shrink-0">🔔</div>
            <div className="flex-1"><p className="font-semibold text-navy text-sm">{n.title||"Notification"}</p><p className="text-gray-500 text-xs mt-0.5">{n.message}</p></div>
            {!n.read&&<div className="w-2 h-2 bg-handza rounded-full flex-shrink-0 mt-1.5"/>}
          </button>
        ))}
      </div>
    </div></div>
  );
}
