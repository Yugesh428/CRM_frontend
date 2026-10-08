"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck, Plus, Search, Edit, Trash2, Eye,
  CheckCircle, XCircle, Clock, AlertCircle,
  BookOpen, Building2, Calendar, Globe, Filter,
  User, Send, Ban,
} from "lucide-react";
import {
  getAllApplications,
  deleteApplication,
  getAllUniversities,
  getAllCourses,
  getAllIntakes,
  getAllLeads,
  getAllCounselors,
  type Application,
  type University,
  type Course,
  type Intake,
  type Lead,
  type Counselor,
} from "@/lib/api";
import ApplicationModal from "./ApplicationModel";

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  new:               { label: "New",               color: "bg-blue-100 text-blue-700",    icon: AlertCircle },
  in_progress:       { label: "In Progress",       color: "bg-indigo-100 text-indigo-700", icon: Clock },
  documents_pending: { label: "Docs Pending",      color: "bg-amber-100 text-amber-700",  icon: Clock },
  ready_to_submit:   { label: "Ready to Submit",   color: "bg-cyan-100 text-cyan-700",    icon: CheckCircle },
  submitted:         { label: "Submitted",         color: "bg-purple-100 text-purple-700", icon: Send },
  offer_received:    { label: "Offer Received",    color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  offer_accepted:    { label: "Offer Accepted",    color: "bg-green-100 text-green-700",  icon: CheckCircle },
  rejected:          { label: "Rejected",          color: "bg-red-100 text-red-700",      icon: XCircle },
  withdrawn:         { label: "Withdrawn",         color: "bg-gray-100 text-gray-600",    icon: Ban },
  visa:              { label: "Visa",              color: "bg-teal-100 text-teal-700",    icon: Globe },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<Application[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Application | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, uniFilter, courseFilter]);

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams?.get("edit");
    if (editId && applications.length > 0) {
      const appToEdit = applications.find(a => a.id === editId);
      if (appToEdit) {
        openEdit(appToEdit);
        // Clear the URL parameter
        router.replace("/admin/applications", { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, applications]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [appRes, uniRes, courseRes, intakeRes, leadRes, counselorRes] = await Promise.all([
        getAllApplications({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          universityId: uniFilter || undefined,
          courseId: courseFilter || undefined,
          search: search || undefined,
          limit: 500,
        }),
        getAllUniversities({ limit: 300 }),
        getAllCourses({ limit: 500 }),
        getAllIntakes({ limit: 500 }),
        getAllLeads({ limit: 500 }),
        getAllCounselors({ limit: 200 }),
      ]);
      if (appRes.success) setApplications(Array.isArray(appRes.data) ? appRes.data : []);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      if (intakeRes.success) setIntakes(Array.isArray(intakeRes.data) ? intakeRes.data : []);
      if (leadRes.success) setLeads(Array.isArray(leadRes.data) ? leadRes.data : []);
      if (counselorRes.success) {
        const data = counselorRes.data;
        setCounselors(Array.isArray(data) ? data : (data as any)?.counselors ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await deleteApplication(selected.id);
      if (res.success) {
        await fetchAll();
        setShowDelete(false);
        setSelected(null);
      } else alert(res.message || "Failed to delete");
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(app: Application) {
    setEditTarget(app);
    setModalOpen(true);
  }

  async function handleModalSaved() {
    setModalOpen(false);
    setEditTarget(null);
    await fetchAll();
  }

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      a.applicationNumber?.toLowerCase().includes(q) ||
      a.student?.fullName?.toLowerCase().includes(q) ||
      a.university?.name?.toLowerCase().includes(q) ||
      a.course?.name?.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setUniFilter("");
    setCourseFilter("");
  };

  const hasFilters = !!(search || statusFilter || priorityFilter || uniFilter || courseFilter);

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "application" : "applications"} found
            </p>
          </div>
          <Button
            className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4 mr-2" /> New Application
          </Button>
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
                placeholder="Search by app number, student, university, course..."
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
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Priority</option>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

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
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
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
            <FileCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {hasFilters ? "No applications match your filters" : "No applications yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {hasFilters
                ? "Try adjusting your search."
                : "Create your first application to get started."}
            </p>
            {!hasFilters && (
              <Button onClick={openCreate} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> New Application
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">App #</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Intake</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Priority</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, idx) => {
                    const statusConf = STATUS_CONFIG[app.status || "new"] || STATUS_CONFIG.new;
                    const StatusIcon = statusConf.icon;
                    const prioConf = PRIORITY_CONFIG[app.priority || "medium"] || PRIORITY_CONFIG.medium;

                    return (
                      <tr
                        key={app.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                          idx % 2 === 1 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-[#1e3a8a]">
                            {app.applicationNumber || "—"}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {app.applicationDate
                              ? new Date(app.applicationDate).toLocaleDateString()
                              : ""}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900">
                                {app.student?.fullName || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {app.student?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {app.university?.name || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <div className="font-medium">{app.course?.name || "—"}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {app.course?.level || ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {app.intake ? (
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {app.intake.label || `${app.intake.month}/${app.intake.year}`}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${prioConf.color} text-xs`}>
                            {prioConf.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/applications/${app.id}`)}
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(app)}
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelected(app);
                                setShowDelete(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
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

      {/* Delete Confirmation */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Application</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete application{" "}
              <strong>{selected.applicationNumber}</strong> for{" "}
              <strong>{selected.student?.fullName}</strong>? This action cannot be undone.
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
                onClick={() => {
                  setShowDelete(false);
                  setSelected(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSaved={handleModalSaved}
        initialData={editTarget}
        universities={universities}
        courses={courses}
        intakes={intakes}
        leads={leads}
        counselors={counselors}
      />
    </AdminLayout>
  );
}