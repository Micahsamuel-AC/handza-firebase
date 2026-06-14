"use client";
import {useState,useEffect} from "react";
import {useRouter} from "next/navigation";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db} from "@/lib/firebase";
import {collection,addDoc,serverTimestamp} from "firebase/firestore";
import {Zap,ArrowRight} from "lucide-react";

const CATS=[{name:"Plumbing",icon:"🔧"},{name:"Electrical",icon:"⚡"},{name:"Welding",icon:"🔥"},{name:"Glass Fitting",icon:"🪟"},{name:"Computer Repairs",icon:"💻"},{name:"Cleaning",icon:"🧹"},{name:"Vehicle Washing",icon:"🚗"},{name:"Painting",icon:"🎨"},{name:"Household Help",icon:"🏠"},{name:"Logistics",icon:"📦"}];

export default function NewJobPage(){
  const router=useRouter();
  const {user,profile,loading:authLoading}=useAuth();
  const [form,setForm]=useState({title:"",category:"Cleaning",location:"",payRate:"",payType:"hour",description:""});
  const [urgent,setUrgent]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{if(!authLoading&&!user)router.push("/auth/login");},[user,authLoading]);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();if(!user||!profile)return;setSubmitting(true);
    await addDoc(collection(db,"jobs"),{title:form.title,category:form.category,location:form.location,payRate:parseFloat(form.payRate)||0,payType:form.payType,description:form.description,isUrgent:urgent,employerId:user.uid,employerName:profile.fullName,status:"open",createdAt:serverTimestamp()});
    router.push("/dashboard");
  }

  if(authLoading)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16 max-w-2xl">
      <div className="mb-6"><span className="text-handza font-semibold text-xs uppercase tracking-widest">New</span><h1 className="font-heading text-3xl font-bold text-navy mt-1">Post a Job</h1><p className="text-gray-500 text-sm mt-1">Takes under 60 seconds. Workers near you are notified instantly.</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Zap size={18} className="text-red-500"/></div><div><p className="font-semibold text-navy text-sm">Mark as Urgent</p><p className="text-gray-400 text-xs">Workers notified immediately</p></div></div>
        <button type="button" onClick={()=>setUrgent(!urgent)} className={`availability-toggle ${urgent?"on":"off"}`} style={urgent?{background:"#EF4444"}:{}}/>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Job Title *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-base" placeholder="e.g. Fix kitchen sink leak"/></div>
        <div><label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Service Category *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{CATS.map(c=>(
          <button key={c.name} type="button" onClick={()=>setForm({...form,category:c.name})} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.category===c.name?"bg-navy text-white border-navy":"bg-white text-gray-600 border-gray-200 hover:border-navy/40"}`}>{c.icon} {c.name}</button>
        ))}</div></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">📍 Location *</label><input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="input-base" placeholder="e.g. Colombo 7"/></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">💰 Pay Rate (LKR) *</label><input required type="number" value={form.payRate} onChange={e=>setForm({...form,payRate:e.target.value})} className="input-base" placeholder="450"/></div>
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pay Type</label>
        <select value={form.payType} onChange={e=>setForm({...form,payType:e.target.value})} className="input-base"><option value="hour">Per Hour</option><option value="day">Per Day</option><option value="job">Per Job</option></select></div>
        <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="input-base resize-none" placeholder="Describe the job..."/></div>
        <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-800 leading-relaxed"><strong>Reminder:</strong> As an employer, you are responsible for worksite safety under Sri Lanka law. Workers are independent contractors, not HANDZA employees.</div>
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60">{submitting?"Posting...":<><span>Post Job Now</span><ArrowRight size={16}/></>}</button>
      </form>
    </div></div>
  );
}
