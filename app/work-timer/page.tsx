"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Play, Square, Clock, DollarSign, CheckCircle, Timer, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

const HOURLY_CATS = ["Cleaning", "Household Help", "Logistics"];
const COMMISSION  = 0.10;

function formatTime(secs: number) {
  const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = secs%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function WorkTimerContent() {
  const params            = useSearchParams();
  const router            = useRouter();
  const jobId             = params.get("jobId") || "";
  const { user, profile } = useAuth();
  const [job, setJob]         = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completed, setCompleted]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (jobId) load();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user, jobId]);

  async function load() {
    setLoading(true);
    const snap = await getDoc(doc(db,"jobs",jobId));
    if (!snap.exists()) { router.push("/dashboard"); return; }
    const j = { id: snap.id, ...snap.data() } as any;
    setJob(j);
    if (j.activeTimerSession) {
      const ss = await getDoc(doc(db,"workSessions",j.activeTimerSession));
      if (ss.exists()) {
        const sd = { id: ss.id, ...ss.data() } as any;
        setSession(sd);
        if (sd.status === "running" && sd.startedAt) {
          const base = Math.floor((Date.now() - sd.startedAt.toDate().getTime()) / 1000);
          setElapsed(base); setRunning(true);
          tick(base);
        }
        if (sd.status === "completed") setCompleted(true);
      }
    }
    setLoading(false);
  }

  function tick(base = 0) {
    let n = base;
    timerRef.current = setInterval(() => { n++; setElapsed(n); }, 1000);
  }

  async function startWork() {
    if (!user || !job) return;
    setRunning(true); setElapsed(0); tick(0);
    const ref = await addDoc(collection(db,"workSessions"), {
      jobId, workerId:user.uid, workerName:profile?.fullName,
      employerId:job.employerId, employerName:job.employerName,
      category:job.category, hourlyRate:job.payRate,
      startedAt:serverTimestamp(), status:"running", createdAt:serverTimestamp(),
    });
    await updateDoc(doc(db,"jobs",jobId), { activeTimerSession:ref.id, timerStatus:"running", status:"in_progress" });
    setSession({ id:ref.id, hourlyRate:job.payRate, status:"running" });
  }

  async function confirmStop() {
    if (timerRef.current) clearInterval(timerRef.current);
    const gross = Math.ceil((elapsed/3600) * (job?.payRate||0));
    const comm  = Math.ceil(gross * COMMISSION);
    const earn  = gross - comm;
    await updateDoc(doc(db,"workSessions",session.id), {
      endedAt:serverTimestamp(), totalSeconds:elapsed,
      totalMinutes:Math.ceil(elapsed/60), totalHours:Math.round(elapsed/3600*100)/100,
      grossAmount:gross, commission:comm, workerEarns:earn, status:"completed",
    });
    await updateDoc(doc(db,"jobs",jobId), {
      timerStatus:"completed", totalSeconds:elapsed,
      totalAmount:gross, workerEarns:earn, commission:comm, status:"completed",
    });
    setSession((s:any) => ({ ...s, status:"completed", totalSeconds:elapsed, grossAmount:gross, commission:comm, workerEarns:earn }));
    setRunning(false); setConfirming(false); setCompleted(true);
  }

  const rate    = job?.payRate || 0;
  const gross   = Math.ceil((elapsed/3600) * rate);
  const comm    = Math.ceil(gross * COMMISSION);
  const earn    = gross - comm;

  if (loading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="section-container pt-28 pb-16 max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6">
          <ArrowLeft size={15}/> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="badge badge-navy text-xs">{job.category}</span>
            <span className={`badge text-xs ${HOURLY_CATS.includes(job.category)?"badge-green":"badge-amber"}`}>
              {HOURLY_CATS.includes(job.category)?"Hourly Billing":"Coming Soon"}
            </span>
          </div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">{job.title}</h1>
          <p className="text-gray-500 text-sm">For: {job.employerName}</p>
          <p className="text-handza font-bold text-lg mt-2">LKR {job.payRate}/hour</p>
        </div>

        {!HOURLY_CATS.includes(job.category) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <AlertCircle size={32} className="text-amber-500 mx-auto mb-3"/>
            <h2 className="font-heading font-bold text-navy text-lg mb-2">Coming Soon</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Hourly billing for <strong>{job.category}</strong> is coming soon.<br/>
              Currently available for: <strong>Cleaning, Household Help, Logistics</strong>
            </p>
          </div>
        ) : completed && session ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3"/>
            <h2 className="font-heading font-bold text-navy text-xl mb-4">Work Completed!</h2>
            <div className="bg-white rounded-xl p-4 space-y-3 text-left mb-5">
              {[
                ["Total time", `${Math.floor((session.totalSeconds||0)/3600)}h ${Math.floor(((session.totalSeconds||0)%3600)/60)}m`],
                ["Gross amount", `LKR ${session.grossAmount}`],
                ["HANDZA fee (10%)", `- LKR ${session.commission}`],
                ["You receive", `LKR ${session.workerEarns}`],
              ].map(([l,v]) => (
                <div key={l} className={`flex justify-between text-sm ${l==="You receive"?"border-t border-gray-100 pt-3 font-bold":""}`}>
                  <span className={l==="You receive"?"text-navy":"text-gray-500"}>{l}</span>
                  <span className={l==="You receive"?"text-green-600 text-lg":"text-navy"}>{v}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard" className="btn-primary w-full justify-center">Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className={`rounded-3xl p-8 text-center mb-5 ${running?"bg-navy":"bg-white border border-gray-100 shadow-sm"}`}>
              <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center relative ${running?"bg-white/10":"bg-lgray"}`}>
                {running && <div className="absolute inset-0 rounded-full border-4 border-handza/30 animate-spin-slow"/>}
                <div className="text-center">
                  <Timer size={24} className={`${running?"text-white":"text-handza"} mx-auto mb-1`}/>
                  <p className={`font-heading font-bold text-2xl ${running?"text-white":"text-navy"}`}>{formatTime(elapsed)}</p>
                </div>
              </div>
              {running ? (
                <>
                  <p className="text-white/60 text-sm mb-2">Timer running</p>
                  <p className="text-white font-heading font-bold text-4xl mb-1">LKR {gross}</p>
                  <p className="text-white/50 text-xs">Gross earnings so far</p>
                  <div className="bg-white/10 rounded-xl p-3 mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-white/70"><span>HANDZA fee (10%)</span><span>- LKR {comm}</span></div>
                    <div className="flex justify-between text-sm font-bold text-white"><span>You receive</span><span>LKR {earn}</span></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-1">Rate: LKR {rate}/hr</p>
                  <p className="text-navy font-heading font-bold text-2xl">Ready to start</p>
                  <p className="text-gray-400 text-xs mt-1">Press Start Work when you arrive at the site</p>
                </>
              )}
            </div>

            {!running ? (
              <button onClick={startWork} className="btn-primary w-full justify-center py-4 text-base">
                <Play size={20}/> Start Work
              </button>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-heading font-bold py-4 rounded-2xl hover:bg-red-600 transition-colors text-base">
                <Square size={20}/> Stop Work
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              Timer starts when you tap Start Work. HANDZA deducts 10% commission automatically.
            </p>
          </>
        )}

        {confirming && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <h3 className="font-heading font-bold text-navy text-xl mb-2">Stop work?</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Timer stops at <strong>{formatTime(elapsed)}</strong>.<br/>
                Total: <strong>LKR {gross}</strong> — you receive <strong>LKR {earn}</strong> after 10% fee.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:border-navy/30 transition-colors">
                  Keep Working
                </button>
                <button onClick={confirmStop}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
                  Stop & Calculate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkTimerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}>
      <WorkTimerContent/>
    </Suspense>
  );
}
