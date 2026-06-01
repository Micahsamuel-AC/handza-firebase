"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Star, CheckCircle, MapPin, Lock, Phone, Shield, Briefcase, ArrowLeft, Award, MessageSquare } from "lucide-react";
import Link from "next/link";

function WorkerProfileContent() {
  const { id }            = useParams<{ id: string }>();
  const router            = useRouter();
  const { user, profile } = useAuth();
  const [worker, setWorker]   = useState<any>(null);
  const [wp, setWp]           = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isHired, setIsHired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id, user]);

  async function load() {
    setLoading(true);
    const snap = await getDoc(doc(db,"profiles",id));
    if (!snap.exists()) { router.push("/workers"); return; }
    setWorker({ id:snap.id, ...snap.data() });
    const wpSnap = await getDoc(doc(db,"workerProfiles",id));
    if (wpSnap.exists()) setWp(wpSnap.data());
    const revSnap = await getDocs(query(collection(db,"reviews"), where("workerId","==",id)));
    setReviews(revSnap.docs.map(d => ({ id:d.id, ...d.data() })));
    if (user) {
      const appSnap = await getDocs(query(collection(db,"applications"),
        where("workerId","==",id), where("employerId","==",user.uid), where("status","==","accepted")));
      setIsHired(!appSnap.empty);
    }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  if (!worker) return null;

  const activeRole = profile?.activeRole || profile?.role;
  const isEmployer = activeRole === "employer";

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="section-container pt-28 pb-16">
        <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6">
          <ArrowLeft size={15}/> Back to Workers
        </Link>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-5 mb-5">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center text-white font-heading font-bold text-3xl">
                    {worker.fullName?.[0]}
                  </div>
                  {wp?.isAvailable && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"/>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="font-heading text-2xl font-bold text-navy">{worker.fullName}</h1>
                    {worker.nicVerified && <span className="flex items-center gap-1 badge badge-green text-xs"><CheckCircle size={11}/> ID Verified</span>}
                  </div>
                  {worker.location && <p className="text-gray-400 text-sm flex items-center gap-1 mb-2"><MapPin size={13}/>{worker.location}</p>}
                  <div className="flex items-center gap-3 flex-wrap">
                    {wp?.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s<=Math.round(wp.rating)?"text-yellow-400 fill-yellow-400":"text-gray-200"}/>)}
                        <span className="text-sm font-semibold text-navy ml-1">{wp.rating}</span>
                        <span className="text-gray-400 text-xs">({wp.totalReviews} reviews)</span>
                      </div>
                    )}
                    <span className={`badge text-xs ${wp?.isAvailable?"badge-green":"bg-gray-100 text-gray-500"}`}>
                      {wp?.isAvailable?"● Available Now":"○ Offline"}
                    </span>
                    {wp?.hourlyRate > 0 && <span className="text-handza font-bold">LKR {wp.hourlyRate}/hr</span>}
                  </div>
                </div>
              </div>
              {worker.bio && <p className="text-gray-600 text-sm leading-relaxed">{worker.bio}</p>}
            </div>

            {/* Skills */}
            {wp?.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-heading font-bold text-navy text-base mb-4 flex items-center gap-2"><Briefcase size={16}/> Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {wp.skills.map((s:string) => <span key={s} className="badge badge-navy">{s}</span>)}
                </div>
              </div>
            )}

            {/* Certifications */}
            {wp?.certifications?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-heading font-bold text-navy text-base mb-4 flex items-center gap-2"><Award size={16}/> Certifications</h2>
                <div className="space-y-3">
                  {wp.certifications.map((c:any, i:number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-lgray rounded-xl">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className="font-semibold text-navy text-sm">{c.name}</p>
                        {c.issuer && <p className="text-gray-400 text-xs">{c.issuer}</p>}
                        {c.year && <p className="text-gray-400 text-xs">{c.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {wp?.portfolioPhotos?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-heading font-bold text-navy text-base mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wp.portfolioPhotos.map((url:string, i:number) => (
                    <img key={i} src={url} alt={`Work sample ${i+1}`} className="w-full h-32 object-cover rounded-xl border border-gray-100"/>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-heading font-bold text-navy text-base mb-4 flex items-center gap-2"><Star size={16}/> Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center text-navy font-bold text-xs">{r.employerName?.[0]}</div>
                          <span className="font-semibold text-navy text-sm">{r.employerName}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s<=r.rating?"text-yellow-400 fill-yellow-400":"text-gray-200"}/>)}
                        </div>
                      </div>
                      {r.comment && <p className="text-gray-600 text-sm leading-relaxed italic">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-bold text-navy text-sm mb-4">Contact Information</h3>
              {/* Phone — hidden until hired */}
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${isHired?"bg-green-50":"bg-gray-50"}`}>
                {isHired ? (
                  <><Phone size={15} className="text-green-500 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="font-semibold text-navy text-sm">{worker.phone||"Not provided"}</p></div></>
                ) : (
                  <><Lock size={15} className="text-gray-400 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-500 font-medium">Phone number hidden</p><p className="text-gray-400 text-xs mt-0.5">Available after you hire</p></div></>
                )}
              </div>
              {/* Email — always hidden */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                <Lock size={15} className="text-gray-400 flex-shrink-0"/>
                <div><p className="text-xs text-gray-500 font-medium">Email hidden</p><p className="text-gray-400 text-xs mt-0.5">Use HANDZA messages</p></div>
              </div>
              {isHired && (
                <Link href="/messages" className="flex items-center justify-center gap-2 w-full bg-navy text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-dark transition-colors mb-3">
                  <MessageSquare size={15}/> Send Message
                </Link>
              )}
              {isEmployer && !isHired && (
                <Link href={`/jobs/new?suggestWorker=${id}`} className="btn-primary w-full justify-center py-3 text-sm">
                  Hire {worker.fullName?.split(" ")[0]}
                </Link>
              )}
              {isHired && <div className="badge badge-green w-full justify-center py-2 text-xs"><CheckCircle size={12}/> Hired</div>}
              {!user && <Link href="/auth/login" className="btn-secondary w-full justify-center py-3 text-sm">Sign in to Hire</Link>}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <Shield size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">Privacy Protected</p>
                  <p className="text-xs text-amber-700 leading-relaxed">Phone and email are hidden until you hire through HANDZA. This protects both parties.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-bold text-navy text-sm mb-3">Stats</h3>
              {[
                ["Jobs completed", wp?.completedJobs||0],
                ["Avg rating", wp?.rating>0?`${wp.rating} ★`:"No ratings"],
                ["Total reviews", wp?.totalReviews||0],
              ].map(([l,v]) => (
                <div key={String(l)} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-semibold text-navy">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}>
      <WorkerProfileContent/>
    </Suspense>
  );
}
