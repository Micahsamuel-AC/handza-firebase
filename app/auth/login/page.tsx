"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import HANDZALogo from "@/components/HANDZALogo";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      const msgs: Record<string, string> = {
        "auth/user-not-found":    "No account found with this email.",
        "auth/wrong-password":    "Incorrect password. Please try again.",
        "auth/invalid-credential":"Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      setError(msgs[err.code] || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lgray flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 bg-navy/5 dot-pattern-dark pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <HANDZALogo size={44} />
        </Link>

        <div className="bg-white rounded-3xl shadow-lg shadow-navy/8 border border-gray-100 p-8">
          <h1 className="font-heading text-2xl font-bold text-navy mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to your HANDZA account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-base" placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-base pr-12" placeholder="Your password"
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

            <button type="submit" disabled={loading}
              className="btn-secondary w-full justify-center py-3.5 mt-2 disabled:opacity-60">
              {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-handza font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
