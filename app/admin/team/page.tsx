"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, updateDoc, serverTimestamp, query, where
} from "firebase/firestore";
import { Shield, ShieldOff, Search, RefreshCw, UserPlus, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const ROLE_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  superadmin: { label: "Super Admin", color: "bg-handza/10 text-handza", desc: "Full access — can manage team, delete accounts, all permissions" },
  admin:      { label: "Admin",       color: "bg-navy/10 text-navy",    desc: "Can verify, suspend, edit workers/employers/jobs" },
  worker:     { label: "Worker",      color: "bg-blue-50 text-blue-600", desc: "Regular worker account" },
  employer:   { label: "Employer",    color: "bg-purple-50 text-purple-600", desc: "Regular employer account" },
};

export default function AdminTeam() {
  const { profile: adminProfile } = useAuth();
  const [allUsers, setAllUsers]   = useState<any[]>([]);
  const [admins, setAdmins]       = useState<any[]>([]);
  const [search, setSearch]       = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<string|null>(null);
  const [toast, setToast]         = useState<string|null>(null);

  const isSuperAdmin = adminProfile?.role === "superadmin";

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "profiles"));
    const all  = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    setAllUsers(all);
    setAdmins(all.filter(u => u.role === "admin" || u.role === "superadmin"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const results = allUsers.filter(u =>
      (u.role === "worker" || u.role === "employer") &&
      (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 5);
    setSearchResults(results);
  }, [search, allUsers]);

  async function promoteToAdmin(userId: string, name: string) {
    if (!isSuperAdmin) return;
    if (!window.confirm(`Grant admin access to ${name}? They will be able to manage workers, employers, and jobs.`)) return;
    setActionId(userId);
    await updateDoc(doc(db, "profiles", userId), {
      role: "admin",
      promotedAt: serverTimestamp(),
      promotedBy: adminProfile?.id,
    });
    showToast(`${name} is now an Admin`);
    setSearch("");
    await load();
    setActionId(null);
  }

  async function revokeAdmin(userId: string, name: string) {
    if (!isSuperAdmin) return;
    if (userId === adminProfile?.id) {
      alert("You cannot revoke your own admin access.");
      return;
    }
    if (!window.confirm(`Revoke admin access from ${name}?`)) return;
    setActionId(userId);
    await updateDoc(doc(db, "profiles", userId), {
      role: "worker", // revert to worker
      revokedAt: serverTimestamp(),
      revokedBy: adminProfile?.id,
    });
    showToast(`${name}'s admin access has been revoked`);
    await load();
    setActionId(null);
  }

  async function promoteSuperAdmin(userId: string, name: string) {
    if (!isSuperAdmin) return;
    if (!window.confirm(`⚠ Grant SUPER ADMIN access to ${name}? This gives full platform control including team management and permanent deletions.`)) return;
    setActionId(userId);
    await updateDoc(doc(db, "profiles", userId), {
      role: "superadmin",
      promotedAt: serverTimestamp(),
      promotedBy: adminProfile?.id,
    });
    showToast(`${name} is now a Super Admin`);
    await load();
    setActionId(null);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-navy text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-navy">Team Access</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage who on the HANDZA team can access the admin panel</p>
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
          <Shield size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>View only.</strong> Only Super Admins can add or remove team members.
            Contact <strong>Micah Samuel</strong> to request access changes.
          </p>
        </div>
      )}

      {/* Role overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {Object.entries(ROLE_CONFIG).filter(([r]) => r === "superadmin" || r === "admin").map(([role, cfg]) => (
          <div key={role} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.label}</div>
              <span className="text-sm font-semibold text-navy">
                {admins.filter(a => a.role === role).length} member{admins.filter(a => a.role === role).length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{cfg.desc}</p>
          </div>
        ))}
      </div>

      {/* Current team */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-navy text-sm">Current Admin Team</h2>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No admin team members yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {admins.map(a => (
              <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.role === "superadmin" ? "bg-handza/20" : "bg-navy/10"
                }`}>
                  {a.role === "superadmin"
                    ? <Crown size={16} className="text-handza" />
                    : <Shield size={16} className="text-navy" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.fullName}</p>
                    {a.id === adminProfile?.id && (
                      <span className="text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{a.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_CONFIG[a.role]?.color || ""}`}>
                    {ROLE_CONFIG[a.role]?.label}
                  </span>
                  {/* Promote to superadmin */}
                  {isSuperAdmin && a.role === "admin" && a.id !== adminProfile?.id && (
                    <button
                      onClick={() => promoteSuperAdmin(a.id, a.fullName)}
                      disabled={actionId === a.id}
                      title="Promote to Super Admin"
                      className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors text-xs">
                      <Crown size={14} />
                    </button>
                  )}
                  {/* Revoke admin */}
                  {isSuperAdmin && a.role !== "superadmin" && a.id !== adminProfile?.id && (
                    <button
                      onClick={() => revokeAdmin(a.id, a.fullName)}
                      disabled={actionId === a.id}
                      title="Revoke admin access"
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <ShieldOff size={14} />
                    </button>
                  )}
                  {actionId === a.id && (
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new admin (superadmin only) */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy text-sm">Add Team Member</h2>
            <p className="text-xs text-gray-400 mt-0.5">Search for an existing HANDZA user and grant them admin access</p>
          </div>
          <div className="p-5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                {searchResults.map(u => (
                  <div key={u.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-bold">{u.fullName?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email} · <span className="capitalize">{u.role}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => promoteToAdmin(u.id, u.fullName)}
                      disabled={actionId === u.id}
                      className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50">
                      <UserPlus size={13} />
                      Grant Admin
                    </button>
                  </div>
                ))}
              </div>
            )}

            {search.trim() && searchResults.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No users found with that name or email</p>
            )}
          </div>

          {/* Permissions table */}
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Permission Levels</p>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-gray-500 font-semibold">Permission</th>
                    <th className="px-4 py-2.5 text-center text-gray-500 font-semibold">Admin</th>
                    <th className="px-4 py-2.5 text-center text-orange-500 font-semibold">Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ["View all workers & employers", true, true],
                    ["Verify NIC & suspend accounts", true, true],
                    ["Edit user details", true, true],
                    ["Remove job posts", true, true],
                    ["View platform dashboard", true, true],
                    ["Add / remove admin team", false, true],
                    ["Permanently delete accounts", false, true],
                    ["Promote to Super Admin", false, true],
                  ].map(([perm, admin, superA]) => (
                    <tr key={perm as string} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{perm}</td>
                      <td className="px-4 py-2.5 text-center">
                        {admin ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {superA ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
