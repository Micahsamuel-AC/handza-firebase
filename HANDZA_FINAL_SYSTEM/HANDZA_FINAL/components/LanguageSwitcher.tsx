"use client";
import { useLang, Lang } from "@/lib/lang-context";
const LANGS: {code:Lang;label:string;flag:string}[] = [
  {code:"en",label:"English",flag:"🇬🇧"},
  {code:"si",label:"සිංහල",flag:"🇱🇰"},
  {code:"ta",label:"தமிழ்",flag:"🇱🇰"},
];
export default function LanguageSwitcher({compact=false}:{compact?:boolean}) {
  const {lang,setLang} = useLang();
  return (
    <div className="flex items-center gap-1">
      {LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.label}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${lang===l.code?"bg-navy text-white":"text-gray-500 hover:text-navy hover:bg-navy/10"}`}>
          {l.flag} {compact ? l.code.toUpperCase() : l.label}
        </button>
      ))}
    </div>
  );
}
