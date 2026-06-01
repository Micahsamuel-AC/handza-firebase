"use client";
import { Clock, Zap, Globe, CreditCard, Shield, Smartphone } from "lucide-react";

const COMING_SOON = [
  { icon: Clock,      label: "Hourly Timer",     desc: "Auto payment for Electrical, Plumbing, Painting", soon: "Q3 2026" },
  { icon: Globe,      label: "Tamil & Sinhala",  desc: "Full platform translation", soon: "Q3 2026" },
  { icon: CreditCard, label: "Online Payments",  desc: "Pay securely via card or wallet", soon: "Q4 2026" },
  { icon: Shield,     label: "Micro-Insurance",  desc: "On-job worker protection", soon: "Q4 2026" },
  { icon: Smartphone, label: "Mobile App",       desc: "iOS and Android apps", soon: "2027" },
  { icon: Zap,        label: "AI Matching",      desc: "Smart worker-job matching", soon: "2027" },
];

export default function UpcomingFeatures() {
  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="section-container relative">
        <div className="text-center mb-12">
          <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">Coming Soon</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-2">
            What's Next for HANDZA
          </h2>
          <p className="text-white/50 mt-3 max-w-md mx-auto text-sm leading-relaxed">
            We're constantly building new features to make HANDZA the best labour platform in Sri Lanka.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMING_SOON.map(({ icon: Icon, label, desc, soon }) => (
            <div key={label} className="glass rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-handza/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-handza" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-heading font-semibold text-white text-sm">{label}</p>
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded-full">{soon}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-white/30 text-xs">
            Currently live: Hourly billing for Cleaning, Household Help & Logistics
          </p>
        </div>
      </div>
    </section>
  );
}
