"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { Timer, CheckCircle, DollarSign, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function EmployerTimerContent() {
  const params            = useSearchParams();
  const router            = useRouter();
  const jobId             = params.get("jobId") || "";
  const { user, profile } = useAuth();
  const [job, setJob]     = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  useEffect(() => {
    if (!user || !jobId) return;
    loadJob();
  }, [user, jobId]);

  async function loadJob() {
    const snap = await getDoc(doc(db, "jobs", jobId));
    if (!snap.exists()) { router.push("/dashboard"); return; }
    const jobData = { id: snap.id, ...snap.data() } as any;
    setJob(jobData);

    if (jobData.activeTimerSession) {
      // Live listener on session
      const unsub = onSnapshot(doc(db, "workSessions", jobData.activeTimerSession), (s) => {
        if (s.exists()) {
          const data = { id: s.id, ...s.data() } as any;
          setSession(data);
          if (data.status === "running" && data.startedAt) {
            const secs = Math.floor((Date.now() - data.startedAt.toDate().getTime()) / 1000);
            setElapsed(secs);
          }
        }
      });
      setLoading(false);
      return () => unsub();
    }
    setLoading(false);
  }

  // Keep elapsed time updating
  useEffect(() => {
    if (session?.status !== "running") return;
    const interval = setInterval(() => {
      if (session?.startedAt) {
        setElapsed(Math.floor((Date.now() - session.startedAt.toDate().getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  async function confirmPayment() {
    if (!session) return;
    setConfirming(true);
    await updateDoc(doc(db, "workSessions", session.id), {
      employerConfirmed: true,
      employerConfirmedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "jobs", jobId), {
      paymentConfirmed: true,
      paymentConfirmedAt: serverTimestamp(),
    });
    setConfirmed(true);
    setConfirming(false);
  }

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  const liveAmount  = session?.grossAmount || Math.ceil((elapsed / 3600) * (session?.hourlyRate || job?.payRate || 0));
  const commission  = Math.ceil(liveAmount * 0.10);
  const workerGets  = liveAmount - commission;

  if (loading) return (
    <div className="min-h-screen bg-lgray flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="section-container pt-28 pb-16 max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6">
          <ArrowLeft size={15}/> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h1 className="font-heading font-bold text-navy text-xl mb-1">{job?.title}</h1>
          <p className="text-gray-500 text-sm">Worker: {session?.workerName || "Assigned worker"}</p>
          <p className="text-handza font-bold mt-1">LKR {job?.payRate}/hr</p>
        </div>

        {!session ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <AlertCircle size={32} className="text-amber-500 mx-auto mb-3"/>
            <p className="text-amber-800 font-semibold text-sm">Worker hasn't started yet</p>
            <p className="text-amber-600 text-xs mt-1">The timer will appear here once the worker taps "Start Work"</p>
          </div>
        ) : confirmed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3"/>
            <h2 className="font-heading font-bold text-navy text-xl mb-2">Payment Confirmed!</h2>
            <p className="text-gray-500 text-sm mb-4">Thank you. The worker will receive their payment within 3 business days.</p>
            <div className="bg-white rounded-xl p-4 text-left space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total time</span>
                <span className="font-semibold">{formatTime(session.totalSeconds || elapsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You paid</span>
                <span className="font-bold text-navy">LKR {session.grossAmount || liveAmount}</span>
              </div>
            </div>
            <Link href="/dashboard" className="btn-primary w-full justify-center">Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className={`rounded-3xl p-8 text-center mb-5 ${session.status==="running" ? "bg-navy" : "bg-white border border-gray-100 shadow-sm"}`}>
              <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center relative bg-white/10">
                {session.status === "running" && <div className="absolute inset-0 rounded-full border-4 border-handza/30 animate-spin-slow"/>}
                <div className="text-center">
                  <Timer size={24} className={session.status==="running" ? "text-white mx-auto mb-1" : "text-handza mx-auto mb-1"}/>
                  <p className={`font-heading font-bold text-2xl ${session.status==="running" ? "text-white" : "text-navy"}`}>
                    {session.status === "completed" ? formatTime(session.totalSeconds) : formatTime(elapsed)}
                  </p>
                </div>
              </div>

              {session.status === "running" ? (
                <>
                  <p className="text-white/60 text-sm mb-2">Worker is working</p>
                  <p className="text-white font-heading font-bold text-4xl mb-1">LKR {liveAmount}</p>
                  <p className="text-white/50 text-xs">Running total (you pay this)</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-2">Work completed</p>
                  <p className="text-navy font-heading font-bold text-4xl mb-1">LKR {session.grossAmount}</p>
                  <p className="text-gray-400 text-xs">Total amount due</p>
                </>
              )}
            </div>

            {/* Payment breakdown */}
            {session.status === "completed" && !confirmed && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <h3 className="font-heading font-bold text-navy text-sm mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total time", val: `${Math.floor((session.totalSeconds||0)/3600)}h ${Math.floor(((session.totalSeconds||0)%3600)/60)}m` },
                    { label: "Rate", val: `LKR ${session.hourlyRate}/hr` },
                    { label: "Gross amount", val: `LKR ${session.grossAmount}` },
                    { label: "HANDZA commission (10%)", val: `LKR ${session.commission}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-navy">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-navy">Worker receives</span>
                    <span className="font-bold text-green-600 text-lg">LKR {session.workerEarns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-navy text-base">You pay total</span>
                    <span className="font-bold text-handza text-xl">LKR {session.grossAmount}</span>
                  </div>
                </div>

                <button onClick={confirmPayment} disabled={confirming}
                  className="btn-primary w-full justify-center mt-4 py-4 disabled:opacity-60">
                  <DollarSign size={18}/>
                  {confirming ? "Confirming..." : "Confirm & Release Payment"}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                  By confirming, you agree the work was completed satisfactorily and authorise payment to the worker.
                </p>
              </div>
            )}

            {session.status === "running" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-amber-700 text-xs leading-relaxed">
                  Work is in progress. You'll be able to confirm payment once the worker stops the timer.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EmployerTimerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}>
      <EmployerTimerContent/>
    </Suspense>
  );
}
