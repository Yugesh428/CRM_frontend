"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Plus, Search, Edit, Trash2, Eye,
  Clock, CheckCircle, XCircle, AlertCircle,
  Users, BookOpen, Building2, Filter, ChevronDown,
} from "lucide-react";
import {
  getAllIntakes, createIntake, updateIntake, deleteIntake,
  getAllUniversities, getAllCourses,
  type Intake, type University, type Course,
} from "@/lib/api";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  upcoming:     { label: "Upcoming",     color: "bg-blue-100 text-blue-700",    icon: Clock },
  open:         { label: "Open",         color: "bg-green-100 text-green-700",  icon: CheckCircle },
  closing_soon: { label: "Closing Soon", color: "bg-orange-100 text-orange-700",icon: AlertCircle },
  closed:       { label: "Closed",       color: "bg-gray-100 text-gray-600",    icon: XCircle },
  cancelled:    { label: "Cancelled",    color: "bg-red-100 text-red-700",      icon: XCircle },
  full:         { label: "Full",         color: "bg-purple-100 text-purple-700",icon: Users },
};

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

// ─── Modal ────────────────────────────────────────────────────────────────────
function IntakeModal({
  mode, intake, universities, courses, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  intake?: Intake | null;
  universities: University[];
  courses: Course[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    universityId:        intake?.universityId || "",
    courseId:            intake?.courseId || "",
    campusId:            intake?.campusId || "",
    month:               intake?.month || "january",
    year:                intake?.year || new Date().getFullYear() + 1,
    courseStartDate:     intake?.courseStartDate?.split("T")[0] || "",
    courseEndDate:       intake?.courseEndDate?.split("T")[0] || "",
    applicationOpensDate: intake?.applicationOpensDate?.split("T")[0] || "",
    applicationDeadline: intake?.applicationDeadline?.split("T")[0] || "",
    orientationDate:     intake?.orientationDate?.split("T")[0] || "",
    totalSeats:          intake?.totalSeats || "",
    availableSeats:      intake?.availableSeats || "",
    status:              intake?.status || "upcoming",
    notes:               intake?.notes || "",
    isFeatured:          intake?.isFeatured || false,
    isActive:            intake?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  // Filter courses by selected university
  const filteredCourses = courses.filter(c => c.universityId === form.universityId);

  function validate() {
    const err: Record<string, string> = {};
    if (!form.universityId) err.universityId = "Required";
    if (!form.courseId) err.courseId = "Required";
    if (!form.month) err.month = "Required";
    if (!form.year) err.year = "Required";
    if (!form.courseStartDate) err.courseStartDate = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: any = { ...form };

    // Generate label automatically
    payload.label = `${payload.month.charAt(0).toUpperCase() + payload.month.slice(1)} ${payload.year}`;

    // Convert numeric fields
    if (payload.totalSeats) payload.totalSeats = parseInt(payload.totalSeats);
    else delete payload.totalSeats;

    if (payload.availableSeats) payload.availableSeats = parseInt(payload.availableSeats);
    else delete payload.availableSeats;

    if (payload.year) payload.year = parseInt(payload.year);

    // Remove empty strings
    Object.keys(payload).forEach(key => {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (payload.campusId === "") delete payload.campusId;

    onSave(payload);
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-3xl w-full my-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1e3a8a]" />
            {mode === "create" ? "Add New Intake" : "Edit Intake"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* body */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* University & Course */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Link to Course</p>
            </div>

            <div>
              <label className={lbl}>University *</label>
              <select value={form.universityId} onChange={(e) => { set("universityId", e.target.value); set("courseId", ""); }} className={inp}>
                <option value="">Select University</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
            </div>

            <div>
              <label className={lbl}>Course *</label>
              <select value={form.courseId} onChange={(e) => set("courseId", e.target.value)} className={inp} disabled={!form.universityId}>
                <option value="">Select Course</option>
                {filteredCourses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
              {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
              {form.universityId && filteredCourses.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">No courses found for this university</p>
              )}
            </div>

            {/* Intake Period */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Intake Period</p>
            </div>

            <div>
              <label className={lbl}>Month *</label>
              <select value={form.month} onChange={(e) => set("month", e.target.value)} className={inp}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
              {errors.month && <p className="text-xs text-red-500 mt-1">{errors.month}</p>}
            </div>

            <div>
              <label className={lbl}>Year *</label>
              <select value={form.year} onChange={(e) => set("year", e.target.value)} className={inp}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
            </div>

            {/* Dates */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Important Dates</p>
            </div>

            <div>
              <label className={lbl}>Course Start Date *</label>
              <input type="date" value={form.courseStartDate} onChange={(e) => set("courseStartDate", e.target.value)} className={inp} />
              {errors.courseStartDate && <p className="text-xs text-red-500 mt-1">{errors.courseStartDate}</p>}
            </div>

            <div>
              <label className={lbl}>Course End Date</label>
              <input type="date" value={form.courseEndDate} onChange={(e) => set("courseEndDate", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Application Opens</label>
              <input type="date" value={form.applicationOpensDate} onChange={(e) => set("applicationOpensDate", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Application Deadline</label>
              <input type="date" value={form.applicationDeadline} onChange={(e) => set("applicationDeadline", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Orientation Date</label>
              <input type="date" value={form.orientationDate} onChange={(e) => set("orientationDate", e.target.value)} className={inp} />
            </div>

            {/* Capacity */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Capacity</p>
            </div>

            <div>
              <label className={lbl}>Total Seats</label>
              <input type="number" min="0" value={form.totalSeats} onChange={(e) => set("totalSeats", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Available Seats</label>
              <input type="number" min="0" value={form.availableSeats} onChange={(e) => set("availableSeats", e.target.value)} className={inp} />
            </div>

            {/* Status & Flags */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Status & Flags</p>
            </div>

            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">Featured</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inp} placeholder="Any additional information..." />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Intake" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IntakesPage() {
  const router = useRouter();

  const [intakes, setIntakes]         = useState<Intake[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [uniFilter, setUniFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter]   = useState("");

  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [selected, setSelected]       = useState<Intake | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [intakeRes, uniRes, courseRes] = await Promise.all([
        getAllIntakes({ limit: 500 }),
        getAllUniversities({ limit: 200 }),
        getAllCourses({ limit: 500 }),
      ]);
      if (intakeRes.success) setIntakes(Array.isArray(intakeRes.data) ? intakeRes.data : []);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) {
        const cData = Array.isArray(courseRes.data) ? courseRes.data : [];
        setCourses(cData);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = intakes.filter((i) => {
    if (search) {
      const s = search.toLowerCase();
      if (!i.course?.name?.toLowerCase().includes(s) &&
          !i.university?.name?.toLowerCase().includes(s) &&
          !i.label?.toLowerCase().includes(s)) return false;
    }
    if (uniFilter && i.universityId !== uniFilter) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (monthFilter && i.month !== monthFilter) return false;
    if (yearFilter && i.year !== parseInt(yearFilter)) return false;
    return true;
  });

  async function handleCreate(data: Partial<Intake>) {
    setActionLoading(true);
    try {
      const res = await createIntake(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create intake");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: Partial<Intake>) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateIntake(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update intake");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteIntake(selected.id);
      if (res.success) { await fetchAll(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete intake");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intakes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "intake" : "intakes"} found
            </p>
          </div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Intake
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course or university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
            <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Universities</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Months</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || uniFilter || statusFilter || monthFilter || yearFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setUniFilter(""); setStatusFilter(""); setMonthFilter(""); setYearFilter(""); }}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || statusFilter || monthFilter || yearFilter ? "No intakes match your filters" : "No intakes yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || statusFilter || monthFilter || yearFilter ? "Try adjusting your search." : "Add your first intake to get started."}
            </p>
            {!search && !uniFilter && !statusFilter && !monthFilter && !yearFilter && (
              <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Intake
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Intake</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Start Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Application Deadline</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Seats</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((intake, idx) => {
                    const statusConf = STATUS_CONFIG[intake.status] || STATUS_CONFIG.upcoming;
                    const StatusIcon = statusConf.icon;
                    const isDeadlineSoon = intake.applicationDeadline &&
                      new Date(intake.applicationDeadline) > new Date() &&
                      (new Date(intake.applicationDeadline).getTime() - Date.now()) < 14 * 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={intake.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
                            <div>
                              <div className="font-bold text-gray-900">
                                {intake.label || `${intake.month.charAt(0).toUpperCase() + intake.month.slice(1)} ${intake.year}`}
                              </div>
                              {intake.isFeatured && (
                                <div className="text-xs text-yellow-600 font-medium">★ Featured</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{intake.university?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{intake.course?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {intake.courseStartDate
                            ? new Date(intake.courseStartDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {intake.applicationDeadline ? (
                            <span className={`font-medium ${isDeadlineSoon ? "text-red-600" : "text-gray-700"}`}>
                              {isDeadlineSoon && "⚠️ "}
                              {new Date(intake.applicationDeadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
                          {intake.totalSeats !== undefined && intake.totalSeats > 0
                            ? `${intake.availableSeats ?? intake.totalSeats} / ${intake.totalSeats}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/intakes/${intake.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelected(intake); setShowEdit(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelected(intake); setShowDelete(true); }}
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

      {/* Create Modal */}
      {showCreate && (
        <IntakeModal mode="create" universities={universities} courses={courses}
          onSave={handleCreate} onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <IntakeModal mode="edit" intake={selected} universities={universities} courses={courses}
          onSave={handleUpdate} onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Intake</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the <strong>{selected.label}</strong> intake for <strong>{selected.course?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null); }} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
