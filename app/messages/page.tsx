"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs, or } from "firebase/firestore";
import { Send, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const router            = useRouter();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv]       = useState<any>(null);
  const [messages, setMessages]           = useState<any[]>([]);
  const [newMsg, setNewMsg]               = useState("");
  const [sending, setSending]             = useState(false);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    const q = query(collection(db,"conversations"), where("participants","array-contains",user.uid));
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    const q = query(collection(db,"messages"), where("conversationId","==",activeConv.id), orderBy("createdAt","asc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [activeConv]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv || !user) return;
    setSending(true);
    await addDoc(collection(db,"messages"), {
      conversationId: activeConv.id, senderId: user.uid,
      senderName: profile?.fullName, text: newMsg.trim(),
      createdAt: serverTimestamp(),
    });
    setNewMsg(""); setSending(false);
  }

  const otherName = (conv: any) => conv.participantNames?.find((n: string) => n !== profile?.fullName) || "Unknown";

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-navy">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time chat with your connections</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-navy text-sm">Conversations ({conversations.length})</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare size={28} className="text-gray-200 mx-auto mb-2"/>
                    <p className="text-gray-400 text-xs">No conversations yet</p>
                  </div>
                ) : conversations.map(conv => (
                  <button key={conv.id} onClick={() => setActiveConv(conv)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-lgray transition-colors ${activeConv?.id === conv.id ? "bg-lgray" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {otherName(conv)?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy text-sm truncate">{otherName(conv)}</p>
                        <p className="text-gray-400 text-xs truncate">{conv.lastMessage || "Start a conversation"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center text-center px-8">
                  <div>
                    <MessageSquare size={40} className="text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 text-sm">Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {otherName(activeConv)?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{otherName(activeConv)}</p>
                      <p className="text-green-500 text-xs">Online</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.senderId === user?.uid
                            ? "bg-navy text-white rounded-br-sm"
                            : "bg-lgray text-gray-800 rounded-bl-sm"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}/>
                  </div>

                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3">
                    <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                      className="input-base flex-1 py-2.5" placeholder="Type a message..."/>
                    <button type="submit" disabled={sending || !newMsg.trim()}
                      className="bg-handza text-white p-3 rounded-xl hover:bg-handza-dark transition-colors disabled:opacity-50">
                      <Send size={16}/>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
