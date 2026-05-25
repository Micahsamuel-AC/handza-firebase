"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminVerifyPage() {
  const { profile: admin } = useAuth();
  const [pending, setPending]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string|null>(null);
  const [note, setNote]         = useState<Record<string,string>>({});

  async function load() {
    setLoading(true);
    const snap = await getDocs(query(collection(db,"profiles"), where("nicPending","==",true)));
    setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    setActionId(id);
    await updateDoc(doc(db,"profiles",id), {
      nicVerified: true, nicPending: false,
      verifiedAt: serverTimestamp(), verifiedBy: admin?.id,
    });
    await load(); setActionId(null);
  }

  async function reject(id: string) {
    setActionId(id);
    await updateDoc(doc(db,"profiles",id), {
      nicPending: false, nicVerified: false,
      rejectedAt: serverTimestamp(), rejectedBy: admin?.id,
      rejectionNote: note[id] || "Document unclear or invalid.",
    });
    await load(); setActionId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Verification Queue</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pending.length} pending NIC verifications</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><RefreshCw size={18}/></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <CheckCircle size={36} className="text-green-400 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">All clear — no pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 bg-navy/10 rounded-xl flex items-center justify-center text-navy font-bold flex-shrink-0">
                  {p.fullName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-navy">{p.fullName}</p>
                  <p className="text-gray-400 text-xs">{p.email} · <span className="capitalize">{p.role}</span></p>
                  <p className="text-gray-400 text-xs">{p.phone} · {p.location}</p>
                </div>
                {p.nicDocumentUrl && (
                  <a href={p.nicDocumentUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-handza font-semibold hover:underline flex-shrink-0">
                    <ExternalLink size={13}/> View NIC
                  </a>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Rejection note (optional)
                </label>
                <input
                  type="text"
                  value={note[p.id] || ""}
                  onChange={e => setNote(prev => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20"
                  placeholder="Reason for rejection if needed..."
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => approve(p.id)} disabled={actionId === p.id}
                  className="flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
                  <CheckCircle size={15}/> Approve
                </button>
                <button onClick={() => reject(p.id)} disabled={actionId === p.id}
                  className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">
                  <XCircle size={15}/> Reject
                </button>
                {actionId === p.id && <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin self-center"/>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
