import Link from "next/link";
import Navbar from "@/components/Navbar";
import UpcomingFeatures from "@/components/UpcomingFeatures";
import HANDZALogo from "@/components/HANDZALogo";
import { ArrowRight, CheckCircle, Star, Zap, Shield, Users, Briefcase, MapPin, Clock, BadgeCheck, Wrench, Flame, Home, Package, Car, Paintbrush, GlassWater, Cpu } from "lucide-react";

const categories = [
  {icon:Wrench,    name:"Plumbing",       color:"bg-blue-50 text-blue-600"},
  {icon:Zap,       name:"Electrical",      color:"bg-yellow-50 text-yellow-600"},
  {icon:Flame,     name:"Welding",         color:"bg-red-50 text-red-600"},
  {icon:GlassWater,name:"Glass Fitting",   color:"bg-cyan-50 text-cyan-600"},
  {icon:Cpu,       name:"Computer Repairs",color:"bg-purple-50 text-purple-600"},
  {icon:Home,      name:"Cleaning",        color:"bg-green-50 text-green-600"},
  {icon:Car,       name:"Vehicle Washing", color:"bg-sky-50 text-sky-600"},
  {icon:Paintbrush,name:"Painting",        color:"bg-pink-50 text-pink-600"},
  {icon:Users,     name:"Household Help",  color:"bg-orange-50 text-orange-600"},
  {icon:Package,   name:"Logistics",       color:"bg-amber-50 text-amber-600"},
];

const steps = [
  {n:"01",title:"Sign Up Free",     desc:"Create your account as worker or employer in under 2 minutes.",icon:Users,    color:"bg-handza"},
  {n:"02",title:"Post or Go Live",  desc:"Post a job in 60 seconds or toggle Available Now on the map.", icon:Zap,      color:"bg-navy"},
  {n:"03",title:"Match Instantly",  desc:"Get matched in real-time by location and skill.",              icon:MapPin,   color:"bg-handza"},
  {n:"04",title:"Work & Get Paid",  desc:"Timer tracks your hours. Payment auto-calculated. Safe.",      icon:BadgeCheck,color:"bg-navy"},
];

const testimonials = [
  {name:"Priya M.",  role:"Homeowner, Colombo", text:"Found a verified electrician in 10 minutes. Professional and fairly priced!",    rating:5},
  {name:"Kamal R.",  role:"Electrician, Kandy",  text:"HANDZA got me 3 new clients in my first week. The availability toggle is genius.", rating:5},
  {name:"Samantha W.",role:"SME Owner, Galle",   text:"We use HANDZA for all our office maintenance. Reliable verified workers every time.", rating:5},
];

const liveWorkers = [
  {name:"Kamal P.", skill:"Electrician",  rate:"LKR 500/hr", stars:5, dist:"1.2km"},
  {name:"Nimal S.", skill:"Plumber",       rate:"LKR 450/hr", stars:4, dist:"2.8km"},
  {name:"Suresh R.",skill:"Painter",       rate:"LKR 400/hr", stars:5, dist:"3.1km"},
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Navbar/>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
        <div className="absolute inset-0 dot-pattern"/>
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 15% 60%,rgba(232,84,26,.18) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(232,84,26,.10) 0%,transparent 45%)"}}/>
        <div className="relative section-container pt-24 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-8 animate-fade-up">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot"/>
                <span className="text-white/80 text-sm font-medium">Sri Lanka&apos;s On-Demand Labour Marketplace</span>
              </div>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-[64px] font-bold text-white leading-[1.05] mb-7 animate-fade-up-1">
                Connect the <span className="gradient-text">Right Hands</span> to the Right Work.
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl animate-fade-up-2">
                Verified skilled workers. Instant job matching. Secure payments. Real-time GPS. Built for Sri Lanka.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fade-up-3">
                <Link href="/auth/signup?role=employer" className="btn-primary text-base px-8 py-4">I Need Workers <ArrowRight size={18}/></Link>
                <Link href="/auth/signup?role=worker" className="btn-ghost text-base px-8 py-4">I Want to Work <ArrowRight size={18}/></Link>
              </div>
              <div className="flex flex-wrap gap-6 animate-fade-up-3">
                {["✓ Free to join","✓ ID-verified workers","✓ Instant matching","✓ Secure payments"].map(t=>(
                  <span key={t} className="text-white/50 text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block animate-fade-up-2">
              <div className="glass rounded-3xl p-6 max-w-sm ml-auto shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <HANDZALogo size={38} theme="dark" variant="icon"/>
                  <div className="flex-1"><p className="text-white font-heading font-bold text-sm">Available Near You</p><p className="text-white/40 text-xs mt-0.5">Colombo District</p></div>
                  <div className="flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 py-1.5 rounded-full"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-dot"/>Live</div>
                </div>
                <div className="space-y-2.5 mb-4">
                  {liveWorkers.map(w=>(
                    <div key={w.name} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-orange">{w.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5"><span className="text-white font-semibold text-sm">{w.name}</span><BadgeCheck size={12} className="text-green-400"/></div>
                        <div className="text-white/50 text-xs">{w.skill}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-handza text-sm font-bold">{w.rate}</div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-yellow-400 text-xs">{"★".repeat(w.stars)}</span>
                          <span className="text-white/30 text-xs">{w.dist}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-2xl p-3 mb-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2"><MapPin size={12} className="text-handza"/><span className="text-white/50 text-xs">3 workers within 5km</span></div>
                  <div className="h-14 bg-navy/50 rounded-xl flex items-center justify-center"><span className="text-white/30 text-xs">Live map view</span></div>
                </div>
                <Link href="/workers" className="block w-full text-center bg-handza text-white text-sm font-semibold py-3 rounded-xl hover:bg-handza-dark transition-colors shadow-orange">Browse All Workers →</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14 fill-white block">
            <path d="M0,32 C240,56 480,8 720,32 C960,56 1200,8 1440,32 L1440,56 L0,56 Z"/>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="section-container"><div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{val:"500+",label:"Verified Workers"},{val:"1,200+",label:"Jobs Completed"},{val:"10",label:"Categories"},{val:"4.8★",label:"Average Rating"}].map(({val,label})=>(
            <div key={label} className="group"><div className="font-heading text-3xl sm:text-4xl font-bold text-navy group-hover:text-handza transition-colors">{val}</div><div className="text-gray-500 text-sm mt-1.5 font-medium">{label}</div></div>
          ))}
        </div></div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">Simple Process</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy mt-2">How HANDZA Works</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">From signup to first payment in minutes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s,i)=>(
              <div key={i} className="bg-lgray rounded-3xl p-7 card-hover relative">
                <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md`}><s.icon size={24} className="text-white"/></div>
                <div className="text-handza font-heading font-bold text-xs uppercase tracking-widest mb-2">Step {s.n}</div>
                <h3 className="font-heading font-bold text-navy text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-lgray dot-pattern-dark relative">
        <div className="section-container relative">
          <div className="text-center mb-16">
            <span className="badge badge-navy text-xs uppercase tracking-widest mb-3 inline-flex">What We Cover</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy mt-2">10 Service Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat=>(
              <Link key={cat.name} href={`/jobs?category=${encodeURIComponent(cat.name)}`} className="bg-white hover:bg-navy group rounded-2xl p-5 text-center card-hover shadow-sm border border-gray-100">
                <div className={`w-12 h-12 ${cat.color} group-hover:bg-handza/20 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors`}><cat.icon size={22} className="group-hover:text-handza transition-colors"/></div>
                <div className="font-heading font-semibold text-navy group-hover:text-white text-sm transition-colors leading-tight">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WORKERS / EMPLOYERS */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16"><h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy">Built for Both Sides</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-navy rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-handza/10 rounded-full blur-3xl"/>
              <div className="relative">
                <div className="w-14 h-14 bg-handza rounded-2xl flex items-center justify-center mb-6 shadow-orange"><Users size={26} className="text-white"/></div>
                <span className="badge badge-orange text-xs mb-3 inline-flex">For Workers</span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-4">Earn on Your Terms</h3>
                <div className="space-y-3 mb-8">
                  {["Flexible hourly earnings — work on your schedule","ID-verified safe employers","Build reputation with ratings and reviews","Toggle Available Now for instant job matches","Transparent pay — no hidden deductions"].map(pt=>(
                    <div key={pt} className="flex items-start gap-3"><CheckCircle size={16} className="text-handza flex-shrink-0 mt-0.5"/><span className="text-white/75 text-sm">{pt}</span></div>
                  ))}
                </div>
                <Link href="/auth/signup?role=worker" className="inline-flex items-center gap-2 bg-handza text-white font-heading font-semibold px-7 py-3.5 rounded-2xl hover:bg-handza-dark transition-all shadow-orange">Join as Worker <ArrowRight size={16}/></Link>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-10 shadow-lg">
              <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mb-6 shadow-md"><Briefcase size={26} className="text-white"/></div>
              <span className="badge badge-navy text-xs mb-3 inline-flex">For Employers</span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-4">Hire Instantly</h3>
              <div className="space-y-3 mb-8">
                {["Instant access to ID-verified skilled workers","Post a job in under 60 seconds","See workers on a live map near you","Pay securely on task completion only","Rated profiles — know who you're hiring"].map(pt=>(
                  <div key={pt} className="flex items-start gap-3"><CheckCircle size={16} className="text-navy flex-shrink-0 mt-0.5"/><span className="text-gray-600 text-sm">{pt}</span></div>
                ))}
              </div>
              <Link href="/auth/signup?role=employer" className="inline-flex items-center gap-2 bg-navy text-white font-heading font-semibold px-7 py-3.5 rounded-2xl hover:bg-navy-dark transition-all shadow-md">Post a Job Free <ArrowRight size={16}/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20 bg-lgray">
        <div className="section-container"><div className="grid md:grid-cols-3 gap-6 text-center">
          {[{icon:BadgeCheck,color:"bg-green-50 text-green-600",title:"ID Verified",desc:"Every worker verified with NIC before their first job."},
            {icon:Shield,color:"bg-blue-50 text-blue-600",title:"Platform Protected",desc:"PDPA compliant. Your data is secure and never sold."},
            {icon:Clock,color:"bg-orange-50 text-orange-600",title:"60-Second Hiring",desc:"Post a job in under a minute. Workers notified instantly."}].map(({icon:Icon,color,title,desc})=>(
            <div key={title} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 card-hover">
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}><Icon size={26}/></div>
              <h3 className="font-heading font-bold text-navy text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div></div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16"><h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy">What People Say</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t,i)=>(
              <div key={i} className="bg-lgray rounded-3xl p-7 card-hover border border-gray-100">
                <div className="flex text-yellow-400 mb-4 gap-0.5">{Array.from({length:t.rating}).map((_,j)=><Star key={j} size={16} fill="currentColor"/>)}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div><p className="font-semibold text-navy text-sm">{t.name}</p><p className="text-gray-400 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <UpcomingFeatures/>

      {/* CTA */}
      <section className="py-28 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern"/>
        <div className="relative section-container text-center">
          <div className="flex justify-center mb-8"><HANDZALogo size={64} theme="dark" variant="icon" className="animate-float"/></div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 max-w-2xl mx-auto leading-tight">Ready to Get Started?</h2>
          <p className="text-white/55 text-lg mb-12 max-w-lg mx-auto leading-relaxed">Join thousands of workers and employers across Sri Lanka. Completely free to join.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup?role=employer" className="btn-primary text-base px-10 py-4 w-full sm:w-auto justify-center">Post a Job Free <ArrowRight size={18}/></Link>
            <Link href="/auth/signup?role=worker" className="btn-ghost text-base px-10 py-4 w-full sm:w-auto justify-center">Find Work Now <ArrowRight size={18}/></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 pt-16 pb-8">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <HANDZALogo size={36} theme="dark" className="mb-4"/>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">Connecting the right hands to the right work across Sri Lanka.</p>
              <p className="text-gray-600 text-xs leading-relaxed border border-gray-800 rounded-xl p-3">HANDZA is a neutral platform. Workers are independent contractors.</p>
            </div>
            <div><p className="font-heading font-semibold text-white mb-4 text-sm">Platform</p>{[["Browse Jobs","/jobs"],["Find Workers","/workers"],["Post a Job","/jobs/new"],["How it works","/how-it-works"]].map(([l,h])=><Link key={l} href={h} className="block text-gray-500 hover:text-white text-sm mb-2.5 transition-colors">{l}</Link>)}</div>
            <div><p className="font-heading font-semibold text-white mb-4 text-sm">Account</p>{[["Sign Up as Worker","/auth/signup?role=worker"],["Sign Up as Employer","/auth/signup?role=employer"],["Log In","/auth/login"],["Dashboard","/dashboard"]].map(([l,h])=><Link key={l} href={h} className="block text-gray-500 hover:text-white text-sm mb-2.5 transition-colors">{l}</Link>)}</div>
            <div><p className="font-heading font-semibold text-white mb-4 text-sm">Legal</p>{[["Terms & Conditions","/legal/terms"],["Privacy Policy","/legal/privacy"]].map(([l,h])=><Link key={l} href={h} className="block text-gray-500 hover:text-white text-sm mb-2.5 transition-colors">{l}</Link>)}</div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 HANDZA (Private) Limited. All rights reserved.</p>
            <span className="text-gray-600 text-sm">Made with ❤️ in Sri Lanka</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
