"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { MapPin, Navigation, Users, Zap, Star, CheckCircle, Filter, RefreshCw, X } from "lucide-react";
import Link from "next/link";

// ── Haversine distance formula ────────────────────────
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SKILLS = ["All", "Plumbing", "Electrical", "Welding", "Glass Fitting", "Computer Repairs", "Cleaning", "Vehicle Washing", "Painting", "Household Help", "Logistics"];
const RADIUS_OPTIONS = [2, 5, 10, 20];

export default function FindWorkersMapPage() {
  const { user, profile }         = useAuth();
  const mapRef                    = useRef<any>(null);
  const leafletMapRef             = useRef<any>(null);
  const markersRef                = useRef<any[]>([]);
  const circleRef                 = useRef<any>(null);
  const userMarkerRef             = useRef<any>(null);
  const [workers, setWorkers]     = useState<any[]>([]);
  const [nearby, setNearby]       = useState<any[]>([]);
  const [userPos, setUserPos]     = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading]     = useState(false);
  const [locating, setLocating]   = useState(false);
  const [radius, setRadius]       = useState(5);
  const [skill, setSkill]         = useState("All");
  const [availOnly, setAvailOnly] = useState(true);
  const [selected, setSelected]   = useState<any>(null);
  const [mapReady, setMapReady]   = useState(false);
  const [locationError, setLocationError] = useState("");

  // ── Load Leaflet dynamically (no SSR issues) ──────────
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Inject Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Inject Leaflet JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script    = document.createElement("script");
          script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload   = () => resolve();
          document.head.appendChild(script);
        });
      }

      initMap();
    };

    loadLeaflet();
    loadWorkers();
  }, []);

  function initMap() {
    const L = (window as any).L;
    if (!L || !mapRef.current || leafletMapRef.current) return;

    // Sri Lanka center coordinates
    const map = L.map(mapRef.current, {
      center: [7.8731, 80.7718],
      zoom: 8,
      zoomControl: true,
    });

    // OpenStreetMap tiles — 100% free, no API key
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMapRef.current = map;
    setMapReady(true);
  }

  async function loadWorkers() {
    setLoading(true);
    try {
      const profilesSnap = await getDocs(query(collection(db, "profiles"), where("role", "==", "worker")));
      const profiles     = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const wpSnap       = await getDocs(collection(db, "workerProfiles"));
      const wpMap: Record<string, any> = {};
      wpSnap.docs.forEach(d => { wpMap[d.data().userId] = { id: d.id, ...d.data() }; });
      const merged = profiles
        .filter(p => !p.suspended)
        .map(p => ({ ...p, wp: wpMap[p.id] || {} }))
        .filter(p => p.wp?.lat && p.wp?.lng);
      setWorkers(merged);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function getUserLocation() {
    setLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setLocating(false);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 13);
        }
        // Save to Firebase if worker
        if (user && profile?.role === "worker") {
          const wp = workers.find(w => w.id === user.uid);
          if (wp?.wp?.id) {
            updateDoc(doc(db, "workerProfiles", wp.wp.id), {
              lat, lng, locationUpdatedAt: serverTimestamp()
            });
          }
        }
      },
      (err) => {
        setLocationError("Could not get your location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ── Update map markers when data changes ──────────────
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;
    updateMapMarkers();
  }, [workers, userPos, radius, skill, availOnly, mapReady, selected]);

  function updateMapMarkers() {
    const L   = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (circleRef.current)    map.removeLayer(circleRef.current);
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    // User position marker
    if (userPos) {
      const userIcon = L.divIcon({
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:#1B3A6B;border:3px solid white;
          box-shadow:0 2px 8px rgba(27,58,107,0.5);
        "></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<strong>Your location</strong>");

      // Radius circle
      circleRef.current = L.circle([userPos.lat, userPos.lng], {
        color:       "#E8541A",
        fillColor:   "#E8541A",
        fillOpacity: 0.06,
        weight:      2,
        radius:      radius * 1000,
        dashArray:   "6 4",
      }).addTo(map);
    }

    // Filter workers
    let filtered = [...workers];
    if (availOnly) filtered = filtered.filter(w => w.wp?.isAvailable);
    if (skill !== "All") filtered = filtered.filter(w => w.wp?.skills?.includes(skill));

    // Calculate distances and filter by radius
    const withDist = filtered.map(w => ({
      ...w,
      distance: userPos ? getDistanceKm(userPos.lat, userPos.lng, w.wp.lat, w.wp.lng) : null,
    })).filter(w => !userPos || (w.distance !== null && w.distance <= radius));

    const sorted = withDist.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
    setNearby(sorted);

    // Add worker markers
    sorted.forEach(w => {
      const isSelected = selected?.id === w.id;
      const isAvail    = w.wp?.isAvailable;
      const color      = isSelected ? "#1B3A6B" : isAvail ? "#10b981" : "#9CA3AF";

      const icon = L.divIcon({
        html: `<div style="
          position:relative;
          width:${isSelected ? 44 : 36}px;
          height:${isSelected ? 44 : 36}px;
          border-radius:50%;
          background:${color};
          border:${isSelected ? "3px" : "2px"} solid white;
          box-shadow:0 2px ${isSelected ? 12 : 6}px rgba(0,0,0,0.25);
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:${isSelected ? 16 : 13}px;
          font-family:Arial,sans-serif;
          transition:all 0.2s;
          cursor:pointer;
        ">${w.fullName?.[0] || "?"}</div>
        ${isAvail ? `<div style="
          position:absolute;bottom:0;right:0;
          width:10px;height:10px;border-radius:50%;
          background:#10b981;border:2px solid white;
        "></div>` : ""}`,
        className: "",
        iconSize:   [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const popup = `
        <div style="font-family:Arial,sans-serif;min-width:160px;padding:4px">
          <strong style="color:#1B3A6B;font-size:14px">${w.fullName}</strong><br/>
          <span style="color:#E8541A;font-size:12px">${w.wp?.skills?.slice(0,2).join(", ") || "General"}</span><br/>
          ${w.wp?.hourlyRate ? `<span style="color:#333;font-size:12px">LKR ${w.wp.hourlyRate}/hr</span><br/>` : ""}
          ${w.distance !== null ? `<span style="color:#666;font-size:11px">📍 ${w.distance.toFixed(1)}km away</span><br/>` : ""}
          <span style="color:${isAvail ? "#10b981" : "#9CA3AF"};font-size:11px">
            ${isAvail ? "● Available now" : "○ Offline"}
          </span>
          ${w.nicVerified ? `<br/><span style="color:#10b981;font-size:11px">✓ ID Verified</span>` : ""}
        </div>
      `;

      const marker = L.marker([w.wp.lat, w.wp.lng], { icon })
        .addTo(map)
        .bindPopup(popup);

      marker.on("click", () => setSelected(w));
      markersRef.current.push(marker);
    });
  }

  function flyToWorker(w: any) {
    setSelected(w);
    if (leafletMapRef.current && w.wp?.lat && w.wp?.lng) {
      leafletMapRef.current.flyTo([w.wp.lat, w.wp.lng], 15, { duration: 1 });
    }
  }

  return (
    <div className="min-h-screen bg-lgray">
      <Navbar />
      <div className="pt-16 h-screen flex flex-col">

        {/* Header bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
          <div>
            <h1 className="font-heading font-bold text-navy text-lg">Find Workers Near You</h1>
            <p className="text-gray-400 text-xs">
              {nearby.length > 0
                ? `${nearby.length} worker${nearby.length !== 1 ? "s" : ""} within ${radius}km`
                : "Enable location to find nearby workers"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Radius selector */}
            <div className="flex gap-1">
              {RADIUS_OPTIONS.map(r => (
                <button key={r} onClick={() => setRadius(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    radius === r ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {r}km
                </button>
              ))}
            </div>

            {/* Available toggle */}
            <button onClick={() => setAvailOnly(!availOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                availOnly ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-600"
              }`}>
              <Zap size={12} /> Available
            </button>

            {/* Skill filter */}
            <select value={skill} onChange={e => setSkill(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-navy">
              {SKILLS.map(s => <option key={s}>{s}</option>)}
            </select>

            {/* Get location button */}
            <button onClick={getUserLocation} disabled={locating}
              className="flex items-center gap-1.5 bg-handza text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-handza-dark transition-colors disabled:opacity-60">
              <Navigation size={13} />
              {locating ? "Locating..." : userPos ? "Relocate" : "My Location"}
            </button>

            <button onClick={loadWorkers} disabled={loading}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-60">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Location error */}
        {locationError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-600 flex items-center gap-2 flex-shrink-0">
            <X size={12} /> {locationError}
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <p className="font-semibold text-navy text-xs uppercase tracking-wide">
                {userPos ? `Workers within ${radius}km` : "All Available Workers"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!userPos && (
                <div className="p-4 text-center">
                  <Navigation size={28} className="text-handza mx-auto mb-2" />
                  <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                    Click "My Location" to see workers near you on the map
                  </p>
                  <button onClick={getUserLocation}
                    className="bg-handza text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-handza-dark transition-colors">
                    Enable My Location
                  </button>
                </div>
              )}

              {nearby.length === 0 && userPos && !loading && (
                <div className="p-4 text-center">
                  <Users size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">No workers found within {radius}km</p>
                  <button onClick={() => setRadius(Math.min(radius + 5, 20))}
                    className="text-handza text-xs font-semibold mt-2 hover:underline">
                    Expand to {Math.min(radius + 5, 20)}km →
                  </button>
                </div>
              )}

              {nearby.map(w => (
                <button key={w.id} onClick={() => flyToWorker(w)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-lgray transition-colors ${
                    selected?.id === w.id ? "bg-navy/5 border-l-2 border-l-navy" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                        w.wp?.isAvailable ? "bg-green-500" : "bg-gray-400"
                      }`}>
                        {w.fullName?.[0]}
                      </div>
                      {w.wp?.isAvailable && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-navy truncate">{w.fullName}</p>
                        {w.nicVerified && <CheckCircle size={11} className="text-green-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {w.wp?.skills?.slice(0, 2).join(", ") || "General worker"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {w.distance !== null && (
                          <span className="text-xs text-handza font-semibold">
                            {w.distance.toFixed(1)}km
                          </span>
                        )}
                        {w.wp?.hourlyRate > 0 && (
                          <span className="text-xs text-gray-400">LKR {w.wp.hourlyRate}/hr</span>
                        )}
                        {w.wp?.rating > 0 && (
                          <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                            <Star size={9} fill="currentColor" />{w.wp.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Stats footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-lgray flex-shrink-0">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{workers.filter(w => w.wp?.isAvailable).length} available now</span>
                <span>{workers.length} total workers</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />

            {/* Selected worker card overlay */}
            {selected && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-72">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <button onClick={() => setSelected(null)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base ${
                      selected.wp?.isAvailable ? "bg-green-500" : "bg-gray-400"
                    }`}>
                      {selected.fullName?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-navy text-sm">{selected.fullName}</p>
                        {selected.nicVerified && <CheckCircle size={13} className="text-green-500" />}
                      </div>
                      <p className="text-xs text-gray-400">{selected.location || "Sri Lanka"}</p>
                    </div>
                  </div>

                  {selected.wp?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selected.wp.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="badge badge-navy text-xs">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className={`font-semibold ${selected.wp?.isAvailable ? "text-green-500" : "text-gray-400"}`}>
                      {selected.wp?.isAvailable ? "● Available now" : "○ Offline"}
                    </span>
                    {selected.distance !== null && (
                      <span className="text-handza font-semibold flex items-center gap-1">
                        <MapPin size={11} /> {selected.distance?.toFixed(1)}km away
                      </span>
                    )}
                    {selected.wp?.hourlyRate > 0 && (
                      <span className="text-navy font-bold">LKR {selected.wp.hourlyRate}/hr</span>
                    )}
                  </div>

                  <Link href={`/jobs/new?workerId=${selected.id}`}
                    className="block w-full bg-handza text-white text-xs font-semibold py-2.5 rounded-xl text-center hover:bg-handza-dark transition-colors">
                    Hire {selected.fullName?.split(" ")[0]} Now →
                  </Link>
                </div>
              </div>
            )}

            {/* Map loading overlay */}
            {!mapReady && (
              <div className="absolute inset-0 bg-lgray flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-handza border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Loading map...</p>
                </div>
              </div>
            )}

            {/* No location hint */}
            {mapReady && !userPos && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-4 py-3 flex items-center gap-2.5 text-sm">
                  <Navigation size={16} className="text-handza flex-shrink-0" />
                  <span className="text-gray-600 font-medium">Click "My Location" to find workers near you</span>
                </div>
              </div>
            )}

            {/* OpenStreetMap credit */}
            <div className="absolute bottom-2 right-2 z-[1000]">
              <p className="text-gray-400 text-xs bg-white/80 px-2 py-1 rounded-md">
                Map: © OpenStreetMap contributors — Free & Open Source
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
