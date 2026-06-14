"use client";
import {useState,useEffect} from "react";
import Link from "next/link";
import {useRouter,usePathname} from "next/navigation";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase";
import {useAuth} from "@/lib/auth-context";
import {useLang} from "@/lib/lang-context";
import HANDZALogo from "@/components/HANDZALogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {Menu,X,Bell,MessageSquare,User,LogOut,Briefcase,ChevronDown,Plus,Shield,LayoutDashboard,Globe} from "lucide-react";

export default function Navbar() {
  const [scrolled,setScrolled]   = useState(false);
  const [menuOpen,setMenuOpen]   = useState(false);
  const [dropOpen,setDropOpen]   = useState(false);
  const [langOpen,setLangOpen]   = useState(false);
  const {user,profile}           = useAuth();
  const {t}                      = useLang();
  const router                   = useRouter();
  const pathname                 = usePathname();
  const isHome                   = pathname==="/";
  const activeRole               = profile?.activeRole||profile?.role;

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>24);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  useEffect(()=>{setMenuOpen(false);setDropOpen(false);setLangOpen(false);},[pathname]);

  const solid = scrolled||!isHome;
  const navCls = solid?"bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm":"bg-transparent";
  const linkCls = solid?"text-gray-600 hover:text-navy":"text-white/80 hover:text-white";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navCls}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/"><HANDZALogo size={36} theme={solid?"light":"dark"}/></Link>

        <div className="hidden md:flex items-center gap-1">
          {[{href:"/jobs",label:t("nav.browseJobs")||"Browse Jobs"},{href:"/workers",label:t("nav.findWorkers")||"Find Workers"},{href:"/how-it-works",label:t("nav.howItWorks")||"How it works"}].map(({href,label})=>(
            <Link key={href} href={href} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${pathname===href?(solid?"text-navy font-semibold":"text-white font-semibold"):linkCls}`}>{label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button onClick={()=>setLangOpen(!langOpen)} className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}><Globe size={16}/></button>
            {langOpen&&(<><div className="fixed inset-0 z-40" onClick={()=>setLangOpen(false)}/><div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-50 animate-fade-in"><LanguageSwitcher/></div></>)}
          </div>
          {user&&profile?(
            <>
              <Link href="/notifications" className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}><Bell size={18}/></Link>
              <Link href="/messages" className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}><MessageSquare size={18}/></Link>
              {(profile.role==="admin"||profile.role==="superadmin")&&(
                <Link href="/admin/dashboard" className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-navy-dark transition-colors"><Shield size={13}/>Admin</Link>
              )}
              {activeRole==="employer"&&(
                <Link href="/jobs/new" className="flex items-center gap-1.5 bg-handza text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-handza-dark transition-all shadow-orange"><Plus size={15}/>{t("nav.postJob")||"Post Job"}</Link>
              )}
              <div className="relative">
                <button onClick={()=>setDropOpen(!dropOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-8 h-8 bg-handza rounded-lg flex items-center justify-center text-white font-bold text-sm">{profile.fullName?.[0]?.toUpperCase()||"?"}</div>
                  <span className={`text-sm font-medium hidden lg:block ${solid?"text-navy":"text-white"}`}>{profile.fullName?.split(" ")[0]}</span>
                  <ChevronDown size={13} className={`transition-transform ${dropOpen?"rotate-180":""} ${solid?"text-gray-400":"text-white/60"}`}/>
                </button>
                {dropOpen&&(<><div className="fixed inset-0 z-40" onClick={()=>setDropOpen(false)}/><div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100"><p className="font-semibold text-navy text-sm truncate">{profile.fullName}</p><p className="text-gray-400 text-xs capitalize mt-0.5">{activeRole}{(profile.roles?.length||0)>=2&&" · Dual Role"}</p></div>
                  <div className="py-1">
                    {[{href:"/dashboard",label:t("nav.dashboard")||"Dashboard",icon:LayoutDashboard},{href:"/profile",label:t("nav.profile")||"My Profile",icon:User},{href:"/messages",label:t("nav.messages")||"Messages",icon:MessageSquare}].map(({href,label,icon:Icon})=>(
                      <Link key={href} href={href} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-lgray hover:text-navy transition-colors"><Icon size={15} className="text-gray-400"/>{label}</Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={async()=>{await signOut(auth);router.push("/");}} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"><LogOut size={15}/>{t("nav.signOut")||"Sign Out"}</button>
                  </div>
                </div></>)}
              </div>
            </>
          ):(
            <>
              <Link href="/auth/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>{t("nav.login")||"Log In"}</Link>
              <Link href="/auth/signup" className="bg-handza text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-handza-dark transition-all shadow-orange">{t("nav.getStarted")||"Get Started Free"}</Link>
            </>
          )}
        </div>

        <button onClick={()=>setMenuOpen(!menuOpen)} className={`md:hidden p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
      </div>

      {menuOpen&&(
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {[{href:"/jobs",label:t("nav.browseJobs")||"Browse Jobs"},{href:"/workers",label:t("nav.findWorkers")||"Find Workers"},{href:"/how-it-works",label:t("nav.howItWorks")||"How it works"}].map(({href,label})=>(
              <Link key={href} href={href} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-lgray">{label}</Link>
            ))}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Language</p>
              <LanguageSwitcher/>
            </div>
            <div className="border-t border-gray-100 pt-2">
              {user&&profile?(
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 bg-handza rounded-xl flex items-center justify-center text-white font-bold">{profile.fullName?.[0]}</div>
                    <div><p className="text-sm font-semibold text-navy">{profile.fullName}</p><p className="text-xs text-gray-400 capitalize">{activeRole}</p></div>
                  </div>
                  {[{href:"/dashboard",label:"Dashboard",icon:LayoutDashboard},{href:"/profile",label:"Profile",icon:User},{href:"/notifications",label:"Notifications",icon:Bell},{href:"/messages",label:"Messages",icon:MessageSquare}].map(({href,label,icon:Icon})=>(
                    <Link key={href} href={href} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-lgray"><Icon size={16} className="text-gray-400"/>{label}</Link>
                  ))}
                  {activeRole==="employer"&&<Link href="/jobs/new" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-handza hover:bg-handza-light"><Plus size={16}/>{t("nav.postJob")||"Post Job"}</Link>}
                  <button onClick={async()=>{await signOut(auth);router.push("/");}} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full mt-1"><LogOut size={16}/>{t("nav.signOut")||"Sign Out"}</button>
                </>
              ):(
                <div className="space-y-2 pt-1">
                  <Link href="/auth/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-navy hover:bg-lgray text-center">{t("nav.login")||"Log In"}</Link>
                  <Link href="/auth/signup" className="block px-4 py-3 rounded-xl text-sm font-semibold bg-handza text-white text-center hover:bg-handza-dark">{t("nav.getStarted")||"Get Started Free"}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
