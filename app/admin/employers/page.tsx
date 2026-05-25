"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Search, CheckCircle, Ban, Trash2, Edit2, Save, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdminEmployers() {
  const { profile: adminProfile } = useAuth();
  const [employers, setEmployers] = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all"|"verified"|"unverified"|"suspended">("all");
  const [editId, setEditId]       = useState<string|null>(null);
  const [editData, setEditData]   = useState<any>({});
  const [saving, setSaving]       = useState(false);
  const [actionId, setActionId]   = useState<string|null>(null);

  const isSuperAdmin = adminProfile?.role === "superadmin";

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "profiles"));
    const all = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.role === "employer") as any[];
    setEmployers(all);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...employers];
    if (search) list = list.filter(e =>
      e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "verified")   list = list.filter(e => e.nicVerified && !e.suspended);
    if (filter === "unverified") list = list.filter(e => !e.nicVerified);
    if (filter === "suspended")  list = list.filter(e => e.suspended);
    setFiltered(list);
  }, [employers, search, filter]);

  async function toggleVerify(id: string, current: boolean) {
    setActionId(id);
    await updateDoc(doc(db, "profiles", id), {
      nicVerified: !current,
      verifiedAt: !current ? serverTimestamp() : null,
    });
    await load(); setActionId(null);
  }

  async function toggleSuspend(id: string, current: boolean) {
    setActionId(id);
    const reason = current ? null : window.prompt("Reason for suspension:");
    if (!current && !reason) { setActionId(null); return; }
    await updateDoc(doc(db, "profiles", id), {
      suspended: !current,
      suspendedAt: !current ? serverTimestamp() : null,
      suspendReason: reason,
      suspendedBy: adminProfile?.id,
    });
    await load(); setActionId(null);
  }

  async function deleteEmployer(id: string) {
    if (!isSuperAdmin) return;
    if (!window.confirm("Permanently delete this employer account?")) return;
    setActionId(id);
    await deleteDoc(doc(db, "profiles", id));
    await load(); setActionId(null);
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);
    await updateDoc(doc(db, "profiles", editId), {
      fullName: editData.fullName,
      phone: editData.phone,
      location: editData.location,
      updatedAt: serverTimestamp(),
      updatedBy: adminProfile?.id,
    });
    setEditId(null);
    await load(); setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Employers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{employers.length} total employers</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search employers..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white" />
        </div>
        <div className="flex gap-2">
          {(["all","verified","unverified","suspended"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No employers found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(e => (
              <div key={e.id}>
                {editId !== e.id ? (
                  <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-sm font-bold">{e.fullName?.charAt(0) || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{e.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{e.email}</p>
                        <p className="text-xs text-gray-400">{e.location || "No location"} · {e.phone || "No phone"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {e.suspended
                        ? <span className="badge-red">Suspended</span>
                        : e.nicVerified
                          ? <span className="badge-green">Verified</span>
                          : <span className="badge-amber">Unverified</span>
                      }
                      <button onClick={() => toggleVerify(e.id, !!e.nicVerified)} disabled={actionId===e.id}
                        className={`p-1.5 rounded-lg transition-colors ${e.nicVerified ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"}`}>
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => toggleSuspend(e.id, !!e.suspended)} disabled={actionId===e.id}
                        className={`p-1.5 rounded-lg transition-colors ${e.suspended ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"}`}>
                        <Ban size={16} />
                      </button>
                      <button onClick={() => { setEditId(e.id); setEditData({ fullName: e.fullName, phone: e.phone||"", location: e.location||"" }); }}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-navy/10 hover:text-navy transition-colors">
                        <Edit2 size={16} />
                      </button>
                      {isSuperAdmin && (
                        <button onClick={() => deleteEmployer(e.id)} disabled={actionId===e.id}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                      {actionId === e.id && <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 bg-navy/5 border-l-4 border-purple-400">
                    <p className="text-xs font-semibold text-navy mb-3">Editing: {e.fullName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      {[["fullName","Full Name"],["phone","Phone"],["location","Location"]].map(([key,label]) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                          <input type="text" value={editData[key]||""} onChange={e2=>setEditData({...editData,[key]:e2.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving}
                        className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-navy/90 disabled:opacity-50">
                        <Save size={13} />{saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-200">
                        <X size={13} />Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        .badge-green{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#d1fae5;color:#065f46;}
        .badge-red{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#fee2e2;color:#991b1b;}
        .badge-amber{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#fef3c7;color:#92400e;}
      `}</style>
    </div>
  );
}
