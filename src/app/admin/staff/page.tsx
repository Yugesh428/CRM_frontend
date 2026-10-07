"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Plus, Search, Edit, Trash2, Lock,
  Mail, Phone, Check, X, Eye, EyeOff, Copy,
  AlertCircle, UserCheck, Clock, Briefcase,
  Shield, ChevronDown, RefreshCw,
} from "lucide-react";
import {
  getAllStaff, getStaffStats, createStaff, updateStaff,
  toggleStaffStatus, resetStaffPassword, getAllDepartments,
  type StaffMember, type CreateStaffPayload, type UpdateStaffPayload,
  type StaffStats, type Department,
} from "@/lib/api";

// ─── config ──────────────────────────────────────────────────────────────────
const ROLES = [
  { value: "receptionist",          label: "Receptionist",            color: "bg-blue-100 text-blue-700" },
  { value: "counselor",             label: "Counselor",               color: "bg-purple-100 text-purple-700" },
  { value: "visa_officer",          label: "Visa Officer",            color: "bg-green-100 text-green-700" },
  { value: "documentation_officer", label: "Documentation Officer",   color: "bg-orange-100 text-orange-700" },
  { value: "teacher",               label: "Teacher",                 color: "bg-cyan-100 text-cyan-700" },
];

function roleBadge(role: string) {
  const r = ROLES.find((x) => x.value === role);
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r?.color ?? "bg-gray-100 text-gray-600"}`}>
      {r?.label ?? role}
    </span>
  );
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

// ─── Staff Modal ──────────────────────────────────────────────────────────────
function StaffModal({
  mode, member, departments, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  member?: StaffMember | null;
  departments: Department[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    fullName:      member?.fullName || "",
    email:         member?.email || "",
    phone:         member?.phone || "",
    role:          member?.role || "receptionist",
    employeeCode:  member?.employeeCode || "",
    designation:   member?.designation || "",
    bio:           member?.bio || "",
    joinedDate:    member?.joinedDate?.split("T")[0] || "",
    departmentId:  member?.departmentId || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: string) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.role) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Record<string, any> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") payload[k] = v;
    });
    // map departmentId → department for create
    if (mode === "create" && payload.departmentId) {
      payload.department = payload.departmentId;
      delete payload.departmentId;
    }
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{mode === "create" ? "Add Staff Member" : "Edit Staff Member"}</h3>
              <p className="text-xs text-blue-200">{mode === "create" ? "Credentials will be emailed to the staff member" : "Update staff profile"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={lbl}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                placeholder="John Doe" className={`${inp} ${errors.fullName ? "border-red-400" : ""}`} />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className={lbl}>Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="staff@example.com" className={`${inp} ${errors.email ? "border-red-400" : ""}`}
                readOnly={mode === "edit"} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={lbl}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+977-98XXXXXXXX" className={inp} />
            </div>

            <div>
              <label className={lbl}>Role <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)}
                className={`${inp} ${errors.role ? "border-red-400" : ""}`}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Designation</label>
              <input type="text" value={form.designation} onChange={(e) => set("designation", e.target.value)}
                placeholder="e.g. Senior Counselor" className={inp} />
            </div>

            <div>
              <label className={lbl}>Employee Code</label>
              <input type="text" value={form.employeeCode} onChange={(e) => set("employeeCode", e.target.value)}
                placeholder="Auto-generated if blank" className={inp} />
            </div>

            <div>
              <label className={lbl}>Department</label>
              <select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)} className={inp}>
                <option value="">— None —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={lbl}>Joined Date</label>
              <input type="date" value={form.joinedDate} onChange={(e) => set("joinedDate", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Bio</label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                placeholder="Brief introduction..." rows={3} className={inp} />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Staff" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const router = useRouter();

  const [staff, setStaff]           = useState<StaffMember[]>([]);
  const [stats, setStats]           = useState<StaffStats | null>(null);
  const [departments, setDepts]     = useState<Department[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);
  const [totalItems, setTotal]      = useState(0);
  const limit = 15;

  // modals
  const [showCreate, setShowCreate]         = useState(false);
  const [showEdit, setShowEdit]             = useState(false);
  const [showDelete, setShowDelete]         = useState(false);
  const [showPwd, setShowPwd]               = useState(false);
  const [selected, setSelected]             = useState<StaffMember | null>(null);
  const [pwdInfo, setPwdInfo]               = useState("");
  const [pwdVisible, setPwdVisible]         = useState(false);
  const [actionLoading, setActionLoading]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, [page, roleFilter, deptFilter, statusFilter]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [staffRes, statsRes, deptRes] = await Promise.all([
        getAllStaff({ page, limit, role: roleFilter || undefined, department: deptFilter || undefined, status: statusFilter || undefined }),
        getStaffStats(),
        getAllDepartments(),
      ]);

      const raw = staffRes as any;
      setStaff(Array.isArray(raw.data) ? raw.data : []);
      setTotal(raw.meta?.totalItems ?? 0);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (deptRes.success && deptRes.data) setDepts(deptRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // client-side search filter
  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.employeeCode || "").toLowerCase().includes(q) ||
      (s.phone || "").includes(q)
    );
  });

  async function handleCreate(data: CreateStaffPayload) {
    setActionLoading(true);
    try {
      const res = await createStaff(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: UpdateStaffPayload) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateStaff(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleToggle(s: StaffMember) {
    try {
      const res = await toggleStaffStatus(s.id);
      if (res.success) await fetchAll();
      else alert(res.message || "Failed");
    } catch { alert("Network error"); }
  }

  async function handleResetPwd(s: StaffMember) {
    if (!confirm(`Reset password for ${s.fullName}?`)) return;
    try {
      const res = await resetStaffPassword(s.id);
      if (res.success) {
        setPwdInfo(res.data?.emailSent
          ? `Password reset. Email sent to ${res.data.email}`
          : "Password reset. Email failed — share manually.");
        setShowPwd(true);
      } else alert(res.message || "Failed to reset password");
    } catch { alert("Network error"); }
  }

  const totalPages = Math.ceil(totalItems / limit);

  // stat cards
  const statCards = stats ? [
    { label: "Total Staff",  value: stats.overview.totalStaff,    color: "from-blue-500 to-blue-600",    icon: Users },
    { label: "Active",       value: stats.overview.activeStaff,   color: "from-green-500 to-green-600",  icon: UserCheck },
    { label: "Inactive",     value: stats.overview.inactiveStaff, color: "from-gray-400 to-gray-500",    icon: X },
    { label: "Counselors",   value: stats.byRole.counselors,      color: "from-purple-500 to-purple-600",icon: Briefcase },
  ] : [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage all staff members across your organisation</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        </div>

        {/* stats */}
        {statCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => {
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
        )}

        {/* role breakdown chips */}
        {stats && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Receptionists",            val: stats.byRole.receptionists,        role: "receptionist" },
              { label: "Visa Officers",             val: stats.byRole.visaOfficers,         role: "visa_officer" },
              { label: "Documentation Officers",    val: stats.byRole.documentationOfficers,role: "documentation_officer" },
              { label: "Admins",                    val: stats.byRole.admins,               role: "admin" },
            ].map((c) => (
              <button key={c.role}
                onClick={() => { setRoleFilter(roleFilter === c.role ? "" : c.role); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  roleFilter === c.role
                    ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1e3a8a]"
                }`}
              >
                {c.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${roleFilter === c.role ? "bg-white/20" : "bg-gray-100"}`}>
                  {c.val}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search name, email, code..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
            </div>

            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(search || roleFilter || deptFilter || statusFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setRoleFilter(""); setDeptFilter(""); setStatus(""); setPage(1); }}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {search || roleFilter || deptFilter || statusFilter ? "No staff match your filters" : "No staff yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {search || roleFilter || deptFilter || statusFilter ? "Try adjusting your filters." : "Add your first staff member."}
              </p>
              {!search && !roleFilter && !deptFilter && !statusFilter && (
                <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                  <Plus className="w-4 h-4 mr-2" /> Add Staff
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Staff Member", "Role", "Department", "Contact", "Work", "Status", "Joined", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((s) => {
                      const dept = departments.find((d) => d.id === s.departmentId);
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          {/* member */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {s.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{s.fullName}</div>
                                <div className="text-xs text-gray-400">{s.employeeCode || "—"}</div>
                                {s.designation && <div className="text-xs text-blue-500">{s.designation}</div>}
                              </div>
                            </div>
                          </td>

                          {/* role */}
                          <td className="px-5 py-4 whitespace-nowrap">{roleBadge(s.role)}</td>

                          {/* dept */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {dept ? (
                              <span className="text-sm text-gray-700">{dept.name}</span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Unassigned</span>
                            )}
                          </td>

                          {/* contact */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-1">
                              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{s.email}</span>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                {s.phone}
                              </div>
                            )}
                          </td>

                          {/* assigned work */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {s.assignedWork !== undefined && s.assignedWork > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                {s.assignedWork} tasks
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          {/* status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <button onClick={() => handleToggle(s)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                s.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}>
                              {s.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {s.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>

                          {/* joined */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fmtDate(s.joinedDate)}
                          </td>

                          {/* actions */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setSelected(s); setShowEdit(true); }}
                                className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleResetPwd(s)}
                                className="p-1.5 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors" title="Reset Password">
                                <Lock className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setSelected(s); setShowDelete(true); }}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Deactivate">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)} of {totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <span className="text-sm text-gray-700 px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* create */}
      {showCreate && (
        <StaffModal mode="create" departments={departments} onSave={handleCreate}
          onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* edit */}
      {showEdit && selected && (
        <StaffModal mode="edit" member={selected} departments={departments} onSave={handleUpdate}
          onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* password reset notification */}
      {showPwd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Password Reset</h3>
                <p className="text-sm text-gray-500 mt-0.5">{pwdInfo}</p>
              </div>
            </div>
            <Button onClick={() => { setShowPwd(false); setPwdInfo(""); }}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">Done</Button>
          </div>
        </div>
      )}

      {/* deactivate confirm */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Deactivate Staff</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Deactivate <strong>{selected.fullName}</strong>? They will lose portal access.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  setActionLoading(true);
                  await updateStaff(selected.id, { isActive: false });
                  await fetchAll();
                  setShowDelete(false);
                  setSelected(null);
                  setActionLoading(false);
                }}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
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
