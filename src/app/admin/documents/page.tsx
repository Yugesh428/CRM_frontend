"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Plus, Search, Edit, Trash2,
  CheckCircle, XCircle, Clock,
  Filter, Upload, Download, ShieldCheck, FileWarning,
  RotateCcw, UploadCloud,
} from "lucide-react";
import {
  getAllApplicationDocuments,
  deleteApplicationDocument,
  getAllApplications,
  type ApplicationDocument,
  type Application,
} from "@/lib/api";
import ApplicationDocumentModal from "./ApplicationDocumentModel";
import ApplicationDocumentVerifyModal from "./ApplicationDocumentVerifyModal";
import BulkUploadModal from "./BulkUploadModal";

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  not_uploaded:      { label: "Not Uploaded",      color: "bg-gray-100 text-gray-600",      icon: FileWarning },
  pending:           { label: "Pending",           color: "bg-amber-100 text-amber-700",    icon: Clock },
  uploaded:          { label: "Uploaded",          color: "bg-blue-100 text-blue-700",      icon: Upload },
  verified:          { label: "Verified",          color: "bg-green-100 text-green-700",    icon: CheckCircle },
  rejected:          { label: "Rejected",          color: "bg-red-100 text-red-700",        icon: XCircle },
  resubmit_required: { label: "Resubmit Required", color: "bg-orange-100 text-orange-700",  icon: RotateCcw },
};

const DOCUMENT_TYPES = [
  { value: "passport",              label: "Passport" },
  { value: "academic_transcript",   label: "Academic Transcript" },
  { value: "degree_certificate",    label: "Degree Certificate" },
  { value: "english_test_result",   label: "English Test Result" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "statement_of_purpose",  label: "Statement of Purpose" },
  { value: "cv_resume",             label: "CV / Resume" },
  { value: "financial_documents",   label: "Financial Documents" },
  { value: "work_experience_letter",label: "Work Experience Letter" },
  { value: "birth_certificate",     label: "Birth Certificate" },
  { value: "passport_photo",        label: "Passport Photo" },
  { value: "police_clearance",      label: "Police Clearance" },
  { value: "medical_certificate",   label: "Medical Certificate" },
  { value: "scholarship_documents", label: "Scholarship Documents" },
  { value: "other",                 label: "Other" },
];

export default function ApplicationDocumentsPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [requiredFilter, setRequiredFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [appFilter, setAppFilter] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<ApplicationDocument | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ApplicationDocument | null>(null);

  // Verify modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<ApplicationDocument | null>(null);

  // Bulk upload modal
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, requiredFilter, verifiedFilter, appFilter]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [docRes, appRes] = await Promise.all([
        getAllApplicationDocuments({
          status: statusFilter || undefined,
          documentType: typeFilter || undefined,
          isRequired: requiredFilter || undefined,
          isVerified: verifiedFilter || undefined,
          applicationId: appFilter || undefined,
          search: search || undefined,
          limit: 500,
        }),
        getAllApplications({ limit: 500 }),
      ]);
      if (docRes.success) setDocuments(Array.isArray(docRes.data) ? docRes.data : []);
      if (appRes.success) setApplications(Array.isArray(appRes.data) ? appRes.data : []);
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
      const res = await deleteApplicationDocument(selected.id);
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

  function openEdit(doc: ApplicationDocument) {
    setEditTarget(doc);
    setModalOpen(true);
  }

  function openVerify(doc: ApplicationDocument) {
    setVerifyTarget(doc);
    setVerifyOpen(true);
  }

  async function handleModalSaved() {
    setModalOpen(false);
    setEditTarget(null);
    await fetchAll();
  }

  async function handleVerifySaved() {
    setVerifyOpen(false);
    setVerifyTarget(null);
    await fetchAll();
  }

  async function handleBulkUploadComplete() {
    setBulkUploadOpen(false);
    await fetchAll();
  }

  // client-side search over relations
  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      d.documentName?.toLowerCase().includes(q) ||
      d.fileName?.toLowerCase().includes(q) ||
      d.application?.applicationNumber?.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setRequiredFilter("");
    setVerifiedFilter("");
    setAppFilter("");
  };

  const hasFilters = !!(
    search || statusFilter || typeFilter || requiredFilter || verifiedFilter || appFilter
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Documents</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "document" : "documents"} found
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
              onClick={() => setBulkUploadOpen(true)}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Bulk Upload
            </Button>
            <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Add Document
            </Button>
          </div>
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
                placeholder="Search by document name, file name, app number..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Types</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={requiredFilter}
              onChange={(e) => setRequiredFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">Required: All</option>
              <option value="true">Required Only</option>
              <option value="false">Optional Only</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">Verified: All</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 min-w-[220px]"
            >
              <option value="">All Applications</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.applicationNumber} — {a.student?.fullName || "—"}
                </option>
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
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {hasFilters ? "No documents match your filters" : "No documents yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {hasFilters
                ? "Try adjusting your search."
                : "Upload the first document to get started."}
            </p>
            {!hasFilters && (
              <Button onClick={openCreate} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                <Plus className="w-4 h-4 mr-2" /> Add Document
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Document</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Application</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">File</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Required</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Version</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, idx) => {
                    const statusConf = STATUS_CONFIG[doc.status || "not_uploaded"] || STATUS_CONFIG.not_uploaded;
                    const StatusIcon = statusConf.icon;

                    return (
                      <tr
                        key={doc.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                          idx % 2 === 1 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900">{doc.documentName}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {doc.documentType?.replace(/_/g, " ")}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {doc.application ? (
                            <div className="font-mono text-xs text-[#1e3a8a] font-semibold">
                              {doc.application.applicationNumber}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {doc.fileName ? (
                            <div>
                              <div className="text-gray-800 text-xs truncate max-w-[180px]">
                                {doc.fileName}
                              </div>
                              <div className="text-xs text-gray-400">
                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No file</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {doc.isRequired ? (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">Required</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">Optional</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-xs font-semibold text-gray-600">v{doc.version || 1}</span>
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConf.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.fileUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.fileUrl!, "_blank")}
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openVerify(doc)}
                              title="Verify / Reject"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(doc)}
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelected(doc);
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selected.documentName}</strong>? This action cannot be undone.
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

      {/* Create / Edit Modal */}
      <ApplicationDocumentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSaved={handleModalSaved}
        initialData={editTarget}
        applications={applications}
      />

      {/* Verify Modal */}
      <ApplicationDocumentVerifyModal
        open={verifyOpen}
        onClose={() => { setVerifyOpen(false); setVerifyTarget(null); }}
        onSaved={handleVerifySaved}
        document={verifyTarget}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onComplete={handleBulkUploadComplete}
        applications={applications}
      />
    </AdminLayout>
  );
}