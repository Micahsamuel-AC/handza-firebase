"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Briefcase, MapPin, Clock, Zap, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

const CATS = ["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

export default function PostJobPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ title:"", description:"", category:"", location:"", payRate:"", payType:"hour", isUrgent:false });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!user || profile?.role !== "employer") {
    return (
      <div className="min-h-screen bg-lgray flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <AlertCircle size={32} className="text-amber-500 mx-auto mb-3"/>
          <h2 className="font-heading font-bold text-navy mb-2">Employers Only</h2>
          <p className="text-gray-500 text-sm mb-4">You need an employer account to post jobs.</p>
          <Link href="/auth/signup?role=employer" className="btn-primary w-full justify-center">Create Employer Account</Link>
        </div>
      </div>
    );
  }

  if (profile?.suspended) {
    return (
      <div className="min-h-screen bg-lgray flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3"/>
          <h2 className="font-heading font-bold text-navy mb-2">Account Suspended</h2>
          <p className="text-gray-500 text-sm">Contact legal@handza.lk for assistance.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) { setError("Please select a service category."); return; }
    setLoading(true); setError("");
    try {
      const jobRef = await addDoc(collection(db,"jobs"), {
        ...form, payRate: parseFloat(form.payRate) || 0,
        employerId: user!.uid, employerName: profile!.fullName,
        status: "open", applications: 0,
        createdAt: serverTimestamp(),
      });
      router.push(`/jobs/${jobRef.id}`);
    } catch (e: any) { setError("Failed to post job. Please try again."); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16 max-w-2xl">
        <div className="mb-8">
          <span className="text-handza font-semibold text-xs uppercase tracking-widest">Employer</span>
          <h1 className="font-heading text-3xl font-bold text-navy mt-1">Post a Job</h1>
          <p className="text-gray-500 text-sm mt-1">Takes under 60 seconds. Workers near you will be notified instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Urgent toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Zap size={18} className="text-red-500"/></div>
                <div>
                  <p className="font-semibold text-navy text-sm">Mark as Urgent</p>
                  <p className="text-gray-400 text-xs">Workers are notified immediately</p>
                </div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, isUrgent: !f.isUrgent }))}
                className={`availability-toggle ${form.isUrgent ? "on" : "off"}`} style={{ background: form.isUrgent ? "#ef4444" : "" }}/>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Job Title *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-base" placeholder="e.g. Fix kitchen sink leak"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Service Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border-2 ${
                      form.category === c ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-600 hover:border-navy/40"
                    }`}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MapPin size={11}/>Location *</label>
              <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="input-base" placeholder="e.g. Colombo 7, Western Province"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pay Rate (LKR) *</label>
                <input required type="number" value={form.payRate} onChange={e => setForm({ ...form, payRate: e.target.value })}
                  className="input-base" placeholder="e.g. 500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pay Type</label>
                <select value={form.payType} onChange={e => setForm({ ...form, payType: e.target.value })}
                  className="input-base">
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="job">Per Job</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4} className="input-base resize-none"
                placeholder="Describe the work needed, any requirements, tools required..."/>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3"><p className="text-red-600 text-sm">{error}</p></div>}

          {/* Legal reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700 leading-relaxed">
            <strong>Reminder:</strong> As an employer, you are responsible for worksite safety under Sri Lanka's Workmen's Compensation Ordinance. Workers are independent contractors, not HANDZA employees.
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
            {loading ? "Posting job..." : <><Briefcase size={18}/>Post Job Now<ArrowRight size={18}/></>}
          </button>
        </form>
      </div>
    </div>
  );
}
