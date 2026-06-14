"use client";
import {useEffect,useState,useRef} from "react";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import {db} from "@/lib/firebase";
import {collection,getDocs,query,where} from "firebase/firestore";
import {MapPin,Star,Navigation} from "lucide-react";

const SKILLS=["Plumbing","Electrical","Welding","Glass Fitting","Computer Repairs","Cleaning","Vehicle Washing","Painting","Household Help","Logistics"];

function haversine(lat1:number,lng1:number,lat2:number,lng2:number){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export default function FindWorkersMapPage(){
  const mapRef=useRef<any>(null);
  const mapInstance=useRef<any>(null);
  const markersRef=useRef<any[]>([]);
  const [leafletReady,setLeafletReady]=useState(false);
  const [workers,setWorkers]=useState<any[]>([]);
  const [userLoc,setUserLoc]=useState<{lat:number;lng:number}|null>(null);
  const [radius,setRadius]=useState(5);
  const [skillFilter,setSkillFilter]=useState("");
  const [availOnly,setAvailOnly]=useState(true);
  const [selected,setSelected]=useState<any>(null);

  useEffect(()=>{loadWorkers();},[]);
  async function loadWorkers(){
    const profSnap=await getDocs(query(collection(db,"profiles"),where("role","==","worker")));
    const profs:Record<string,any>={};profSnap.docs.forEach(d=>profs[d.id]={id:d.id,...d.data()});
    const wpSnap=await getDocs(collection(db,"workerProfiles"));
    const list:any[]=[];
    wpSnap.docs.forEach(d=>{const wp=d.data();if(wp.lat&&wp.lng&&profs[d.id])list.push({...profs[d.id],wp});});
    setWorkers(list);
  }

  useEffect(()=>{
    if(!leafletReady||!mapRef.current||mapInstance.current)return;
    const L=(window as any).L;if(!L)return;
    const center=userLoc||{lat:6.9271,lng:79.8612};
    mapInstance.current=L.map(mapRef.current).setView([center.lat,center.lng],12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(mapInstance.current);
    renderMarkers();
  },[leafletReady]);

  useEffect(()=>{if(mapInstance.current)renderMarkers();},[workers,userLoc,radius,skillFilter,availOnly,leafletReady]);

  function renderMarkers(){
    const L=(window as any).L;if(!L||!mapInstance.current)return;
    markersRef.current.forEach(m=>mapInstance.current.removeLayer(m));
    markersRef.current=[];
    if(userLoc){
      const uMarker=L.circleMarker([userLoc.lat,userLoc.lng],{radius:8,fillColor:"#1B3A6B",color:"#fff",weight:3,fillOpacity:1}).addTo(mapInstance.current);
      markersRef.current.push(uMarker);
      const circle=L.circle([userLoc.lat,userLoc.lng],{radius:radius*1000,color:"#E8541A",fillColor:"#E8541A",fillOpacity:0.06,dashArray:"6,6"}).addTo(mapInstance.current);
      markersRef.current.push(circle);
    }
    getFilteredWorkers().forEach(w=>{
      const color=w.wp.isAvailable?"#10b981":"#9CA3AF";
      const marker=L.circleMarker([w.wp.lat,w.wp.lng],{radius:10,fillColor:color,color:"#fff",weight:3,fillOpacity:1}).addTo(mapInstance.current);
      marker.bindPopup(`<b>${w.fullName}</b><br/>${(w.wp.skills||[]).join(", ")}<br/>LKR ${w.wp.hourlyRate}/hr`);
      marker.on("click",()=>setSelected(w));
      markersRef.current.push(marker);
    });
  }

  function getFilteredWorkers(){
    return workers.filter(w=>{
      if(availOnly&&!w.wp.isAvailable)return false;
      if(skillFilter&&!w.wp.skills?.includes(skillFilter))return false;
      if(userLoc){const d=haversine(userLoc.lat,userLoc.lng,w.wp.lat,w.wp.lng);if(d>radius)return false;w._dist=d;}
      return true;
    }).sort((a,b)=>(a._dist||0)-(b._dist||0));
  }

  function locateMe(){
    if(!navigator.geolocation)return;
    navigator.geolocation.getCurrentPosition(p=>{
      const loc={lat:p.coords.latitude,lng:p.coords.longitude};setUserLoc(loc);
      if(mapInstance.current)mapInstance.current.setView([loc.lat,loc.lng],12);
    });
  }

  const filtered=getFilteredWorkers();

  return(
    <div className="min-h-screen bg-lgray">
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onLoad={()=>setLeafletReady(true)}/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <Navbar/>
      <div className="pt-16 flex flex-col lg:flex-row h-[calc(100vh-0px)]">
        <div className="lg:w-80 bg-white border-r border-gray-100 flex flex-col order-2 lg:order-1">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <h1 className="font-heading font-bold text-navy text-lg">Find Workers Near You</h1>
            <div className="flex gap-2">{[2,5,10,20].map(r=>(
              <button key={r} onClick={()=>setRadius(r)} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${radius===r?"bg-navy text-white":"bg-lgray text-gray-600"}`}>{r}km</button>
            ))}</div>
            <select value={skillFilter} onChange={e=>setSkillFilter(e.target.value)} className="input-base text-sm"><option value="">All Skills</option>{SKILLS.map(s=><option key={s} value={s}>{s}</option>)}</select>
            <button onClick={()=>setAvailOnly(!availOnly)} className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${availOnly?"bg-green-500 text-white":"bg-lgray text-gray-600"}`}>⚡ Available Now Only</button>
            <button onClick={locateMe} className="btn-secondary w-full justify-center py-2.5 text-sm"><Navigation size={14}/>My Location</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length===0?<p className="text-gray-400 text-sm text-center py-8 px-4">{userLoc?"No workers found in this radius":"Click 'My Location' to find workers near you"}</p>:
            filtered.map(w=>(
              <Link key={w.id} href={`/workers/${w.id}`} className="flex items-center gap-3 p-3 hover:bg-lgray border-b border-gray-50 transition-colors">
                <div className="relative"><div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-sm">{w.fullName?.[0]}</div>{w.wp.isAvailable&&<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{w.fullName}</p><p className="text-gray-400 text-xs">{(w.wp.skills||[])[0]||"Worker"}{w._dist!==undefined&&` · ${w._dist.toFixed(1)}km`}</p></div>
                <div className="text-right flex-shrink-0"><p className="text-handza font-bold text-sm">LKR {w.wp.hourlyRate}/hr</p>{w.wp.rating>0&&<p className="text-xs flex items-center gap-0.5 justify-end"><Star size={10} className="text-yellow-400 fill-yellow-400"/>{w.wp.rating}</p>}</div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-1 relative order-1 lg:order-2" style={{minHeight:"400px"}}>
          <div ref={mapRef} className="absolute inset-0"/>
          {!leafletReady&&<div className="absolute inset-0 bg-lgray flex items-center justify-center"><div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin"/></div>}
        </div>
      </div>
    </div>
  );
}
