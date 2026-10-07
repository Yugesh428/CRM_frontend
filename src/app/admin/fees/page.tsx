"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Plus, Search, Edit, Trash2, Eye,
  CheckCircle, Clock, XCircle, FileText,
  BookOpen, Building2, Filter, Calendar,
} from "lucide-react";
import {
  getAllFees, createFee, updateFee, deleteFee,
  getAllUniversities, getAllCourses, getAllIntakes,
  type Fee, type University, type Course, type Intake,
} from "@/lib/api";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  current:  { label: "Current",  color: "bg-green-100 text-green-700",  icon: CheckCircle },
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700",    icon: Clock },
  expired:  { label: "Expired",  color: "bg-gray-100 text-gray-600",    icon: XCircle },
  draft:    { label: "Draft",    color: "bg-amber-100 text-amber-700",  icon: FileText },
};

const PERIOD_CONFIG: Record<string, string> = {
  per_year: "Per Year",
  per_semester: "Per Semester",
  per_trimester: "Per Trimester",
  per_credit: "Per Credit",
  total_course: "Total Course",
};

const CURRENCIES = ["AUD", "USD", "GBP", "CAD", "NZD", "EUR", "JPY", "SGD", "INR", "NPR", "OTHER"];

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

function fmt(amount?: number, currency?: string) {
  if (amount === undefined || amount === null) return "—";
  return `${currency || ""} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function FeeModal({
  mode, fee, universities, courses, intakes, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  fee?: Fee | null;
  universities: University[];
  courses: Course[];
  intakes: Intake[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    universityId:          fee?.universityId || "",
    courseId:               fee?.courseId || "",
    campusId:               fee?.campusId || "",
    intakeId:               fee?.intakeId || "",
    academicYear:           fee?.academicYear || new Date().getFullYear().toString(),
    tuitionFee:             fee?.tuitionFee ?? "",
    feePeriod:              fee?.feePeriod || "per_year",
    currency:               fee?.currency || "AUD",
    applicationFee:         fee?.applicationFee ?? "",
    deposit:                fee?.deposit ?? "",
    enrollmentFee:          fee?.enrollmentFee ?? "",
    registrationFee:        fee?.registrationFee ?? "",
    insuranceFee:           fee?.insuranceFee ?? "",
    studentServicesFee:     fee?.studentServicesFee ?? "",
    materialFee:            fee?.materialFee ?? "",
    technologyFee:          fee?.technologyFee ?? "",
    otherFees:              fee?.otherFees ?? "",
    otherFeesDescription:   fee?.otherFeesDescription || "",
    estimatedLivingCost:    fee?.estimatedLivingCost ?? "",
    feeNotes:               fee?.feeNotes || "",
    gstIncluded:            fee?.gstIncluded || false,
    gstPercentage:          fee?.gstPercentage ?? "",
    effectiveFrom:          fee?.effectiveFrom?.split("T")[0] || "",
    effectiveUntil:         fee?.effectiveUntil?.split("T")[0] || "",
    status:                 fee?.status || "current",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  const filteredCourses = courses.filter(c => c.universityId === form.universityId);
  const filteredIntakes = intakes.filter(i => i.courseId === form.courseId);

  function validate() {
    const err: Record<string, string> = {};
    if (!form.universityId) err.universityId = "Required";
    if (!form.courseId) err.courseId = "Required";
    if (!form.academicYear.trim()) err.academicYear = "Required";
    if (!form.tuitionFee && form.tuitionFee !== 0) err.tuitionFee = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: any = { ...form };

    const numFields = [
      "tuitionFee", "applicationFee", "deposit", "enrollmentFee", "registrationFee",
      "insuranceFee", "studentServicesFee", "materialFee", "technologyFee",
      "otherFees", "estimatedLivingCost", "gstPercentage",
    ];
    numFields.forEach((f) => {
      if (payload[f] !== "" && payload[f] !== undefined && payload[f] !== null) {
        payload[f] = parseFloat(payload[f]);
      } else {
        delete payload[f];
      }
    });

    // Remove empty strings
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1e3a8a]" />
            {mode === "create" ? "Add New Fee Record" : "Edit Fee Record"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* body */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Link */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Link to Course</p>
            </div>

            <div>
              <label className={lbl}>University *</label>
              <select value={form.universityId} onChange={(e) => { set("universityId", e.target.value); set("courseId", ""); set("intakeId", ""); }} className={inp}>
                <option value="">Select University</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
            </div>

            <div>
              <label className={lbl}>Course *</label>
              <select value={form.courseId} onChange={(e) => { set("courseId", e.target.value); set("intakeId", ""); }} className={inp} disabled={!form.universityId}>
                <option value="">Select Course</option>
                {filteredCourses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
              {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
            </div>

            <div>
              <label className={lbl}>Intake (Optional)</label>
              <select value={form.intakeId} onChange={(e) => set("intakeId", e.target.value)} className={inp} disabled={!form.courseId}>
                <option value="">All Intakes</option>
                {filteredIntakes.map((i) => <option key={i.id} value={i.id}>{i.label || `${i.month} ${i.year}`}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Academic Year *</label>
              <input type="text" placeholder="e.g. 2027 or 2026-27" value={form.academicYear} onChange={(e) => set("academicYear", e.target.value)} className={inp} />
              {errors.academicYear && <p className="text-xs text-red-500 mt-1">{errors.academicYear}</p>}
            </div>

            {/* Core Fees */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Core Fees</p>
            </div>

            <div>
              <label className={lbl}>Tuition Fee *</label>
              <input type="number" step="0.01" value={form.tuitionFee} onChange={(e) => set("tuitionFee", e.target.value)} className={inp} />
              {errors.tuitionFee && <p className="text-xs text-red-500 mt-1">{errors.tuitionFee}</p>}
            </div>

            <div>
              <label className={lbl}>Currency *</label>
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inp}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Fee Period</label>
              <select value={form.feePeriod} onChange={(e) => set("feePeriod", e.target.value)} className={inp}>
                {Object.entries(PERIOD_CONFIG).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Application Fee</label>
              <input type="number" step="0.01" value={form.applicationFee} onChange={(e) => set("applicationFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Deposit</label>
              <input type="number" step="0.01" value={form.deposit} onChange={(e) => set("deposit", e.target.value)} className={inp} />
            </div>

            {/* Additional Fees */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Additional Fees</p>
            </div>

            <div>
              <label className={lbl}>Enrollment Fee</label>
              <input type="number" step="0.01" value={form.enrollmentFee} onChange={(e) => set("enrollmentFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Registration Fee</label>
              <input type="number" step="0.01" value={form.registrationFee} onChange={(e) => set("registrationFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Insurance Fee</label>
              <input type="number" step="0.01" value={form.insuranceFee} onChange={(e) => set("insuranceFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Student Services Fee</label>
              <input type="number" step="0.01" value={form.studentServicesFee} onChange={(e) => set("studentServicesFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Material Fee</label>
              <input type="number" step="0.01" value={form.materialFee} onChange={(e) => set("materialFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Technology Fee</label>
              <input type="number" step="0.01" value={form.technologyFee} onChange={(e) => set("technologyFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Other Fees</label>
              <input type="number" step="0.01" value={form.otherFees} onChange={(e) => set("otherFees", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Other Fees Description</label>
              <input type="text" value={form.otherFeesDescription} onChange={(e) => set("otherFeesDescription", e.target.value)} className={inp} />
            </div>

            {/* Living Cost & GST */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Living Cost & Tax</p>
            </div>

            <div>
              <label className={lbl}>Estimated Living Cost (per year)</label>
              <input type="number" step="0.01" value={form.estimatedLivingCost} onChange={(e) => set("estimatedLivingCost", e.target.value)} className={inp} />
            </div>

            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer mb-2.5">
                <input type="checkbox" checked={form.gstIncluded} onChange={(e) => set("gstIncluded", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">GST Included</span>
              </label>
              {form.gstIncluded && (
                <input type="number" step="0.01" placeholder="GST %" value={form.gstPercentage} onChange={(e) => set("gstPercentage", e.target.value)} className={inp} />
              )}
            </div>

            {/* Validity & Status */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Validity & Status</p>
            </div>

            <div>
              <label className={lbl}>Effective From</label>
              <input type="date" value={form.effectiveFrom} onChange={(e) => set("effectiveFrom", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Effective Until</label>
              <input type="date" value={form.effectiveUntil} onChange={(e) => set("effectiveUntil", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Fee Notes</label>
              <textarea rows={3} value={form.feeNotes} onChange={(e) => set("feeNotes", e.target.value)} className={inp} placeholder="Any additional notes about this fee structure..." />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Fee Record" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeesPage() {
  const router = useRouter();

  const [fees, setFees]               = useState<Fee[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [intakes, setIntakes]         = useState<Intake[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [uniFilter, setUniFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");

  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [selected, setSelected]       = useState<Fee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [feeRes, uniRes, courseRes, intakeRes] = await Promise.all([
        getAllFees({ limit: 500 }),
        getAllUniversities({ limit: 200 }),
        getAllCourses({ limit: 500 }),
        getAllIntakes({ limit: 500 }),
      ]);
      if (feeRes.success) setFees(Array.isArray(feeRes.data) ? feeRes.data : []);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      if (intakeRes.success) setIntakes(Array.isArray(intakeRes.data) ? intakeRes.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = fees.filter((f) => {
    if (search) {
      const s = search.toLowerCase();
      if (!f.course?.name?.toLowerCase().includes(s) &&
          !f.university?.name?.toLowerCase().includes(s) &&
          !f.academicYear?.toLowerCase().includes(s)) return false;
    }
    if (uniFilter && f.universityId !== uniFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    if (currencyFilter && f.currency !== currencyFilter) return false;
    return true;
  });

  async function handleCreate(data: Partial<Fee>) {
    setActionLoading(true);
    try {
      const res = await createFee(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create fee record");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: Partial<Fee>) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateFee(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update fee record");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteFee(selected.id);
      if (res.success) { await fetchAll(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete fee record");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "fee record" : "fee records"} found
            </p>
          </div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Fee Record
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
                placeholder="Search by course, university, or year..."
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
            <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Currencies</option>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || uniFilter || statusFilter || currencyFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setUniFilter(""); setStatusFilter(""); setCurrencyFilter(""); }}>
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
            <DollarSign className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || statusFilter || currencyFilter ? "No fee records match your filters" : "No fee records yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || statusFilter || currencyFilter ? "Try adjusting your search." : "Add your first fee record to get started."}
            </p>
            {!search && !uniFilter && !statusFilter && !currencyFilter && (
              <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Fee Record
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Tuition Fee</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Academic Year</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Fee Period</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Application Fee</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Deposit</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Est. Total Cost</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((fee, idx) => {
                    const statusConf = STATUS_CONFIG[fee.status] || STATUS_CONFIG.current;
                    const StatusIcon = statusConf.icon;

                    return (
                      <tr
                        key={fee.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            <DollarSign className="w-3.5 h-3.5 text-[#1e3a8a]" />
                            {fmt(fee.tuitionFee, fee.currency)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{fee.university?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{fee.course?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fee.academicYear}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{PERIOD_CONFIG[fee.feePeriod]}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {fee.applicationFee ? fmt(fee.applicationFee, fee.currency) : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {fee.deposit ? fmt(fee.deposit, fee.currency) : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fee.estimatedTotalCost ? (
                            <span className="font-bold text-gray-900">{fmt(fee.estimatedTotalCost, fee.currency)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/fees/${fee.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelected(fee); setShowEdit(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelected(fee); setShowDelete(true); }}
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
        <FeeModal mode="create" universities={universities} courses={courses} intakes={intakes}
          onSave={handleCreate} onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <FeeModal mode="edit" fee={selected} universities={universities} courses={courses} intakes={intakes}
          onSave={handleUpdate} onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Fee Record</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this fee record for <strong>{selected.course?.name}</strong> ({selected.academicYear})? This action cannot be undone.
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
