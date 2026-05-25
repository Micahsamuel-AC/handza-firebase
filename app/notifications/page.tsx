"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { Bell, CheckCircle, Briefcase, MessageSquare, AlertCircle, Star } from "lucide-react";
import Link from "next/link";

const ICONS: Record<string, any> = {
  job:     { icon: Briefcase,     color: "bg-blue-50 text-blue-600" },
  message: { icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
  rating:  { icon: Star,          color: "bg-yellow-50 text-yellow-600" },
  alert:   { icon: AlertCircle,   color: "bg-red-50 text-red-600" },
  success: { icon: CheckCircle,   color: "bg-green-50 text-green-600" },
};

export default function NotificationsPage() {
  const router            = useRouter();
  const { user }          = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    const q = query(collection(db,"notifications"), where("userId","==",user.uid), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user]);

  async function markRead(id: string) {
    await updateDoc(doc(db,"notifications",id), { read: true });
  }

  async function markAllRead() {
    await Promise.all(notifs.filter(n => !n.read).map(n => updateDoc(doc(db,"notifications",n.id), { read: true })));
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy">Notifications</h1>
            {unreadCount > 0 && <p className="text-handza text-sm mt-0.5 font-medium">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-navy hover:text-handza transition-colors">
              Mark all read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {notifs.length === 0 ? (
            <div className="text-center py-16">
              <Bell size={36} className="text-gray-200 mx-auto mb-3"/>
              <p className="text-gray-400 text-sm">No notifications yet</p>
              <p className="text-gray-300 text-xs mt-1">We'll notify you about job requests, messages, and more</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifs.map(n => {
                const cfg = ICONS[n.type] || ICONS.alert;
                const Icon = cfg.icon;
                return (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-lgray transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon size={16}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${!n.read ? "font-semibold text-navy" : "text-gray-700"}`}>{n.message}</p>
                      {n.link && (
                        <Link href={n.link} className="text-xs text-handza hover:underline font-medium mt-0.5 inline-block"
                          onClick={e => e.stopPropagation()}>
                          View details →
                        </Link>
                      )}
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-handza rounded-full flex-shrink-0 mt-1.5"/>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
