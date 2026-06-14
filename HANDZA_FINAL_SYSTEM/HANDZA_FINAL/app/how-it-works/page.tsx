import Link from "next/link";
import Navbar from "@/components/Navbar";
import {ArrowRight} from "lucide-react";

const workerSteps=[
  ["01","Sign Up Free","Create your worker account in 2 minutes. Add your skills and hourly rate."],
  ["02","Upload Your NIC","Admin verifies within 24 hours. Get your verified badge."],
  ["03","Go Available","Toggle Available Now — your GPS location is shared with nearby employers."],
  ["04","Get Job Requests","Receive instant notifications. Accept jobs that suit you."],
  ["05","Work & Get Paid","Timer tracks hours. Payment transferred within 3 business days."],
];
const empSteps=[
  ["01","Create Account","Sign up as employer. Verify your NIC to unlock hiring."],
  ["02","Post a Job","Describe the work, set pay rate, choose category. Under 60 seconds."],
  ["03","See Available Workers","Nearby verified workers shown on live map. Filter by skill."],
  ["04","Accept & Chat","Choose from applicants. Chat to confirm details."],
  ["05","Confirm & Rate","Work done — confirm payment. Rate the worker."],
];

export default function HowItWorksPage(){
  return(
    <div className="min-h-screen bg-white"><Navbar/>
    <div className="bg-navy pt-32 pb-16 dot-pattern relative">
      <div className="section-container text-center relative">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">How HANDZA Works</h1>
        <p className="text-white/60 max-w-xl mx-auto">From signup to first payment — here&apos;s exactly what happens.</p>
      </div>
    </div>
    <div className="section-container py-16">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-6">For Workers</h2>
          {workerSteps.map(([n,t,d])=>(
            <div key={n} className="flex gap-4 mb-5"><div className="w-10 h-10 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{n}</div><div><h3 className="font-heading font-bold text-navy mb-1">{t}</h3><p className="text-gray-500 text-sm leading-relaxed">{d}</p></div></div>
          ))}
          <Link href="/auth/signup?role=worker" className="btn-primary mt-2">Join as Worker <ArrowRight size={16}/></Link>
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-6">For Employers</h2>
          {empSteps.map(([n,t,d])=>(
            <div key={n} className="flex gap-4 mb-5"><div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{n}</div><div><h3 className="font-heading font-bold text-navy mb-1">{t}</h3><p className="text-gray-500 text-sm leading-relaxed">{d}</p></div></div>
          ))}
          <Link href="/auth/signup?role=employer" className="btn-secondary mt-2">Post a Job Free <ArrowRight size={16}/></Link>
        </div>
      </div>
    </div></div>
  );
}
