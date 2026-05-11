"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { ArrowLeft, Zap } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"", location:"", payRate:"", payType:"hourly", isUrgent:false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    setLoading(true); setError("");
    try {
      await addDoc(collection(db, "jobs"), {
        ...form, payRate: Number(form.payRate),
        employerId: user.uid, employerName: profile?.fullName || "Employer",
        status: "open", createdAt: serverTimestamp()
      });
      router.push("/dashboard");
    } catch(err: any) { setError(err.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ArrowLeft size={16}/> Back to Dashboard
        </Link>
        <div className="bg-white rounded-3xl shadow-xl shadow-navy/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-handza rounded-xl flex items-center justify-center"><Zap size={20} className="text-white"/></div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-navy">Post a New Job</h1>
              <p className="text-gray-500 text-sm">Find the right worker fast</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Job Title *</label>
              <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition"
                placeholder="e.g. Fix electrical wiring in kitchen"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category *</label>
              <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition bg-white">
                <option value="">Select a category</option>
                {SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description *</label>
              <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition resize-none"
                placeholder="Describe the task in detail — tools needed, timeline, requirements..."/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location *</label>
              <input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition"
                placeholder="e.g. Colombo 7, Negombo, Kandy"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pay Rate (LKR) *</label>
                <input required type="number" min="1" value={form.payRate} onChange={e=>setForm({...form,payRate:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition" placeholder="500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pay Type *</label>
                <select value={form.payType} onChange={e=>setForm({...form,payType:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 bg-white">
                  <option value="hourly">Per Hour</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors">
              <input type="checkbox" checked={form.isUrgent} onChange={e=>setForm({...form,isUrgent:e.target.checked})} className="w-4 h-4 accent-handza"/>
              <div>
                <span className="font-semibold text-sm text-gray-700">Mark as Urgent</span>
                <p className="text-xs text-gray-400 mt-0.5">Gets highlighted — more visibility</p>
              </div>
            </label>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-handza text-white font-heading font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30 disabled:opacity-60 flex items-center justify-center gap-2 text-lg">
              <Zap size={18}/> {loading ? "Posting..." : "Post Job Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
