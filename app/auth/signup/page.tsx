"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, ArrowRight, Users, Briefcase } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<"worker"|"employer">((params.get("role") as any) || "worker");
  const [form, setForm] = useState({ fullName:"", email:"", password:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Save profile to Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        email: form.email, fullName: form.fullName, role,
        phone: "", location: "", bio: "", createdAt: serverTimestamp()
      });
      // If worker, create worker profile too
      if (role === "worker") {
        await setDoc(doc(db, "workerProfiles", user.uid), {
          userId: user.uid, skills: [], hourlyRate: 0,
          isAvailable: true, rating: 0, totalReviews: 0
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      const msgs: any = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(msgs[err.code] || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lgray flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo.png" alt="HANDZA" width={40} height={40} className="rounded-xl shadow-lg" />
          <span className="font-heading font-bold text-2xl text-navy">HANDZA</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-navy/10 p-8">
          <h1 className="font-heading text-2xl font-bold text-navy mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Free forever. No credit card required.</p>

          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-lgray rounded-2xl">
            {(["worker","employer"] as const).map(r => (
              <button key={r} onClick={()=>setRole(r)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-heading font-semibold transition-all ${
                  role===r ? "bg-navy text-white shadow-sm" : "text-gray-500 hover:text-navy"
                }`}>
                {r==="worker" ? <Users size={16}/> : <Briefcase size={16}/>}
                {r==="worker" ? "I'm a Worker" : "I'm an Employer"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label:"Full Name", key:"fullName", type:"text", placeholder:"Your full name" },
              { label:"Email", key:"email", type:"email", placeholder:"you@email.com" },
            ].map(({label,key,type,placeholder}) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} required value={(form as any)[key]}
                  onChange={e=>setForm({...form,[key]:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition"
                  placeholder={placeholder}/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPwd?"text":"password"} required value={form.password} minLength={6}
                  onChange={e=>setForm({...form,password:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-handza/30 focus:border-handza transition pr-12"
                  placeholder="Min. 6 characters"/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-handza text-white font-heading font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30 disabled:opacity-60 mt-2">
              {loading ? "Creating account..." : <>Create Account <ArrowRight size={16}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-handza font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}><SignupForm/></Suspense>;
}
