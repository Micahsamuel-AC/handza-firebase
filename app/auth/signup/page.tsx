"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import HANDZALogo from "@/components/HANDZALogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Eye, EyeOff, ArrowRight, Users, Briefcase, CheckCircle, Layers } from "lucide-react";

type RoleOption = "worker" | "employer" | "both";

function SignupForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [roleOption, setRoleOption] = useState<RoleOption>((params.get("role") as RoleOption) || "worker");
  const [form, setForm]     = useState({ fullName:"", email:"", password:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [agreed, setAgreed]   = useState(false);

  const ROLES: { key: RoleOption; icon: any; title: string; desc: string }[] = [
    { key:"worker",   icon:Users,    title:"I'm a Worker",    desc:"Find jobs and earn hourly" },
    { key:"employer", icon:Briefcase,title:"I'm an Employer", desc:"Post jobs and hire workers" },
    { key:"both",     icon:Layers,   title:"Both",            desc:"Work and hire on HANDZA" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the Terms & Conditions."); return; }
    setLoading(true); setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const rolesArr = roleOption === "both" ? ["worker","employer"] : [roleOption];
      const primary  = roleOption === "both" ? "worker" : roleOption;
      await setDoc(doc(db,"profiles",user.uid), {
        email:form.email, fullName:form.fullName,
        role:primary, roles:rolesArr, activeRole:primary,
        phone:"", location:"", bio:"",
        nicVerified:false, suspended:false,
        agreedToTerms:true, agreedToTermsAt:serverTimestamp(),
        createdAt:serverTimestamp(),
      });
      if (roleOption === "worker" || roleOption === "both") {
        await setDoc(doc(db,"workerProfiles",user.uid), {
          userId:user.uid, skills:[], hourlyRate:0,
          isAvailable:false, rating:0, totalReviews:0,
          completedJobs:0, certifications:[], portfolioPhotos:[],
          location:null, createdAt:serverTimestamp(),
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      const msgs: Record<string,string> = {
        "auth/email-already-in-use":"This email is already registered.",
        "auth/weak-password":"Password must be at least 6 characters.",
        "auth/invalid-email":"Please enter a valid email address.",
      };
      setError(msgs[err.code] || err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-lgray flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-navy/5 dot-pattern-dark pointer-events-none"/>
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-4"><LanguageSwitcher compact/></div>
        <Link href="/" className="flex justify-center mb-6"><HANDZALogo size={44}/></Link>
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h1 className="font-heading text-2xl font-bold text-navy mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Free forever. No credit card required.</p>

          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-lgray rounded-2xl">
            {ROLES.map(({ key, icon:Icon, title }) => (
              <button key={key} type="button" onClick={() => setRoleOption(key)}
                className={`flex flex-col items-center py-3 px-2 rounded-xl text-xs font-heading font-semibold transition-all gap-1 ${roleOption===key?"bg-navy text-white shadow-sm":"text-gray-500 hover:text-navy"}`}>
                <Icon size={16}/><span>{title}</span>
              </button>
            ))}
          </div>

          <div className={`rounded-2xl p-3.5 mb-5 text-xs leading-relaxed ${roleOption==="worker"?"bg-handza-light text-handza-dark":roleOption==="employer"?"bg-navy-light text-navy":"bg-purple-50 text-purple-700"}`}>
            {roleOption==="worker" && "As a worker, you'll toggle availability, receive job requests, and build your reputation."}
            {roleOption==="employer" && "As an employer, you can post jobs, search verified workers, and hire instantly."}
            {roleOption==="both" && "Switch between Worker and Employer mode from your dashboard anytime."}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label:"Full Name",key:"fullName",type:"text", placeholder:"Your full name" },
              { label:"Email",   key:"email",   type:"email",placeholder:"you@email.com" },
            ].map(({ label,key,type,placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} required value={(form as any)[key]}
                  onChange={e => setForm({...form,[key]:e.target.value})}
                  className="input-base" placeholder={placeholder}/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPwd?"text":"password"} required minLength={6}
                  value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                  className="input-base pr-12" placeholder="Min. 6 characters"/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3"><p className="text-red-600 text-sm">{error}</p></div>}

            <label className="flex items-start gap-3 cursor-pointer">
              <div onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${agreed?"bg-handza border-handza":"border-gray-300 bg-white hover:border-handza"}`}>
                {agreed && <CheckCircle size={12} className="text-white"/>}
              </div>
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to HANDZA's{" "}
                <Link href="/legal/terms" target="_blank" className="text-handza font-semibold hover:underline">Terms & Conditions</Link>{" "}and{" "}
                <Link href="/legal/privacy" target="_blank" className="text-handza font-semibold hover:underline">Privacy Policy</Link>.
                I understand HANDZA is a neutral platform.
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16}/></>}
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}>
      <SignupForm/>
    </Suspense>
  );
}
