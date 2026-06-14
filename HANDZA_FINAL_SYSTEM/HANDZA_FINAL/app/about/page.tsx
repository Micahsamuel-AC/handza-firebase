import Navbar from "@/components/Navbar";
import HANDZALogo from "@/components/HANDZALogo";

export default function AboutPage(){
  return(
    <div className="min-h-screen bg-white"><Navbar/>
    <div className="bg-navy pt-32 pb-20 dot-pattern relative">
      <div className="section-container text-center relative">
        <div className="flex justify-center mb-6"><HANDZALogo size={56} theme="dark" variant="icon"/></div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">About HANDZA</h1>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">Sri Lanka&apos;s first on-demand labour marketplace — connecting verified workers with employers for flexible, instant hiring.</p>
        <div className="flex justify-center gap-10 mt-12 flex-wrap">
          {[["22M+","Sri Lankans we serve"],["500+","Verified workers"],["10","Job categories"],["60s","Time to hire"]].map(([v,l])=>(
            <div key={l} className="text-center"><div className="font-heading text-3xl font-bold text-handza">{v}</div><div className="text-white/50 text-sm mt-1">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
    <div className="section-container py-16">
      <div className="max-w-3xl mx-auto space-y-6 text-gray-600 leading-relaxed">
        <h2 className="font-heading text-2xl font-bold text-navy">Our Mission</h2>
        <p>HANDZA connects the right hands to the right work. We believe every skilled worker in Sri Lanka deserves access to consistent, fairly-paid opportunities — and every employer deserves to find trusted, verified help in minutes, not days.</p>
        <h2 className="font-heading text-2xl font-bold text-navy">Why HANDZA?</h2>
        <p>The informal labour market in Sri Lanka is broken: no verification, no platform, no speed, no security. HANDZA solves this with dual NIC verification, real-time GPS matching, and an hourly payment timer that calculates fair pay automatically.</p>
        <h2 className="font-heading text-2xl font-bold text-navy">Our Values</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Trust</strong> — every user is identity-verified</li>
          <li><strong>Fairness</strong> — transparent 10% commission, no hidden fees</li>
          <li><strong>Speed</strong> — hire or get hired in under 60 seconds</li>
          <li><strong>Inclusion</strong> — built in English, Sinhala, and Tamil for all Sri Lankans</li>
        </ul>
      </div>
    </div></div>
  );
}
