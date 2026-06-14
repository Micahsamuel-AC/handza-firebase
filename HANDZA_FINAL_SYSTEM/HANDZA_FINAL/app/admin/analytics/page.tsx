"use client";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase";
import {collection,getDocs} from "firebase/firestore";

export default function AdminAnalyticsPage(){
  const [jobs,setJobs]=useState<any[]>([]);
  const [workers,setWorkers]=useState(0);
  const [employers,setEmployers]=useState(0);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){
    const [jobsSnap,profSnap]=await Promise.all([getDocs(collection(db,"jobs")),getDocs(collection(db,"profiles"))]);
    const jobsList=jobsSnap.docs.map(d=>d.data());
    setJobs(jobsList);
    setWorkers(profSnap.docs.filter(d=>d.data().role==="worker").length);
    setEmployers(profSnap.docs.filter(d=>d.data().role==="employer").length);
    setLoading(false);
  }
  if(loading)return<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>;

  const completed=jobs.filter((j:any)=>j.status==="completed").length;
  const completionRate=jobs.length?Math.round((completed/jobs.length)*100):0;
  const catCounts:Record<string,number>={};
  jobs.forEach((j:any)=>{catCounts[j.category]=(catCounts[j.category]||0)+1;});
  const total=jobs.length||1;
  const topCats=Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return(
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-6">Analytics</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[["Workers",workers],["Employers",employers],["Jobs completed",completed],["Completion rate",`${completionRate}%`]].map(([l,v])=>(
          <div key={String(l)} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><div className="font-heading text-2xl font-bold text-navy">{v}</div><div className="text-gray-500 text-xs mt-1">{l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-heading font-bold text-navy text-sm mb-4">Top Job Categories</h2>
        {topCats.length===0?<p className="text-gray-400 text-sm text-center py-4">No job data yet</p>:
        topCats.map(([cat,count])=>{const pct=Math.round((count/total)*100);return(
          <div key={cat} className="mb-3"><div className="flex justify-between text-sm mb-1.5"><span>{cat}</span><span className="text-gray-500">{pct}%</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-handza rounded-full transition-all" style={{width:`${pct}%`}}/></div></div>
        );})}
      </div>
    </div>
  );
}
