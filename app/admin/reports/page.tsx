"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { AlertTriangle, CheckCircle, Ban, RefreshCw } from "lucide-react";

const STATUS_COLORS: Record<string,string> = {
  pending:    "bg-amber-50 text-amber-700",
  reviewed:   "bg-blue-50 text-blue-700",
  actioned:   "bg-red-50 text-red-700",
  dismissed:  "bg-gray-100 text-gray-600",
};

export default function AdminReportsPage() {
  const { profile: admin } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string|null>(null);

  async function load() {
    setLoading(true);
    const snap = await getDocs(query(collection(db,"reports"), orderBy("createdAt","desc")));
    setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateReport(id: string, status: string, action?: string) {
    setActionId(id);
    await updateDoc(doc(db,"reports",id), {
      status, reviewedAt: serverTimestamp(), reviewedBy: admin?.id,
      adminAction: action || null,
    });
    if (action === "suspend" ) {
      const report = reports.find(r => r.id === id);
      if (report?.reportedUserId) {
        await updateDoc(doc(db,"profiles",report.reportedUserId), {
          suspended: true, suspendedAt: serverTimestamp(),
          suspendReason: `Suspended via abuse report #${id}`,
        });
      }
    }
    await load(); setActionId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">Abuse Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">{reports.filter(r => r.status === "pending").length} pending reports</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><RefreshCw size={18}/></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <CheckCircle size={36} className="text-green-400 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">No reports filed yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="text-red-500"/>
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{r.reason || "Abuse reported"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Reported by: {r.reporterName} · Against: {r.reportedName}
                    </p>
                    <p className="text-gray-400 text-xs">Type: <span className="capitalize">{r.reportType}</span></p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                  {r.status}
                </span>
              </div>

              {r.description && (
                <div className="bg-lgray rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-600 leading-relaxed">"{r.description}"</p>
                </div>
              )}

              {r.status === "pending" && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => updateReport(r.id, "actioned", "suspend")} disabled={actionId === r.id}
                    className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
                    <Ban size={13}/> Suspend User
                  </button>
                  <button onClick={() => updateReport(r.id, "reviewed")} disabled={actionId === r.id}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50">
                    <CheckCircle size={13}/> Mark Reviewed
                  </button>
                  <button onClick={() => updateReport(r.id, "dismissed")} disabled={actionId === r.id}
                    className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                    Dismiss
                  </button>
                  {actionId === r.id && <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin self-center"/>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
