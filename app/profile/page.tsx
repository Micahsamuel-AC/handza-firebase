"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { Save, User, MapPin, Phone, Briefcase, ToggleLeft, ToggleRight, Plus, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ fullName:"", phone:"", location:"", bio:"" });
  const [workerForm, setWorkerForm] = useState({ hourlyRate:"", isAvailable:true, skills:[] as string[] });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (profile) {
      setForm({ fullName:profile.fullName||"", phone:profile.phone||"", location:profile.location||"", bio:profile.bio||"" });
      if (profile.role === "worker") {
        import("firebase/firestore").then(({ getDoc }) => {
          getDoc(doc(db,"workerProfiles",user.uid)).then(snap => {
            if (snap.exists()) {
              const wp = { id: snap.id, ...snap.data() };
              setWorkerProfile(wp);
              setWorkerForm({ hourlyRate:(wp as any).hourlyRate||"", isAvailable:(wp as any).isAvailable??true, skills:(wp as any).skills||[] });
            }
            setLoading(false);
          });
        });
      } else setLoading(false);
    }
  }, [user, profile, authLoading]);

  const handleSave = async () => {
    setSaving(true);
    await updateDoc(doc(db,"profiles",user!.uid), { ...form });
    if (profile?.role === "worker") {
      await setDoc(doc(db,"workerProfiles",user!.uid), { userId:user!.uid, ...workerForm, hourlyRate:Number(workerForm.hourlyRate) }, { merge:true });
    }
    await refreshProfile();
    setSaving(false); setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const addSkill = () => {
    if (newSkill && !workerForm.skills.includes(newSkill)) {
      setWorkerForm({...workerForm, skills:[...workerForm.skills,newSkill]});
      setNewSkill("");
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Keep your profile updated to get more opportunities</p>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 mb-6 flex items-center gap-2 animate-fade-in">✅ Profile saved successfully!</div>}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl">
              {form.fullName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-heading font-bold text-navy text-lg">{form.fullName || "Your Name"}</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${profile?.role==="worker"?"bg-blue-100 text-blue-700":"bg-orange-100 text-orange-700"}`}>{profile?.role}</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label:"Full Name", key:"fullName", icon:User, placeholder:"Your full name" },
              { label:"Phone", key:"phone", icon:Phone, placeholder:"07X XXX XXXX" },
            ].map(({label,key,icon:Icon,placeholder}) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition" placeholder={placeholder}/>
                </div>
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition" placeholder="e.g. Colombo 7, Kandy, Galle"/>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bio</label>
              <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition resize-none"
                placeholder="Tell people about yourself, your experience..."/>
            </div>
          </div>
        </div>

        {profile?.role === "worker" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <h2 className="font-heading font-bold text-navy mb-5 flex items-center gap-2"><Briefcase size={18} className="text-handza"/>Worker Settings</h2>
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Hourly Rate (LKR)</label>
                <input type="number" value={workerForm.hourlyRate} onChange={e=>setWorkerForm({...workerForm,hourlyRate:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition" placeholder="e.g. 500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Availability</label>
                <button onClick={()=>setWorkerForm({...workerForm,isAvailable:!workerForm.isAvailable})}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    workerForm.isAvailable ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}>
                  {workerForm.isAvailable ? <ToggleRight size={20} className="text-green-500"/> : <ToggleLeft size={20}/>}
                  {workerForm.isAvailable ? "Available Now" : "Not Available"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Your Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {workerForm.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-xl">
                    {skill}
                    <button onClick={()=>setWorkerForm({...workerForm,skills:workerForm.skills.filter(s=>s!==skill)})} className="hover:text-red-500 transition-colors"><X size={12}/></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={newSkill} onChange={e=>setNewSkill(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 bg-white">
                  <option value="">Select a skill to add</option>
                  {SERVICE_CATEGORIES.filter(c=>!workerForm.skills.includes(c)).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={addSkill} className="bg-navy text-white px-4 py-2.5 rounded-xl hover:bg-handza transition-colors"><Plus size={18}/></button>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-handza text-white font-heading font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30 disabled:opacity-60 text-lg">
          <Save size={20}/> {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
