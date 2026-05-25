import Navbar from "@/components/Navbar";
import Link from "next/link";
import { UserPlus, ToggleRight, MapPin, DollarSign, Shield, CheckCircle, ArrowRight } from "lucide-react";

const workerSteps = [
  { icon: UserPlus,    step:"01", title:"Sign Up Free",       desc:"Create your worker account in 2 minutes. Add your skills and set your hourly rate." },
  { icon: Shield,      step:"02", title:"Upload Your NIC",    desc:"Upload your National Identity Card. Admin verifies within 24 hours. You get a verified badge." },
  { icon: ToggleRight, step:"03", title:"Go Available",       desc:"Toggle Available Now from your dashboard. Employers near you can see you on the live map." },
  { icon: MapPin,      step:"04", title:"Get Job Requests",   desc:"Receive instant notifications for jobs nearby. Accept what suits you." },
  { icon: DollarSign,  step:"05", title:"Work & Get Paid",    desc:"Complete the job. Payment transferred to your bank account within 3 business days." },
];
const employerSteps = [
  { icon: UserPlus,    step:"01", title:"Create Account",     desc:"Sign up as an employer. Verify your NIC or business registration to unlock hiring." },
  { icon: MapPin,      step:"02", title:"Post a Job",         desc:"Describe the work, set your pay rate, choose the category. Takes under 60 seconds." },
  { icon: Shield,      step:"03", title:"See Available Workers", desc:"Nearby verified workers shown on a live map. Filter by skill, rating, and distance." },
  { icon: CheckCircle, step:"04", title:"Accept & Chat",      desc:"Choose a worker from applicants. Chat to confirm details before work starts." },
  { icon: DollarSign,  step:"05", title:"Confirm & Rate",     desc:"After work is done, confirm completion to release payment. Rate the worker." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="section-container text-center mb-20">
          <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">Simple Process</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-navy mt-2 mb-4">How HANDZA Works</h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">Fast, safe, and simple for both workers and employers.</p>
        </div>
        {[{ steps: workerSteps, label:"For Workers", color:"bg-handza shadow-orange", badge:"badge-orange", cta:"/auth/signup?role=worker", ctaLabel:"Join as Worker", ctaBtnClass:"btn-primary" },
          { steps: employerSteps, label:"For Employers", color:"bg-navy shadow-md", badge:"badge-navy", cta:"/auth/signup?role=employer", ctaLabel:"Post a Job Free", ctaBtnClass:"btn-secondary" }
        ].map(({ steps, label, color, badge, cta, ctaLabel, ctaBtnClass }) => (
          <div key={label} className="section-container mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                <span className="text-white font-bold text-sm">{label[4]}</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-navy">{label}</h2>
            </div>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5 bg-lgray rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <s.icon size={20} className="text-white"/>
                  </div>
                  <div>
                    <span className={`badge ${badge} text-xs`}>Step {s.step}</span>
                    <h3 className="font-heading font-bold text-navy text-lg mt-2 mb-1">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6"><Link href={cta} className={`${ctaBtnClass} inline-flex`}>{ctaLabel} <ArrowRight size={16}/></Link></div>
          </div>
        ))}
        <div className="section-container">
          <div className="bg-navy rounded-3xl p-10 text-center text-white">
            <Shield size={36} className="mx-auto mb-4 text-handza"/>
            <h2 className="font-heading text-2xl font-bold mb-3">Built on Trust & Safety</h2>
            <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed mb-6">Every user is ID-verified. HANDZA is governed by Sri Lanka's PDPA and labour laws.</p>
            <div className="flex flex-wrap gap-6 justify-center">
              {["ID Verified users","PDPA Compliant","Secure payments","Rated profiles"].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-white/70"><CheckCircle size={14} className="text-handza"/>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
