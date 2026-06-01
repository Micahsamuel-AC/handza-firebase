"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
export type Lang = "en" | "si" | "ta";
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; }
const LangContext = createContext<LangCtx>({ lang:"en", setLang:()=>{}, t:(k)=>k });
const cache: Record<Lang,any> = { en:null, si:null, ta:null };
async function loadDict(lang: Lang) {
  if (cache[lang]) return cache[lang];
  try { const r = await fetch(`/locales/${lang}/common.json`); cache[lang] = await r.json(); return cache[lang]; }
  catch { return {}; }
}
function get(obj: any, path: string): string {
  return path.split(".").reduce((o,k) => o?.[k], obj) ?? path;
}
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [dict, setDict]      = useState<any>({});
  useEffect(() => {
    const saved = localStorage.getItem("handza_lang") as Lang;
    const l = saved && ["en","si","ta"].includes(saved) ? saved : "en";
    setLangState(l); loadDict(l).then(setDict);
  }, []);
  const setLang = useCallback(async (l: Lang) => {
    setLangState(l); localStorage.setItem("handza_lang",l); setDict(await loadDict(l));
  }, []);
  const t = useCallback((key: string) => get(dict, key), [dict]);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
export const useLang = () => useContext(LangContext);
