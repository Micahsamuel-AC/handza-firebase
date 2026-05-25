"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Search, Trash2, RefreshCw, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const STATUS_COLORS: Record<string, string> = {
  open:        "bg-green-50 text-green-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed:   "bg-gray-100 text-gray-600",
  cancelled:   "bg-red-50 text-red-600",
  removed:     "bg-red-100 text-red-800",
};

export default function AdminJobs() {
  const { profile: adminProfile } = useAuth();
  const [jobs, setJobs]         = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [actionId, setActionId] = useState<string|null>(null);
  const isSuperAdmin = adminProfile?.role === "superadmin";

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "jobs"));
    const all  = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    setJobs(all.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...jobs];
    if (search) list = list.filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.employerName?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter !== "all") list = list.filter(j => j.status === filter);
    setFiltered(list);
  }, [jobs, search, filter]);

  async function removeJob(id: string) {
    if (!window.confirm("Remove this job post? It will be hidden from users.")) return;
    setActionId(id);
    await updateDoc(doc(db, "jobs", id), {
      status: "cancelled",
      removedByAdmin: true,
      removedAt: serverTimestamp(),
      removedBy: adminProfile?.id,
    });
    await load(); setActionId(null);
  }

  async function deleteJob(id: string) {
    if (!isSuperAdmin) return;
    if (!window.confirm("Permanently delete this job?")) return;
    setActionId(id);
    await deleteDoc(doc(db, "jobs", id));
    await load(); setActionId(null);
  }

  const filters = ["all","open","in_progress","completed","cancelled"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Jobs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} total jobs</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"
              }`}>{f.replace("_"," ")}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No jobs found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(j => (
              <div key={j.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">{j.title}</p>
                    {j.isUrgent && <span className="text-xs font-bold px-1.5 py-0.5 bg-red-50 text-red-600 rounded">URGENT</span>}
                    {j.removedByAdmin && <span className="text-xs font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded">REMOVED BY ADMIN</span>}
                  </div>
                  <p className="text-xs text-gray-400">By {j.employerName} · {j.location} · LKR {j.payRate}/{j.payType}</p>
                  <p className="text-xs text-gray-400">{j.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[j.status] || "bg-gray-100 text-gray-600"}`}>
                    {j.status?.replace("_"," ")}
                  </span>
                  {j.status === "open" && (
                    <button onClick={() => removeJob(j.id)} disabled={actionId===j.id}
                      title="Remove this job post"
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <XCircle size={16} />
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button onClick={() => deleteJob(j.id)} disabled={actionId===j.id}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                  {actionId === j.id && <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
