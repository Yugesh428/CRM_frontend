"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Plus, Search, Edit, Trash2,
  Users, Check, X, Building2, UserCheck,
  AlertCircle, ChevronRight, BarChart3,
} from "lucide-react";
import {
  getAllDepartments, createDepartment, updateDepartment,
  deleteDepartment, getDepartmentStatistics, getUsersByRole,
  type Department, type CreateDepartmentPayload, type UpdateDepartmentPayload,
} from "@/lib/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

// ─── Department Modal ─────────────────────────────────────────────────────────
function DepartmentModal({
  mode, dept, staff, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  dept?: Department | null;
  staff: any[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: dept?.name || "",
    code: dept?.code || "",
    description: dept?.description || "",
    departmentHeadId: dept?.departmentHeadId || "",
    status: dept?.status || "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.code.trim()) e.code = "Code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: any = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      status: form.status,
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.departmentHeadId) payload.departmentHeadId = form.departmentHeadId;
    else payload.departmentHeadId = null;
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
        {/* header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {mode === "create" ? "New Department" : "Edit Department"}
              </h3>
              <p className="text-xs text-blue-200">
                {mode === "create" ? "Create a new department" : "Update department details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Counseling Department"
                className={`${inputCls} ${errors.name ? "border-red-400" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className={labelCls}>
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="e.g. CNS"
                maxLength={10}
                className={`${inputCls} font-mono ${errors.code ? "border-red-400" : ""}`}
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Department Head</label>
            <select
              value={form.departmentHeadId}
              onChange={(e) => set("departmentHeadId", e.target.value)}
              className={inputCls}
            >
              <option value="">— None —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}{s.employeeCode ? ` (${s.employeeCode})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of this department..."
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Department" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, [statusFilter]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [deptRes, statsRes, staffRes] = await Promise.all([
        getAllDepartments({ status: statusFilter || undefined, search: search || undefined }),
        getDepartmentStatistics(),
        getAllUsers(),
      ]);
      if (deptRes.success) setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      if (statsRes.success) setStats(statsRes.data);
      if (staffRes.success) {
        const list = Array.isArray((staffRes as any).data)
          ? (staffRes as any).data
          : [];
        setStaff(list.filter((u: any) => u.role !== "student"));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(data: CreateDepartmentPayload) {
    setActionLoading(true);
    try {
      const res = await createDepartment(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: UpdateDepartmentPayload) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateDepartment(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    setDeleteError("");
    try {
      const res = await deleteDepartment(selected.id);
      if (res.success) {
        await fetchAll();
        setShowDelete(false);
        setSelected(null);
      } else {
        setDeleteError(res.message || "Failed to delete");
      }
    } catch { setDeleteError("Network error"); }
    finally { setActionLoading(false); }
  }

  // client-side search filter
  const filtered = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Organise your staff into departments
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[#1e3a8a] hover:bg-[#1e40af]"
          >
            <Plus className="w-4 h-4 mr-2" /> New Department
          </Button>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total",
                value: stats.totalDepartments,
                icon: Building2,
                color: "from-blue-500 to-blue-600",
              },
              {
                label: "Active",
                value: stats.activeDepartments,
                icon: Check,
                color: "from-green-500 to-green-600",
              },
              {
                label: "Inactive",
                value: stats.inactiveDepartments,
                icon: X,
                color: "from-gray-400 to-gray-500",
              },
              {
                label: "Largest",
                value: stats.largestDepartment
                  ? `${stats.largestDepartment.staffCount} staff`
                  : "—",
                sub: stats.largestDepartment?.name,
                icon: BarChart3,
                color: "from-purple-500 to-purple-600",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-4 overflow-hidden relative">
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-full`}
                  />
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  {s.sub && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{s.sub}</p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Filters ── */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(search || statusFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setStatusFilter(""); }}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || statusFilter ? "No departments match your filters" : "No departments yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || statusFilter
                ? "Try adjusting your search."
                : "Create your first department to organise your team."}
            </p>
            {!search && !statusFilter && (
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-[#1e3a8a] hover:bg-[#1e40af]"
              >
                <Plus className="w-4 h-4 mr-2" /> New Department
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((dept) => (
              <Card
                key={dept.id}
                className="p-5 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                {/* status strip */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
                    dept.status === "active" ? "bg-green-400" : "bg-gray-300"
                  }`}
                />

                <div className="pl-2">
                  {/* top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {dept.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {dept.name}
                        </h3>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-mono rounded">
                          {dept.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        dept.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {dept.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* description */}
                  {dept.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {dept.description}
                    </p>
                  )}

                  {/* stats row */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{dept.staffCount ?? (dept.staff?.length ?? 0)}</span>
                      <span className="text-gray-400 text-xs">staff</span>
                    </div>
                  </div>

                  {/* department head */}
                  {dept.departmentHead ? (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {dept.departmentHead.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {dept.departmentHead.fullName}
                        </p>
                        <p className="text-xs text-gray-400">Department Head</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-600">No head assigned</p>
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => { setSelected(dept); setShowEdit(true); }}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 text-xs"
                      onClick={() => {
                        setSelected(dept);
                        setDeleteError("");
                        setShowDelete(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <DepartmentModal
          mode="create"
          staff={staff}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          loading={actionLoading}
        />
      )}

      {/* ── Edit Modal ── */}
      {showEdit && selected && (
        <DepartmentModal
          mode="edit"
          dept={selected}
          staff={staff}
          onSave={handleUpdate}
          onClose={() => { setShowEdit(false); setSelected(null); }}
          loading={actionLoading}
        />
      )}

      {/* ── Delete Confirm ── */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Department</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Delete <strong>{selected.name}</strong>? This cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowDelete(false); setSelected(null); setDeleteError(""); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// tiny shim so the page can reuse getAllUsers without a full re-import cycle
async function getAllUsers() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/users?limit=200`,
    { headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
  );
  return res.json();
}
