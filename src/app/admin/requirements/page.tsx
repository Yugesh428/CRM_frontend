"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Plus, Search, Edit, Trash2, Eye,
  CheckCircle, XCircle, Clock,
  BookOpen, Globe, Filter,
} from "lucide-react";
import {
  getAllCourseRequirements,
  deleteCourseRequirement,
  getAllUniversities,
  getAllCourses,
  type CourseRequirement,
  type University,
  type Course,
} from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:   { label: "Active",   color: "bg-green-100 text-green-700",  icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-600",    icon: XCircle },
  draft:    { label: "Draft",    color: "bg-amber-100 text-amber-700",  icon: Clock },
};

const STUDY_LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  undergraduate: { label: "Undergraduate", color: "bg-blue-100 text-blue-700" },
  postgraduate:  { label: "Postgraduate",  color: "bg-purple-100 text-purple-700" },
  phd:           { label: "PhD",           color: "bg-indigo-100 text-indigo-700" },
  diploma:       { label: "Diploma",       color: "bg-teal-100 text-teal-700" },
  certificate:   { label: "Certificate",   color: "bg-cyan-100 text-cyan-700" },
};

export default function RequirementsPage() {
  const router = useRouter();

  const [requirements, setRequirements] = useState<CourseRequirement[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<CourseRequirement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, [uniFilter, courseFilter, statusFilter]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [reqRes, uniRes, courseRes] = await Promise.all([
        getAllCourseRequirements({
          universityId: uniFilter || undefined,
          courseId: courseFilter || undefined,
          status: statusFilter || undefined,
          limit: 500,
        }),
        getAllUniversities({ limit: 200 }),
        getAllCourses({ limit: 500 }),
      ]);
      if (reqRes.success) setRequirements(Array.isArray(reqRes.data) ? reqRes.data : []);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteCourseRequirement(selected.id);
      if (res.success) { await fetchAll(); setShowDelete(false); setSelected(null); }
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  const filtered = requirements.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.course?.name?.toLowerCase().includes(q) ||
      r.course?.code?.toLowerCase().includes(q) ||
      r.university?.name?.toLowerCase().includes(q) ||
      (r.applicableCountry || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: requirements.length,
    active: requirements.filter(r => r.status === "active").length,
    withIelts: requirements.filter(r => r.ieltsOverall).length,
    withWorkExp: requirements.filter(r => r.workExperienceRequired).length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Requirements</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Admission requirements for all courses
            </p>
          </div>
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/requirements/create")}>
            <Plus className="w-4 h-4 mr-2" /> Add Requirement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requirements", value: stats.total,       color: "bg-blue-500" },
            { label: "Active",             value: stats.active,      color: "bg-green-500" },
            { label: "With IELTS",         value: stats.withIelts,   color: "bg-purple-500" },
            { label: "Work Exp. Required", value: stats.withWorkExp, color: "bg-orange-500" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4">
              <div className={`w-2 h-8 ${color} rounded-full mb-3`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course, university, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
            <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Universities</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || uniFilter || courseFilter || statusFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setUniFilter(""); setCourseFilter(""); setStatusFilter(""); }}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {search || uniFilter || courseFilter || statusFilter ? "No requirements match your filters" : "No requirements yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || uniFilter || courseFilter || statusFilter ? "Try adjusting your search." : "Add your first course requirement to get started."}
            </p>
            {!search && !uniFilter && !courseFilter && !statusFilter && (
              <Button onClick={() => router.push("/admin/requirements/create")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Requirement
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Country</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Study Level</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">IELTS</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">PTE</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Min GPA / %</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Work Exp</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">MOI</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, idx) => {
                    const statusConf = STATUS_CONFIG[req.status || "active"] || STATUS_CONFIG.active;
                    const StatusIcon = statusConf.icon;
                    const levelConf = STUDY_LEVEL_CONFIG[req.studyLevel || ""] || null;

                    return (
                      <tr
                        key={req.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{idx + 1}</td>

                        {/* Course */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900 max-w-[160px] truncate">{req.course?.name || "—"}</div>
                              <div className="text-xs text-gray-400">{req.course?.code || ""}</div>
                            </div>
                          </div>
                        </td>

                        {/* University */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-gray-700 max-w-[140px] truncate block">{req.university?.name || "—"}</span>
                        </td>

                        {/* Country */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {req.applicableCountry ? (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-gray-700">{req.applicableCountry}</span>
                            </div>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Global</span>
                          )}
                        </td>

                        {/* Study Level */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {levelConf ? (
                            <Badge variant="secondary" className={`text-xs ${levelConf.color}`}>{levelConf.label}</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs capitalize">{req.studyLevel?.replace(/_/g, " ") || "—"}</span>
                          )}
                        </td>

                        {/* IELTS */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {req.ieltsOverall ? (
                            <div>
                              <span className="font-bold text-gray-900">{req.ieltsOverall}</span>
                              {req.ieltsWriting && <div className="text-xs text-gray-400">W:{req.ieltsWriting}</div>}
                            </div>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* PTE */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {req.pteOverall ? (
                            <span className="font-bold text-gray-900">{req.pteOverall}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Min GPA / % */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {req.minimumGPA ? (
                            <span className="font-semibold text-gray-900">{Number(req.minimumGPA).toFixed(1)} GPA</span>
                          ) : req.minimumPercentage ? (
                            <span className="font-semibold text-gray-900">{req.minimumPercentage}%</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Work Exp */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {req.workExperienceRequired ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              ✓ {req.workExperienceYears || 0}+ yrs
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">No</span>
                          )}
                        </td>

                        {/* MOI */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {req.moiAccepted ? (
                            <span className="text-xs text-green-600 font-semibold">✓ Yes</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/requirements/${req.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/requirements/${req.id}/edit`)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline" size="sm"
                              onClick={() => { setSelected(req); setShowDelete(true); }}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
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
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              Showing {filtered.length} of {requirements.length} requirements
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Requirement</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the requirement for <strong>{selected.course?.name}</strong>
              {selected.applicableCountry ? ` (${selected.applicableCountry})` : ""}? This action cannot be undone.
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
