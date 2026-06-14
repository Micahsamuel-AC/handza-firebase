"use client";
import {useEffect} from "react";
import {useRouter,usePathname} from "next/navigation";
import Link from "next/link";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase";
import {useAuth} from "@/lib/auth-context";
import HANDZALogo from "@/components/HANDZALogo";
import {LayoutDashboard,Users,Briefcase,FileCheck,FileWarning,BarChart3,Shield,LogOut,UserCog} from "lucide-react";

const NAV=[
  {href:"/admin/dashboard",label:"Dashboard",icon:LayoutDashboard},
  {href:"/admin/workers",label:"Workers",icon:Users},
  {href:"/admin/employers",label:"Employers",icon:Briefcase},
  {href:"/admin/jobs",label:"Jobs",icon:FileCheck},
  {href:"/admin/verify",label:"Verify Queue",icon:FileCheck},
  {href:"/admin/reports",label:"Reports",icon:FileWarning},
  {href:"/admin/analytics",label:"Analytics",icon:BarChart3},
  {href:"/admin/team",label:"Team Access",icon:UserCog},
];

export default function AdminLayout({children}:{children:React.ReactNode}){
  const router=useRouter();const pathname=usePathname();
  const {user,profile,loading}=useAuth();

  useEffect(()=>{
    if(loading)return;
    if(!user){router.push("/auth/login");return;}
    if(profile&&profile.role!=="admin"&&profile.role!=="superadmin"){router.push("/dashboard");}
  },[user,profile,loading]);

  if(loading||!profile||(profile.role!=="admin"&&profile.role!=="superadmin"))
    return<div className="min-h-screen bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div className="min-h-screen bg-lgray flex">
      <aside className="w-64 bg-navy flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-5 border-b border-white/10"><HANDZALogo size={32} theme="dark"/><p className="text-white/40 text-xs mt-2">Admin Panel</p></div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({href,label,icon:Icon})=>(
            <Link key={href} href={href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname===href?"bg-white/15 text-white":"text-white/60 hover:bg-white/10 hover:text-white"}`}><Icon size={16}/>{label}</Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2.5"><div className="w-8 h-8 bg-handza rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{profile.fullName?.[0]}</div><div className="min-w-0"><p className="text-white text-xs font-semibold truncate">{profile.fullName}</p><p className="text-white/40 text-xs capitalize">{profile.role}</p></div></div>
          <button onClick={async()=>{await signOut(auth);router.push("/");}} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10 w-full"><LogOut size={16}/>Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="lg:hidden bg-navy p-4 flex items-center justify-between"><HANDZALogo size={28} theme="dark"/><span className="badge" style={{background:"rgba(232,84,26,.2)",color:"#FF7A47"}}><Shield size={11}/>{profile.role}</span></div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
