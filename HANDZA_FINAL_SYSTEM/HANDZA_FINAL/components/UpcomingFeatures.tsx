const FEATURES=[
  {icon:"🔧",title:"Hourly Timer — More Categories",date:"Q3 2026",desc:"Plumbing, Electrical, Welding, Painting and more get the live hourly payment timer."},
  {icon:"💳",title:"In-App Payments",date:"Q3 2026",desc:"Pay workers directly through HANDZA via card or mobile wallet."},
  {icon:"🛡",title:"Worker Insurance",date:"Q4 2026",desc:"Optional micro-insurance for on-the-job protection."},
  {icon:"📱",title:"Mobile App",date:"Q4 2026",desc:"Native Android and iOS apps for faster access."},
];
export default function UpcomingFeatures(){
  return (
    <section className="py-24 bg-navy dot-pattern relative overflow-hidden">
      <div className="section-container relative">
        <div className="text-center mb-14">
          <span className="badge badge-orange text-xs uppercase tracking-widest mb-3 inline-flex">Coming Soon</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2">What&apos;s Next for HANDZA</h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">We&apos;re constantly building. Here&apos;s what&apos;s coming to the platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f=>(
            <div key={f.title} className="glass rounded-3xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <span className="badge badge-orange text-xs mb-2 inline-flex">{f.date}</span>
              <h3 className="font-heading font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
