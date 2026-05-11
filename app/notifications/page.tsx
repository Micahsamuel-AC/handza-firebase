"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { Bell, Briefcase, MessageSquare, Star, Zap, CheckCheck } from "lucide-react";

const iconMap: any = { job:"Briefcase", message:"MessageSquare", review:"Star" };

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    loadNotifs();
  }, [user]);

  async function loadNotifs() {
    const snap = await getDocs(query(collection(db,"notifications"), where("userId","==",user!.uid), orderBy("createdAt","desc")));
    setNotifs(snap.docs.map(d=>({id:d.id,...d.data()})));
    // Mark all as read
    snap.docs.filter(d=>!d.data().isRead).forEach(d => updateDoc(doc(db,"notifications",d.id),{isRead:true}));
    setLoading(false);
  }

  async function markAllRead() {
    notifs.forEach(n => { if(!n.isRead) updateDoc(doc(db,"notifications",n.id),{isRead:true}); });
    setNotifs(notifs.map(n=>({...n,isRead:true})));
  }

  const icons: any = { job: Briefcase, message: MessageSquare, review: Star, default: Zap };

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy">Notifications</h1>
            {notifs.filter(n=>!n.isRead).length > 0 && (
              <p className="text-handza text-sm mt-1">{notifs.filter(n=>!n.isRead).length} unread</p>
            )}
          </div>
          {notifs.length > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors">
              <CheckCheck size={16}/> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>
        ) : notifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Bell size={48} className="mx-auto mb-3 text-gray-300"/>
            <p className="font-heading font-semibold text-gray-400 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map(n => {
              const Icon = icons[n.type] || icons.default;
              return (
                <div key={n.id} className={`bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all ${!n.isRead?"border-l-4 border-handza":""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.isRead?"bg-handza/10":"bg-gray-100"}`}>
                    <Icon size={18} className={!n.isRead?"text-handza":"text-gray-500"}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-navy text-sm">{n.title}</p>
                    {n.message && <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>}
                    <p className="text-gray-400 text-xs mt-2">
                      {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleDateString("en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "Just now"}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-handza rounded-full flex-shrink-0 mt-1"/>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
