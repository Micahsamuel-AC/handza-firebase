"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp, doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { Send, MessageSquare, ArrowLeft, Search } from "lucide-react";

function MessagesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    const to = params.get("to");
    if (to) openChat(to);
  }, [user]);

  async function loadConversations() {
    const [sentSnap, recvSnap] = await Promise.all([
      getDocs(query(collection(db,"messages"), where("senderId","==",user!.uid))),
      getDocs(query(collection(db,"messages"), where("receiverId","==",user!.uid)))
    ]);
    const userIds = new Set<string>();
    sentSnap.docs.forEach(d => userIds.add(d.data().receiverId));
    recvSnap.docs.forEach(d => userIds.add(d.data().senderId));
    const convs = await Promise.all(Array.from(userIds).map(async uid => {
      const snap = await getDoc(doc(db,"profiles",uid));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }));
    setConversations(convs.filter(Boolean));
    setLoading(false);
  }

  async function openChat(uid: string) {
    if (unsubRef.current) unsubRef.current();
    const snap = await getDoc(doc(db,"profiles",uid));
    if (!snap.exists()) return;
    setActiveUser({ id: snap.id, ...snap.data() });
    if (!conversations.find((c:any)=>c.id===uid)) {
      setConversations(prev => [...prev, { id: snap.id, ...snap.data() }]);
    }
    // Real-time listener
    const q = query(collection(db,"messages"),
      where("participants","array-contains",user!.uid),
      orderBy("createdAt","asc"));
    unsubRef.current = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d=>({id:d.id,...d.data()}))
        .filter((m:any) => (m.senderId===user!.uid && m.receiverId===uid) || (m.senderId===uid && m.receiverId===user!.uid));
      setMessages(msgs);
      setTimeout(()=>messagesEndRef.current?.scrollIntoView({behavior:"smooth"}),50);
    });
    // Mark as read
    const unreadSnap = await getDocs(query(collection(db,"messages"), where("senderId","==",uid), where("receiverId","==",user!.uid), where("isRead","==",false)));
    unreadSnap.docs.forEach(d => updateDoc(doc(db,"messages",d.id),{isRead:true}));
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeUser || !user) return;
    const msg = { senderId:user.uid, senderName:profile?.fullName, receiverId:activeUser.id,
      content:newMsg.trim(), isRead:false, participants:[user.uid,activeUser.id], createdAt:serverTimestamp() };
    setNewMsg("");
    await addDoc(collection(db,"messages"), msg);
    await addDoc(collection(db,"notifications"), {
      userId:activeUser.id, title:`New message from ${profile?.fullName}`,
      message:newMsg.trim().substring(0,60), type:"message", isRead:false, createdAt:serverTimestamp()
    });
  }

  const filteredConvs = conversations.filter((c:any) => c.fullName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-lgray flex flex-col">
      <Navbar/>
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 pt-24 pb-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex" style={{height:"calc(100vh - 120px)"}}>

          {/* Sidebar */}
          <div className={`flex flex-col border-r border-gray-100 ${activeUser ? "hidden sm:flex w-72" : "flex w-full sm:w-72"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-navy mb-3">Messages</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..."
                  className="w-full bg-lgray rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none"/>
              </div>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-3 border-handza border-t-transparent rounded-full animate-spin"/></div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <MessageSquare size={36} className="mb-3 opacity-30"/>
                <p className="font-heading font-semibold text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Apply to jobs or hire workers to start chatting</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {filteredConvs.map((conv:any) => (
                  <button key={conv.id} onClick={()=>openChat(conv.id)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-lgray transition-colors text-left ${activeUser?.id===conv.id?"bg-lgray border-r-2 border-handza":""}`}>
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.fullName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{conv.fullName}</p>
                      <p className="text-gray-400 text-xs capitalize">{conv.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          {activeUser ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                <button onClick={()=>setActiveUser(null)} className="sm:hidden p-1.5 hover:bg-lgray rounded-xl mr-1"><ArrowLeft size={18} className="text-navy"/></button>
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold">{activeUser.fullName?.[0]}</div>
                <div>
                  <p className="font-heading font-semibold text-navy">{activeUser.fullName}</p>
                  <p className="text-green-500 text-xs capitalize">{activeUser.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-lgray/30">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {messages.map((msg:any, i) => {
                  const isMine = msg.senderId === user?.uid;
                  return (
                    <div key={i} className={`flex ${isMine?"justify-end":"justify-start"}`}>
                      {!isMine && (
                        <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end mb-1">
                          {activeUser.fullName?.[0]}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMine ? "bg-navy text-white rounded-br-sm" : "bg-white text-gray-700 rounded-bl-sm"
                      }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${isMine?"text-white/50":"text-gray-400"}`}>
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "Sending..."}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}/>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input value={newMsg} onChange={e=>setNewMsg(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                    placeholder={`Message ${activeUser.fullName}...`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition"/>
                  <button onClick={sendMessage} disabled={!newMsg.trim()}
                    className="bg-navy text-white px-4 py-3 rounded-xl hover:bg-handza transition-colors disabled:opacity-40 shadow-sm">
                    <Send size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-gray-400">
              <MessageSquare size={56} className="mb-4 opacity-20"/>
              <p className="font-heading font-semibold text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose someone to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}><MessagesContent/></Suspense>;
}
