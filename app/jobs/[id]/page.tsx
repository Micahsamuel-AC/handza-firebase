"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { MapPin, Clock, Briefcase, CheckCircle, XCircle, User, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const router            = useRouter();
  const { user, profile } = useAuth();
  const [job, setJob]     = useState<any>(null);
  const [employer, setEmployer] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [myApp, setMyApp] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function load() {
      const jobSnap = await getDoc(doc(db, "jobs", id));
      if (!jobSnap.exists()) { router.push("/jobs"); return; }
      const jobData = { id: jobSnap.id, ...jobSnap.data() };
      setJob(jobData);
      const empSnap = await getDoc(doc(db, "profiles", (jobData as any).employerId));
      if (empSnap.exists()) setEmployer({ id: empSnap.id, ...empSnap.data() });
      if (user) {
        const appsSnap = await getDocs(query(collection(db,"applications"), where("jobId","==",id)));
        const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setApplications(apps);
        setMyApp(apps.find((a:any) => a.workerId === user.uid) || null);
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function applyForJob() {
    if (!user || !profile || !job) return;
    setApplying(true);
    const appRef = await addDoc(collection(db,"applications"), {
      jobId: id, workerId: user.uid, workerName: profile.fullName,
      employerId: job.employerId, status: "pending",
      createdAt: serverTimestamp(),
    });
    setMyApp({ id: appRef.id, status: "pending" });
    setApplying(false);
  }

  async function updateApplication(appId: string, status: "accepted"|"rejected") {
    await updateDoc(doc(db,"applications",appId), { status, updatedAt: serverTimestamp() });
    if (status === "accepted") {
      await updateDoc(doc(db,"jobs",id), { status: "in_progress" });
      setJob((j:any) => ({ ...j, status: "in_progress" }));
    }
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
  }

  if (loading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  if (!job) return null;

  const isEmployer  = profile?.id === job.employerId;
  const isWorker    = profile?.role === "worker";
  const canApply    = isWorker && job.status === "open" && !myApp && !profile?.suspended;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ArrowLeft size={15}/> Back to jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {job.isUrgent && <span className="badge badge-red">🔥 Urgent</span>}
                    <span className="badge badge-navy">{job.category}</span>
                    <span className={`badge ${job.status==="open"?"badge-green":job.status==="in_progress"?"badge-navy":"badge-red"}`}>
                      {job.status?.replace("_"," ")}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-navy">{job.title}</h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading text-2xl font-bold text-handza">LKR {job.payRate}</p>
                  <p className="text-gray-400 text-sm">per {job.payType}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-handza"/>{job.location}</span>
                <span className="flex items-center gap-1.5"><User size={14} className="text-navy"/>By {job.employerName}</span>
                {job.createdAt && <span className="flex items-center gap-1.5"><Clock size={14}/>Posted recently</span>}
              </div>

              <div>
                <h3 className="font-heading font-bold text-navy text-sm mb-2">Job Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description || "No description provided."}</p>
              </div>

              {/* Worker apply */}
              {isWorker && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  {!user ? (
                    <Link href="/auth/login" className="btn-primary">Sign in to Apply</Link>
                  ) : myApp ? (
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${
                      myApp.status==="accepted"?"bg-green-50":myApp.status==="rejected"?"bg-red-50":"bg-amber-50"
                    }`}>
                      {myApp.status==="accepted"?<CheckCircle size={18} className="text-green-500"/>:myApp.status==="rejected"?<XCircle size={18} className="text-red-500"/>:<Clock size={18} className="text-amber-500"/>}
                      <div>
                        <p className="font-semibold text-sm capitalize">{myApp.status === "pending" ? "Application submitted" : `Application ${myApp.status}`}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{myApp.status==="pending"?"Waiting for employer response.":myApp.status==="accepted"?"Congratulations! You got the job.":"Your application was not selected."}</p>
                      </div>
                    </div>
                  ) : canApply ? (
                    <button onClick={applyForJob} disabled={applying} className="btn-primary disabled:opacity-60">
                      <Briefcase size={16}/>{applying ? "Applying..." : "Apply for this Job"}
                    </button>
                  ) : job.status !== "open" ? (
                    <p className="text-gray-400 text-sm">This job is no longer accepting applications.</p>
                  ) : profile?.suspended ? (
                    <p className="text-red-500 text-sm">Your account is suspended. You cannot apply for jobs.</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Applications — employer view */}
            {isEmployer && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-heading font-bold text-navy text-base mb-4">
                  Applications ({applications.length})
                </h2>
                {applications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-lgray rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {app.workerName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-navy text-sm">{app.workerName}</p>
                            <span className={`badge text-xs ${app.status==="accepted"?"badge-green":app.status==="rejected"?"badge-red":"badge-amber"}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        {app.status === "pending" && job.status === "open" && (
                          <div className="flex gap-2">
                            <button onClick={() => updateApplication(app.id,"accepted")}
                              className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-600 transition-colors">
                              <CheckCircle size={13}/> Accept
                            </button>
                            <button onClick={() => updateApplication(app.id,"rejected")}
                              className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors">
                              <XCircle size={13}/> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {employer && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-heading font-bold text-navy text-sm mb-3">Posted by</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-navy/10 rounded-2xl flex items-center justify-center text-navy font-bold">
                    {employer.fullName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-navy text-sm">{employer.fullName}</p>
                      {employer.nicVerified && <CheckCircle size={13} className="text-green-500"/>}
                    </div>
                    {employer.location && <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={10}/>{employer.location}</p>}
                  </div>
                </div>
                {employer.nicVerified && (
                  <div className="badge badge-green text-xs"><CheckCircle size={11}/> ID Verified Employer</div>
                )}
              </div>
            )}

            <div className="bg-navy rounded-2xl p-5 text-white">
              <p className="font-heading font-bold text-sm mb-2">Safety reminder</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Always confirm job details before starting work. HANDZA is a neutral platform — all agreements are between you and the employer. Stay safe on site.
              </p>
              <Link href="/legal/terms" className="text-handza text-xs font-semibold hover:underline mt-2 inline-block">
                Read our T&C →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
