import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { ArrowRight, CheckCircle, Star, Zap, Shield, Users, Briefcase, MapPin } from "lucide-react";

const categories = [
  {icon:"🔧",name:"Plumbing",count:"120+"},{icon:"⚡",name:"Electrical",count:"90+"},
  {icon:"🔥",name:"Welding",count:"45+"},{icon:"🪟",name:"Glass Fitting",count:"30+"},
  {icon:"💻",name:"Computer Repairs",count:"80+"},{icon:"🧹",name:"Cleaning",count:"200+"},
  {icon:"🚗",name:"Vehicle Washing",count:"60+"},{icon:"🖌️",name:"Painting",count:"110+"},
  {icon:"🏠",name:"Household Help",count:"150+"},{icon:"📦",name:"Logistics",count:"70+"},
];

const testimonials = [
  {name:"Priya M.",role:"Homeowner, Colombo",text:"Found a verified electrician within 10 minutes. Professional, fast and fairly priced!",rating:5},
  {name:"Kamal R.",role:"Electrician, Kandy",text:"HANDZA helped me find 3 new clients in my first week. The platform is so easy to use!",rating:5},
  {name:"Samantha W.",role:"SME Owner, Galle",text:"We use HANDZA for all our office maintenance now. Reliable workers every time.",rating:5},
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar/>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 20% 50%, rgba(232,84,26,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(232,84,26,0.1) 0%, transparent 40%)"}}/>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",backgroundSize:"36px 36px"}}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-white/80 text-sm font-medium">Sri Lanka's #1 Labor Marketplace</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Connect the <span className="text-handza">Right Hands</span> to the Right Work.
              </h1>
              <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg">
                Find verified skilled workers for any task — or discover flexible hourly jobs. Instant matching. Secure payments. Real reviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/auth/signup?role=employer" className="bg-handza text-white font-heading font-semibold px-7 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-handza/30 hover:scale-105">
                  I Need Workers <ArrowRight size={18}/>
                </Link>
                <Link href="/auth/signup?role=worker" className="glass text-white font-heading font-semibold px-7 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/15 transition-all">
                  I Want to Work <ArrowRight size={18}/>
                </Link>
              </div>
              <div className="flex flex-wrap gap-5">
                {["✓ Free to join","✓ ID verified workers","✓ Secure payments"].map(t=>(
                  <span key={t} className="text-white/60 text-sm">{t}</span>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="hidden lg:block animate-fade-up-1">
              <div className="glass rounded-3xl p-6 max-w-sm ml-auto">
                <div className="flex items-center gap-3 mb-5">
                  <Image src="/logo.png" alt="HANDZA" width={40} height={40} className="rounded-xl"/>
                  <div>
                    <p className="text-white font-heading font-bold">HANDZA</p>
                    <p className="text-white/50 text-xs">Live Workers Near You</p>
                  </div>
                  <span className="ml-auto bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">● Live</span>
                </div>
                {[
                  {name:"Kamal P.",skill:"Electrician",rate:"LKR 500/hr",stars:5},
                  {name:"Nimal S.",skill:"Plumber",rate:"LKR 450/hr",stars:4},
                  {name:"Suresh R.",skill:"Painter",rate:"LKR 400/hr",stars:5},
                ].map(w=>(
                  <div key={w.name} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 mb-2.5 transition-colors">
                    <div className="w-10 h-10 bg-handza rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{w.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{w.name}</div>
                      <div className="text-white/50 text-xs">{w.skill}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-handza text-sm font-bold">{w.rate}</div>
                      <div className="text-yellow-400 text-xs">{"★".repeat(w.stars)}</div>
                    </div>
                  </div>
                ))}
                <Link href="/workers" className="block w-full text-center bg-handza text-white text-sm font-semibold py-3 rounded-xl mt-3 hover:bg-orange-600 transition-colors">
                  Browse All Workers →
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["500+","Workers Registered"],["1,200+","Jobs Completed"],["10","Service Categories"],["4.8★","Average Rating"]].map(([val,label])=>(
            <div key={label}>
              <div className="font-heading text-3xl font-bold text-navy">{val}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-handza font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="font-heading text-4xl font-bold text-navy mt-2">How HANDZA Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {n:"01",title:"Sign Up Free",desc:"Create your account as a worker or employer in 2 minutes.",icon:Users,color:"bg-navy"},
              {n:"02",title:"Post or Browse",desc:"Employers post jobs instantly. Workers toggle Available Now.",icon:Briefcase,color:"bg-handza"},
              {n:"03",title:"Match & Connect",desc:"Get matched in real-time. Chat directly before hiring.",icon:Zap,color:"bg-navy"},
              {n:"04",title:"Work & Get Paid",desc:"Complete the job. Payment released securely on completion.",icon:Shield,color:"bg-handza"},
            ].map((s,i)=>(
              <div key={i} className="bg-lgray rounded-2xl p-6 card-hover group">
                <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className="text-white"/>
                </div>
                <div className="text-handza font-heading font-bold text-xs uppercase tracking-widest mb-1">Step {s.n}</div>
                <h3 className="font-heading font-bold text-navy text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-lgray">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-handza font-semibold text-sm uppercase tracking-widest">What We Cover</span>
            <h2 className="font-heading text-4xl font-bold text-navy mt-2">10 Service Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat=>(
              <Link key={cat.name} href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className="bg-white hover:bg-navy group rounded-2xl p-5 text-center card-hover shadow-sm">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-heading font-semibold text-navy group-hover:text-white text-sm transition-colors">{cat.name}</div>
                <div className="text-gray-400 group-hover:text-white/60 text-xs mt-1 transition-colors">{cat.count} workers</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-navy rounded-3xl p-10 text-white">
            <div className="w-12 h-12 bg-handza rounded-2xl flex items-center justify-center mb-6"><Users size={24} className="text-white"/></div>
            <h3 className="font-heading text-2xl font-bold mb-2">For Workers</h3>
            <p className="text-white/60 mb-6 text-sm">Students, tradespeople — earn flexibly on your terms.</p>
            {["Flexible hourly earnings","Verified & safe employers","Build reputation with ratings","Toggle Available Now for instant jobs","Transparent pay — no hidden fees"].map(pt=>(
              <div key={pt} className="flex items-start gap-3 mb-3">
                <CheckCircle size={16} className="text-handza flex-shrink-0 mt-0.5"/>
                <span className="text-white/80 text-sm">{pt}</span>
              </div>
            ))}
            <Link href="/auth/signup?role=worker" className="mt-6 inline-flex items-center gap-2 bg-handza text-white font-heading font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-handza/30">
              Join as Worker <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="bg-white border-2 border-navy/10 rounded-3xl p-10 shadow-xl shadow-navy/5">
            <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mb-6"><Briefcase size={24} className="text-white"/></div>
            <h3 className="font-heading text-2xl font-bold text-navy mb-2">For Employers</h3>
            <p className="text-gray-500 mb-6 text-sm">Homeowners, businesses — find reliable help fast.</p>
            {["Instant access to vetted workers","Post a job in under 60 seconds","ID-verified & rated profiles","Pay securely on task completion","One-time or recurring help"].map(pt=>(
              <div key={pt} className="flex items-start gap-3 mb-3">
                <CheckCircle size={16} className="text-navy flex-shrink-0 mt-0.5"/>
                <span className="text-gray-600 text-sm">{pt}</span>
              </div>
            ))}
            <Link href="/auth/signup?role=employer" className="mt-6 inline-flex items-center gap-2 bg-navy text-white font-heading font-semibold px-6 py-3 rounded-xl hover:bg-navy/90 transition-colors">
              Post a Job <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-lgray">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-handza font-semibold text-sm uppercase tracking-widest">Real Reviews</span>
            <h2 className="font-heading text-4xl font-bold text-navy mt-2">What People Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t,i)=>(
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm card-hover">
                <div className="flex text-yellow-400 mb-4">{Array.from({length:t.rating}).map((_,i)=><Star key={i} size={16} fill="currentColor"/>)}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",backgroundSize:"36px 36px"}}/>
        <div className="absolute right-0 top-0 w-96 h-96 bg-handza/20 rounded-full blur-3xl"/>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <Image src="/logo.png" alt="HANDZA" width={64} height={64} className="rounded-2xl mx-auto mb-6 shadow-xl"/>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5">Ready to Get Started?</h2>
          <p className="text-white/60 text-lg mb-10">Join thousands of workers and employers. It's 100% free.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=employer" className="bg-handza text-white font-heading font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-handza/30 hover:scale-105">
              Post a Job Free <ArrowRight size={18}/>
            </Link>
            <Link href="/auth/signup?role=worker" className="glass text-white font-heading font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/15 transition-all">
              Find Work Now <ArrowRight size={18}/>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/logo.png" alt="HANDZA" width={32} height={32} className="rounded-lg"/>
                <span className="font-heading font-bold text-white">HANDZA</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Connecting the right hands to the right work across Sri Lanka.</p>
            </div>
            <div>
              <p className="font-heading font-semibold text-white mb-3 text-sm">Platform</p>
              {[["Browse Jobs","/jobs"],["Find Workers","/workers"],["Post a Job","/jobs/new"]].map(([l,h])=>(
                <Link key={l} href={h} className="block text-gray-500 hover:text-white text-sm mb-2 transition-colors">{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-heading font-semibold text-white mb-3 text-sm">Account</p>
              {[["Sign Up","/auth/signup"],["Log In","/auth/login"],["Dashboard","/dashboard"]].map(([l,h])=>(
                <Link key={l} href={h} className="block text-gray-500 hover:text-white text-sm mb-2 transition-colors">{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-heading font-semibold text-white mb-3 text-sm">Categories</p>
              {["Plumbing","Electrical","Cleaning","Painting"].map(c=>(
                <Link key={c} href={`/jobs?category=${c}`} className="block text-gray-500 hover:text-white text-sm mb-2 transition-colors">{c}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm">© 2026 HANDZA. All rights reserved.</p>
            <p className="text-gray-600 text-sm">Made with ❤️ in Sri Lanka</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
