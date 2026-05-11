"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { MapPin, Clock, Zap, ArrowLeft, CheckCircle, Send, Star } from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [employer, setEmployer] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const jobSnap = await getDoc(doc(db, "jobs", id as string));
      if (!jobSnap.exists()) return;
      const jobData = { id: jobSnap.id, ...jobSnap.data() };
      setJob(jobData);
      const empSnap = await getDoc(doc(db, "profiles", (jobData as any).employerId));
      if (empSnap.exists()) setEmployer({ id: empSnap.id, ...empSnap.data() });
      if (user) {
        const appSnap = await getDocs(query(collection(db, "applications"), where("jobId","==",id), where("workerId","==",user.uid)));
        if (!appSnap.empty) setApplied(true);
        // If employer, load all applications for this job
        if (profile?.role === "employer") {
          const allApps = await getDocs(query(collection(db, "applications"), where("jobId","==",id)));
          setApplications(allApps.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }
    }
    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setLoading(true);
    await addDoc(collection(db, "applications"), {
      jobId: id, jobTitle: job.title, workerId: user.uid,
      workerName: profile?.fullName || "Worker",
      message, status: "pending", createdAt: serverTimestamp()
    });
    // Notify employer
    await addDoc(collection(db, "notifications"), {
      userId: job.employerId, title: "New Application!",
      message: `${profile?.fullName} applied for "${job.title}"`,
      type: "job", isRead: false, createdAt: serverTimestamp()
    });
    setApplied(true); setSuccess(true); setLoading(false);
  };

  const updateAppStatus = async (appId: string, status: string, workerId: string) => {
    const { updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "applications", appId), { status });
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    // Notify worker
    await addDoc(collection(db, "notifications"), {
      userId: workerId, title: status === "accepted" ? "Application Accepted! 🎉" : "Application Update",
      message: status === "accepted" ? `Your application for "${job.title}" was accepted!` : `Your application for "${job.title}" was not selected.`,
      type: "job", isRead: false, createdAt: serverTimestamp()
    });
  };

  if (!job) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ArrowLeft size={16}/> Back to Jobs
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <span className="bg-navy/10 text-navy text-xs font-semibold px-3 py-1 rounded-lg">{job.category}</span>
                {job.isUrgent && <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1"><Zap size={11}/>Urgent</span>}
              </div>
              <h1 className="font-heading text-2xl font-bold text-navy mb-3">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5"><MapPin size={14}/>{job.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14}/>Posted recently</span>
                <span className="text-handza font-bold text-base">LKR {job.payRate?.toLocaleString()}/{job.payType==="hourly"?"hr":"fixed"}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Employer info */}
            {employer && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-navy mb-4">About the Employer</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-lg">{employer.fullName?.[0]}</div>
                  <div>
                    <p className="font-semibold text-navy">{employer.fullName}</p>
                    {employer.location && <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={11}/>{employer.location}</p>}
                    {employer.bio && <p className="text-gray-500 text-sm mt-1">{employer.bio}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Applications list for employer */}
            {profile?.role === "employer" && job.employerId === user?.uid && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-navy mb-4">Applications ({applications.length})</h2>
                {applications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No applications yet</p>
                ) : applications.map(app => (
                  <div key={app.id} className="flex items-center gap-3 p-4 rounded-xl bg-lgray mb-3">
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold">{app.workerName?.[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm">{app.workerName}</p>
                      {app.message && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">"{app.message}"</p>}
                    </div>
                    {app.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={()=>updateAppStatus(app.id,"accepted",app.workerId)} className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"><CheckCircle size={12}/>Accept</button>
                        <button onClick={()=>updateAppStatus(app.id,"rejected",app.workerId)} className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${app.status==="accepted"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{app.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-center mb-5">
                <div className="font-heading text-3xl font-bold text-handza">LKR {job.payRate?.toLocaleString()}</div>
                <div className="text-gray-500 text-sm">per {job.payType==="hourly"?"hour":"project"}</div>
              </div>

              {success ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-2"/>
                  <p className="font-heading font-bold text-navy">Application Sent!</p>
                  <p className="text-gray-500 text-sm mt-1">The employer will review and contact you.</p>
                  <Link href="/messages" className="inline-flex items-center gap-1.5 mt-3 text-handza text-sm font-semibold hover:underline"><Send size={14}/>Message Employer</Link>
                </div>
              ) : profile?.role === "worker" || !user ? (
                <>
                  <textarea value={message} onChange={e=>setMessage(e.target.value)}
                    placeholder="Add a message to stand out (optional)..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 resize-none mb-3"/>
                  <button onClick={handleApply} disabled={loading||applied}
                    className="w-full bg-handza text-white font-heading font-semibold py-3.5 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30 disabled:opacity-60">
                    {applied ? "Already Applied ✓" : loading ? "Sending..." : "Apply Now →"}
                  </button>
                  {!user && <p className="text-center text-xs text-gray-400 mt-3">You must <Link href="/auth/login" className="text-handza underline">log in</Link> to apply</p>}
                </>
              ) : profile?.role === "employer" && job.employerId !== user?.uid ? (
                <p className="text-center text-sm text-gray-400 py-2">Employers cannot apply to jobs</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
