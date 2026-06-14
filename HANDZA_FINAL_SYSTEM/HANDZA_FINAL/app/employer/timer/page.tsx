"use client";
import {useEffect,useState,useRef,Suspense} from "react";
import {useSearchParams,useRouter} from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db} from "@/lib/firebase";
import {doc,getDoc,onSnapshot,updateDoc,serverTimestamp} from "firebase/firestore";
import {ArrowLeft,Timer,CheckCircle} from "lucide-react";

function fmt(s:number){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}

function Content(){
  const params=useSearchParams();const router=useRouter();
  const jobId=params.get("jobId")||"";
  const {user}=useAuth();
  const [job,setJob]=useState<any>(null);
  const [session,setSession]=useState<any>(null);
  const [elapsed,setElapsed]=useState(0);
  const [confirmed,setConfirmed]=useState(false);
  const tickRef=useRef<any>(null);

  useEffect(()=>{if(!user){router.push("/auth/login");return;}if(jobId)load();return()=>{if(tickRef.current)clearInterval(tickRef.current);};},[user,jobId]);

  async function load(){
    const snap=await getDoc(doc(db,"jobs",jobId));
    if(!snap.exists())return;
    const j={id:snap.id,...snap.data()} as any;setJob(j);
    if(j.activeTimerSession){
      const unsub=onSnapshot(doc(db,"workSessions",j.activeTimerSession),s=>{
        if(!s.exists())return;
        const sd={id:s.id,...s.data()} as any;setSession(sd);
        if(sd.status==="running"&&sd.startedAt){
          if(tickRef.current)clearInterval(tickRef.current);
          const base=Math.floor((Date.now()-sd.startedAt.toDate().getTime())/1000);
          setElapsed(base);
          tickRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
        }
        if(sd.status==="completed"){if(tickRef.current)clearInterval(tickRef.current);setElapsed(sd.totalSeconds||0);}
      });
      return ()=>unsub();
    }
  }

  async function confirmPayment(){
    if(!session)return;
    await updateDoc(doc(db,"workSessions",session.id),{employerConfirmed:true,confirmedAt:serverTimestamp()});
    setConfirmed(true);
  }

  if(!job)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  const rate=job.payRate||0;
  const gross=session?.status==="completed"?session.grossAmount:Math.ceil((elapsed/3600)*rate);
  const comm=session?.status==="completed"?session.commission:Math.ceil(gross*0.1);
  const earn=session?.status==="completed"?session.workerEarns:gross-comm;
  const isRunning=session?.status==="running";
  const isComplete=session?.status==="completed";

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16 max-w-lg">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6"><ArrowLeft size={15}/>Back to Dashboard</Link>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">{job.title}</h1>
        <p className="text-gray-500 text-sm">Worker: {session?.workerName||"—"}</p>
        <p className="text-handza font-bold text-base mt-2">LKR {rate}/hr</p>
      </div>
      <div className="bg-navy rounded-3xl p-8 text-center mb-5">
        <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center relative bg-white/10 ${isRunning?"":"opacity-60"}`}>
          {isRunning&&<div className="absolute inset-0 rounded-full border-4 border-handza/30 animate-spin-slow"/>}
          <div className="text-center"><Timer size={24} className="text-white mx-auto mb-1"/><p className="font-heading font-bold text-2xl text-white">{fmt(elapsed)}</p></div>
        </div>
        <p className="text-white/60 text-sm mb-2">{isComplete?"Final amount":isRunning?"Live running total":"Waiting for worker to start..."}</p>
        <p className="text-white font-heading font-bold text-4xl mb-1">LKR {gross}</p>
        <p className="text-white/50 text-xs">You pay this amount</p>
        <div className="bg-white/10 rounded-xl p-3 mt-4 space-y-2"><div className="flex justify-between text-xs text-white/70"><span>Worker receives</span><span>LKR {earn}</span></div><div className="flex justify-between text-sm font-bold text-white"><span>HANDZA commission</span><span>LKR {comm}</span></div></div>
      </div>
      {isRunning&&<div className="bg-amber-50 rounded-2xl p-4 text-center text-amber-700 text-sm mb-4">Work in progress. Confirm payment once the worker stops the timer.</div>}
      {isComplete&&!confirmed&&!session?.employerConfirmed&&(
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-heading font-bold text-navy text-sm mb-3">Payment Summary</h3>
            {[["Total time",`${Math.floor(elapsed/3600)}h ${Math.floor((elapsed%3600)/60)}m`],["Gross amount",`LKR ${gross}`],["HANDZA fee (10%)",`LKR ${comm}`]].map(([l,v])=>(
              <div key={l} className="flex justify-between text-sm mb-2"><span className="text-gray-500">{l}</span><span className="font-semibold">{v}</span></div>
            ))}
            <div className="flex justify-between text-base border-t border-gray-100 pt-3"><span className="font-bold text-navy">You pay total</span><span className="font-bold text-handza">LKR {gross}</span></div>
          </div>
          <button onClick={confirmPayment} className="btn-primary w-full justify-center py-3.5 bg-green-500 hover:bg-green-600"><CheckCircle size={16}/>Confirm & Release Payment</button>
        </>
      )}
      {(confirmed||session?.employerConfirmed)&&(
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center"><CheckCircle size={36} className="text-green-500 mx-auto mb-2"/><p className="font-heading font-bold text-navy">Payment Confirmed!</p><p className="text-gray-500 text-sm mt-1">Worker will receive LKR {earn}.</p></div>
      )}
    </div></div>
  );
}
export default function EmployerTimerPage(){return<Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}><Content/></Suspense>;}
