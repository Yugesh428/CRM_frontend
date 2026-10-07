"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Plus, Search, Eye, Edit, Trash2,
  GraduationCap, DollarSign, Clock, Star,
  CheckCircle, XCircle, Award, Globe, Filter,
} from "lucide-react";
import {
  getAllCourses, getAllUniversities, getAllCampuses,
  createCourse, updateCourse, deleteCourse,
  type Course, type University, type Campus,
} from "@/lib/api";

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  high_school: { label: "High School", color: "bg-gray-100 text-gray-700" },
  foundation: { label: "Foundation", color: "bg-teal-100 text-teal-700" },
  certificate: { label: "Certificate", color: "bg-orange-100 text-orange-700" },
  diploma: { label: "Diploma", color: "bg-green-100 text-green-700" },
  advanced_diploma: { label: "Advanced Diploma", color: "bg-lime-100 text-lime-700" },
  bachelor: { label: "Bachelor", color: "bg-blue-100 text-blue-700" },
  graduate_diploma: { label: "Graduate Diploma", color: "bg-indigo-100 text-indigo-700" },
  master: { label: "Master", color: "bg-purple-100 text-purple-700" },
  phd: { label: "PhD", color: "bg-red-100 text-red-700" },
  postdoctoral: { label: "Postdoctoral", color: "bg-pink-100 text-pink-700" },
};

const MODE_CONFIG: Record<string, { label: string; color: string }> = {
  on_campus: { label: "On Campus", color: "bg-emerald-100 text-emerald-700" },
  online: { label: "Online", color: "bg-cyan-100 text-cyan-700" },
  hybrid: { label: "Hybrid", color: "bg-indigo-100 text-indigo-700" },
  distance: { label: "Distance", color: "bg-amber-100 text-amber-700" },
};

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

const INTAKE_OPTIONS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function CourseModal({
  mode,
  course,
  universities,
  campuses,
  onSave,
  onClose,
  loading,
}: {
  mode: "create" | "edit";
  course?: Course | null;
  universities: University[];
  campuses: Campus[];
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: course?.name || "",
    code: course?.code || "",
    description: course?.description || "",
    shortDescription: course?.shortDescription || "",
    discipline: course?.discipline || "",
    specialization: course?.specialization || "",
    level: course?.level || "bachelor",
    mode: course?.mode || "on_campus",
    duration: course?.duration || "",
    durationMonths: course?.durationMonths || "",
    intakes: course?.intakes || [] as string[],
    tuitionFee: course?.tuitionFee || "",
    currency: course?.currency || "USD",
    applicationFee: course?.applicationFee || "",
    scholarshipAmount: course?.scholarshipAmount || "",
    feeFrequency: course?.feeFrequency || "per_year",
    ieltsOverall: course?.ieltsOverall || "",
    pteOverall: course?.pteOverall || "",
    toeflTotal: course?.toeflTotal || "",
    minimumGPA: course?.minimumGPA || "",
    coverImageUrl: course?.coverImageUrl || "",
    isActive: course?.isActive ?? true,
    isFeatured: course?.isFeatured || false,
    isScholarshipAvailable: course?.isScholarshipAvailable || false,
    universityId: course?.universityId || "",
    campusId: course?.campusId || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(f: string, v: any) {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  }

  function toggleIntake(val: string) {
    setForm((p) => ({
      ...p,
      intakes: p.intakes.includes(val) ? p.intakes.filter((x) => x !== val) : [...p.intakes, val],
    }));
  }

  function validate() {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Required";
    if (!form.code.trim()) err.code = "Required";
    if (!form.universityId) err.universityId = "Required";
    if (!form.level) err.level = "Required";
    if (!form.mode) err.mode = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: any = { ...form };
    
    // Convert numeric fields only if they have values
    if (payload.tuitionFee && payload.tuitionFee !== "") {
      payload.tuitionFee = parseFloat(payload.tuitionFee);
    } else {
      delete payload.tuitionFee;
    }
    
    if (payload.applicationFee && payload.applicationFee !== "") {
      payload.applicationFee = parseFloat(payload.applicationFee);
    } else {
      delete payload.applicationFee;
    }
    
    if (payload.scholarshipAmount && payload.scholarshipAmount !== "") {
      payload.scholarshipAmount = parseFloat(payload.scholarshipAmount);
    } else {
      delete payload.scholarshipAmount;
    }
    
    if (payload.durationMonths && payload.durationMonths !== "") {
      payload.durationMonths = parseInt(payload.durationMonths);
    } else {
      delete payload.durationMonths;
    }
    
    if (payload.ieltsOverall && payload.ieltsOverall !== "") {
      payload.ieltsOverall = parseFloat(payload.ieltsOverall);
    } else {
      delete payload.ieltsOverall;
    }
    
    if (payload.pteOverall && payload.pteOverall !== "") {
      payload.pteOverall = parseInt(payload.pteOverall);
    } else {
      delete payload.pteOverall;
    }
    
    if (payload.toeflTotal && payload.toeflTotal !== "") {
      payload.toeflTotal = parseInt(payload.toeflTotal);
    } else {
      delete payload.toeflTotal;
    }
    
    if (payload.minimumGPA && payload.minimumGPA !== "") {
      payload.minimumGPA = parseFloat(payload.minimumGPA);
    } else {
      delete payload.minimumGPA;
    }
    
    // Ensure feeFrequency has a valid value
    if (!payload.feeFrequency || payload.feeFrequency.includes(' ')) {
      payload.feeFrequency = "per_year";
    }
    
    // Remove empty string fields and null/undefined
    Object.keys(payload).forEach(key => {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });
    
    // Ensure campusId is not empty string
    if (payload.campusId === "") {
      delete payload.campusId;
    }
    
    onSave(payload);
  }

  const filteredCampuses = campuses.filter(c => c.universityId === form.universityId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{mode === "create" ? "Add New Course" : "Edit Course"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* body */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
            </div>
            
            <div>
              <label className={lbl}>Course Name *</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inp} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className={lbl}>Course Code *</label>
              <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} className={inp} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className={lbl}>University *</label>
              <select value={form.universityId} onChange={(e) => set("universityId", e.target.value)} className={inp}>
                <option value="">Select University</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
            </div>

            <div>
              <label className={lbl}>Campus (Optional)</label>
              <select value={form.campusId} onChange={(e) => set("campusId", e.target.value)} className={inp} disabled={!form.universityId}>
                <option value="">Select Campus</option>
                {filteredCampuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Level *</label>
              <select value={form.level} onChange={(e) => set("level", e.target.value)} className={inp}>
                {Object.entries(LEVEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Mode *</label>
              <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className={inp}>
                {Object.entries(MODE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Discipline</label>
              <input type="text" value={form.discipline} onChange={(e) => set("discipline", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Specialization</label>
              <input type="text" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Short Description</label>
              <input type="text" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className={lbl}>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inp} />
            </div>

            {/* Duration & Fees */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-3">Duration & Fees</h3>
            </div>

            <div>
              <label className={lbl}>Duration (Text)</label>
              <input type="text" placeholder="e.g. 2 years" value={form.duration} onChange={(e) => set("duration", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Duration (Months)</label>
              <input type="number" value={form.durationMonths} onChange={(e) => set("durationMonths", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Tuition Fee</label>
              <input type="number" step="0.01" value={form.tuitionFee} onChange={(e) => set("tuitionFee", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Currency</label>
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inp}>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="EUR">EUR - Euro</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="NZD">NZD - New Zealand Dollar</option>
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Fee Frequency</label>
              <select value={form.feeFrequency} onChange={(e) => set("feeFrequency", e.target.value)} className={inp}>
                <option value="per_year">Per Year</option>
                <option value="per_semester">Per Semester</option>
                <option value="per_trimester">Per Trimester</option>
                <option value="total">Total</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Application Fee</label>
              <input type="number" step="0.01" value={form.applicationFee} onChange={(e) => set("applicationFee", e.target.value)} className={inp} />
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-3">Requirements</h3>
            </div>

            <div>
              <label className={lbl}>IELTS Overall</label>
              <input type="number" step="0.5" value={form.ieltsOverall} onChange={(e) => set("ieltsOverall", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>PTE Overall</label>
              <input type="number" value={form.pteOverall} onChange={(e) => set("pteOverall", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>TOEFL Total</label>
              <input type="number" value={form.toeflTotal} onChange={(e) => set("toeflTotal", e.target.value)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Minimum GPA</label>
              <input type="number" step="0.1" value={form.minimumGPA} onChange={(e) => set("minimumGPA", e.target.value)} className={inp} />
            </div>

            {/* Intakes */}
            <div className="md:col-span-2">
              <label className={lbl}>Intakes</label>
              <div className="flex flex-wrap gap-2">
                {INTAKE_OPTIONS.map((intake) => (
                  <button
                    key={intake}
                    type="button"
                    onClick={() => toggleIntake(intake)}
                    className={`px-3 py-1.5 text-xs rounded-full border font-medium capitalize ${
                      form.intakes.includes(intake)
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {intake}
                  </button>
                ))}
              </div>
            </div>

            {/* Scholarship */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isScholarshipAvailable} onChange={(e) => set("isScholarshipAvailable", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">Scholarship Available</span>
              </label>
            </div>

            {form.isScholarshipAvailable && (
              <div>
                <label className={lbl}>Scholarship Amount</label>
                <input type="number" step="0.01" value={form.scholarshipAmount} onChange={(e) => set("scholarshipAmount", e.target.value)} className={inp} />
              </div>
            )}

            {/* Other */}
            <div className="md:col-span-2">
              <label className={lbl}>Cover Image URL</label>
              <input type="text" value={form.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} className={inp} />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">Featured</span>
              </label>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : mode === "create" ? "Create Course" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [coursesRes, unisRes, campusRes] = await Promise.all([
        getAllCourses({ limit: 500 }),
        getAllUniversities({ limit: 200 }),
        getAllCampuses({ limit: 500 }),
      ]);
      
      if (coursesRes.success) {
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        setCourses(coursesData);
      }
      if (unisRes.success) {
        const unisData = Array.isArray(unisRes.data) ? unisRes.data : [];
        setUniversities(unisData);
      }
      if (campusRes.success) {
        const campusData = Array.isArray(campusRes.data) ? campusRes.data : [];
        setCampuses(campusData);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  const filtered = courses.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && 
        !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (uniFilter && c.universityId !== uniFilter) return false;
    if (levelFilter && c.level !== levelFilter) return false;
    if (modeFilter && c.mode !== modeFilter) return false;
    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "inactive" && c.isActive) return false;
    return true;
  });

  async function handleCreate(data: Partial<Course>) {
    setActionLoading(true);
    try {
      const res = await createCourse(data);
      if (res.success) {
        await fetchAll();
        setShowCreate(false);
      } else {
        alert(res.message || "Failed to create course");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(data: Partial<Course>) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await updateCourse(selected.id, data);
      if (res.success) {
        await fetchAll();
        setShowEdit(false);
        setSelected(null);
      } else {
        alert(res.message || "Failed to update course");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteCourse(selected.id);
      if (res.success) {
        await fetchAll();
        setShowDelete(false);
        setSelected(null);
      } else {
        alert(res.message || "Failed to delete course");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
            </p>
          </div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Course
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                />
              </div>
            </div>
            <select
              value={uniFilter}
              onChange={(e) => setUniFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Levels</option>
              {Object.entries(LEVEL_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Modes</option>
              {Object.entries(MODE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(search || uniFilter || levelFilter || modeFilter || statusFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setUniFilter("");
                  setLevelFilter("");
                  setModeFilter("");
                  setStatusFilter("");
                }}
              >
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
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || levelFilter || modeFilter || statusFilter
                ? "No courses match your filters"
                : "No courses yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || levelFilter || modeFilter || statusFilter
                ? "Try adjusting your search."
                : "Add your first course to get started."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const levelConf = LEVEL_CONFIG[course.level] || { label: course.level, color: "bg-gray-100 text-gray-700" };
              const modeConf = MODE_CONFIG[course.mode] || { label: course.mode, color: "bg-gray-100 text-gray-700" };

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  {course.coverImageUrl ? (
                    <div className="h-32 w-full overflow-hidden">
                      <img src={course.coverImageUrl} alt={course.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white/50" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{course.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{course.code}</p>
                      </div>
                      {course.isActive ? (
                        <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0 ml-2">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 text-xs flex-shrink-0 ml-2">
                          <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </div>

                    {course.shortDescription && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.shortDescription}</p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${levelConf.color} text-xs`}>{levelConf.label}</Badge>
                      <Badge className={`${modeConf.color} text-xs`}>{modeConf.label}</Badge>
                      {course.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          <Star className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-2 border-t border-gray-100 mb-3 text-xs">
                      {course.tuitionFee && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{course.currency || "$"}{course.tuitionFee.toLocaleString()}</span>
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{course.duration}</span>
                        </div>
                      )}
                      {course.ieltsOverall && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">IELTS {course.ieltsOverall}</span>
                        </div>
                      )}
                      {course.isScholarshipAvailable && (
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-gray-600">Scholarship</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => { setSelected(course); setShowEdit(true); }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                        onClick={() => { setSelected(course); setShowDelete(true); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CourseModal
          mode="create"
          universities={universities}
          campuses={campuses}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          loading={actionLoading}
        />
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <CourseModal
          mode="edit"
          course={selected}
          universities={universities}
          campuses={campuses}
          onSave={handleUpdate}
          onClose={() => { setShowEdit(false); setSelected(null); }}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selected.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowDelete(false); setSelected(null); }}
                disabled={actionLoading}
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
