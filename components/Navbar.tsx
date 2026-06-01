"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import HANDZALogo from "@/components/HANDZALogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Menu, X, Bell, MessageSquare, User, LogOut,
  Briefcase, ChevronDown, Plus, Shield, LayoutDashboard, Globe
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [langOpen, setLangOpen]     = useState(false);
  const { user, profile }           = useAuth();
  const { t }                       = useLang();
  const router                      = useRouter();
  const pathname                    = usePathname();
  const isHome                      = pathname === "/";
  const activeRole                  = profile?.activeRole || profile?.role;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setLangOpen(false); }, [pathname]);

  const handleSignOut = async () => { await signOut(auth); router.push("/"); };

  const solid   = scrolled || !isHome;
  const navCls  = solid ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent";
  const linkCls = solid ? "text-gray-600 hover:text-navy" : "text-white/80 hover:text-white";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navCls}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <HANDZALogo size={36} theme={solid ? "light" : "dark"} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/jobs",          label: t("nav.browseJobs") },
              { href: "/workers",       label: t("nav.findWorkers") },
              { href: "/how-it-works",  label: t("nav.howItWorks") },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === href
                    ? (solid ? "text-navy font-semibold" : "text-white font-semibold")
                    : linkCls
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>
                <Globe size={16} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-50 animate-fade-in">
                    <LanguageSwitcher />
                  </div>
                </>
              )}
            </div>

            {user && profile ? (
              <>
                <Link href="/notifications"
                  className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>
                  <Bell size={18} />
                </Link>
                <Link href="/messages"
                  className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>
                  <MessageSquare size={18} />
                </Link>

                {(profile.role === "admin" || profile.role === "superadmin") && (
                  <Link href="/admin/dashboard"
                    className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-navy-dark transition-colors">
                    <Shield size={13} /> Admin
                  </Link>
                )}

                {activeRole === "employer" && (
                  <Link href="/jobs/new"
                    className="flex items-center gap-1.5 bg-handza text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-handza-dark transition-all shadow-orange">
                    <Plus size={15} /> {t("nav.postJob")}
                  </Link>
                )}

                {/* Avatar dropdown */}
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-black/5 transition-colors">
                    <div className="w-8 h-8 bg-handza rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {profile.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className={`text-sm font-medium hidden lg:block ${solid ? "text-navy" : "text-white"}`}>
                      {profile.fullName?.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={`transition-transform ${dropOpen ? "rotate-180" : ""} ${solid ? "text-gray-400" : "text-white/60"}`} />
                  </button>

                  {dropOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-navy text-sm truncate">{profile.fullName}</p>
                          <p className="text-gray-400 text-xs capitalize mt-0.5">{activeRole} account</p>
                          {profile.roles?.length >= 2 && (
                            <span className="text-xs text-purple-500 font-medium">Dual role account</span>
                          )}
                        </div>
                        <div className="py-1">
                          {[
                            { href: "/dashboard", label: t("nav.dashboard"),      icon: LayoutDashboard },
                            { href: "/profile",   label: t("nav.profile"),        icon: User },
                            { href: "/messages",  label: t("nav.messages"),       icon: MessageSquare },
                          ].map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-lgray hover:text-navy transition-colors">
                              <Icon size={15} className="text-gray-400" /> {label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button onClick={handleSignOut}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                            <LogOut size={15} /> {t("nav.signOut")}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>
                  {t("nav.login")}
                </Link>
                <Link href="/auth/signup"
                  className="bg-handza text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-handza-dark transition-all shadow-orange">
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-colors hover:bg-black/5 ${linkCls}`}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {[
                { href: "/jobs",         label: t("nav.browseJobs") },
                { href: "/workers",      label: t("nav.findWorkers") },
                { href: "/how-it-works", label: t("nav.howItWorks") },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-lgray hover:text-navy transition-colors">
                  {label}
                </Link>
              ))}

              {/* Mobile language switcher */}
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Language</p>
                <LanguageSwitcher />
              </div>

              <div className="border-t border-gray-100 pt-2 mt-2">
                {user && profile ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-1">
                      <div className="w-9 h-9 bg-handza rounded-xl flex items-center justify-center text-white font-bold">
                        {profile.fullName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{profile.fullName}</p>
                        <p className="text-xs text-gray-400 capitalize">{activeRole}</p>
                      </div>
                    </div>
                    {[
                      { href: "/dashboard",    label: t("nav.dashboard"),     icon: LayoutDashboard },
                      { href: "/profile",      label: t("nav.profile"),       icon: User },
                      { href: "/notifications",label: t("nav.notifications"), icon: Bell },
                      { href: "/messages",     label: t("nav.messages"),      icon: MessageSquare },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-lgray">
                        <Icon size={16} className="text-gray-400" />{label}
                      </Link>
                    ))}
                    {(profile.role === "admin" || profile.role === "superadmin") && (
                      <Link href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-navy font-semibold hover:bg-navy/5">
                        <Shield size={16} />Admin Panel
                      </Link>
                    )}
                    {activeRole === "employer" && (
                      <Link href="/jobs/new"
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-handza hover:bg-handza-light">
                        <Plus size={16} />{t("nav.postJob")}
                      </Link>
                    )}
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full mt-1">
                      <LogOut size={16} /> {t("nav.signOut")}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Link href="/auth/login"
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-navy hover:bg-lgray text-center">
                      {t("nav.login")}
                    </Link>
                    <Link href="/auth/signup"
                      className="block px-4 py-3 rounded-xl text-sm font-semibold bg-handza text-white text-center hover:bg-handza-dark transition-colors">
                      {t("nav.getStarted")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
