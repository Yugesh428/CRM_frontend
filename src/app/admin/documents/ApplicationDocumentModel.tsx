"use client";

import { useEffect, useState } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createApplicationDocument,
  updateApplicationDocument,
  type ApplicationDocument,
  type Application,
} from "@/lib/api";

// ==========================================
// CONSTANTS
// ==========================================
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

const STATUS_OPTIONS = [
  { value: "not_uploaded",      label: "Not Uploaded" },
  { value: "pending",           label: "Pending" },
  { value: "uploaded",          label: "Uploaded" },
  { value: "verified",          label: "Verified" },
  { value: "rejected",          label: "Rejected" },
  { value: "resubmit_required", label: "Resubmit Required" },
];

// ==========================================
// TYPES
// ==========================================
interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: ApplicationDocument | null;
  applications: Application[];
}

interface FormState {
  applicationId: string;
  documentType: string;
  documentName: string;
  description: string;
  isRequired: boolean;
  status: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
}

const EMPTY: FormState = {
  applicationId: "",
  documentType: "passport",
  documentName: "",
  description: "",
  isRequired: false,
  status: "not_uploaded",
  fileName: "",
  fileUrl: "",
  fileType: "",
  fileSize: "",
  issueDate: "",
  expiryDate: "",
  notes: "",
};

// ==========================================
// HELPERS
// ==========================================
function toDateInput(val?: string | Date | null): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]/40";

const inputErrCls =
  "w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 bg-[#1e3a8a] rounded" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// ==========================================
// MODAL
// ==========================================
export default function ApplicationDocumentModal({
  open,
  onClose,
  onSaved,
  initialData,
  applications,
}: Props) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);

    if (initialData) {
      setForm({
        applicationId: initialData.applicationId || "",
        documentType: initialData.documentType || "other",
        documentName: initialData.documentName || "",
        description: initialData.description || "",
        isRequired: !!initialData.isRequired,
        status: initialData.status || "not_uploaded",
        fileName: initialData.fileName || "",
        fileUrl: initialData.fileUrl || "",
        fileType: initialData.fileType || "",
        fileSize: initialData.fileSize != null ? String(initialData.fileSize) : "",
        issueDate: toDateInput(initialData.issueDate),
        expiryDate: toDateInput(initialData.expiryDate),
        notes: initialData.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, initialData]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key as string];
        return n;
      });
    }
  }

  // ==========================================
  // VALIDATION
  // ==========================================
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!isEdit && !form.applicationId) e.applicationId = "Application is required";
    if (!form.documentType) e.documentType = "Document type is required";
    if (!form.documentName.trim()) e.documentName = "Document name is required";

    if (form.fileSize && isNaN(parseInt(form.fileSize)))
      e.fileSize = "File size must be a number";

    if (
      form.issueDate &&
      form.expiryDate &&
      new Date(form.issueDate) > new Date(form.expiryDate)
    )
      e.expiryDate = "Expiry must be after issue date";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ==========================================
  // SUBMIT
  // ==========================================
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload: any = {
      documentType: form.documentType,
      documentName: form.documentName.trim(),
      description: form.description || undefined,
      isRequired: form.isRequired,
      status: form.status,
      fileName: form.fileName || undefined,
      fileUrl: form.fileUrl || undefined,
      fileType: form.fileType || undefined,
      fileSize: form.fileSize ? parseInt(form.fileSize) : undefined,
      issueDate: form.issueDate || undefined,
      expiryDate: form.expiryDate || undefined,
      notes: form.notes || undefined,
    };

    // Only include applicationId on create
    if (!isEdit) payload.applicationId = form.applicationId;

    try {
      const res = isEdit
        ? await updateApplicationDocument(initialData!.id, payload)
        : await createApplicationDocument(payload);

      if (res.success) onSaved();
      else setSubmitError(res.message || "Failed to save document");
    } catch (err: any) {
      setSubmitError(err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Document" : "Add Document"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? "Update document metadata, file URL, or status"
                : "Attach a document record to an application"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">

            {submitError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* LINKING */}
            <Section title="Linking">
              <Field
                label="Application"
                required={!isEdit}
                error={errors.applicationId}
                hint={isEdit ? "Application cannot be changed" : undefined}
              >
                <select
                  value={form.applicationId}
                  onChange={(e) => update("applicationId", e.target.value)}
                  className={errors.applicationId ? inputErrCls : inputCls}
                  disabled={isEdit}
                >
                  <option value="">Select application...</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.applicationNumber} — {a.student?.fullName || "—"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Document Type" required error={errors.documentType}>
                <select
                  value={form.documentType}
                  onChange={(e) => update("documentType", e.target.value)}
                  className={errors.documentType ? inputErrCls : inputCls}
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Document Name" required error={errors.documentName}>
                <input
                  type="text"
                  value={form.documentName}
                  onChange={(e) => update("documentName", e.target.value)}
                  placeholder="e.g. Bachelor Transcript"
                  maxLength={200}
                  className={errors.documentName ? inputErrCls : inputCls}
                />
              </Field>

              <Field label="Is Required?">
                <div className="flex items-center gap-3 mt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRequired}
                      onChange={(e) => update("isRequired", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    />
                    <span className="text-sm text-gray-700">Required for application</span>
                  </label>
                </div>
              </Field>

              <Field label="Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Short description..."
                  className={inputCls}
                />
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </Section>

            {/* FILE INFO */}
            <Section title="File Information">
              <Field label="File Name">
                <input
                  type="text"
                  value={form.fileName}
                  onChange={(e) => update("fileName", e.target.value)}
                  placeholder="transcript.pdf"
                  className={inputCls}
                />
              </Field>

              <Field label="File Type" hint="pdf, jpg, png, doc, etc.">
                <input
                  type="text"
                  value={form.fileType}
                  onChange={(e) => update("fileType", e.target.value)}
                  placeholder="pdf"
                  className={inputCls}
                />
              </Field>

              <Field label="File URL" hint="Public URL returned by your upload endpoint">
                <input
                  type="url"
                  value={form.fileUrl}
                  onChange={(e) => update("fileUrl", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>

              <Field label="File Size (bytes)" error={errors.fileSize}>
                <input
                  type="number"
                  min="0"
                  value={form.fileSize}
                  onChange={(e) => update("fileSize", e.target.value)}
                  placeholder="e.g. 245760"
                  className={errors.fileSize ? inputErrCls : inputCls}
                />
              </Field>
            </Section>

            {/* VALIDITY */}
            <Section title="Validity">
              <Field label="Issue Date">
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => update("issueDate", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Expiry Date" error={errors.expiryDate}>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => update("expiryDate", e.target.value)}
                  className={errors.expiryDate ? inputErrCls : inputCls}
                />
              </Field>
            </Section>

            {/* NOTES */}
            <Section title="Notes">
              <div className="md:col-span-2">
                <Field label="Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any additional notes..."
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
