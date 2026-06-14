"use client";
import {useEffect,useState,useRef} from "react";
import {useRouter} from "next/navigation";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db} from "@/lib/firebase";
import {collection,query,where,getDocs,addDoc,onSnapshot,orderBy,serverTimestamp,doc,updateDoc} from "firebase/firestore";
import {Send,MessageSquare} from "lucide-react";

export default function MessagesPage(){
  const router=useRouter();
  const {user,profile,loading:authLoading}=useAuth();
  const [convs,setConvs]=useState<any[]>([]);
  const [active,setActive]=useState<any>(null);
  const [messages,setMessages]=useState<any[]>([]);
  const [text,setText]=useState("");
  const bottomRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{if(!authLoading&&!user){router.push("/auth/login");return;}if(user)loadConvs();},[user,authLoading]);
  async function loadConvs(){
    if(!user)return;
    const snap=await getDocs(query(collection(db,"conversations"),where("participants","array-contains",user.uid)));
    const list=snap.docs.map(d=>({id:d.id,...d.data()}));
    setConvs(list);
    if(list.length>0)setActive(list[0]);
  }
  useEffect(()=>{
    if(!active)return;
    const unsub=onSnapshot(query(collection(db,"messages"),where("conversationId","==",active.id),orderBy("createdAt","asc")),snap=>{
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()})));
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
    });
    return ()=>unsub();
  },[active]);

  async function send(){
    if(!text.trim()||!user||!active)return;
    await addDoc(collection(db,"messages"),{conversationId:active.id,senderId:user.uid,senderName:profile?.fullName,text:text.trim(),createdAt:serverTimestamp()});
    await updateDoc(doc(db,"conversations",active.id),{lastMessage:text.trim(),lastMessageAt:serverTimestamp()});
    setText("");
  }

  if(authLoading)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  function otherName(c:any){
    if(!c.participantNames||!user)return"Conversation";
    const others=Object.entries(c.participantNames).filter(([id])=>id!==user.uid);
    return others[0]?.[1]||"Conversation";
  }

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="pt-16 flex" style={{height:"100vh"}}>
      <div className="w-full sm:w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100"><h1 className="font-heading font-bold text-navy text-lg">Messages</h1></div>
        <div className="flex-1 overflow-y-auto">
          {convs.length===0?<div className="text-center py-12 px-4"><MessageSquare size={32} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No conversations yet</p><p className="text-gray-400 text-xs mt-1">Conversations start after a worker is hired</p></div>:
          convs.map(c=>(
            <button key={c.id} onClick={()=>setActive(c)} className={`w-full flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-lgray transition-colors text-left ${active?.id===c.id?"bg-lgray":""}`}>
              <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">{otherName(c)?.[0]}</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{otherName(c)}</p><p className="text-gray-400 text-xs truncate">{c.lastMessage||"No messages yet"}</p></div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 hidden sm:flex flex-col">
        {active?(
          <>
            <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3"><div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold">{otherName(active)?.[0]}</div><p className="font-semibold text-navy">{otherName(active)}</p></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m=>(
                <div key={m.id} className={`flex ${m.senderId===user?.uid?"justify-end":"justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${m.senderId===user?.uid?"bg-navy text-white rounded-br-md":"bg-white text-gray-700 rounded-bl-md shadow-sm"}`}>{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white flex gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} className="input-base flex-1" placeholder="Type a message..."/>
              <button onClick={send} className="btn-primary px-4"><Send size={16}/></button>
            </div>
          </>
        ):<div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>}
      </div>
    </div></div>
  );
}
