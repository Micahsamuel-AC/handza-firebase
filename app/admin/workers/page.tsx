"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import {
  Search, Filter, CheckCircle, XCircle, Ban, Trash2,
  ChevronDown, Edit2, Save, X, Eye, RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdminWorkers() {
  const { profile: adminProfile } = useAuth();
  const [workers, setWorkers]     = useState<any[]>([]);
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
      .filter((p: any) => p.role === "worker") as any[];
    setWorkers(all);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...workers];
    if (search) list = list.filter(w =>
      w.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      w.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.phone?.includes(search)
    );
    if (filter === "verified")   list = list.filter(w => w.nicVerified && !w.suspended);
    if (filter === "unverified") list = list.filter(w => !w.nicVerified);
    if (filter === "suspended")  list = list.filter(w => w.suspended);
    setFiltered(list);
  }, [workers, search, filter]);

  async function toggleVerify(id: string, current: boolean) {
    setActionId(id);
    await updateDoc(doc(db, "profiles", id), {
      nicVerified: !current,
      verifiedAt: !current ? serverTimestamp() : null,
      verifiedBy: !current ? adminProfile?.id : null,
    });
    await load();
    setActionId(null);
  }

  async function toggleSuspend(id: string, current: boolean) {
    setActionId(id);
    const reason = current ? null : window.prompt("Reason for suspension (shown to team):");
    if (!current && !reason) { setActionId(null); return; }
    await updateDoc(doc(db, "profiles", id), {
      suspended: !current,
      suspendedAt: !current ? serverTimestamp() : null,
      suspendedBy: !current ? adminProfile?.id : null,
      suspendReason: reason,
    });
    await load();
    setActionId(null);
  }

  async function deleteWorker(id: string) {
    if (!isSuperAdmin) return;
    if (!window.confirm("Permanently delete this worker? This cannot be undone.")) return;
    setActionId(id);
    await deleteDoc(doc(db, "profiles", id));
    await load();
    setActionId(null);
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);
    await updateDoc(doc(db, "profiles", editId), {
      fullName: editData.fullName,
      phone: editData.phone,
      location: editData.location,
      bio: editData.bio,
      updatedAt: serverTimestamp(),
      updatedBy: adminProfile?.id,
    });
    setEditId(null);
    await load();
    setSaving(false);
  }

  const StatusBadge = ({ w }: { w: any }) => {
    if (w.suspended) return <span className="badge-red">Suspended</span>;
    if (w.nicVerified) return <span className="badge-green">Verified</span>;
    return <span className="badge-amber">Unverified</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Workers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{workers.length} total workers</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name, email, phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
          />
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No workers found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(w => (
              <div key={w.id}>
                {/* Normal row */}
                {editId !== w.id ? (
                  <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-navy text-sm font-bold">{w.fullName?.charAt(0) || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{w.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{w.email} · {w.phone || "No phone"}</p>
                        <p className="text-xs text-gray-400 truncate">{w.location || "No location"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge w={w} />
                      {/* Verify button */}
                      <button
                        onClick={() => toggleVerify(w.id, !!w.nicVerified)}
                        disabled={actionId === w.id}
                        title={w.nicVerified ? "Revoke verification" : "Mark as verified"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          w.nicVerified
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"
                        }`}>
                        <CheckCircle size={16} />
                      </button>
                      {/* Suspend button */}
                      <button
                        onClick={() => toggleSuspend(w.id, !!w.suspended)}
                        disabled={actionId === w.id}
                        title={w.suspended ? "Unsuspend" : "Suspend"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          w.suspended
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        }`}>
                        <Ban size={16} />
                      </button>
                      {/* Edit button */}
                      <button
                        onClick={() => { setEditId(w.id); setEditData({ fullName: w.fullName, phone: w.phone || "", location: w.location || "", bio: w.bio || "" }); }}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-navy/10 hover:text-navy transition-colors"
                        title="Edit details">
                        <Edit2 size={16} />
                      </button>
                      {/* Delete (superadmin only) */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => deleteWorker(w.id)}
                          disabled={actionId === w.id}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete account">
                          <Trash2 size={16} />
                        </button>
                      )}
                      {actionId === w.id && (
                        <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit row */
                  <div className="px-5 py-4 bg-navy/5 border-l-4 border-navy">
                    <p className="text-xs font-semibold text-navy mb-3">Editing: {w.fullName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {[
                        { key: "fullName", label: "Full Name" },
                        { key: "phone",    label: "Phone" },
                        { key: "location", label: "Location" },
                        { key: "bio",      label: "Bio" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                          <input
                            type="text"
                            value={editData[key] || ""}
                            onChange={e => setEditData({ ...editData, [key]: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving}
                        className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50">
                        <Save size={13} /> {saving ? "Saving..." : "Save changes"}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                        <X size={13} /> Cancel
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
        .badge-green { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; background:#d1fae5; color:#065f46; }
        .badge-red   { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; background:#fee2e2; color:#991b1b; }
        .badge-amber { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; background:#fef3c7; color:#92400e; }
      `}</style>
    </div>
  );
}
