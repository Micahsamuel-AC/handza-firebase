"use client";
import {useEffect,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db} from "@/lib/firebase";
import {doc,getDoc,collection,getDocs,query,where,addDoc,updateDoc,serverTimestamp} from "firebase/firestore";
import {ArrowLeft,MapPin,Clock,CheckCircle,Shield,Timer,Briefcase} from "lucide-react";

const HOURLY_CATS=["Cleaning","Household Help","Logistics"];

export default function JobDetailPage(){
  const {id}=useParams<{id:string}>();
  const router=useRouter();
  const {user,profile}=useAuth();
  const [job,setJob]=useState<any>(null);
  const [employer,setEmployer]=useState<any>(null);
  const [applications,setApplications]=useState<any[]>([]);
  const [myApp,setMyApp]=useState<any>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{load();},[id,user]);

  async function load(){
    setLoading(true);
    const snap=await getDoc(doc(db,"jobs",id));
    if(!snap.exists()){router.push("/jobs");return;}
    const j={id:snap.id,...snap.data()} as any;
    setJob(j);
    const empSnap=await getDoc(doc(db,"profiles",j.employerId));
    if(empSnap.exists())setEmployer(empSnap.data());
    const appsSnap=await getDocs(query(collection(db,"applications"),where("jobId","==",id)));
    const apps=appsSnap.docs.map(d=>({id:d.id,...d.data()}));
    setApplications(apps);
    if(user) setMyApp(apps.find((a:any)=>a.workerId===user.uid));
    setLoading(false);
  }

  async function applyJob(){
    if(!user||!profile||!job)return;
    await addDoc(collection(db,"applications"),{jobId:job.id,workerId:user.uid,workerName:profile.fullName,employerId:job.employerId,status:"pending",createdAt:serverTimestamp()});
    load();
  }

  async function actOnApp(appId:string,status:"accepted"|"rejected"){
    await updateDoc(doc(db,"applications",appId),{status});
    if(status==="accepted") await updateDoc(doc(db,"jobs",id),{status:"in_progress"});
    load();
  }

  if(loading)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  if(!job)return null;

  const activeRole=profile?.activeRole||profile?.role;
  const isEmployer=user&&job.employerId===user.uid;
  const isWorker=activeRole==="worker"&&!isEmployer;
  const isHourly=HOURLY_CATS.includes(job.category);

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6"><ArrowLeft size={15}/>Back to Jobs</Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex gap-2 flex-wrap mb-3">{job.isUrgent&&<span className="badge badge-red">🔥 Urgent</span>}<span className="badge badge-navy">{job.category}</span><span className={`badge ${job.status==="open"?"badge-green":"badge-navy"}`}>{job.status?.replace("_"," ")}</span></div>
            <h1 className="font-heading text-2xl font-bold text-navy mb-2">{job.title}</h1>
            <div className="text-handza font-heading text-2xl font-bold mb-4">LKR {job.payRate}<span className="text-sm text-gray-500 font-body"> / {job.payType}</span></div>
            <div className="flex gap-4 flex-wrap text-gray-500 text-sm mb-4"><span className="flex items-center gap-1"><MapPin size={13}/>{job.location}</span><span>👤 By {job.employerName}</span></div>
            {job.description&&<><p className="font-semibold text-navy text-sm mb-1">Description</p><p className="text-gray-600 text-sm leading-relaxed">{job.description}</p></>}

            {isWorker&&job.status==="open"&&(
              <div className="mt-5 pt-5 border-t border-gray-100">
                {myApp?<div className="bg-green-50 rounded-xl p-4 text-center"><CheckCircle size={20} className="text-green-500 mx-auto mb-1"/><p className="font-semibold text-green-700 text-sm">Application Submitted</p><p className="text-green-600 text-xs mt-0.5">Status: {myApp.status}</p></div>:
                <button onClick={applyJob} className="btn-primary w-full justify-center py-3.5">💼 Apply for this Job</button>}
              </div>
            )}
            {myApp?.status==="accepted"&&isHourly&&(
              <div className="mt-3"><Link href={`/work-timer?jobId=${job.id}`} className="btn-primary w-full justify-center py-3"><Timer size={16}/>Open Work Timer</Link></div>
            )}
            {isEmployer&&job.status==="in_progress"&&isHourly&&(
              <div className="mt-3"><Link href={`/employer/timer?jobId=${job.id}`} className="btn-secondary w-full justify-center py-3"><Timer size={16}/>View Live Timer</Link></div>
            )}
          </div>

          {isEmployer&&(
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-heading font-bold text-navy text-base mb-4">Applications ({applications.length})</h2>
              {applications.length===0?<p className="text-gray-400 text-sm text-center py-4">No applications yet</p>:
              applications.map(app=>(
                <div key={app.id} className="flex items-center gap-3 p-3 bg-lgray rounded-xl mb-2">
                  <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{app.workerName?.[0]}</div>
                  <div className="flex-1"><p className="font-semibold text-navy text-sm">{app.workerName}</p><span className={`badge ${app.status==="accepted"?"badge-green":app.status==="rejected"?"badge-red":"badge-amber"}`}>{app.status}</span></div>
                  {app.status==="pending"&&<div className="flex gap-2"><button onClick={()=>actOnApp(app.id,"accepted")} className="btn-primary text-xs py-1.5 px-3">✓ Accept</button><button onClick={()=>actOnApp(app.id,"rejected")} className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full">✗</button></div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-heading font-bold text-navy text-sm mb-3">Posted by</h3>
            <div className="flex items-center gap-3 mb-2"><div className="w-11 h-11 bg-navy-light rounded-xl flex items-center justify-center text-navy font-bold">{job.employerName?.[0]}</div><div><p className="font-semibold text-navy text-sm">{job.employerName}</p>{employer?.location&&<p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={11}/>{employer.location}</p>}</div></div>
            {employer?.nicVerified&&<span className="badge badge-green">✓ ID Verified Employer</span>}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><div className="flex items-start gap-2"><Shield size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/><div><p className="text-xs font-semibold text-amber-800 mb-1">Safety Reminder</p><p className="text-xs text-amber-700 leading-relaxed">HANDZA is a neutral platform. Confirm job details before starting.</p></div></div></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-heading font-bold text-navy text-sm mb-2">💰 Payment</h3>
            <div className="text-sm text-gray-600 leading-7">Rate: <strong>LKR {job.payRate}/{job.payType}</strong><br/>HANDZA fee: <strong>10%</strong><br/>You receive: <strong>LKR {Math.floor(job.payRate*0.9)}/{job.payType}</strong></div>
          </div>
        </div>
      </div>
    </div></div>
  );
}
