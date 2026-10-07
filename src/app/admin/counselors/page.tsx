"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Plus, Search, Edit, Trash2, Lock,
  Mail, Phone, Check, X, Eye, EyeOff, Copy,
  UserCheck, TrendingUp, Clock, Target, BookOpen,
  Globe, Briefcase, Calendar, AlertCircle, ChevronRight,
  Star,
} from "lucide-react";
import {
  getAllCounselors, createCounselor, updateCounselor,
  deleteCounselor, toggleCounselorStatus, resetUserPassword,
  type Counselor, type CreateCounselorPayload, type UpdateCounselorPayload,
} from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(v: string | undefined | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const SPECIALIZATION_OPTIONS = [
  "UK", "Australia", "Canada", "USA", "New Zealand",
  "Ireland", "Germany", "France", "Netherlands", "Japan",
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// ─── Stat chip ───────────────────────────────────────────────────────────────
function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${color}`}>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-xs mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

// ─── Specialization Tags ─────────────────────────────────────────────────────
function SpecTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return <span className="text-xs text-gray-400 italic">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
          {t}
        </span>
      ))}
    </div>
  );
}

// ─── Counselor Modal ──────────────────────────────────────────────────────────
function CounselorModal({
  mode, counselor, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  counselor?: Counselor | null;
  onSave: (data: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    fullName: counselor?.fullName || "",
    email: counselor?.email || "",
    phone: counselor?.phone || "",
    employeeCode: counselor?.employeeCode || "",
    designation: counselor?.designation || "",
    bio: counselor?.bio || "",
    joinedDate: counselor?.joinedDate?.split("T")[0] || "",
    specializations: counselor?.specializations || [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specInput, setSpecInput] = useState("");

  function set(field: string, val: any) {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function toggleSpec(s: string) {
    setForm((p) => ({
      ...p,
      specializations: p.specializations.includes(s)
        ? p.specializations.filter((x) => x !== s)
        : [...p.specializations, s],
    }));
  }

  function addCustomSpec() {
    const val = specInput.trim();
    if (val && !form.specializations.includes(val)) {
      setForm((p) => ({ ...p, specializations: [...p.specializations, val] }));
    }
    setSpecInput("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const clean: Record<string, any> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v) ? v.length > 0 : v !== "") clean[k] = v;
    });
    if (form.specializations.length === 0) clean.specializations = [];
    onSave(clean);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{mode === "create" ? "Add Counselor" : "Edit Counselor"}</h3>
              <p className="text-xs text-blue-200">{mode === "create" ? "A welcome email with credentials will be sent" : "Update counselor profile"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                placeholder="John Doe" className={`${inputCls} ${errors.fullName ? "border-red-500" : ""}`} />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className={labelCls}>Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="john@example.com" className={`${inputCls} ${errors.email ? "border-red-500" : ""}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+977-98XXXXXXXX" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Employee Code</label>
              <input type="text" value={form.employeeCode} onChange={(e) => set("employeeCode", e.target.value)}
                placeholder="CNS-001 (auto-generated if blank)" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Designation</label>
              <input type="text" value={form.designation} onChange={(e) => set("designation", e.target.value)}
                placeholder="Senior Counselor" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Joined Date</label>
              <input type="date" value={form.joinedDate} onChange={(e) => set("joinedDate", e.target.value)} className={inputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                placeholder="Brief introduction..." rows={3} className={inputCls} />
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className={labelCls}>Specializations (study destinations)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SPECIALIZATION_OPTIONS.map((s) => (
                <button key={s} type="button"
                  onClick={() => toggleSpec(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.specializations.includes(s)
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a8a]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={specInput} onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSpec())}
                placeholder="Add custom (press Enter)" className={`${inputCls} flex-1`} />
              <Button variant="outline" size="sm" onClick={addCustomSpec} type="button">Add</Button>
            </div>
            {form.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.specializations.map((s) => (
                  <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    {s}
                    <button onClick={() => toggleSpec(s)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Counselor" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CounselorsPage() {
  const router = useRouter();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState<Counselor | null>(null);
  const [genPassword, setGenPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchCounselors();
  }, [statusFilter]);

  async function fetchCounselors() {
    setLoading(true);
    try {
      const res = await getAllCounselors({ status: statusFilter || undefined, search: search || undefined });
      if (res.success) {
        const list = res.data?.data || (res.data as any) || [];
        setCounselors(Array.isArray(list) ? list : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(data: CreateCounselorPayload) {
    setActionLoading(true);
    try {
      const res = await createCounselor(data);
      if (res.success) {
        await fetchCounselors();
        setShowCreate(false);
        // Show generated password from response
        const pwd = (res.data as any)?.generatedPassword || (res as any)?.generatedPassword;
        if (pwd) { setGenPassword(pwd); setShowPassword(true); }
      } else alert(res.message || "Failed to create counselor");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: UpdateCounselorPayload) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateCounselor(selected.id, data);
      if (res.success) { await fetchCounselors(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteCounselor(selected.id);
      if (res.success) { await fetchCounselors(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleToggle(c: Counselor) {
    try {
      const res = await toggleCounselorStatus(c.id);
      if (res.success) await fetchCounselors();
      else alert(res.message || "Failed to toggle status");
    } catch { alert("Network error"); }
  }

  async function handleResetPassword(c: Counselor) {
    if (!confirm(`Reset password for ${c.fullName}?`)) return;
    try {
      const res = await resetUserPassword(c.id);
      if (res.success && res.data) {
        setGenPassword(res.data.newPassword);
        setShowPassword(true);
      } else alert(res.message || "Failed to reset password");
    } catch { alert("Network error"); }
  }

  const filtered = counselors.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.employeeCode || "").toLowerCase().includes(search.toLowerCase())
  );

  // Stats summary
  const totalLeads = counselors.reduce((a, c) => a + (c.statistics?.assignedLeads || 0), 0);
  const totalConverted = counselors.reduce((a, c) => a + (c.statistics?.convertedLeads || 0), 0);
  const active = counselors.filter((c) => c.isActive).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Counselors</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your counseling team</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" /> Add Counselor
          </Button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Counselors", value: counselors.length, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Active", value: active, icon: UserCheck, color: "from-green-500 to-green-600" },
            { label: "Total Leads", value: totalLeads, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
            { label: "Converted", value: totalConverted, icon: Target, color: "from-emerald-500 to-emerald-600" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-full`} />
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </Card>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCounselors()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchCounselors}>
              <Search className="w-4 h-4 mr-1" /> Search
            </Button>
          </div>
        </Card>

        {/* ── Table ── */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UserCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No counselors found</h3>
              <p className="text-sm text-gray-500 mb-4">Add your first counselor to get started.</p>
              <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Counselor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Counselor", "Contact", "Specializations", "Stats", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      {/* Counselor */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                            {c.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{c.fullName}</div>
                            <div className="text-xs text-gray-400">{c.employeeCode || "—"}</div>
                            {c.designation && <div className="text-xs text-blue-600">{c.designation}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {c.phone}
                          </div>
                        )}
                      </td>

                      {/* Specializations */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <SpecTags tags={c.specializations} />
                      </td>

                      {/* Stats */}
                      <td className="px-5 py-4">
                        {c.statistics ? (
                          <div className="flex gap-1.5 flex-wrap">
                            <StatChip label="Leads" value={c.statistics.assignedLeads} color="bg-blue-50 text-blue-700" />
                            <StatChip label="Active" value={c.statistics.activeStudents} color="bg-green-50 text-green-700" />
                            <StatChip label="Converted" value={c.statistics.convertedLeads} color="bg-emerald-50 text-emerald-700" />
                            {c.statistics.pendingFollowUps > 0 && (
                              <StatChip label="Follow-ups" value={c.statistics.pendingFollowUps} color="bg-amber-50 text-amber-700" />
                            )}
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button onClick={() => handleToggle(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            c.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          {c.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {c.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fmtDate(c.joinedDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(c); setShowEdit(true); }}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleResetPassword(c)}
                            className="p-1.5 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors" title="Reset Password">
                            <Lock className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelected(c); setShowDelete(true); }}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <CounselorModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* ── Edit Modal ── */}
      {showEdit && selected && (
        <CounselorModal mode="edit" counselor={selected} onSave={handleUpdate} onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* ── Password Display Modal ── */}
      {showPassword && genPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Counselor Created</h3>
                <p className="text-sm text-gray-500">A welcome email has been sent with login credentials.</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <div className="relative">
                <input type={passwordVisible ? "text" : "password"} value={genPassword} readOnly
                  className="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setPasswordVisible((p) => !p)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(genPassword)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Save this password — it cannot be retrieved later.</p>
            </div>

            <Button onClick={() => { setShowPassword(false); setGenPassword(""); }} className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">
              Done
            </Button>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Deactivate Counselor</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>{selected.fullName}</strong> will be deactivated. Their assigned leads will remain.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Processing..." : "Deactivate"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
