"use client";

import { useState, useCallback } from "react";
import { X, Upload, File, CheckCircle, XCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkUploadApplicationDocuments, type Application } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Common document types for applications
const DOCUMENT_CHECKLIST = [
  { type: "passport", label: "Passport", required: true },
  { type: "academic_transcript", label: "Academic Transcript", required: true },
  { type: "degree_certificate", label: "Degree Certificate", required: true },
  { type: "english_test_result", label: "English Test Result", required: true },
  { type: "recommendation_letter", label: "Recommendation Letter", required: false },
  { type: "statement_of_purpose", label: "Statement of Purpose (SOP)", required: true },
  { type: "cv_resume", label: "CV / Resume", required: true },
  { type: "financial_documents", label: "Financial Documents", required: true },
  { type: "work_experience_letter", label: "Work Experience Letter", required: false },
  { type: "birth_certificate", label: "Birth Certificate", required: false },
  { type: "passport_photo", label: "Passport Photo", required: true },
  { type: "police_clearance", label: "Police Clearance", required: false },
  { type: "medical_certificate", label: "Medical Certificate", required: false },
  { type: "scholarship_documents", label: "Scholarship Documents", required: false },
  { type: "other", label: "Other Documents", required: false },
];

interface FileWithMeta {
  file: File;
  documentType: string;
  documentName: string;
  isRequired: boolean;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  fileUrl?: string;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  applications: Application[];
}

export default function BulkUploadModal({ open, onClose, onComplete, applications }: Props) {
  const [selectedApp, setSelectedApp] = useState("");
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const filesWithMeta: FileWithMeta[] = newFiles.map((file) => {
      // Try to auto-detect document type from filename
      const fileName = file.name.toLowerCase();
      let detectedType = "other";
      let docName = file.name;

      if (fileName.includes("passport")) {
        detectedType = "passport";
        docName = "Passport";
      } else if (fileName.includes("transcript")) {
        detectedType = "academic_transcript";
        docName = "Academic Transcript";
      } else if (fileName.includes("degree") || fileName.includes("certificate")) {
        detectedType = "degree_certificate";
        docName = "Degree Certificate";
      } else if (fileName.includes("ielts") || fileName.includes("pte") || fileName.includes("toefl")) {
        detectedType = "english_test_result";
        docName = "English Test Result";
      } else if (fileName.includes("sop") || fileName.includes("statement")) {
        detectedType = "statement_of_purpose";
        docName = "Statement of Purpose";
      } else if (fileName.includes("cv") || fileName.includes("resume")) {
        detectedType = "cv_resume";
        docName = "CV / Resume";
      } else if (fileName.includes("financial") || fileName.includes("bank")) {
        detectedType = "financial_documents";
        docName = "Financial Documents";
      } else if (fileName.includes("photo")) {
        detectedType = "passport_photo";
        docName = "Passport Photo";
      }

      const docType = DOCUMENT_CHECKLIST.find(d => d.type === detectedType);

      return {
        file,
        documentType: detectedType,
        documentName: docName,
        isRequired: docType?.required || false,
        status: "pending" as const,
        progress: 0,
      };
    });

    setFiles((prev) => [...prev, ...filesWithMeta]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index: number, newType: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      const docType = DOCUMENT_CHECKLIST.find(d => d.type === newType);
      updated[index] = {
        ...updated[index],
        documentType: newType,
        isRequired: docType?.required || false,
      };
      return updated;
    });
  };

  const updateFileName = (index: number, newName: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], documentName: newName };
      return updated;
    });
  };

  const uploadFile = async (fileWithMeta: FileWithMeta, index: number) => {
    const formData = new FormData();
    formData.append("file", fileWithMeta.file);

    try {
      // Update status to uploading
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "uploading", progress: 0 };
        return updated;
      });

      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      
      // Extract fileUrl from response (could be data.fileUrl, data.data.fileUrl, or data.url)
      const fileUrl = data.data?.fileUrl || data.data?.url || data.fileUrl || data.url;
      
      // Update with success
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: "success",
          progress: 100,
          fileUrl: fileUrl,
        };
        return updated;
      });
    } catch (err: any) {
      // Update with error
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: "error",
          progress: 0,
          error: err.message || "Upload failed",
        };
        return updated;
      });
      throw err;
    }
  };

  const handleUploadAll = async () => {
    if (!selectedApp) {
      setError("Please select an application");
      return;
    }

    if (files.length === 0) {
      setError("Please add at least one file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload all files first
      await Promise.all(
        files.map((fileWithMeta, index) => uploadFile(fileWithMeta, index))
      );

      // Check if all uploads succeeded
      const failedUploads = files.filter(f => f.status === "error");
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} file(s) failed to upload`);
        setUploading(false);
        return;
      }

      // Create document records
      const documents = files.map((f) => ({
        applicationId: selectedApp,
        documentType: f.documentType,
        documentName: f.documentName,
        isRequired: f.isRequired,
        fileName: f.file.name,
        fileUrl: f.fileUrl,
        fileType: f.file.type,
        fileSize: f.file.size,
        status: "uploaded",
      }));

      const res = await bulkUploadApplicationDocuments(documents);

      if (res.success) {
        onComplete();
        resetForm();
      } else {
        setError(res.message || "Failed to create document records");
      }
    } catch (err: any) {
      setError(err?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedApp("");
    setFiles([]);
    setError(null);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  if (!open) return null;

  const completedCount = files.filter(f => f.status === "success").length;
  const errorCount = files.filter(f => f.status === "error").length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bulk Upload Documents</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload multiple documents at once for an application
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Application Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Application <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">Choose application...</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.student?.fullName || "Unknown Student"}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-[#1e3a8a] bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-[#1e3a8a]" : "text-gray-400"}`} />
            <p className="text-sm font-medium text-gray-700 mb-2">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Upload multiple files at once (PDF, JPG, PNG, DOC)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse Files
              </Button>
            </label>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Uploaded Files ({files.length})
                </h3>
                {completedCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {completedCount} completed
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-xs text-red-600 font-medium">
                    {errorCount} failed
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {files.map((fileWithMeta, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {fileWithMeta.status === "pending" && (
                        <File className="w-5 h-5 text-gray-400" />
                      )}
                      {fileWithMeta.status === "uploading" && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {fileWithMeta.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {fileWithMeta.status === "error" && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Document Name
                          </label>
                          <input
                            type="text"
                            value={fileWithMeta.documentName}
                            onChange={(e) => updateFileName(index, e.target.value)}
                            disabled={uploading}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Document Type
                          </label>
                          <select
                            value={fileWithMeta.documentType}
                            onChange={(e) => updateFileType(index, e.target.value)}
                            disabled={uploading}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {DOCUMENT_CHECKLIST.map((doc) => (
                              <option key={doc.type} value={doc.type}>
                                {doc.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{fileWithMeta.file.name}</span>
                        <span>•</span>
                        <span>{(fileWithMeta.file.size / 1024).toFixed(1)} KB</span>
                        {fileWithMeta.isRequired && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">Required</span>
                          </>
                        )}
                      </div>

                      {fileWithMeta.status === "error" && fileWithMeta.error && (
                        <p className="text-xs text-red-600">{fileWithMeta.error}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {files.length > 0 && (
              <span>{files.length} file(s) ready to upload</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadAll}
              disabled={uploading || files.length === 0 || !selectedApp}
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading {completedCount}/{files.length}...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload All ({files.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
