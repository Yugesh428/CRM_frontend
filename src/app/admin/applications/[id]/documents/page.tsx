"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getApplicationById,
  getAllApplicationDocuments,
  verifyApplicationDocument,
  deleteApplicationDocument,
  type Application,
  type ApplicationDocument,
} from "@/lib/api";

export default function ApplicationDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  useEffect(() => {
    loadData();
  }, [applicationId]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [appRes, docsRes] = await Promise.all([
        getApplicationById(applicationId),
        getAllApplicationDocuments({ applicationId, limit: 500 }),
      ]);

      if (appRes.success) {
        const app = appRes.data.application || appRes.data;
        setApplication(app);
      }

      if (docsRes.success) {
        setDocuments(docsRes.data || []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectDoc(id: string) {
    setSelectedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function selectAll() {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map((d) => d.id)));
    }
  }

  async function bulkVerify(decision: "verify" | "reject") {
    if (selectedDocs.size === 0) {
      alert("Please select at least one document");
      return;
    }

    const confirmMsg =
      decision === "verify"
        ? `Verify ${selectedDocs.size} document(s)?`
        : `Reject ${selectedDocs.size} document(s)?`;

    if (!confirm(confirmMsg)) return;

    setVerifying(true);
    setError(null);

    try {
      const promises = Array.from(selectedDocs).map((docId) =>
        verifyApplicationDocument(docId, {
          verified: decision === "verify",
          verificationNotes: `Bulk ${decision === "verify" ? "verified" : "rejected"}`,
        })
      );

      await Promise.all(promises);

      setSelectedDocs(new Set());
      loadData();
    } catch (err: any) {
      setError(err?.message || "Bulk verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this document?")) return;

    try {
      const res = await deleteApplicationDocument(docId);
      if (res.success) {
        loadData();
      } else {
        alert(res.message || "Delete failed");
      }
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  function getStatusBadge(doc: ApplicationDocument) {
    if (doc.isVerified) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Verified
        </div>
      );
    }
    if (doc.status === "rejected") {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          Rejected
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        Pending
      </div>
    );
  }

  function getDocIcon(doc: ApplicationDocument) {
    const type = doc.fileType?.toLowerCase() || "";
    if (type.includes("image")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    return "📎";
  }

  const stats = {
    total: documents.length,
    verified: documents.filter((d) => d.isVerified).length,
    pending: documents.filter((d) => !d.isVerified && d.status !== "rejected").length,
    rejected: documents.filter((d) => d.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/applications/${applicationId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Application Documents</h1>
                <p className="text-sm text-gray-600">
                  {application?.applicationNumber} — {application?.student?.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/documents?applicationId=${applicationId}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Documents
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Documents</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-700 mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-700 mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-700 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedDocs.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedDocs.size} document(s) selected
              </span>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDocs(new Set())}
                  disabled={verifying}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  onClick={() => bulkVerify("verify")}
                  disabled={verifying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Verify All
                </Button>
                <Button
                  size="sm"
                  onClick={() => bulkVerify("reject")}
                  disabled={verifying}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedDocs.size === documents.length && documents.length > 0}
                onChange={selectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
            </div>
            <div className="col-span-3">Document Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Uploaded</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No documents uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">Upload documents to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedDocs.has(doc.id) ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleSelectDoc(doc.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>

                  {/* Document Name */}
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="text-2xl">{getDocIcon(doc)}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {doc.documentName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{doc.fileName}</div>
                      {doc.isRequired && (
                        <span className="text-xs text-orange-600 font-medium">Required</span>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex items-center text-sm text-gray-700">
                    {doc.documentType?.replace(/_/g, " ")}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">{getStatusBadge(doc)}</div>

                  {/* Uploaded Info */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-xs text-gray-600">
                      <div>{new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</div>
                      <div className="text-gray-500">
                        {doc.uploadedBy?.fullName || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    {!doc.isVerified && (
                      <button
                        onClick={() =>
                          verifyApplicationDocument(doc.id, { verified: true }).then(loadData)
                        }
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                        title="Quick Verify"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{previewDoc.documentName}</h3>
                <p className="text-sm text-gray-600 truncate">{previewDoc.fileName}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {!previewDoc.isVerified && (
                  <div className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">
                    Click image to verify
                  </div>
                )}
                {previewDoc.isVerified && (
                  <div className="flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Preview Body - Full Size, Clickable */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
              {/* Debug Info */}
              {!previewDoc.fileUrl && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium mb-2">Image URL is missing</p>
                  <p className="text-sm text-gray-600 font-mono bg-gray-200 p-2 rounded">
                    fileUrl: {JSON.stringify(previewDoc.fileUrl)}
                  </p>
                </div>
              )}
              
              {previewDoc.fileUrl && previewDoc.fileType?.includes("image") ? (
                <div
                  className={`relative max-w-full max-h-full ${
                    !previewDoc.isVerified ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (!previewDoc.isVerified) {
                      verifyApplicationDocument(previewDoc.id, { verified: true }).then(() => {
                        loadData();
                        setPreviewDoc(null);
                      });
                    }
                  }}
                >
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.documentName}
                    className="max-w-full max-h-[calc(95vh-200px)] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  />
                  {!previewDoc.isVerified && (
                    <div className="absolute inset-0 bg-green-600/0 hover:bg-green-600/10 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Click to Verify
                      </div>
                    </div>
                  )}
                </div>
              ) : previewDoc.fileType?.includes("pdf") ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-full min-h-[600px] border-0 rounded-lg"
                  title={previewDoc.documentName}
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg p-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="text-sm text-gray-600">
                {(previewDoc.fileSize! / 1024).toFixed(2)} KB • Uploaded{" "}
                {new Date(previewDoc.uploadedAt || previewDoc.createdAt).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
                {!previewDoc.isVerified && (
                  <Button
                    onClick={() => {
                      verifyApplicationDocument(previewDoc.id, { verified: true }).then(() => {
                        loadData();
                        setPreviewDoc(null);
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Document
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
