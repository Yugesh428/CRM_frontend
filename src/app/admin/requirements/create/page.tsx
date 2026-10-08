"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ArrowLeft, Plus, X, BookOpen, Globe,
  GraduationCap, FileCheck, Briefcase, Clock, Award,
} from "lucide-react";
import {
  createCourseRequirement,
  getAllUniversities,
  getAllCourses,
  getAllIntakes,
  type University,
  type Course,
  type Intake,
} from "@/lib/api";

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] disabled:bg-gray-50 disabled:text-gray-500";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

const STUDY_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "foundation", label: "Foundation" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "advanced_diploma", label: "Advanced Diploma" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "bachelor", label: "Bachelor" },
  { value: "graduate_diploma", label: "Graduate Diploma" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "master", label: "Master" },
  { value: "phd", label: "PhD" },
  { value: "postdoctoral", label: "Postdoctoral" },
];

const STUDY_GAP_POLICIES = [
  { value: "no_gap_allowed", label: "No Gap Allowed" },
  { value: "up_to_1_year", label: "Up to 1 Year" },
  { value: "up_to_2_years", label: "Up to 2 Years" },
  { value: "up_to_3_years", label: "Up to 3 Years" },
  { value: "up_to_5_years", label: "Up to 5 Years" },
  { value: "no_restriction", label: "No Restriction" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

export default function CreateRequirementPage() {
  const router = useRouter();

  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // Basic
    courseId: "",
    universityId: "",
    intakeId: "",
    applicableCountry: "",
    studyLevel: "",
    status: "active",

    // Academic
    minimumGPA: "",
    minimumPercentage: "",
    minimumQualification: "",
    academicRequirementNotes: "",
    requiredSubjects: [] as string[],
    subjectNotes: "",

    // IELTS
    ieltsOverall: "",
    ieltsListening: "",
    ieltsReading: "",
    ieltsWriting: "",
    ieltsSpeaking: "",

    // PTE
    pteOverall: "",
    pteListening: "",
    pteReading: "",
    pteWriting: "",
    pteSpeaking: "",

    // TOEFL
    toeflTotal: "",
    toeflListening: "",
    toeflReading: "",
    toeflWriting: "",
    toeflSpeaking: "",

    // Other English Tests
    duolingoScore: "",
    satTotal: "",
    actScore: "",
    greTotal: "",
    gmatTotal: "",
    englishRequirementNotes: "",
    moiAccepted: false,
    englishWaiverAvailable: false,

    // Work Experience
    workExperienceRequired: false,
    workExperienceYears: "",
    workExperienceDetails: "",

    // Study Gap
    studyGapPolicy: "no_restriction",
    studyGapNotes: "",

    // Documents
    requiredDocuments: [] as string[],
    documentNotes: "",

    // Additional
    additionalRequirements: "",
    scholarshipRequirements: "",
    interviewRequired: "",
    portfolioRequired: "",
    countrySpecificNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSubject, setNewSubject] = useState("");
  const [newDocument, setNewDocument] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [uniRes, courseRes, intakeRes] = await Promise.all([
        getAllUniversities({ limit: 200 }),
        getAllCourses({ limit: 500 }),
        getAllIntakes({ limit: 500 }),
      ]);
      if (uniRes.success) setUniversities(Array.isArray(uniRes.data) ? uniRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      if (intakeRes.success) setIntakes(Array.isArray(intakeRes.data) ? intakeRes.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function set(field: string, value: any) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function addSubject() {
    if (!newSubject.trim()) return;
    setForm((p) => ({ ...p, requiredSubjects: [...p.requiredSubjects, newSubject.trim()] }));
    setNewSubject("");
  }

  function removeSubject(index: number) {
    setForm((p) => ({ ...p, requiredSubjects: p.requiredSubjects.filter((_, i) => i !== index) }));
  }

  function addDocument() {
    if (!newDocument.trim()) return;
    setForm((p) => ({ ...p, requiredDocuments: [...p.requiredDocuments, newDocument.trim()] }));
    setNewDocument("");
  }

  function removeDocument(index: number) {
    setForm((p) => ({ ...p, requiredDocuments: p.requiredDocuments.filter((_, i) => i !== index) }));
  }

  function validate() {
    const err: Record<string, string> = {};
    if (!form.courseId) err.courseId = "Required";
    if (!form.universityId) err.universityId = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: any = { ...form };

      // Convert numeric fields
      const numericFields = [
        "minimumGPA", "minimumPercentage",
        "ieltsOverall", "ieltsListening", "ieltsReading", "ieltsWriting", "ieltsSpeaking",
        "pteOverall", "pteListening", "pteReading", "pteWriting", "pteSpeaking",
        "toeflTotal", "toeflListening", "toeflReading", "toeflWriting", "toeflSpeaking",
        "duolingoScore", "satTotal", "actScore", "greTotal", "gmatTotal",
        "workExperienceYears",
      ];

      numericFields.forEach((field) => {
        if (payload[field] && payload[field] !== "") {
          payload[field] = parseFloat(payload[field]);
        } else {
          delete payload[field];
        }
      });

      // Remove empty fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      // Ensure empty arrays are removed or sent properly
      if (payload.requiredSubjects && payload.requiredSubjects.length === 0) delete payload.requiredSubjects;
      if (payload.requiredDocuments && payload.requiredDocuments.length === 0) delete payload.requiredDocuments;

      // Empty strings for optional fields
      if (payload.intakeId === "") delete payload.intakeId;
      if (payload.applicableCountry === "") delete payload.applicableCountry;

      const res = await createCourseRequirement(payload);
      if (res.success) {
        router.push("/admin/requirements");
      } else {
        alert(res.message || "Failed to create requirement");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  const filteredCourses = form.universityId
    ? courses.filter((c) => c.universityId === form.universityId)
    : courses;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Course Requirement</h1>
              <p className="text-sm text-gray-500 mt-0.5">Define admission requirements for a course</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              {saving ? "Saving..." : "Create Requirement"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Basic Information */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>University *</label>
                <select value={form.universityId} onChange={(e) => set("universityId", e.target.value)} className={inp}>
                  <option value="">Select University</option>
                  {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
              </div>

              <div>
                <label className={lbl}>Course *</label>
                <select
                  value={form.courseId}
                  onChange={(e) => set("courseId", e.target.value)}
                  className={inp}
                  disabled={!form.universityId}
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
                {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
                {!form.universityId && <p className="text-xs text-amber-600 mt-1">Select a university first</p>}
              </div>

              <div>
                <label className={lbl}>Intake (Optional)</label>
                <select value={form.intakeId} onChange={(e) => set("intakeId", e.target.value)} className={inp}>
                  <option value="">All Intakes</option>
                  {intakes.map((i) => <option key={i.id} value={i.id}>{i.name} - {i.year}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all intakes</p>
              </div>

              <div>
                <label className={lbl}>Applicable Country (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nepal, India"
                  value={form.applicableCountry}
                  onChange={(e) => set("applicableCountry", e.target.value)}
                  className={inp}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for global requirements</p>
              </div>

              <div>
                <label className={lbl}>Study Level</label>
                <select value={form.studyLevel} onChange={(e) => set("studyLevel", e.target.value)} className={inp}>
                  <option value="">Select Level</option>
                  {STUDY_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div>
                <label className={lbl}>Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Academic Requirements */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Academic Requirements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Minimum GPA (out of 4.0)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 3.0"
                  value={form.minimumGPA}
                  onChange={(e) => set("minimumGPA", e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Minimum Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 65"
                  value={form.minimumPercentage}
                  onChange={(e) => set("minimumPercentage", e.target.value)}
                  className={inp}
                />
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Minimum Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor's degree in Computer Science or related field"
                  value={form.minimumQualification}
                  onChange={(e) => set("minimumQualification", e.target.value)}
                  className={inp}
                />
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Required Subjects</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add subject (e.g. Mathematics)"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                    className={inp}
                  />
                  <Button onClick={addSubject} type="button" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.requiredSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.requiredSubjects.map((subj, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 flex items-center gap-1">
                        {subj}
                        <button onClick={() => removeSubject(idx)} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Subject Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional subject requirements or notes"
                  value={form.subjectNotes}
                  onChange={(e) => set("subjectNotes", e.target.value)}
                  className={inp}
                />
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Academic Requirement Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional academic requirements or clarifications"
                  value={form.academicRequirementNotes}
                  onChange={(e) => set("academicRequirementNotes", e.target.value)}
                  className={inp}
                />
              </div>
            </div>
          </Card>

          {/* English Language Tests */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">English Language Requirements</h2>
            </div>

            {/* IELTS */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">IELTS</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={lbl}>Overall</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6.5"
                    value={form.ieltsOverall}
                    onChange={(e) => set("ieltsOverall", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Listening</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6.0"
                    value={form.ieltsListening}
                    onChange={(e) => set("ieltsListening", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Reading</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6.0"
                    value={form.ieltsReading}
                    onChange={(e) => set("ieltsReading", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Writing</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6.0"
                    value={form.ieltsWriting}
                    onChange={(e) => set("ieltsWriting", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Speaking</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6.0"
                    value={form.ieltsSpeaking}
                    onChange={(e) => set("ieltsSpeaking", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* PTE */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">PTE Academic</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={lbl}>Overall</label>
                  <input
                    type="number"
                    placeholder="58"
                    value={form.pteOverall}
                    onChange={(e) => set("pteOverall", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Listening</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.pteListening}
                    onChange={(e) => set("pteListening", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Reading</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.pteReading}
                    onChange={(e) => set("pteReading", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Writing</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.pteWriting}
                    onChange={(e) => set("pteWriting", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Speaking</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.pteSpeaking}
                    onChange={(e) => set("pteSpeaking", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* TOEFL */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">TOEFL iBT</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={lbl}>Total</label>
                  <input
                    type="number"
                    placeholder="79"
                    value={form.toeflTotal}
                    onChange={(e) => set("toeflTotal", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Listening</label>
                  <input
                    type="number"
                    placeholder="17"
                    value={form.toeflListening}
                    onChange={(e) => set("toeflListening", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Reading</label>
                  <input
                    type="number"
                    placeholder="18"
                    value={form.toeflReading}
                    onChange={(e) => set("toeflReading", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Writing</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={form.toeflWriting}
                    onChange={(e) => set("toeflWriting", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Speaking</label>
                  <input
                    type="number"
                    placeholder="18"
                    value={form.toeflSpeaking}
                    onChange={(e) => set("toeflSpeaking", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* Other Tests */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Other Tests</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={lbl}>Duolingo</label>
                  <input
                    type="number"
                    placeholder="105"
                    value={form.duolingoScore}
                    onChange={(e) => set("duolingoScore", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>SAT Total</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={form.satTotal}
                    onChange={(e) => set("satTotal", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>ACT Score</label>
                  <input
                    type="number"
                    placeholder="24"
                    value={form.actScore}
                    onChange={(e) => set("actScore", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>GRE Total</label>
                  <input
                    type="number"
                    placeholder="310"
                    value={form.greTotal}
                    onChange={(e) => set("greTotal", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>GMAT Total</label>
                  <input
                    type="number"
                    placeholder="600"
                    value={form.gmatTotal}
                    onChange={(e) => set("gmatTotal", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* MOI & Waiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.moiAccepted}
                  onChange={(e) => set("moiAccepted", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Medium of Instruction (MOI) Accepted
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.englishWaiverAvailable}
                  onChange={(e) => set("englishWaiverAvailable", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">
                  English Waiver Available
                </span>
              </label>
            </div>

            <div>
              <label className={lbl}>English Requirement Notes</label>
              <textarea
                rows={3}
                placeholder="Additional English requirements or clarifications (e.g., MOI accepted from native English countries)"
                value={form.englishRequirementNotes}
                onChange={(e) => set("englishRequirementNotes", e.target.value)}
                className={inp}
              />
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.workExperienceRequired}
                  onChange={(e) => set("workExperienceRequired", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Work Experience Required
                </span>
              </label>

              {form.workExperienceRequired && (
                <>
                  <div>
                    <label className={lbl}>Minimum Years</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={form.workExperienceYears}
                      onChange={(e) => set("workExperienceYears", e.target.value)}
                      className={inp}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Work Experience Details</label>
                    <textarea
                      rows={3}
                      placeholder="Details about work experience requirements (e.g., 2 years in IT industry)"
                      value={form.workExperienceDetails}
                      onChange={(e) => set("workExperienceDetails", e.target.value)}
                      className={inp}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Study Gap */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Study Gap Policy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Study Gap Policy</label>
                <select
                  value={form.studyGapPolicy}
                  onChange={(e) => set("studyGapPolicy", e.target.value)}
                  className={inp}
                >
                  {STUDY_GAP_POLICIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={lbl}>Study Gap Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes about study gap (e.g., Gap must be justified with documents)"
                  value={form.studyGapNotes}
                  onChange={(e) => set("studyGapNotes", e.target.value)}
                  className={inp}
                />
              </div>
            </div>
          </Card>

          {/* Required Documents */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Required Documents</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Documents</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add document (e.g. Passport, Transcripts)"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDocument())}
                    className={inp}
                  />
                  <Button onClick={addDocument} type="button" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.requiredDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.requiredDocuments.map((doc, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-700 flex items-center gap-1">
                        {doc}
                        <button onClick={() => removeDocument(idx)} className="hover:text-green-900">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={lbl}>Document Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional document requirements or notes"
                  value={form.documentNotes}
                  onChange={(e) => set("documentNotes", e.target.value)}
                  className={inp}
                />
              </div>
            </div>
          </Card>

          {/* Additional Requirements */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-lg font-bold text-gray-900">Additional Requirements</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Additional Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Any additional requirements not covered above"
                  value={form.additionalRequirements}
                  onChange={(e) => set("additionalRequirements", e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Scholarship Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Specific requirements to be eligible for scholarships"
                  value={form.scholarshipRequirements}
                  onChange={(e) => set("scholarshipRequirements", e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Interview Required</label>
                <input
                  type="text"
                  placeholder="e.g., Yes - video interview required"
                  value={form.interviewRequired}
                  onChange={(e) => set("interviewRequired", e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Portfolio Required</label>
                <input
                  type="text"
                  placeholder="e.g., Portfolio required for design courses"
                  value={form.portfolioRequired}
                  onChange={(e) => set("portfolioRequired", e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Country-Specific Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes specific to certain countries (e.g., Nepal applicants need police clearance)"
                  value={form.countrySpecificNotes}
                  onChange={(e) => set("countrySpecificNotes", e.target.value)}
                  className={inp}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {saving ? "Saving..." : "Create Requirement"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
