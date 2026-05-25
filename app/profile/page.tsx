"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, Upload, CheckCircle, AlertCircle, User, Phone, MapPin, FileText, Star, Briefcase } from "lucide-react";

const SKILLS = ["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [form, setForm]       = useState({ fullName:"", phone:"", location:"", bio:"", hourlyRate:"" });
  const [skills, setSkills]   = useState<string[]>([]);
  const [nicFile, setNicFile] = useState<File|null>(null);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [workerData, setWorkerData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (profile) {
      setForm({ fullName: profile.fullName||"", phone: profile.phone||"", location: profile.location||"", bio: profile.bio||"", hourlyRate: "" });
      if (profile.role === "worker") loadWorkerProfile();
    }
  }, [profile, authLoading]);

  async function loadWorkerProfile() {
    if (!user) return;
    const snap = await getDoc(doc(db, "workerProfiles", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      setWorkerData(d);
      setSkills(d.skills || []);
      setForm(f => ({ ...f, hourlyRate: d.hourlyRate?.toString() || "" }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "profiles", user.uid), {
      fullName: form.fullName, phone: form.phone,
      location: form.location, bio: form.bio,
      updatedAt: serverTimestamp(),
    });
    if (profile?.role === "worker") {
      await updateDoc(doc(db, "workerProfiles", user.uid), {
        skills, hourlyRate: parseFloat(form.hourlyRate) || 0,
        updatedAt: serverTimestamp(),
      });
    }
    await refreshProfile();
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleNicUpload() {
    if (!nicFile || !user) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `nic/${user.uid}/${nicFile.name}`);
      await uploadBytes(storageRef, nicFile);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "profiles", user.uid), {
        nicDocumentUrl: url, nicSubmittedAt: serverTimestamp(),
        nicPending: true,
      });
      await refreshProfile();
      alert("NIC uploaded successfully! Admin will verify within 24 hours.");
    } catch (e) { alert("Upload failed. Please try again."); }
    setUploading(false); setNicFile(null);
  }

  function toggleSkill(skill: string) {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  }

  if (authLoading) return <div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="section-container pt-28 pb-16">
        <div className="mb-8">
          <span className="text-handza font-semibold text-xs uppercase tracking-widest">Account</span>
          <h1 className="font-heading text-3xl font-bold text-navy mt-1">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your information and verification status</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleSave}>
              {/* Basic info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <h2 className="font-heading font-bold text-navy text-base mb-5 flex items-center gap-2"><User size={16}/> Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label:"Full Name", key:"fullName", icon:User,    type:"text",  placeholder:"Your full name" },
                    { label:"Phone",     key:"phone",    icon:Phone,   type:"tel",   placeholder:"+94 77 123 4567" },
                    { label:"Location",  key:"location", icon:MapPin,  type:"text",  placeholder:"Colombo, Western Province" },
                  ].map(({ label, key, icon: Icon, type, placeholder }) => (
                    <div key={key} className={key === "location" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                        <Icon size={11}/>{label}
                      </label>
                      <input type={type} value={(form as any)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="input-base" placeholder={placeholder}/>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText size={11}/>Bio
                    </label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                      rows={3} className="input-base resize-none"
                      placeholder="Tell employers about your experience and skills..."/>
                  </div>
                </div>
              </div>

              {/* Worker-specific */}
              {profile?.role === "worker" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                  <h2 className="font-heading font-bold text-navy text-base mb-5 flex items-center gap-2"><Briefcase size={16}/> Worker Details</h2>
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Hourly Rate (LKR)</label>
                    <input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                      className="input-base max-w-xs" placeholder="e.g. 500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Skills — Select all that apply</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map(skill => (
                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            skills.includes(skill)
                              ? "bg-navy text-white border-navy"
                              : "bg-white text-gray-600 border-gray-200 hover:border-navy/40"
                          }`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={saving}
                className="btn-primary disabled:opacity-60">
                <Save size={16}/>
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
              {saved && <span className="ml-3 text-green-600 text-sm font-medium">✓ Profile updated</span>}
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Verification status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-bold text-navy text-sm mb-4">Identity Verification</h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${
                profile?.nicVerified ? "bg-green-50" : "bg-amber-50"
              }`}>
                {profile?.nicVerified
                  ? <CheckCircle size={18} className="text-green-500 flex-shrink-0"/>
                  : <AlertCircle size={18} className="text-amber-500 flex-shrink-0"/>
                }
                <div>
                  <p className={`text-xs font-semibold ${profile?.nicVerified ? "text-green-700" : "text-amber-700"}`}>
                    {profile?.nicVerified ? "ID Verified" : "Verification Pending"}
                  </p>
                  <p className={`text-xs mt-0.5 ${profile?.nicVerified ? "text-green-600" : "text-amber-600"}`}>
                    {profile?.nicVerified ? "Your NIC has been verified by HANDZA admin." : "Upload your NIC to get verified."}
                  </p>
                </div>
              </div>

              {!profile?.nicVerified && (
                <div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Upload a clear photo of your National Identity Card (front). Your NIC is stored securely and only visible to HANDZA admins.
                  </p>
                  <label className="block">
                    <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      nicFile ? "border-navy bg-navy-light" : "border-gray-200 hover:border-navy/40"
                    }`}>
                      <Upload size={20} className="mx-auto mb-2 text-gray-400"/>
                      <p className="text-xs text-gray-500">{nicFile ? nicFile.name : "Click to upload NIC photo"}</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,.pdf"
                      onChange={e => setNicFile(e.target.files?.[0] || null)}/>
                  </label>
                  {nicFile && (
                    <button onClick={handleNicUpload} disabled={uploading}
                      className="btn-primary w-full justify-center mt-3 py-2.5 text-sm disabled:opacity-60">
                      <Upload size={14}/>
                      {uploading ? "Uploading..." : "Submit for Verification"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile completeness */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-bold text-navy text-sm mb-3">Profile Strength</h3>
              {[
                { label: "Full name",    done: !!form.fullName },
                { label: "Phone number", done: !!form.phone },
                { label: "Location",     done: !!form.location },
                { label: "Bio",          done: !!form.bio },
                { label: "ID Verified",  done: !!profile?.nicVerified },
                ...(profile?.role === "worker" ? [
                  { label: "Skills added",  done: skills.length > 0 },
                  { label: "Hourly rate",   done: !!form.hourlyRate },
                ] : []),
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 py-1.5">
                  <CheckCircle size={14} className={done ? "text-green-500" : "text-gray-200"}/>
                  <span className={`text-xs ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* Stats if worker */}
            {profile?.role === "worker" && workerData && (
              <div className="bg-navy rounded-2xl p-5 text-white">
                <h3 className="font-heading font-bold text-sm mb-3">Your Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Rating</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star size={11} className="text-yellow-400"/>{workerData.rating || "No ratings yet"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Total Reviews</span>
                    <span className="font-semibold">{workerData.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Skills</span>
                    <span className="font-semibold">{skills.length} selected</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
