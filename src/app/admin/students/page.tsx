"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Plus, Search, Edit, Trash2, Lock,
  Mail, Phone, Check, X, Eye, EyeOff, Copy,
  AlertCircle, Users, UserCheck, Clock, TrendingUp,
} from "lucide-react";
import {
  getAllUsers, createUser, updateUser, deleteUser,
  toggleUserStatus, resetUserPassword,
  type User, type CreateUserPayload, type UpdateUserPayload,
} from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(v: string | null | undefined) {
  if (!v) return "Never";
  return new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

// ─── Student Modal ────────────────────────────────────────────────────────────
interface ModalProps {
  mode: "create" | "edit";
  student?: User | null;
  onSave: (data: any) => void;
  onClose: () => void;
  loading: boolean;
}

function StudentModal({ mode, student, onSave, onClose, loading }: ModalProps) {
  const [form, setForm] = useState({
    fullName: student?.fullName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    employeeCode: student?.employeeCode || "",
    designation: student?.designation || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const clean: Record<string, any> = { role: "student" };
    Object.entries(form).forEach(([k, v]) => { if (v.trim()) clean[k] = v.trim(); });
    onSave(clean);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{mode === "create" ? "Add Student" : "Edit Student"}</h3>
              <p className="text-xs text-blue-200">{mode === "create" ? "Student login credentials will be emailed" : "Update student information"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="John Doe" className={`${inputCls} ${errors.fullName ? "border-red-500" : ""}`} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className={labelCls}>Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="student@example.com"
              className={`${inputCls} ${errors.email ? "border-red-500" : ""}`}
              readOnly={mode === "edit"} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            {mode === "edit" && <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>}
          </div>

          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="+977-98XXXXXXXX" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Student ID / Code</label>
            <input type="text" value={form.employeeCode} onChange={(e) => set("employeeCode", e.target.value)}
              placeholder="STU-001 (auto-generated if blank)" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Course / Program</label>
            <input type="text" value={form.designation} onChange={(e) => set("designation", e.target.value)}
              placeholder="e.g. Bachelor of IT" className={inputCls} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex gap-3">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Student" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [genPassword, setGenPassword] = useState("");
  const [pwdVisible, setPwdVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchStudents();
  }, [page, statusFilter]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const params: any = { role: "student", page, limit };
      if (statusFilter) params.isActive = statusFilter === "active";
      const res = await getAllUsers(params);
      // Backend returns: { success, meta, data: User[] }
      // The api.ts wrapper puts everything under res, so data is the array
      const raw = res as any;
      const list: User[] = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.data?.users)
        ? raw.data.users
        : [];
      setStudents(list);
      setTotalItems(raw.meta?.totalItems ?? raw.data?.total ?? list.length);
    } catch (e) { console.error(e); setStudents([]); }
    finally { setLoading(false); }
  }

  async function handleCreate(data: CreateUserPayload) {
    setActionLoading(true);
    try {
      const res = await createUser({ ...data, role: "student" });
      if (res.success && res.data) {
        const pwd = res.data.generatedPassword;
        if (pwd) { setGenPassword(pwd); setShowPwdModal(true); }
        setShowCreate(false);
        await fetchStudents();
      } else alert(res.message || "Failed to create student");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: UpdateUserPayload) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateUser(selected.id, data);
      if (res.success) { await fetchStudents(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteUser(selected.id);
      if (res.success) { await fetchStudents(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleToggle(s: User) {
    try {
      const res = await toggleUserStatus(s.id);
      if (res.success) await fetchStudents();
      else alert(res.message || "Failed to toggle status");
    } catch { alert("Network error"); }
  }

  async function handleResetPassword(s: User) {
    if (!confirm(`Reset password for ${s.fullName}?`)) return;
    try {
      const res = await resetUserPassword(s.id);
      if (res.success && res.data) { setGenPassword(res.data.newPassword); setShowPwdModal(true); }
      else alert(res.message || "Failed to reset password");
    } catch { alert("Network error"); }
  }

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.employeeCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || "").includes(search)
  );

  const activeCount = students.filter((s) => s.isActive).length;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage enrolled students and portal access</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalItems || students.length, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Active", value: activeCount, icon: UserCheck, color: "from-green-500 to-green-600" },
            { label: "Inactive", value: students.length - activeCount, icon: X, color: "from-gray-400 to-gray-500" },
            { label: "This Page", value: filtered.length, icon: GraduationCap, color: "from-purple-500 to-purple-600" },
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
                placeholder="Search by name, email, ID or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(search || statusFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}>
                Clear
              </Button>
            )}
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
              <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {search || statusFilter ? "No students match your filters" : "No students yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {search || statusFilter ? "Try adjusting your search or filters." : "Add your first student to get started."}
              </p>
              {!search && !statusFilter && (
                <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                  <Plus className="w-4 h-4 mr-2" /> Add Student
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Student", "Contact", "Program / Course", "Status", "Last Login", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        {/* Student */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                              {s.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{s.fullName}</div>
                              <div className="text-xs text-gray-400">{s.employeeCode || <span className="italic">No ID</span>}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{s.email}</span>
                          </div>
                          {s.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              {s.phone}
                            </div>
                          )}
                        </td>

                        {/* Program */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {s.designation || <span className="text-gray-400 italic text-xs">Not set</span>}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button onClick={() => handleToggle(s)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              s.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}>
                            {s.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {s.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {fmtDate(s.lastLogin)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setSelected(s); setShowEdit(true); }}
                              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleResetPassword(s)}
                              className="p-1.5 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors" title="Reset Password">
                              <Lock className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelected(s); setShowDelete(true); }}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)} of {totalItems} students
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700 px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <StudentModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* ── Edit Modal ── */}
      {showEdit && selected && (
        <StudentModal mode="edit" student={selected} onSave={handleUpdate} onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* ── Password Modal ── */}
      {showPwdModal && genPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Student Created</h3>
                <p className="text-xs text-gray-500 mt-0.5">Login credentials emailed to student.</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <div className="relative">
                <input type={pwdVisible ? "text" : "password"} value={genPassword} readOnly
                  className="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setPwdVisible((p) => !p)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    {pwdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(genPassword)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Save this — it cannot be retrieved later.</p>
            </div>
            <Button onClick={() => { setShowPwdModal(false); setGenPassword(""); setPwdVisible(false); }}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">Done</Button>
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
                <h3 className="font-semibold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>{selected.fullName}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Deleting..." : "Delete Student"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
