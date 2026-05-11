"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from "firebase/firestore";
import { Briefcase, Users, Star, PlusCircle, ToggleLeft, ToggleRight, MapPin, Clock, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    loadData();
  }, [user, profile, authLoading]);

  async function loadData() {
    if (!user || !profile) return;
    try {
      if (profile.role === "worker") {
        // Load worker profile
        const wpSnap = await getDocs(query(collection(db, "workerProfiles"), where("userId", "==", user.uid)));
        if (!wpSnap.empty) setWorkerProfile({ id: wpSnap.docs[0].id, ...wpSnap.docs[0].data() });
        // Load recent open jobs
        const jobsSnap = await getDocs(query(collection(db, "jobs"), where("status", "==", "open"), orderBy("createdAt", "desc"), limit(6)));
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        // Load my applications
        const appSnap = await getDocs(query(collection(db, "applications"), where("workerId", "==", user.uid), orderBy("createdAt", "desc"), limit(5)));
        setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        // Load employer's jobs
        const jobsSnap = await getDocs(query(collection(db, "jobs"), where("employerId", "==", user.uid), orderBy("createdAt", "desc")));
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const toggleAvailability = async () => {
    if (!workerProfile) return;
    await updateDoc(doc(db, "workerProfiles", user!.uid), { isAvailable: !workerProfile.isAvailable });
    setWorkerProfile({ ...workerProfile, isAvailable: !workerProfile.isAvailable });
  };

  if (authLoading || loading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  const statusStyle: any = {
    open: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-handza font-semibold text-sm uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="font-heading text-3xl font-bold text-navy">Welcome, {profile?.fullName?.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 mt-1 text-sm">{profile?.role === "worker" ? "Find your next opportunity" : "Manage your job postings"}</p>
          </div>
          <div className="flex gap-3">
            {profile?.role === "worker" && workerProfile && (
              <button onClick={toggleAvailability}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-semibold text-sm transition-all shadow-sm ${
                  workerProfile.isAvailable ? "bg-green-500 text-white shadow-green-200" : "bg-gray-200 text-gray-600"
                }`}>
                {workerProfile.isAvailable ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                {workerProfile.isAvailable ? "Available Now" : "Set Available"}
              </button>
            )}
            {profile?.role === "employer" && (
              <Link href="/jobs/new" className="flex items-center gap-2 bg-handza text-white font-heading font-semibold px-5 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30">
                <PlusCircle size={18}/> Post a Job
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(() => { const stats = profile?.role === "worker" ? [
            { label:"Rating", val: workerProfile?.rating > 0 ? `${Number(workerProfile.rating).toFixed(1)} ★` : "No reviews", icon:Star, color:"bg-yellow-50 text-yellow-600" },
            { label:"Reviews", val: workerProfile?.totalReviews || 0, icon:Users, color:"bg-blue-50 text-blue-600" },
            { label:"Open Jobs", val: jobs.length, icon:Briefcase, color:"bg-handza/10 text-handza" },
            { label:"Applications", val: applications.length, icon:CheckCircle, color:"bg-navy/10 text-navy" },
          ] : [
            { label:"Jobs Posted", val: jobs.length, icon:Briefcase, color:"bg-handza/10 text-handza" },
            { label:"Open", val: jobs.filter(j=>j.status==="open").length, icon:PlusCircle, color:"bg-green-50 text-green-600" },
            { label:"In Progress", val: jobs.filter(j=>j.status==="in_progress").length, icon:Clock, color:"bg-blue-50 text-blue-600" },
            { label:"Completed", val: jobs.filter(j=>j.status==="completed").length, icon:Star, color:"bg-purple-50 text-purple-600" },
          ]; return stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}><stat.icon size={20}/></div>
              <div className="font-heading text-2xl font-bold text-navy">{String(stat.val)}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          )); })()}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Jobs */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-navy">{profile?.role==="worker" ? "Latest Open Jobs" : "Your Job Postings"}</h2>
              <Link href="/jobs" className="text-handza text-sm font-semibold flex items-center gap-1 hover:underline">View all <ArrowRight size={14}/></Link>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Briefcase size={36} className="mx-auto mb-3 opacity-30"/>
                <p className="font-heading font-semibold text-sm">No jobs yet</p>
                {profile?.role==="employer" && <Link href="/jobs/new" className="inline-flex items-center gap-1.5 mt-3 bg-handza text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-orange-600"><PlusCircle size={14}/>Post First Job</Link>}
              </div>
            ) : jobs.slice(0,5).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-lgray transition-all group mb-2">
                <div className="w-9 h-9 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase size={16} className="text-navy"/></div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-navy text-sm truncate group-hover:text-handza transition-colors">{job.title}</div>
                  <div className="text-gray-400 text-xs flex items-center gap-1.5 mt-0.5"><MapPin size={10}/>{job.location} · LKR {job.payRate}/{job.payType==="hourly"?"hr":"fixed"}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${statusStyle[job.status]}`}>{job.status.replace("_"," ")}</span>
              </Link>
            ))}
          </div>

          {/* Applications (worker) or Recent activity (employer) */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-heading font-bold text-navy mb-5">{profile?.role==="worker" ? "My Applications" : "Quick Actions"}</h2>
            {profile?.role === "worker" ? (
              applications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <AlertCircle size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-heading font-semibold text-sm">No applications yet</p>
                  <Link href="/jobs" className="inline-flex items-center gap-1.5 mt-3 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-handza"><ArrowRight size={14}/>Browse Jobs</Link>
                </div>
              ) : applications.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-lgray mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${statusStyle[app.status]}`}>
                    {app.status==="accepted" ? <CheckCircle size={16}/> : app.status==="rejected" ? <XCircle size={16}/> : <Clock size={16}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-navy text-sm truncate">{app.jobTitle}</div>
                    <div className="text-gray-400 text-xs mt-0.5">Applied recently</div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusStyle[app.status]}`}>{app.status}</span>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {[
                  { href:"/jobs/new", icon:PlusCircle, label:"Post a New Job", desc:"Find workers fast", color:"bg-handza text-white" },
                  { href:"/workers", icon:Users, label:"Browse Workers", desc:"Find the right person", color:"bg-navy text-white" },
                  { href:"/messages", icon:Briefcase, label:"View Messages", desc:"Chat with workers", color:"bg-blue-600 text-white" },
                ].map(item => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-4 p-4 rounded-xl ${item.color} hover:opacity-90 transition-opacity`}>
                    <item.icon size={20}/>
                    <div>
                      <p className="font-heading font-semibold text-sm">{item.label}</p>
                      <p className="text-white/70 text-xs">{item.desc}</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto"/>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
