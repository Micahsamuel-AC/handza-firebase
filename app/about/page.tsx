import Navbar from "@/components/Navbar";
import HANDZALogo from "@/components/HANDZALogo";
import Link from "next/link";
import { Shield, Users, Zap, Heart, ArrowRight, CheckCircle } from "lucide-react";

const values = [
  { icon: Shield,  title: "Trust First",      desc: "Every user is ID-verified. We never compromise on the safety of our workers or employers." },
  { icon: Users,   title: "Community Driven", desc: "Built for Sri Lankan workers and families. We understand local needs, language, and culture." },
  { icon: Zap,     title: "Speed Matters",    desc: "Emergency hire in under 60 seconds. Instant notifications. Real-time matching. Time is money." },
  { icon: Heart,   title: "Social Impact",    desc: "We create income for students, tradespeople, and daily wage earners across the country." },
];

const team = [
  { name: "Micah Samuel",    role: "Founder & CEO",        initial: "M", color: "bg-handza" },
  { name: "Co-Founder",      role: "Technical Lead",        initial: "C", color: "bg-navy" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-28 pb-20">
        {/* Hero */}
        <div className="section-container text-center mb-20">
          <div className="flex justify-center mb-8">
            <HANDZALogo size={72} />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-navy mb-5">
            About HANDZA
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            HANDZA is Sri Lanka's first on-demand labour marketplace — connecting verified skilled workers
            with employers for flexible hourly jobs and instant hiring across the country.
          </p>
        </div>

        {/* Story */}
        <div className="section-container mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">Our Story</span>
              <h2 className="font-heading text-3xl font-bold text-navy mb-5">Why we built HANDZA</h2>
              <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
                <p>Sri Lanka has millions of skilled workers — plumbers, electricians, painters, cleaners — who are talented and hardworking but struggle to find consistent work. At the same time, homeowners and businesses spend days trying to find trusted help for simple tasks.</p>
                <p>We saw this problem firsthand. The informal labour market in Sri Lanka is broken. No verification, no transparency, no security for either side. Workers get underpaid. Employers get let down. Nobody wins.</p>
                <p>HANDZA was built to fix this. A digital platform that brings the trust, speed, and reliability of modern technology to Sri Lanka's labour market — while keeping it human, local, and fair.</p>
              </div>
            </div>
            <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-handza/15 rounded-full blur-2xl"/>
              <div className="relative space-y-5">
                {[
                  { val: "22M+",  label: "People in Sri Lanka we're building for" },
                  { val: "10",    label: "Service categories at launch" },
                  { val: "60s",   label: "Time to post or find a job" },
                  { val: "100%",  label: "ID-verified platform" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="font-heading text-3xl font-bold text-handza w-20 flex-shrink-0">{val}</span>
                    <span className="text-white/60 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-lgray py-20 mb-20">
          <div className="section-container text-center">
            <span className="badge badge-navy text-xs uppercase tracking-widest mb-3 inline-flex">Mission</span>
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Our Mission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              "To eliminate labour market friction in Sri Lanka by creating a verified, real-time, mobile-first platform where anyone can earn and anyone can hire — safely, fairly, and instantly."
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="section-container mb-20">
          <div className="text-center mb-12">
            <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">What we stand for</span>
            <h2 className="font-heading text-3xl font-bold text-navy mt-2">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-hover">
                <div className="w-12 h-12 bg-handza-light rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-handza"/>
                </div>
                <h3 className="font-heading font-bold text-navy text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="section-container mb-20">
          <div className="text-center mb-12">
            <span className="badge badge-navy text-xs uppercase tracking-widest mb-3 inline-flex">The Team</span>
            <h2 className="font-heading text-3xl font-bold text-navy mt-2">Who's Building HANDZA</h2>
          </div>
          <div className="flex flex-wrap gap-5 justify-center">
            {team.map(({ name, role, initial, color }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center w-52 card-hover">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl mx-auto mb-4`}>
                  {initial}
                </div>
                <p className="font-heading font-bold text-navy text-sm">{name}</p>
                <p className="text-gray-400 text-xs mt-1">{role}</p>
                <p className="text-gray-300 text-xs mt-1">University of Vavuniya</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal commitment */}
        <div className="section-container mb-20">
          <div className="bg-white border-2 border-navy/10 rounded-3xl p-8">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Our Legal Commitment</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Registered under Sri Lanka's Companies Act No. 7 of 2007",
                "Fully compliant with PDPA No. 9 of 2022 (data protection)",
                "Workers are independent contractors — not HANDZA employees",
                "Platform liability limited as a neutral intermediary",
                "Electronic Transactions Act No. 19 of 2006 compliant",
                "Online Safety Act No. 9 of 2024 compliant",
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5"/>
                  <span className="text-gray-600 text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="section-container text-center">
          <h2 className="font-heading text-3xl font-bold text-navy mb-4">Join the Movement</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Be part of Sri Lanka's labour revolution. Free to join, safe to use.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup?role=worker" className="btn-primary">
              Join as Worker <ArrowRight size={16}/>
            </Link>
            <Link href="/auth/signup?role=employer" className="btn-secondary">
              Post a Job Free <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
