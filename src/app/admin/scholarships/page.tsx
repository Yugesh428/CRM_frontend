"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award, Plus, Search, Edit, Trash2, Eye,
  CheckCircle, Clock, XCircle, AlertCircle, FileText,
  BookOpen, Building2, Filter, Globe, Mail, Phone,
  Users, RefreshCw, DollarSign,
} from "lucide-react";
import {
  getAllScholarships, createScholarship, updateScholarship, deleteScholarship,
  getAllUniversities, getAllCourses,
  type Scholarship, type University, type Course,
} from "@/lib/api";

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:    { label: "Active",    color: "bg-green-100 text-green-700",  icon: CheckCircle },
  upcoming:  { label: "Upcoming",  color: "bg-blue-100 text-blue-700",    icon: Clock },
  expired:   { label: "Expired",   color: "bg-gray-100 text-gray-600",    icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-700",      icon: AlertCircle },
  draft:     { label: "Draft",     color: "bg-amber-100 text-amber-700",  icon: FileText },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  merit_based:         { label: "Merit Based",         color: "bg-blue-100 text-blue-700" },
  academic_excellence: { label: "Academic Excellence", color: "bg-purple-100 text-purple-700" },
  need_based:          { label: "Need Based",          color: "bg-orange-100 text-orange-700" },
  early_application:   { label: "Early Application",   color: "bg-teal-100 text-teal-700" },
  country_specific:    { label: "Country Specific",    color: "bg-indigo-100 text-indigo-700" },
  course_specific:     { label: "Course Specific",     color: "bg-cyan-100 text-cyan-700" },
  diversity:           { label: "Diversity",           color: "bg-pink-100 text-pink-700" },
  sports:              { label: "Sports",              color: "bg-green-100 text-green-700" },
  research:            { label: "Research",            color: "bg-violet-100 text-violet-700" },
  alumni:              { label: "Alumni",              color: "bg-amber-100 text-amber-700" },
  partial:             { label: "Partial",             color: "bg-rose-100 text-rose-700" },
  full_tuition:        { label: "Full Tuition",        color: "bg-emerald-100 text-emerald-700" },
  other:               { label: "Other",               color: "bg-gray-100 text-gray-700" },
};

const AMOUNT_TYPE_CONFIG: Record<string, string> = {
  fixed_amount:    "Fixed Amount",
  percentage:      "Percentage",
  full_tuition:    "Full Tuition",
  partial_tuition: "Partial Tuition",
};

const CURRENCIES = ["AUD","USD","GBP","CAD","NZD","EUR","JPY","SGD","INR","NPR","OTHER"];

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";
const sectionTitle = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-2";

// ─── Modal ────────────────────────────────────────────────────────────────────
function ScholarshipModal({
  mode, scholarship, universities, courses, onSave, onClose, loading,
}: {
  mode: "create" | "edit";
  scholarship?: Scholarship | null;
  universities: University[];
  courses: Course[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    universityId:          scholarship?.universityId || "",
    courseId:              scholarship?.courseId || "",
    name:                  scholarship?.name || "",
    description:           scholarship?.description || "",
    type:                  scholarship?.type || "merit_based",
    amountType:            scholarship?.amountType || "fixed_amount",
    amount:                scholarship?.amount ?? "",
    percentage:            scholarship?.percentage ?? "",
    currency:              scholarship?.currency || "AUD",
    amountDescription:     scholarship?.amountDescription || "",
    eligibilityCriteria:   scholarship?.eligibilityCriteria || "",
    minimumGpa:            scholarship?.minimumGpa ?? "",
    minimumIelts:          scholarship?.minimumIelts ?? "",
    minimumPte:            scholarship?.minimumPte ?? "",
    minimumToefl:          scholarship?.minimumToefl ?? "",
    eligibleCountries:     scholarship?.eligibleCountries || "",
    eligibleNationalities: scholarship?.eligibleNationalities || "",
    applicationOpenDate:   scholarship?.applicationOpenDate?.split("T")[0] || "",
    deadline:              scholarship?.deadline?.split("T")[0] || "",
    applicationProcess:    scholarship?.applicationProcess || "",
    requiredDocuments:     scholarship?.requiredDocuments || "",
    automaticConsideration: scholarship?.automaticConsideration || false,
    duration:              scholarship?.duration || "",
    renewable:             scholarship?.renewable || false,
    renewalCriteria:       scholarship?.renewalCriteria || "",
    numberOfAwards:        scholarship?.numberOfAwards ?? "",
    awardsRemaining:       scholarship?.awardsRemaining ?? "",
    websiteUrl:            scholarship?.websiteUrl || "",
    contactEmail:          scholarship?.contactEmail || "",
    contactPhone:          scholarship?.contactPhone || "",
    notes:                 scholarship?.notes || "",
    termsAndConditions:    scholarship?.termsAndConditions || "",
    status:                scholarship?.status || "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  const filteredCourses = courses.filter(c => c.universityId === form.universityId);

  function validate() {
    const err: Record<string, string> = {};
    if (!form.universityId) err.universityId = "Required";
    if (!form.name.trim()) err.name = "Required";
    if (!form.type) err.type = "Required";
    if (!form.amountType) err.amountType = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: any = { ...form };

    // Parse numeric fields
    const numFields = ["amount", "percentage", "minimumGpa", "minimumIelts", "minimumPte", "minimumToefl", "numberOfAwards", "awardsRemaining"];
    numFields.forEach(f => {
      if (payload[f] !== "" && payload[f] !== undefined && payload[f] !== null) {
        payload[f] = parseFloat(payload[f]);
      } else {
        delete payload[f];
      }
    });

    // Remove empty strings
    Object.keys(payload).forEach(k => {
      if (payload[k] === "" || payload[k] === null || payload[k] === undefined) {
        delete payload[k];
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
            <Award className="w-5 h-5 text-[#1e3a8a]" />
            {mode === "create" ? "Add New Scholarship" : "Edit Scholarship"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* body */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Basic Info */}
            <div className="md:col-span-2"><p className={sectionTitle}>Basic Information</p></div>

            <div className="md:col-span-2">
              <label className={lbl}>Scholarship Name *</label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} className={inp} placeholder="e.g. Excellence Scholarship 2027" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className={lbl}>University *</label>
              <select value={form.universityId} onChange={e => { set("universityId", e.target.value); set("courseId", ""); }} className={inp}>
                <option value="">Select University</option>
                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
            </div>

            <div>
              <label className={lbl}>Course (Optional)</label>
              <select value={form.courseId} onChange={e => set("courseId", e.target.value)} className={inp} disabled={!form.universityId}>
                <option value="">All Courses</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Scholarship Type *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inp}>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inp}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} className={inp} placeholder="Brief description of this scholarship..." />
            </div>

            {/* Amount */}
            <div className="md:col-span-2"><p className={sectionTitle}>Amount Details</p></div>

            <div>
              <label className={lbl}>Amount Type *</label>
              <select value={form.amountType} onChange={e => set("amountType", e.target.value)} className={inp}>
                {Object.entries(AMOUNT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Currency</label>
              <select value={form.currency} onChange={e => set("currency", e.target.value)} className={inp}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {(form.amountType === "fixed_amount" || form.amountType === "partial_tuition") && (
              <div>
                <label className={lbl}>Amount</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} className={inp} />
              </div>
            )}

            {form.amountType === "percentage" && (
              <div>
                <label className={lbl}>Percentage (%)</label>
                <input type="number" step="0.01" min="0" max="100" value={form.percentage} onChange={e => set("percentage", e.target.value)} className={inp} />
              </div>
            )}

            <div>
              <label className={lbl}>Amount Description</label>
              <input type="text" value={form.amountDescription} onChange={e => set("amountDescription", e.target.value)} className={inp} placeholder="e.g. Up to AUD 10,000 per year" />
            </div>

            {/* Eligibility */}
            <div className="md:col-span-2"><p className={sectionTitle}>Eligibility Requirements</p></div>

            <div className="md:col-span-2">
              <label className={lbl}>Eligibility Criteria</label>
              <textarea rows={3} value={form.eligibilityCriteria} onChange={e => set("eligibilityCriteria", e.target.value)} className={inp} placeholder="Describe who can apply..." />
            </div>

            <div>
              <label className={lbl}>Minimum GPA</label>
              <input type="number" step="0.01" value={form.minimumGpa} onChange={e => set("minimumGpa", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Minimum IELTS</label>
              <input type="number" step="0.5" value={form.minimumIelts} onChange={e => set("minimumIelts", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Minimum PTE</label>
              <input type="number" value={form.minimumPte} onChange={e => set("minimumPte", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Minimum TOEFL</label>
              <input type="number" value={form.minimumToefl} onChange={e => set("minimumToefl", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Eligible Countries</label>
              <input type="text" value={form.eligibleCountries} onChange={e => set("eligibleCountries", e.target.value)} className={inp} placeholder="e.g. Nepal, India, Sri Lanka" />
            </div>

            <div>
              <label className={lbl}>Eligible Nationalities</label>
              <input type="text" value={form.eligibleNationalities} onChange={e => set("eligibleNationalities", e.target.value)} className={inp} placeholder="e.g. Nepali, Indian" />
            </div>

            {/* Application */}
            <div className="md:col-span-2"><p className={sectionTitle}>Application Details</p></div>

            <div>
              <label className={lbl}>Application Open Date</label>
              <input type="date" value={form.applicationOpenDate} onChange={e => set("applicationOpenDate", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Application Process</label>
              <input type="text" value={form.applicationProcess} onChange={e => set("applicationProcess", e.target.value)} className={inp} placeholder="e.g. Apply online via university portal" />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Required Documents</label>
              <textarea rows={2} value={form.requiredDocuments} onChange={e => set("requiredDocuments", e.target.value)} className={inp} placeholder="e.g. Transcripts, recommendation letters..." />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoConsider" checked={form.automaticConsideration} onChange={e => set("automaticConsideration", e.target.checked)} className="w-4 h-4" />
              <label htmlFor="autoConsider" className="text-sm font-semibold text-gray-700 cursor-pointer">Automatic Consideration (with admission)</label>
            </div>

            {/* Terms */}
            <div className="md:col-span-2"><p className={sectionTitle}>Scholarship Terms</p></div>

            <div>
              <label className={lbl}>Duration</label>
              <input type="text" value={form.duration} onChange={e => set("duration", e.target.value)} className={inp} placeholder="e.g. One-time, Per semester, Full program" />
            </div>

            <div>
              <label className={lbl}>Number of Awards</label>
              <input type="number" value={form.numberOfAwards} onChange={e => set("numberOfAwards", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Awards Remaining</label>
              <input type="number" value={form.awardsRemaining} onChange={e => set("awardsRemaining", e.target.value)} className={inp} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="renewable" checked={form.renewable} onChange={e => set("renewable", e.target.checked)} className="w-4 h-4" />
              <label htmlFor="renewable" className="text-sm font-semibold text-gray-700 cursor-pointer">Renewable</label>
            </div>

            {form.renewable && (
              <div className="md:col-span-2">
                <label className={lbl}>Renewal Criteria</label>
                <textarea rows={2} value={form.renewalCriteria} onChange={e => set("renewalCriteria", e.target.value)} className={inp} placeholder="e.g. Maintain GPA of 3.5 or above" />
              </div>
            )}

            {/* Contact */}
            <div className="md:col-span-2"><p className={sectionTitle}>Contact & Links</p></div>

            <div>
              <label className={lbl}>Website URL</label>
              <input type="text" value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Contact Phone</label>
              <input type="text" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Terms & Conditions</label>
              <textarea rows={3} value={form.termsAndConditions} onChange={e => set("termsAndConditions", e.target.value)} className={inp} />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Scholarship" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ScholarshipsPage() {
  const router = useRouter();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses]           = useState<Course[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [uniFilter, setUniFilter]       = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showDelete, setShowDelete]     = useState(false);
  const [selected, setSelected]         = useState<Scholarship | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [schRes, uniRes, courseRes] = await Promise.all([
        getAllScholarships({ limit: 500 }),
        getAllUniversities({ limit: 200 }),
        getAllCourses({ limit: 500 }),
      ]);
      if (schRes.success) setScholarships(Array.isArray(schRes.data) ? schRes.data : []);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = scholarships.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) &&
          !s.university?.name?.toLowerCase().includes(q) &&
          !s.course?.name?.toLowerCase().includes(q)) return false;
    }
    if (uniFilter && s.universityId !== uniFilter) return false;
    if (typeFilter && s.type !== typeFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  async function handleCreate(data: any) {
    setActionLoading(true);
    try {
      const res = await createScholarship(data);
      if (res.success) { await fetchAll(); setShowCreate(false); }
      else alert(res.message || "Failed to create scholarship");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleUpdate(data: any) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateScholarship(selected.id, data);
      if (res.success) { await fetchAll(); setShowEdit(false); setSelected(null); }
      else alert(res.message || "Failed to update scholarship");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteScholarship(selected.id);
      if (res.success) { await fetchAll(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete scholarship");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  function formatAmount(s: Scholarship) {
    if (s.amountType === "full_tuition") return "Full Tuition";
    if (s.amountType === "percentage" && s.percentage) return `${s.percentage}% off`;
    if (s.amount) return `${s.currency} ${s.amount.toLocaleString()}`;
    return s.amountDescription || "—";
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "scholarship" : "scholarships"} found
            </p>
          </div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Scholarship
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
              <input type="text" placeholder="Search scholarships..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20" />
            </div>
            <select value={uniFilter} onChange={e => setUniFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Universities</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || typeFilter || statusFilter ? "No scholarships match your filters" : "No scholarships yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || typeFilter || statusFilter ? "Try adjusting your search." : "Add your first scholarship to get started."}
            </p>
            {!search && !uniFilter && !typeFilter && !statusFilter && (
              <Button onClick={() => setShowCreate(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Scholarship
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Scholarship Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Deadline</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => {
                    const statusConf = STATUS_CONFIG[s.status] || STATUS_CONFIG.active;
                    const typeConf = TYPE_CONFIG[s.type] || TYPE_CONFIG.other;
                    const StatusIcon = statusConf.icon;
                    const isDeadlineSoon = s.deadline &&
                      new Date(s.deadline) > new Date() &&
                      (new Date(s.deadline).getTime() - Date.now()) < 14 * 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={s.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 max-w-[220px]">
                          <span className="font-bold text-gray-900 line-clamp-2">{s.name}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{s.university?.name || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{s.course?.name || "All Courses"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`${typeConf.color} text-xs`}>{typeConf.label}</Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span className="font-semibold text-gray-900">{formatAmount(s)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {s.deadline ? (
                            <span className={`font-medium ${isDeadlineSoon ? "text-red-600" : "text-gray-700"}`}>
                              {isDeadlineSoon && "⚠️ "}
                              {new Date(s.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/scholarships/${s.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelected(s); setShowEdit(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelected(s); setShowDelete(true); }}
                              className="text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
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
        <ScholarshipModal mode="create" universities={universities} courses={courses}
          onSave={handleCreate} onClose={() => setShowCreate(false)} loading={actionLoading} />
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <ScholarshipModal mode="edit" scholarship={selected} universities={universities} courses={courses}
          onSave={handleUpdate} onClose={() => { setShowEdit(false); setSelected(null); }} loading={actionLoading} />
      )}

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Scholarship</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selected.name}</strong>? This action cannot be undone.
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
