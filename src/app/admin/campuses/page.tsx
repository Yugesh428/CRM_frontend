"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Plus, Search, Edit, Trash2, Building2,
  Users, GraduationCap, Phone, Mail, Globe, Eye,
  CheckCircle, Clock, Hammer, XCircle, X, AlertCircle,
} from "lucide-react";
import {
  getAllCampuses, createCampus, updateCampus, deleteCampus,
  toggleCampusStatus, getAllUniversities,
  type Campus, type University,
} from "@/lib/api";

// ─── config ──────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  main:      { label: "Main",      color: "bg-blue-100 text-blue-700" },
  branch:    { label: "Branch",    color: "bg-purple-100 text-purple-700" },
  satellite: { label: "Satellite", color: "bg-indigo-100 text-indigo-700" },
  online:    { label: "Online",    color: "bg-cyan-100 text-cyan-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:               { label: "Active",               color: "bg-green-100 text-green-700", icon: CheckCircle },
  inactive:             { label: "Inactive",              color: "bg-gray-100 text-gray-600",   icon: XCircle },
  under_construction:   { label: "Under Construction",   color: "bg-amber-100 text-amber-700",  icon: Hammer },
  temporarily_closed:   { label: "Temporarily Closed",   color: "bg-red-100 text-red-700",      icon: Clock },
};

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";
const sectionTitle = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-2";

const FACILITY_OPTIONS = ["Library", "Gym", "Lab", "Cafeteria", "Hostel", "Sports Complex", "Auditorium", "Wi-Fi Campus", "Parking", "Medical Center"];
const INTAKE_OPTIONS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function cap(s: string) {
  return s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Campus Modal ─────────────────────────────────────────────────────────────
function CampusModal({
  mode, campus, universities, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  campus?: Campus | null;
  universities: University[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name:            campus?.name || "",
    universityId:    campus?.universityId || "",
    campusType:      campus?.campusType || "main",
    status:          campus?.status || "active",
    address:         campus?.address || "",
    city:            campus?.city || "",
    state:           campus?.state || "",
    country:         campus?.country || "",
    postalCode:      campus?.postalCode || "",
    phone:           campus?.phone || "",
    email:           campus?.email || "",
    website:         campus?.website || "",
    description:     campus?.description || "",
    establishedYear: campus?.establishedYear || "",
    totalArea:       campus?.totalArea || "",
    totalStudents:   campus?.totalStudents || "",
    totalFaculty:    campus?.totalFaculty || "",
    imageUrl:        campus?.imageUrl || "",
    mapUrl:          campus?.mapUrl || "",
    facilities:      campus?.facilities || [] as string[],
    intakes:         campus?.intakes || [] as string[],
    availableDepartments: campus?.availableDepartments || [] as string[],
  });
  const [deptInput, setDeptInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  function toggleArr(field: "facilities" | "intakes", val: string) {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((x) => x !== val) : [...p[field], val],
    }));
  }

  function addDept() {
    const v = deptInput.trim();
    if (v && !form.availableDepartments.includes(v)) {
      setForm((p) => ({ ...p, availableDepartments: [...p.availableDepartments, v] }));
    }
    setDeptInput("");
  }

  function removeDept(d: string) {
    setForm((p) => ({ ...p, availableDepartments: p.availableDepartments.filter((x) => x !== d) }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Campus name is required";
    if (!form.universityId) e.universityId = "University is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Record<string, any> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) { if (v.length) payload[k] = v; }
      else if (v !== "") payload[k] = v;
    });
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{mode === "create" ? "Add Campus" : "Edit Campus"}</h3>
              <p className="text-xs text-blue-200">{mode === "create" ? "Create a new campus listing" : "Update campus details"}</p>
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
              <label className={lbl}>Campus Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Main Campus" className={`${inp} ${errors.name ? "border-red-400" : ""}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>University <span className="text-red-500">*</span></label>
              <select value={form.universityId} onChange={(e) => set("universityId", e.target.value)}
                className={`${inp} ${errors.universityId ? "border-red-400" : ""}`}>
                <option value="">— Select University —</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
            </div>

            <div>
              <label className={lbl}>Campus Type</label>
              <select value={form.campusType} onChange={(e) => set("campusType", e.target.value)} className={inp}>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <p className={sectionTitle}>Location</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={lbl}>Address <span className="text-red-500">*</span></label>
              <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
                placeholder="Street address" className={`${inp} ${errors.address ? "border-red-400" : ""}`} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className={lbl}>City</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inp} />
            </div>
            <div>
              <label className={lbl}>State / Province</label>
              <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="State" className={inp} />
            </div>
            <div>
              <label className={lbl}>Country</label>
              <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Country" className={inp} />
            </div>
            <div>
              <label className={lbl}>Postal Code</label>
              <input type="text" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="e.g. 3000" className={inp} />
            </div>
          </div>

          <p className={sectionTitle}>Contact</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+61 3 XXXX XXXX" className={inp} />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="campus@university.edu" className={inp} />
            </div>
            <div className="md:col-span-2">
              <label className={lbl}>Website</label>
              <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." className={inp} />
            </div>
          </div>

          <p className={sectionTitle}>Campus Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Established Year</label>
              <input type="number" value={form.establishedYear} onChange={(e) => set("establishedYear", e.target.value)} placeholder="e.g. 1990" className={inp} />
            </div>
            <div>
              <label className={lbl}>Total Area</label>
              <input type="text" value={form.totalArea} onChange={(e) => set("totalArea", e.target.value)} placeholder="e.g. 50 acres" className={inp} />
            </div>
            <div>
              <label className={lbl}>Total Students</label>
              <input type="number" value={form.totalStudents} onChange={(e) => set("totalStudents", e.target.value)} placeholder="e.g. 12000" className={inp} />
            </div>
            <div>
              <label className={lbl}>Total Faculty</label>
              <input type="number" value={form.totalFaculty} onChange={(e) => set("totalFaculty", e.target.value)} placeholder="e.g. 450" className={inp} />
            </div>
            <div>
              <label className={lbl}>Image URL</label>
              <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." className={inp} />
            </div>
            <div>
              <label className={lbl}>Map URL</label>
              <input type="url" value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} placeholder="Google Maps embed URL" className={inp} />
            </div>
            <div className="md:col-span-2">
              <label className={lbl}>Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
                placeholder="Brief description of this campus..." className={inp} />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className={lbl}>Facilities</label>
            <div className="flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map((f) => (
                <button key={f} type="button" onClick={() => toggleArr("facilities", f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.facilities.includes(f) ? "bg-[#1e3a8a] text-white border-[#1e3a8a]" : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a8a]"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Intakes */}
          <div>
            <label className={lbl}>Intakes</label>
            <div className="flex flex-wrap gap-2">
              {INTAKE_OPTIONS.map((i) => (
                <button key={i} type="button" onClick={() => toggleArr("intakes", i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors ${
                    form.intakes.includes(i) ? "bg-[#1e3a8a] text-white border-[#1e3a8a]" : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a8a]"
                  }`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className={lbl}>Available Departments</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={deptInput} onChange={(e) => setDeptInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDept())}
                placeholder="e.g. Engineering (press Enter)" className={`${inp} flex-1`} />
              <Button variant="outline" size="sm" type="button" onClick={addDept}>Add</Button>
            </div>
            {form.availableDepartments.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.availableDepartments.map((d) => (
                  <span key={d} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    {d}
                    <button onClick={() => removeDept(d)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Campus" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CampusesPage() {
  const router = useRouter();

  const [campuses, setCampuses]       = useState<Campus[]>([]);
  const [universities, setUnis]       = useState<University[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [uniFilter, setUniFilter]     = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [selected, setSelected]       = useState<Campus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, [uniFilter, typeFilter, statusFilter]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [campusRes, uniRes] = await Promise.all([
        getAllCampuses({
          universityId: uniFilter || undefined,
          campusType: typeFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
          limit: 100,
        }),
        getAllUniversities({ limit: 200 }),
      ]);
      if (campusRes.success) setCampuses(Array.isArray(campusRes.data) ? campusRes.data : []);
      if (uniRes.success) setUnis(Array.isArray(uniRes.data) ? uniRes.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(data: Partial<Campus>) {
    setActionLoading(true);
    try {
      const res = await createCampus(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: Partial<Campus>) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateCampus(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteCampus(selected.id);
      if (res.success) { await fetchAll(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleToggle(c: Campus) {
    try {
      const res = await toggleCampusStatus(c.id);
      if (res.success) await fetchAll();
      else alert(res.message || "Failed to toggle");
    } catch { alert("Network error"); }
  }

  const filtered = campuses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city || "").toLowerCase().includes(q) ||
      (c.country || "").toLowerCase().includes(q) ||
      (c.university?.name || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: campuses.length,
    active: campuses.filter((c) => c.status === "active").length,
    totalStudents: campuses.reduce((a, c) => a + (c.totalStudents || 0), 0),
    universities: new Set(campuses.map((c) => c.universityId)).size,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campuses</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage university campus locations</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" /> Add Campus
          </Button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Campuses", value: stats.total,          icon: MapPin,        color: "from-blue-500 to-blue-600" },
            { label: "Active",         value: stats.active,          icon: CheckCircle,   color: "from-green-500 to-green-600" },
            { label: "Universities",   value: stats.universities,    icon: Building2,     color: "from-purple-500 to-purple-600" },
            { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
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

        {/* filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name, city, country..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
            </div>
            <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Universities</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || uniFilter || typeFilter || statusFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setUniFilter(""); setTypeFilter(""); setStatusFilter(""); }}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || typeFilter || statusFilter ? "No campuses match your filters" : "No campuses yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || typeFilter || statusFilter ? "Try adjusting your search." : "Add your first campus to get started."}
            </p>
            {!search && !uniFilter && !typeFilter && !statusFilter && (
              <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Campus
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Campus</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Location</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Students</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Faculty</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Facilities</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((campus, idx) => {
                    const StatusIcon = STATUS_CONFIG[campus.status]?.icon || Clock;
                    return (
                      <tr
                        key={campus.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {campus.imageUrl ? (
                              <img src={campus.imageUrl} alt={campus.name} className="w-9 h-9 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">{campus.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{campus.university?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {campus.city}{campus.city && campus.country ? ", " : ""}{campus.country}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="secondary" className={TYPE_CONFIG[campus.campusType]?.color}>
                            {TYPE_CONFIG[campus.campusType]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap font-semibold text-gray-900">
                          {campus.totalStudents ? campus.totalStudents.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap font-semibold text-gray-900">
                          {campus.totalFaculty || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {campus.facilities && campus.facilities.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {campus.facilities.slice(0, 2).map((f) => (
                                <span key={f} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{f}</span>
                              ))}
                              {campus.facilities.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">+{campus.facilities.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${STATUS_CONFIG[campus.status]?.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_CONFIG[campus.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/campuses/${campus.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelected(campus); setShowEdit(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelected(campus); setShowDelete(true); }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* create */}
      {showCreate && (
        <CampusModal mode="create" universities={universities} onSave={handleCreate}
          onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* edit */}
      {showEdit && selected && (
        <CampusModal mode="edit" campus={selected} universities={universities} onSave={handleUpdate}
          onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* delete confirm */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Campus</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Delete <strong>{selected.name}</strong>? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
