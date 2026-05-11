"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Menu, X, Bell, MessageSquare, User, LogOut, Briefcase, ChevronDown, Plus } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navBg = scrolled || !isHome ? "bg-white shadow-lg border-b border-gray-100" : "bg-transparent";
  const textCol = scrolled || !isHome ? "text-gray-600" : "text-white/80";
  const logoCol = scrolled || !isHome ? "text-navy" : "text-white";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="HANDZA" width={36} height={36} className="rounded-lg" />
          <span className={`font-heading font-bold text-xl transition-colors ${logoCol} group-hover:text-handza`}>HANDZA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[{href:"/jobs",label:"Browse Jobs"},{href:"/workers",label:"Find Workers"}].map(({href,label})=>(
            <Link key={href} href={href} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname===href ? "bg-navy/10 text-navy font-semibold" : `${textCol} hover:text-navy hover:bg-gray-50`
            }`}>{label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user && profile ? (
            <>
              <Link href="/notifications" className={`p-2 rounded-xl transition-colors ${textCol} hover:bg-gray-100`}><Bell size={19}/></Link>
              <Link href="/messages" className={`p-2 rounded-xl transition-colors ${textCol} hover:bg-gray-100`}><MessageSquare size={19}/></Link>
              {profile.role === "employer" && (
                <Link href="/jobs/new" className="bg-handza text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors shadow-md">
                  + Post Job
                </Link>
              )}
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 bg-handza rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {profile.fullName?.[0]?.toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium hidden lg:block ${scrolled||!isHome?"text-navy":"text-white"}`}>
                    {profile.fullName?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className={scrolled||!isHome?"text-gray-500":"text-white/70"} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" onClick={()=>setDropOpen(false)}>
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="font-semibold text-navy text-sm">{profile.fullName}</p>
                      <p className="text-gray-400 text-xs capitalize">{profile.role}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-lgray hover:text-navy transition-colors"><Briefcase size={15}/>Dashboard</Link>
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-lgray hover:text-navy transition-colors"><User size={15}/>Edit Profile</Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"><LogOut size={15}/>Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${textCol} hover:bg-gray-100`}>Log In</Link>
              <Link href="/auth/signup" className="bg-handza text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-handza/30">Get Started Free</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden p-2 rounded-xl ${textCol}`}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          <Link href="/jobs" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-lgray">Browse Jobs</Link>
          <Link href="/workers" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-lgray">Find Workers</Link>
          {user && profile ? (
            <>
              <Link href="/dashboard" onClick={()=>setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-navy hover:bg-lgray"><Briefcase size={16}/>Dashboard</Link>
              <Link href="/profile" onClick={()=>setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-navy hover:bg-lgray"><User size={16}/>Profile</Link>
              <Link href="/notifications" onClick={()=>setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-navy hover:bg-lgray"><Bell size={16}/>Notifications</Link>
              <Link href="/messages" onClick={()=>setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-navy hover:bg-lgray"><MessageSquare size={16}/>Messages</Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full"><LogOut size={16}/>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-navy hover:bg-lgray">Log In</Link>
              <Link href="/auth/signup" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold bg-handza text-white text-center">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
