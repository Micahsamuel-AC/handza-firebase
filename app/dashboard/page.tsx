"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import {
  Briefcase, MapPin, Clock, ArrowRight, CheckCircle,
  XCircle, PlusCircle, ToggleLeft, ToggleRight, Star,
  TrendingUp, Users, AlertCircle
} from "lucide-react";

const STATUS: Record<string, string> = {
  open:        "badge badge-green",
  in_progress: "badge badge-navy",
  completed:   "badge badge-navy",
  cancelled:   "badge badge-red",
  pending:     "badge badge-amber",
  accepted:    "badge badge-green",
  rejected:    "badge badge-red",
};

export default function DashboardPage() {
  const router                                  = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [workerProfile, setWorkerProfile]       = useState<any>(null);
  const [jobs, setJobs]                         = useState<any[]>([]);
  const [applications, setApplications]         = useState<any[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [toggling, setToggling]                 = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (profile?.role === "admin" || profile?.role === "superadmin") {
      router.push("/admin/dashboard"); return;
    }
    loadData();
  }, [user, profile, authLoading]);

  async function loadData() {
    if (!user || !profile) return;
    try {
      if (profile.role === "worker") {
        const wpSnap = await getDocs(query(collection(db, "workerProfiles"), where("userId", "==", user.uid)));
        if (!wpSnap.empty) setWorkerProfile({ id: wpSnap.docs[0].id, ...wpSnap.docs[0].data() });
        const jobsSnap = await getDocs(query(collection(db, "jobs"), where("status", "==", "open")));
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 5));
        const appSnap = await getDocs(query(collection(db, "applications"), where("workerId", "==", user.uid)));
        setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        const jobsSnap = await getDocs(query(collection(db, "jobs"), where("employerId", "==", user.uid)));
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function toggleAvailability() {
    if (!workerProfile || toggling) return;
    setToggling(true);
    const newVal = !workerProfile.isAvailable;
    let locationData = {};
    if (newVal && navigator.geolocation) {
      await new Promise<void>(res => {
        navigator.geolocation.getCurrentPosition(
          pos => {
            locationData = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              locationUpdatedAt: serverTimestamp(),
            };
            res();
          },
          () => res(),
          { timeout: 5000 }
        );
      });
    }
    await updateDoc(doc(db, "workerProfiles", workerProfile.id), {
      isAvailable: newVal,
      ...(newVal ? locationData : { lat: null, lng: null }),
    });
    setWorkerProfile({ ...workerProfile, isAvailable: newVal });
    setToggling(false);
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-lgray flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isWorker   = profile?.role === "worker";
  const isEmployer = profile?.role === "employer";
  const suspended  = profile?.suspended;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16">

        {/* Suspended banner */}
        {suspended && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Account Suspended</p>
              <p className="text-red-600 text-xs mt-0.5">Your account has been suspended. Contact legal@handza.lk for assistance.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="text-handza font-semibold text-xs uppercase tracking-widest">Dashboard</span>
            <h1 className="font-heading text-3xl font-bold text-navy mt-1">
              Welcome, {profile?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm capitalize">{profile?.role} Account</p>
          </div>
          <div className="flex gap-3">
            {isWorker && workerProfile && (
              <button onClick={toggleAvailability} disabled={toggling || suspended}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-heading font-semibold text-sm transition-all shadow-sm disabled:opacity-60 ${
                  workerProfile.isAvailable
                    ? "bg-green-500 text-white shadow-green-200"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-navy"
                }`}>
                {toggling ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : workerProfile.isAvailable ? (
                  <ToggleRight size={20} />
                ) : (
                  <ToggleLeft size={20} />
                )}
                {workerProfile.isAvailable ? "Available Now" : "Go Available"}
              </button>
            )}
            {isEmployer && !suspended && (
              <Link href="/jobs/new" className="btn-primary py-3">
                <PlusCircle size={18} /> Post a Job
              </Link>
            )}
          </div>
        </div>

        {/* Verification banner */}
        {!profile?.nicVerified && !suspended && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">Complete your verification</p>
              <p className="text-amber-700 text-xs mt-0.5">Upload your NIC to get verified and unlock all features.</p>
            </div>
            <Link href="/profile" className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
              Verify now →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {isWorker ? [
            { icon: Briefcase,   label: "Available Jobs",   val: jobs.length,        color: "bg-blue-50 text-blue-600" },
            { icon: CheckCircle, label: "Applications",      val: applications.length, color: "bg-green-50 text-green-600" },
            { icon: Star,        label: "Rating",            val: workerProfile?.rating ? `${workerProfile.rating}★` : "New", color: "bg-yellow-50 text-yellow-600" },
            { icon: TrendingUp,  label: "Status",            val: workerProfile?.isAvailable ? "Online" : "Offline", color: workerProfile?.isAvailable ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500" },
          ] : [
            { icon: Briefcase,   label: "Jobs Posted",   val: jobs.length,                              color: "bg-blue-50 text-blue-600" },
            { icon: CheckCircle, label: "Active Jobs",   val: jobs.filter(j => j.status === "open").length, color: "bg-green-50 text-green-600" },
            { icon: Users,       label: "Completed",     val: jobs.filter(j => j.status === "completed").length, color: "bg-purple-50 text-purple-600" },
            { icon: TrendingUp,  label: "In Progress",   val: jobs.filter(j => j.status === "in_progress").length, color: "bg-orange-50 text-orange-600" },
          ].map(({ icon: Icon, label, val, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <div className="font-heading text-2xl font-bold text-navy">{val}</div>
              <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Jobs list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-bold text-navy text-sm">
                  {isWorker ? "Available Jobs Near You" : "My Job Posts"}
                </h2>
                <Link href={isWorker ? "/jobs" : "/jobs"} className="text-xs text-handza hover:underline font-medium">
                  View all →
                </Link>
              </div>
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    {isWorker ? "No open jobs right now" : "No jobs posted yet"}
                  </p>
                  {isEmployer && (
                    <Link href="/jobs/new" className="btn-primary mt-4 text-sm py-2.5 px-5 inline-flex">
                      Post Your First Job
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {jobs.slice(0, 6).map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-lgray transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-handza-light rounded-xl flex items-center justify-center flex-shrink-0">
                          <Briefcase size={16} className="text-handza" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-navy">{job.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={11} />{job.location}
                            </span>
                            <span className="text-xs text-handza font-semibold">LKR {job.payRate}/{job.payType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.isUrgent && <span className="badge badge-red text-xs">Urgent</span>}
                        <span className={STATUS[job.status] || "badge badge-navy"}>{job.status?.replace("_", " ")}</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-navy transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-handza rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-orange">
                  {profile?.fullName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">{profile?.fullName}</p>
                  <p className="text-gray-400 text-xs capitalize">{profile?.role}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">ID Verification</span>
                  <span className={profile?.nicVerified ? "badge badge-green" : "badge badge-amber"}>
                    {profile?.nicVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                {isWorker && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Status</span>
                    <span className={workerProfile?.isAvailable ? "badge badge-green" : "badge-gray text-gray-500 text-xs"}>
                      {workerProfile?.isAvailable ? "● Available" : "○ Offline"}
                    </span>
                  </div>
                )}
              </div>
              <Link href="/profile" className="block w-full text-center bg-lgray text-navy text-xs font-semibold py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                Edit Profile
              </Link>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-heading font-bold text-navy text-sm mb-3">Quick Actions</p>
              <div className="space-y-2">
                {isWorker ? [
                  { href: "/jobs",          label: "Browse All Jobs", icon: Briefcase },
                  { href: "/messages",      label: "Messages",        icon: MapPin },
                  { href: "/notifications", label: "Notifications",   icon: Clock },
                ] : [
                  { href: "/jobs/new",      label: "Post a New Job",  icon: PlusCircle },
                  { href: "/workers",       label: "Find Workers",    icon: Users },
                  { href: "/messages",      label: "Messages",        icon: MapPin },
                ]}.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-lgray hover:text-navy transition-colors">
                    <Icon size={15} className="text-gray-400" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
