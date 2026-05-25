"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import HANDZALogo from "@/components/HANDZALogo";
import { Eye, EyeOff, ArrowRight, Users, Briefcase, CheckCircle } from "lucide-react";

function SignupForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [role, setRole]         = useState<"worker"|"employer">((params.get("role") as any) || "worker");
  const [form, setForm]         = useState({ fullName: "", email: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [agreed, setAgreed]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (!agreed) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      setLoading(false);
      return;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "profiles", user.uid), {
        email: form.email, fullName: form.fullName, role,
        phone: "", location: "", bio: "",
        nicVerified: false, suspended: false,
        agreedToTerms: true, agreedToTermsAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      if (role === "worker") {
        await setDoc(doc(db, "workerProfiles", user.uid), {
          userId: user.uid, skills: [], hourlyRate: 0,
          isAvailable: false, rating: 0, totalReviews: 0,
          location: null, createdAt: serverTimestamp(),
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      const msgs: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password":        "Password must be at least 6 characters.",
        "auth/invalid-email":        "Please enter a valid email address.",
      };
      setError(msgs[err.code] || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lgray flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-navy/5 dot-pattern-dark pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <HANDZALogo size={44} />
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h1 className="font-heading text-2xl font-bold text-navy mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Free forever. No credit card required.</p>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-lgray rounded-2xl">
            {(["worker", "employer"] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-heading font-semibold transition-all ${
                  role === r ? "bg-navy text-white shadow-sm" : "text-gray-500 hover:text-navy"
                }`}>
                {r === "worker" ? <Users size={16} /> : <Briefcase size={16} />}
                {r === "worker" ? "I'm a Worker" : "I'm an Employer"}
              </button>
            ))}
          </div>

          {/* Role info banner */}
          <div className={`rounded-2xl p-3.5 mb-5 text-xs leading-relaxed ${
            role === "worker" ? "bg-handza-light text-handza-dark" : "bg-navy-light text-navy"
          }`}>
            {role === "worker"
              ? "As a worker, you'll be able to toggle availability, receive job requests, and build your reputation."
              : "As an employer, you can post jobs, search verified workers, and hire instantly."}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full Name", key: "fullName", type: "text",  placeholder: "Your full name" },
              { label: "Email",     key: "email",    type: "email", placeholder: "you@email.com" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input
                  type={type} required value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-base" placeholder={placeholder}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} required minLength={6}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-base pr-12" placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* T&C checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                  agreed ? "bg-handza border-handza" : "border-gray-300 bg-white hover:border-handza"
                }`}>
                {agreed && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to HANDZA's{" "}
                <Link href="/legal/terms" target="_blank" className="text-handza font-semibold hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/legal/privacy" target="_blank" className="text-handza font-semibold hover:underline">Privacy Policy</Link>.
                I understand HANDZA is a neutral platform not responsible for user conduct.
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16} /></>}
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
    <Suspense fallback={
      <div className="min-h-screen bg-lgray flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
