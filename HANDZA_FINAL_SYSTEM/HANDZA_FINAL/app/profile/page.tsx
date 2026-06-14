"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Navbar from "@/components/Navbar";
import {useAuth} from "@/lib/auth-context";
import {db,storage} from "@/lib/firebase";
import {doc,updateDoc,serverTimestamp,getDoc} from "firebase/firestore";
import {ref,uploadBytes,getDownloadURL} from "firebase/storage";
import {Save,Upload,CheckCircle,AlertCircle,User,Phone,MapPin,FileText,Star,Briefcase} from "lucide-react";

const SKILLS=["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

export default function ProfilePage() {
  const router=useRouter();
  const {user,profile,loading:authLoading,refreshProfile}=useAuth();
  const [form,setForm]=useState({fullName:"",phone:"",location:"",bio:"",hourlyRate:""});
  const [skills,setSkills]=useState<string[]>([]);
  const [nicFile,setNicFile]=useState<File|null>(null);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [saved,setSaved]=useState(false);
  const [workerData,setWorkerData]=useState<any>(null);

  useEffect(()=>{
    if(!authLoading&&!user){router.push("/auth/login");return;}
    if(profile){
      setForm({fullName:profile.fullName||"",phone:profile.phone||"",location:profile.location||"",bio:profile.bio||"",hourlyRate:""});
      const r=profile.activeRole||profile.role;
      if(r==="worker")loadWP();
    }
  },[profile,authLoading]);

  async function loadWP(){
    if(!user)return;
    const s=await getDoc(doc(db,"workerProfiles",user.uid));
    if(s.exists()){const d=s.data();setWorkerData(d);setSkills(d.skills||[]);setForm(f=>({...f,hourlyRate:d.hourlyRate?.toString()||""}));}
  }

  async function handleSave(e:React.FormEvent){
    e.preventDefault();if(!user)return;setSaving(true);
    await updateDoc(doc(db,"profiles",user.uid),{fullName:form.fullName,phone:form.phone,location:form.location,bio:form.bio,updatedAt:serverTimestamp()});
    const r=profile?.activeRole||profile?.role;
    if(r==="worker") await updateDoc(doc(db,"workerProfiles",user.uid),{skills,hourlyRate:parseFloat(form.hourlyRate)||0,updatedAt:serverTimestamp()});
    await refreshProfile();setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  }

  async function handleNicUpload(){
    if(!nicFile||!user)return;setUploading(true);
    try{
      const r=ref(storage,`nic/${user.uid}/${nicFile.name}`);
      await uploadBytes(r,nicFile);const url=await getDownloadURL(r);
      await updateDoc(doc(db,"profiles",user.uid),{nicDocumentUrl:url,nicSubmittedAt:serverTimestamp(),nicPending:true});
      await refreshProfile();alert("NIC uploaded! Admin will verify within 24 hours.");
    }catch{alert("Upload failed.");}
    setUploading(false);setNicFile(null);
  }

  if(authLoading)return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;
  const isWorker=(profile?.activeRole||profile?.role)==="worker";

  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16">
      <div className="mb-8"><span className="text-handza font-semibold text-xs uppercase tracking-widest">Account</span><h1 className="font-heading text-3xl font-bold text-navy mt-1">My Profile</h1></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSave}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
              <h2 className="font-heading font-bold text-navy text-base mb-5 flex items-center gap-2"><User size={16}/>Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label><input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="input-base" placeholder="Your full name"/></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input-base" placeholder="+94 77 123 4567"/></div>
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="input-base" placeholder="Colombo, Western Province"/></div>
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} className="input-base resize-none" placeholder="Tell employers about your experience..."/></div>
              </div>
            </div>
            {isWorker&&(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <h2 className="font-heading font-bold text-navy text-base mb-5 flex items-center gap-2"><Briefcase size={16}/>Worker Details</h2>
                <div className="mb-5"><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Hourly Rate (LKR)</label><input type="number" value={form.hourlyRate} onChange={e=>setForm({...form,hourlyRate:e.target.value})} className="input-base max-w-xs" placeholder="500"/></div>
                <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Skills</label>
                <div className="flex flex-wrap gap-2">{SKILLS.map(s=><button key={s} type="button" onClick={()=>setSkills(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${skills.includes(s)?"bg-navy text-white border-navy":"bg-white text-gray-600 border-gray-200 hover:border-navy/40"}`}>{s}</button>)}</div>
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60"><Save size={16}/>{saving?"Saving...":saved?"Saved! ✓":"Save Changes"}</button>
          </form>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-heading font-bold text-navy text-sm mb-4">Identity Verification</h3>
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${profile?.nicVerified?"bg-green-50":"bg-amber-50"}`}>
              {profile?.nicVerified?<CheckCircle size={18} className="text-green-500"/>:<AlertCircle size={18} className="text-amber-500"/>}
              <div><p className={`text-xs font-semibold ${profile?.nicVerified?"text-green-700":"text-amber-700"}`}>{profile?.nicVerified?"ID Verified":"Pending"}</p><p className="text-xs mt-0.5 text-amber-600">{profile?.nicVerified?"Verified by HANDZA admin.":"Upload NIC to get verified."}</p></div>
            </div>
            {!profile?.nicVerified&&(
              <>
                <label className="block cursor-pointer mb-3">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${nicFile?"border-navy bg-navy-light":"border-gray-200 hover:border-navy/40"}`}>
                    <Upload size={20} className="mx-auto mb-2 text-gray-400"/><p className="text-xs text-gray-500">{nicFile?nicFile.name:"Click to upload NIC"}</p><p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e=>setNicFile(e.target.files?.[0]||null)}/>
                </label>
                {nicFile&&<button onClick={handleNicUpload} disabled={uploading} className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-60"><Upload size={14}/>{uploading?"Uploading...":"Submit"}</button>}
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-heading font-bold text-navy text-sm mb-3">Profile Strength</h3>
            {[{l:"Full name",d:!!form.fullName},{l:"Phone",d:!!form.phone},{l:"Location",d:!!form.location},{l:"Bio",d:!!form.bio},{l:"ID Verified",d:!!profile?.nicVerified},...(isWorker?[{l:"Skills",d:skills.length>0},{l:"Hourly rate",d:!!form.hourlyRate}]:[])].map(({l,d})=>(
              <div key={l} className="flex items-center gap-2.5 py-1.5"><CheckCircle size={14} className={d?"text-green-500":"text-gray-200"}/><span className={`text-xs ${d?"text-gray-700":"text-gray-400"}`}>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div></div>
  );
}
