"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createApplication,
  updateApplication,
  type Application,
  type University,
  type Course,
  type Intake,
  type Lead,
  type Counselor,
} from "@/lib/api";

// ==========================================
// ENUM OPTIONS
// ==========================================
const STATUS_OPTIONS = [
  { value: "new",               label: "New" },
  { value: "in_progress",       label: "In Progress" },
  { value: "documents_pending", label: "Documents Pending" },
  { value: "ready_to_submit",   label: "Ready to Submit" },
  { value: "submitted",         label: "Submitted" },
  { value: "offer_received",    label: "Offer Received" },
  { value: "offer_accepted",    label: "Offer Accepted" },
  { value: "rejected",          label: "Rejected" },
  { value: "withdrawn",         label: "Withdrawn" },
  { value: "visa",              label: "Visa" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CHANNEL_OPTIONS = [
  { value: "consultancy",   label: "Consultancy" },
  { value: "direct",        label: "Direct" },
  { value: "agent",         label: "Agent" },
  { value: "online_portal", label: "Online Portal" },
  { value: "walk_in",       label: "Walk-in" },
];

const TYPE_OPTIONS = [
  { value: "new_application", label: "New Application" },
  { value: "transfer",        label: "Transfer" },
  { value: "re_application",  label: "Re-application" },
  { value: "course_change",   label: "Course Change" },
];

const SUBMISSION_METHOD_OPTIONS = [
  { value: "university_portal",  label: "University Portal" },
  { value: "email",              label: "Email" },
  { value: "consultancy_portal", label: "Consultancy Portal" },
  { value: "courier",            label: "Courier" },
  { value: "agent_submission",   label: "Agent Submission" },
  { value: "online_system",      label: "Online System" },
];

const QUALIFICATION_OPTIONS = [
  { value: "SEE / SLC",                    label: "SEE / SLC" },
  { value: "+2 / A Levels / 12th Grade",   label: "+2 / A Levels / 12th Grade" },
  { value: "Diploma",                      label: "Diploma" },
  { value: "Bachelor's Degree",            label: "Bachelor's Degree" },
  { value: "Postgraduate Diploma",         label: "Postgraduate Diploma" },
  { value: "Master's Degree",              label: "Master's Degree" },
  { value: "PhD / Doctorate",              label: "PhD / Doctorate" },
  { value: "Other",                        label: "Other" },
];

const ENGLISH_TEST_OPTIONS = [
  { value: "",          label: "Not Taken" },
  { value: "IELTS",     label: "IELTS" },
  { value: "PTE",       label: "PTE Academic" },
  { value: "TOEFL",     label: "TOEFL iBT" },
  { value: "Duolingo",  label: "Duolingo English Test" },
  { value: "SAT",       label: "SAT" },
  { value: "ACT",       label: "ACT" },
  { value: "GRE",       label: "GRE" },
  { value: "GMAT",      label: "GMAT" },
  { value: "MOI",       label: "MOI (Medium of Instruction)" },
  { value: "Exempt",    label: "Exempt / Waiver" },
];

// Score ranges per test type
const SCORE_HINTS: Record<string, { placeholder: string; min: number; max: number; step: number }> = {
  IELTS:    { placeholder: "e.g. 6.5",  min: 0,    max: 9,    step: 0.5 },
  PTE:      { placeholder: "e.g. 65",   min: 0,    max: 90,   step: 1 },
  TOEFL:    { placeholder: "e.g. 79",   min: 0,    max: 120,  step: 1 },
  Duolingo: { placeholder: "e.g. 105",  min: 10,   max: 160,  step: 1 },
  SAT:      { placeholder: "e.g. 1200", min: 400,  max: 1600, step: 10 },
  ACT:      { placeholder: "e.g. 24",   min: 1,    max: 36,   step: 1 },
  GRE:      { placeholder: "e.g. 310",  min: 260,  max: 340,  step: 1 },
  GMAT:     { placeholder: "e.g. 600",  min: 200,  max: 800,  step: 10 },
};

// ==========================================
// TYPES
// ==========================================
interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: Application | null;
  universities: University[];
  courses: Course[];
  intakes: Intake[];
  leads: Lead[];
  counselors: Counselor[];
}

interface FormState {
  studentId: string;
  universityId: string;
  campusId: string;
  courseId: string;
  intakeId: string;
  applicationType: string;
  applicationChannel: string;
  applicationDate: string;
  priority: string;
  status: string;
  assignedStaffId: string;          // counselor ID
  highestQualification: string;
  customQualification: string;      // shown only when "Other" selected
  institution: string;
  graduationYear: string;
  gpa: string;
  percentage: string;
  englishTest: string;
  englishTestOverallScore: string;
  englishTestListening: string;
  englishTestReading: string;
  englishTestWriting: string;
  englishTestSpeaking: string;
  englishTestDate: string;
  submissionDate: string;
  universityReferenceNumber: string;
  submissionMethod: string;
  portalId: string;
  notes: string;
  internalNotes: string;
}

const EMPTY_FORM: FormState = {
  studentId: "",
  universityId: "",
  campusId: "",
  courseId: "",
  intakeId: "",
  applicationType: "new_application",
  applicationChannel: "consultancy",
  applicationDate: new Date().toISOString().slice(0, 10),
  priority: "medium",
  status: "new",
  assignedStaffId: "",
  highestQualification: "",
  customQualification: "",
  institution: "",
  graduationYear: "",
  gpa: "",
  percentage: "",
  englishTest: "",
  englishTestOverallScore: "",
  englishTestListening: "",
  englishTestReading: "",
  englishTestWriting: "",
  englishTestSpeaking: "",
  englishTestDate: "",
  submissionDate: "",
  universityReferenceNumber: "",
  submissionMethod: "",
  portalId: "",
  notes: "",
  internalNotes: "",
};

function toDateInput(val?: string | Date | null): string {
  if (!val) return "";
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// ==========================================
// REUSABLE FIELD WRAPPER
// ==========================================
function Field({
  label, required, error, hint, children, colSpan,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  colSpan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const cls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]/40 bg-white";
const errCls = "w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white";

function inp(err?: string) { return err ? errCls : cls; }

// ==========================================
// SECTION WRAPPER
// ==========================================
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
// MODAL COMPONENT
// ==========================================
export default function ApplicationModal({
  open, onClose, onSaved,
  initialData, universities, courses, intakes, leads, counselors,
}: Props) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Reset when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);

    if (initialData) {
      // Handle "Other" qualification - check if it's a custom value
      const isKnownQualification = QUALIFICATION_OPTIONS.some(
        opt => opt.value === initialData.highestQualification
      );
      const qualificationValue: string = isKnownQualification 
        ? (initialData.highestQualification || "") 
        : (initialData.highestQualification ? "Other" : "");
      const customQualValue: string = (!isKnownQualification && initialData.highestQualification) 
        ? initialData.highestQualification 
        : "";

      setForm({
        studentId:                initialData.studentId || "",
        universityId:             initialData.universityId || "",
        campusId:                 initialData.campusId || "",
        courseId:                 initialData.courseId || "",
        intakeId:                 initialData.intakeId || "",
        applicationType:          initialData.applicationType || "new_application",
        applicationChannel:       initialData.applicationChannel || "consultancy",
        applicationDate:          toDateInput(initialData.applicationDate) || new Date().toISOString().slice(0, 10),
        priority:                 initialData.priority || "medium",
        status:                   initialData.status || "new",
        assignedStaffId:          initialData.assignedStaffId || "",
        highestQualification:     qualificationValue,
        customQualification:      customQualValue,
        institution:              initialData.institution || "",
        graduationYear:           initialData.graduationYear || "",
        gpa:                      initialData.gpa != null ? String(initialData.gpa) : "",
        percentage:               initialData.percentage != null ? String(initialData.percentage) : "",
        englishTest:              initialData.englishTest || "",
        englishTestOverallScore:  initialData.englishTestOverallScore != null ? String(initialData.englishTestOverallScore) : "",
        englishTestListening:     (initialData.englishTestScores?.listening != null) ? String(initialData.englishTestScores.listening) : "",
        englishTestReading:       (initialData.englishTestScores?.reading != null) ? String(initialData.englishTestScores.reading) : "",
        englishTestWriting:       (initialData.englishTestScores?.writing != null) ? String(initialData.englishTestScores.writing) : "",
        englishTestSpeaking:      (initialData.englishTestScores?.speaking != null) ? String(initialData.englishTestScores.speaking) : "",
        englishTestDate:          toDateInput(initialData.englishTestDate),
        submissionDate:           toDateInput(initialData.submissionDate),
        universityReferenceNumber: initialData.universityReferenceNumber || "",
        submissionMethod:         initialData.submissionMethod || "",
        portalId:                 initialData.portalId || "",
        notes:                    initialData.notes || "",
        internalNotes:            initialData.internalNotes || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialData]);

  // ── Cascading selects ────────────────────────────────────────────────
  const availableCourses = useMemo(() => {
    if (!form.universityId) return courses;
    return courses.filter((c: any) => !c.universityId || c.universityId === form.universityId);
  }, [courses, form.universityId]);

  const availableIntakes = useMemo(() => {
    if (!form.courseId) return intakes;
    return intakes.filter((i: any) => !i.courseId || i.courseId === form.courseId);
  }, [intakes, form.courseId]);

  useEffect(() => {
    if (form.courseId && !availableCourses.find((c) => c.id === form.courseId))
      setForm((f) => ({ ...f, courseId: "" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.universityId]);

  useEffect(() => {
    if (form.intakeId && !availableIntakes.find((i) => i.id === form.intakeId))
      setForm((f) => ({ ...f, intakeId: "" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.courseId]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  }

  // ── Score hint for selected test ─────────────────────────────────────
  const scoreHint = SCORE_HINTS[form.englishTest] ?? { placeholder: "e.g. 6.5", min: 0, max: 120, step: 0.1 };
  const showBands = ["IELTS", "PTE", "TOEFL"].includes(form.englishTest);

  // ── Actual qualification value (handle "Other") ──────────────────────
  const qualificationValue = form.highestQualification === "Other"
    ? form.customQualification
    : form.highestQualification;

  // ── Validation ────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.studentId)      e.studentId      = "Student is required";
    if (!form.universityId)   e.universityId   = "University is required";
    if (!form.courseId)       e.courseId       = "Course is required";
    if (!form.intakeId)       e.intakeId       = "Intake is required";
    if (!form.applicationDate) e.applicationDate = "Application date is required";
    if (form.highestQualification === "Other" && !form.customQualification)
      e.customQualification = "Please specify qualification";
    if (form.gpa && (parseFloat(form.gpa) < 0 || parseFloat(form.gpa) > 4))
      e.gpa = "GPA must be between 0 and 4";
    if (form.percentage) {
      const p = parseFloat(form.percentage);
      if (isNaN(p) || p < 0 || p > 100) e.percentage = "Percentage must be 0–100";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);

    const englishTestScores =
      showBands &&
      (form.englishTestListening || form.englishTestReading || form.englishTestWriting || form.englishTestSpeaking)
        ? {
            listening: form.englishTestListening ? parseFloat(form.englishTestListening) : undefined,
            reading:   form.englishTestReading   ? parseFloat(form.englishTestReading)   : undefined,
            writing:   form.englishTestWriting   ? parseFloat(form.englishTestWriting)   : undefined,
            speaking:  form.englishTestSpeaking  ? parseFloat(form.englishTestSpeaking)  : undefined,
          }
        : undefined;

    const payload: Partial<Application> = {
      studentId:                   form.studentId,
      universityId:                form.universityId,
      campusId:                    form.campusId || undefined,
      courseId:                    form.courseId,
      intakeId:                    form.intakeId,
      applicationType:             form.applicationType as any,
      applicationChannel:          form.applicationChannel as any,
      applicationDate:             form.applicationDate,
      priority:                    form.priority as any,
      status:                      form.status as any,
      assignedStaffId:             form.assignedStaffId || undefined,
      highestQualification:        qualificationValue || undefined,
      institution:                 form.institution || undefined,
      graduationYear:              form.graduationYear || undefined,
      gpa:                         form.gpa ? parseFloat(form.gpa) : undefined,
      percentage:                  form.percentage ? parseFloat(form.percentage) : undefined,
      englishTest:                 form.englishTest || undefined,
      englishTestOverallScore:     form.englishTestOverallScore ? parseFloat(form.englishTestOverallScore) : undefined,
      englishTestScores,
      englishTestDate:             form.englishTestDate || undefined,
      submissionDate:              form.submissionDate || undefined,
      universityReferenceNumber:   form.universityReferenceNumber || undefined,
      submissionMethod:            form.submissionMethod as any || undefined,
      portalId:                    form.portalId || undefined,
      notes:                       form.notes || undefined,
      internalNotes:               form.internalNotes || undefined,
    };

    try {
      const res = isEdit
        ? await updateApplication(initialData!.id, payload)
        : await createApplication(payload);
      if (res.success) { onSaved(); }
      else { setSubmitError(res.message || "Failed to save application"); }
    } catch (err: any) {
      setSubmitError(err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl my-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Application" : "New Application"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? `Editing ${initialData?.applicationNumber}` : "Fill in the details to create a new application"}
            </p>
          </div>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8 max-h-[72vh] overflow-y-auto">

            {submitError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* ── 1. STUDENT & PROGRAM ── */}
            <Section title="Student & Program">
              <Field label="Student" required error={errors.studentId}>
                <select value={form.studentId} onChange={(e) => set("studentId", e.target.value)} className={inp(errors.studentId)}>
                  <option value="">Select student...</option>
                  {(leads || []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName}{l.phone ? ` — ${l.phone}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Student Info Preview */}
              {form.studentId && (() => {
                const selectedStudent = leads?.find(l => l.id === form.studentId);
                if (!selectedStudent) return null;
                return (
                  <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-blue-900 mb-2 uppercase">Student Information</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-600">Full Name:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedStudent.fullName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedStudent.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 text-gray-900">{selectedStudent.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Country:</span>
                        <span className="ml-2 text-gray-900">{selectedStudent.country || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">City:</span>
                        <span className="ml-2 text-gray-900">{selectedStudent.city || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Nationality:</span>
                        <span className="ml-2 text-gray-900">{selectedStudent.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <span className="ml-2 text-gray-900 capitalize">{selectedStudent.gender || "—"}</span>
                      </div>
                      {selectedStudent.highestQualification && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Qualification:</span>
                          <span className="ml-2 text-gray-900">{selectedStudent.highestQualification}</span>
                          {selectedStudent.institution && (
                            <span className="text-gray-600"> from {selectedStudent.institution}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {(selectedStudent.firstName === null || selectedStudent.dateOfBirth === null || selectedStudent.nationality === null) && (
                      <p className="text-xs text-amber-700 mt-2 italic">
                        ⚠️ Some student information is incomplete. Please update the lead profile.
                      </p>
                    )}
                  </div>
                );
              })()}

              <Field label="University" required error={errors.universityId}>
                <select value={form.universityId} onChange={(e) => set("universityId", e.target.value)} className={inp(errors.universityId)}>
                  <option value="">Select university...</option>
                  {(universities || []).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.country}</option>
                  ))}
                </select>
              </Field>

              <Field label="Course" required error={errors.courseId}>
                <select value={form.courseId} onChange={(e) => set("courseId", e.target.value)} disabled={!form.universityId} className={inp(errors.courseId)}>
                  <option value="">Select course...</option>
                  {(availableCourses || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code}) — {c.level}</option>
                  ))}
                </select>
              </Field>

              <Field label="Intake" required error={errors.intakeId}>
                <select value={form.intakeId} onChange={(e) => set("intakeId", e.target.value)} disabled={!form.courseId} className={inp(errors.intakeId)}>
                  <option value="">Select intake...</option>
                  {availableIntakes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.label || `${i.month} ${i.year}`}
                      {i.status ? ` (${i.status})` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </Section>

            {/* ── 2. APPLICATION DETAILS ── */}
            <Section title="Application Details">
              <Field label="Application Type">
                <select value={form.applicationType} onChange={(e) => set("applicationType", e.target.value)} className={cls}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Channel">
                <select value={form.applicationChannel} onChange={(e) => set("applicationChannel", e.target.value)} className={cls}>
                  {CHANNEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Application Date" required error={errors.applicationDate}>
                <input type="date" value={form.applicationDate} onChange={(e) => set("applicationDate", e.target.value)} className={inp(errors.applicationDate)} />
              </Field>

              <Field label="Priority">
                <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={cls}>
                  {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={cls}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              {/* Counselor dropdown — replaces the UUID text field */}
              <Field label="Assign Counselor" hint="Optional — the counselor handling this application">
                <select value={form.assignedStaffId} onChange={(e) => set("assignedStaffId", e.target.value)} className={cls}>
                  <option value="">— Unassigned —</option>
                  {(counselors || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}{c.designation ? ` (${c.designation})` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </Section>

            {/* ── 3. ACADEMIC INFORMATION ── */}
            <Section title="Academic Information">
              <Field label="Highest Qualification" error={errors.highestQualification}>
                <select
                  value={form.highestQualification}
                  onChange={(e) => set("highestQualification", e.target.value)}
                  className={cls}
                >
                  <option value="">Select qualification...</option>
                  {QUALIFICATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              {/* Show free-text only when "Other" is selected */}
              {form.highestQualification === "Other" && (
                <Field label="Specify Qualification" required error={errors.customQualification}>
                  <input
                    type="text"
                    value={form.customQualification}
                    onChange={(e) => set("customQualification", e.target.value)}
                    placeholder="e.g. Advanced Diploma in IT"
                    className={inp(errors.customQualification)}
                  />
                </Field>
              )}

              <Field label="Institution / School">
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => set("institution", e.target.value)}
                  placeholder="e.g. Tribhuvan University"
                  className={cls}
                />
              </Field>

              <Field label="Graduation Year">
                <select value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} className={cls}>
                  <option value="">Select year...</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                    <option key={yr} value={String(yr)}>{yr}</option>
                  ))}
                </select>
              </Field>

              <Field label="GPA" error={errors.gpa} hint="Scale 0–4">
                <input
                  type="number" step="0.01" min="0" max="4"
                  value={form.gpa}
                  onChange={(e) => set("gpa", e.target.value)}
                  placeholder="e.g. 3.2"
                  className={inp(errors.gpa)}
                />
              </Field>

              <Field label="Percentage" error={errors.percentage} hint="Out of 100">
                <input
                  type="number" step="0.01" min="0" max="100"
                  value={form.percentage}
                  onChange={(e) => set("percentage", e.target.value)}
                  placeholder="e.g. 75.5"
                  className={inp(errors.percentage)}
                />
              </Field>
            </Section>

            {/* ── 4. ENGLISH TEST ── */}
            <Section title="English Test">
              <Field label="Test Type">
                <select value={form.englishTest} onChange={(e) => set("englishTest", e.target.value)} className={cls}>
                  {ENGLISH_TEST_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              {form.englishTest && form.englishTest !== "Exempt" && form.englishTest !== "MOI" && (
                <>
                  <Field label="Overall Score" error={errors.englishTestOverallScore}
                    hint={`${scoreHint.placeholder} · Range: ${scoreHint.min}–${scoreHint.max}`}
                  >
                    <input
                      type="number"
                      step={scoreHint.step}
                      min={scoreHint.min}
                      max={scoreHint.max}
                      value={form.englishTestOverallScore}
                      onChange={(e) => set("englishTestOverallScore", e.target.value)}
                      placeholder={scoreHint.placeholder}
                      className={inp(errors.englishTestOverallScore)}
                    />
                  </Field>

                  <Field label="Test Date">
                    <input type="date" value={form.englishTestDate} onChange={(e) => set("englishTestDate", e.target.value)} className={cls} />
                  </Field>

                  {/* Band scores for IELTS / PTE / TOEFL */}
                  {showBands && (
                    <>
                      <Field label="Listening">
                        <input type="number" step={scoreHint.step} value={form.englishTestListening}
                          onChange={(e) => set("englishTestListening", e.target.value)}
                          placeholder={scoreHint.placeholder} className={cls} />
                      </Field>
                      <Field label="Reading">
                        <input type="number" step={scoreHint.step} value={form.englishTestReading}
                          onChange={(e) => set("englishTestReading", e.target.value)}
                          placeholder={scoreHint.placeholder} className={cls} />
                      </Field>
                      <Field label="Writing">
                        <input type="number" step={scoreHint.step} value={form.englishTestWriting}
                          onChange={(e) => set("englishTestWriting", e.target.value)}
                          placeholder={scoreHint.placeholder} className={cls} />
                      </Field>
                      <Field label="Speaking">
                        <input type="number" step={scoreHint.step} value={form.englishTestSpeaking}
                          onChange={(e) => set("englishTestSpeaking", e.target.value)}
                          placeholder={scoreHint.placeholder} className={cls} />
                      </Field>
                    </>
                  )}
                </>
              )}
            </Section>

            {/* ── 5. SUBMISSION (edit mode only) ── */}
            {isEdit && (
              <Section title="Submission Information">
                <Field label="Submission Date">
                  <input type="date" value={form.submissionDate} onChange={(e) => set("submissionDate", e.target.value)} className={cls} />
                </Field>

                <Field label="Submission Method">
                  <select value={form.submissionMethod} onChange={(e) => set("submissionMethod", e.target.value)} className={cls}>
                    <option value="">Not set</option>
                    {SUBMISSION_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>

                <Field label="University Reference Number">
                  <input type="text" value={form.universityReferenceNumber}
                    onChange={(e) => set("universityReferenceNumber", e.target.value)}
                    placeholder="e.g. UNI-REF-2026-0042" className={cls} />
                </Field>

                <Field label="Portal ID">
                  <input type="text" value={form.portalId}
                    onChange={(e) => set("portalId", e.target.value)}
                    placeholder="University portal login / ID" className={cls} />
                </Field>
              </Section>
            )}

            {/* ── 6. NOTES ── */}
            <Section title="Notes">
              <Field label="Student-Facing Notes">
                <textarea rows={3} value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Visible to student / counselor..." className={cls} />
              </Field>

              <Field label="Internal Notes" hint="Visible to staff only">
                <textarea rows={3} value={form.internalNotes}
                  onChange={(e) => set("internalNotes", e.target.value)}
                  placeholder="Internal remarks..." className={cls} />
              </Field>
            </Section>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white min-w-[140px]">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> {isEdit ? "Update" : "Create"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
