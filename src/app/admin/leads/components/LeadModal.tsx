"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, User, Globe, GraduationCap, Calendar, Languages } from "lucide-react";

interface LeadModalProps {
  mode: "create" | "edit";
  lead?: any;
  counselors?: Array<{ id: string; fullName: string }>;
  onSave: (data: any) => void;
  onClose: () => void;
  loading?: boolean;
}

const SOURCES = [
  "website", "facebook", "instagram", "linkedin", "twitter", "referral",
  "walk_in", "event", "agent", "phone_inquiry", "email_inquiry", "other",
];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const DEGREE_LEVELS = ["high_school", "diploma", "bachelor", "master", "phd", "certificate"];
const CONTACT_METHODS = ["email", "phone", "whatsapp", "sms"];
const ENGLISH_TEST_STATUSES = [
  "not_taken", "planning_to_take", "ielts", "pte", "toefl", "duolingo", "waived",
];
const EDU_STATUSES = ["completed", "in_progress", "awaiting_results"];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const sectionTitle = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-2";

function cap(s: string) {
  return s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function LeadModal({ mode, lead, counselors = [], onSave, onClose, loading }: LeadModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Basic
    fullName: lead?.fullName || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    alternativePhone: lead?.alternativePhone || "",
    dateOfBirth: lead?.dateOfBirth?.split("T")[0] || "",
    gender: lead?.gender || "",
    nationality: lead?.nationality || "",
    // Address
    address: lead?.address || "",
    city: lead?.city || "",
    province: lead?.province || "",
    country: lead?.country || "",
    // Lead meta
    source: lead?.source || "website",
    priority: lead?.priority || "medium",
    preferredContactMethod: lead?.preferredContactMethod || "email",
    remarks: lead?.remarks || "",
    nextFollowUpDate: lead?.nextFollowUpDate?.split("T")[0] || "",
    assignedToId: lead?.assignedToId || "",
    // Academic
    highestQualification: lead?.highestQualification || "",
    institution: lead?.institution || "",
    graduationYear: lead?.graduationYear || "",
    gpaPercentage: lead?.gpaPercentage || "",
    academicBackground: lead?.academicBackground || "",
    currentEducationStatus: lead?.currentEducationStatus || "",
    // Study Preferences
    preferredCountry: lead?.preferredCountry || "",
    secondPreferredCountry: lead?.secondPreferredCountry || "",
    preferredUniversityName: lead?.preferredUniversityName || "",
    preferredCourseName: lead?.preferredCourseName || "",
    degreeLevel: lead?.degreeLevel || "",
    preferredIntake: lead?.preferredIntake || "",
    studyDestination: lead?.studyDestination || "",
    estimatedBudget: lead?.estimatedBudget || "",
    // English
    englishTestStatus: lead?.englishTestStatus || "not_taken",
    ieltsOverall: lead?.ieltsOverall || "",
    ieltsListening: lead?.ieltsListening || "",
    ieltsReading: lead?.ieltsReading || "",
    ieltsWriting: lead?.ieltsWriting || "",
    ieltsSpeaking: lead?.ieltsSpeaking || "",
    ieltsExamDate: lead?.ieltsExamDate?.split("T")[0] || "",
    pteOverall: lead?.pteOverall || "",
    pteListening: lead?.pteListening || "",
    pteReading: lead?.pteReading || "",
    pteWriting: lead?.pteWriting || "",
    pteSpeaking: lead?.pteSpeaking || "",
    pteExamDate: lead?.pteExamDate?.split("T")[0] || "",
    toeflTotal: lead?.toeflTotal || "",
    toeflListening: lead?.toeflListening || "",
    toeflReading: lead?.toeflReading || "",
    toeflWriting: lead?.toeflWriting || "",
    toeflSpeaking: lead?.toeflSpeaking || "",
    toeflExamDate: lead?.toeflExamDate?.split("T")[0] || "",
    duolingoScore: lead?.duolingoScore || "",
    duolingoExamDate: lead?.duolingoExamDate?.split("T")[0] || "",
    greScore: lead?.greScore || "",
    gmatScore: lead?.gmatScore || "",
  });

  function set(field: string, value: any) {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    // Strip empty strings so backend doesn't overwrite with ""
    const clean: Record<string, any> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) clean[k] = v;
    });
    onSave(clean);
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "academic", label: "Academic & English", icon: GraduationCap },
    { id: "preferences", label: "Study Preferences", icon: Globe },
    { id: "assignment", label: "Assignment", icon: Calendar },
  ];

  const showIelts = ["ielts"].includes(formData.englishTestStatus);
  const showPte = ["pte"].includes(formData.englishTestStatus);
  const showToefl = ["toefl"].includes(formData.englishTestStatus);
  const showDuolingo = ["duolingo"].includes(formData.englishTestStatus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="max-w-4xl w-full my-8 flex flex-col max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200">

          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{mode === "create" ? "Add New Lead" : "Edit Lead"}</h2>
                <p className="text-xs text-blue-100">{mode === "create" ? "Create a new student inquiry" : "Update lead information"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-5 flex-shrink-0">
            <div className="flex gap-0.5 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-white">

            {/* ── Basic Info ── */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.fullName} onChange={(e) => set("fullName", e.target.value)}
                      placeholder="John Doe"
                      className={`${inputCls} ${errors.fullName ? "border-red-500" : ""}`} />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)}
                      placeholder="john@example.com"
                      className={`${inputCls} ${errors.email ? "border-red-500" : ""}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)}
                      placeholder="+977-98XXXXXXXX"
                      className={`${inputCls} ${errors.phone ? "border-red-500" : ""}`} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Alternative Phone</label>
                    <input type="tel" value={formData.alternativePhone} onChange={(e) => set("alternativePhone", e.target.value)} placeholder="+977-98XXXXXXXX" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={formData.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Nationality</label>
                    <input type="text" value={formData.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="e.g. Nepali, Indian" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Preferred Contact</label>
                    <select value={formData.preferredContactMethod} onChange={(e) => set("preferredContactMethod", e.target.value)} className={inputCls}>
                      {CONTACT_METHODS.map((m) => <option key={m} value={m}>{cap(m)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <p className={sectionTitle}>Address</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Street Address</label>
                    <textarea value={formData.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" rows={2} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" value={formData.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Province / State</label>
                    <input type="text" value={formData.province} onChange={(e) => set("province", e.target.value)} placeholder="Province" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input type="text" value={formData.country} onChange={(e) => set("country", e.target.value)} placeholder="Nepal" className={inputCls} />
                  </div>
                </div>

                {/* Lead meta */}
                <p className={sectionTitle}>Lead Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Source</label>
                    <select value={formData.source} onChange={(e) => set("source", e.target.value)} className={inputCls}>
                      {SOURCES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select value={formData.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{cap(p)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Academic & English ── */}
            {activeTab === "academic" && (
              <div className="space-y-4">
                <p className={sectionTitle}>Academic Background</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Highest Qualification</label>
                    <input type="text" value={formData.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} placeholder="e.g. Bachelor's in Computer Science" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Institution</label>
                    <input type="text" value={formData.institution} onChange={(e) => set("institution", e.target.value)} placeholder="School / College name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Graduation Year</label>
                    <input type="text" value={formData.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} placeholder="2023" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GPA / Percentage</label>
                    <input type="number" step="0.01" value={formData.gpaPercentage} onChange={(e) => set("gpaPercentage", e.target.value)} placeholder="e.g. 3.5 or 85" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Education Status</label>
                    <select value={formData.currentEducationStatus} onChange={(e) => set("currentEducationStatus", e.target.value)} className={inputCls}>
                      <option value="">Select Status</option>
                      {EDU_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Academic Background Notes</label>
                    <textarea value={formData.academicBackground} onChange={(e) => set("academicBackground", e.target.value)} placeholder="Any additional academic info..." rows={2} className={inputCls} />
                  </div>
                </div>

                <p className={sectionTitle}>English Proficiency</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Test Status</label>
                    <select value={formData.englishTestStatus} onChange={(e) => set("englishTestStatus", e.target.value)} className={inputCls}>
                      {ENGLISH_TEST_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                    </select>
                  </div>

                  {/* IELTS */}
                  {showIelts && (
                    <>
                      <p className="md:col-span-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">IELTS Scores</p>
                      {["Overall", "Listening", "Reading", "Writing", "Speaking"].map((sub) => {
                        const key = `ielts${sub}` as keyof typeof formData;
                        return (
                          <div key={sub}>
                            <label className={labelCls}>{sub} <span className="text-gray-400 font-normal">(0–9)</span></label>
                            <input type="number" step="0.5" min="0" max="9" value={formData[key] as string} onChange={(e) => set(key, e.target.value)} placeholder="e.g. 6.5" className={inputCls} />
                          </div>
                        );
                      })}
                      <div>
                        <label className={labelCls}>IELTS Exam Date</label>
                        <input type="date" value={formData.ieltsExamDate} onChange={(e) => set("ieltsExamDate", e.target.value)} className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* PTE */}
                  {showPte && (
                    <>
                      <p className="md:col-span-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">PTE Scores</p>
                      {["Overall", "Listening", "Reading", "Writing", "Speaking"].map((sub) => {
                        const key = `pte${sub}` as keyof typeof formData;
                        return (
                          <div key={sub}>
                            <label className={labelCls}>{sub} <span className="text-gray-400 font-normal">(0–90)</span></label>
                            <input type="number" min="0" max="90" value={formData[key] as string} onChange={(e) => set(key, e.target.value)} placeholder="e.g. 65" className={inputCls} />
                          </div>
                        );
                      })}
                      <div>
                        <label className={labelCls}>PTE Exam Date</label>
                        <input type="date" value={formData.pteExamDate} onChange={(e) => set("pteExamDate", e.target.value)} className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* TOEFL */}
                  {showToefl && (
                    <>
                      <p className="md:col-span-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">TOEFL Scores</p>
                      {[["Total", "toeflTotal", "120"], ["Listening", "toeflListening", "30"], ["Reading", "toeflReading", "30"], ["Writing", "toeflWriting", "30"], ["Speaking", "toeflSpeaking", "30"]].map(([label, key, max]) => (
                        <div key={key}>
                          <label className={labelCls}>{label} <span className="text-gray-400 font-normal">(0–{max})</span></label>
                          <input type="number" min="0" max={max} value={formData[key as keyof typeof formData] as string} onChange={(e) => set(key, e.target.value)} placeholder={`e.g. ${max}`} className={inputCls} />
                        </div>
                      ))}
                      <div>
                        <label className={labelCls}>TOEFL Exam Date</label>
                        <input type="date" value={formData.toeflExamDate} onChange={(e) => set("toeflExamDate", e.target.value)} className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* Duolingo */}
                  {showDuolingo && (
                    <>
                      <div>
                        <label className={labelCls}>Duolingo Score <span className="text-gray-400 font-normal">(0–160)</span></label>
                        <input type="number" min="0" max="160" value={formData.duolingoScore} onChange={(e) => set("duolingoScore", e.target.value)} placeholder="e.g. 120" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Duolingo Exam Date</label>
                        <input type="date" value={formData.duolingoExamDate} onChange={(e) => set("duolingoExamDate", e.target.value)} className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* GRE / GMAT always visible */}
                  <div>
                    <label className={labelCls}>GRE Score <span className="text-gray-400 font-normal">(optional, 260–340)</span></label>
                    <input type="number" min="260" max="340" value={formData.greScore} onChange={(e) => set("greScore", e.target.value)} placeholder="e.g. 320" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GMAT Score <span className="text-gray-400 font-normal">(optional, 200–800)</span></label>
                    <input type="number" min="200" max="800" value={formData.gmatScore} onChange={(e) => set("gmatScore", e.target.value)} placeholder="e.g. 650" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Study Preferences ── */}
            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Preferred Country</label>
                    <input type="text" value={formData.preferredCountry} onChange={(e) => set("preferredCountry", e.target.value)} placeholder="e.g. Australia, Canada, UK" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>2nd Preferred Country</label>
                    <input type="text" value={formData.secondPreferredCountry} onChange={(e) => set("secondPreferredCountry", e.target.value)} placeholder="Alternative country" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Study Destination</label>
                    <input type="text" value={formData.studyDestination} onChange={(e) => set("studyDestination", e.target.value)} placeholder="City or region" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree Level</label>
                    <select value={formData.degreeLevel} onChange={(e) => set("degreeLevel", e.target.value)} className={inputCls}>
                      <option value="">Select Level</option>
                      {DEGREE_LEVELS.map((l) => <option key={l} value={l}>{cap(l)}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Preferred University</label>
                    <input type="text" value={formData.preferredUniversityName} onChange={(e) => set("preferredUniversityName", e.target.value)} placeholder="University name" className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Preferred Course</label>
                    <input type="text" value={formData.preferredCourseName} onChange={(e) => set("preferredCourseName", e.target.value)} placeholder="Course name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Preferred Intake</label>
                    <input type="text" value={formData.preferredIntake} onChange={(e) => set("preferredIntake", e.target.value)} placeholder="e.g. September 2025" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Estimated Budget</label>
                    <input type="text" value={formData.estimatedBudget} onChange={(e) => set("estimatedBudget", e.target.value)} placeholder="e.g. $20,000–$30,000" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Assignment ── */}
            {activeTab === "assignment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelCls}>Assign to Counselor</label>
                    <select value={formData.assignedToId} onChange={(e) => set("assignedToId", e.target.value)} className={inputCls}>
                      <option value="">Unassigned</option>
                      {counselors.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Next Follow-Up Date</label>
                    <input type="date" value={formData.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Remarks</label>
                    <textarea value={formData.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Additional notes..." rows={4} className={inputCls} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0 rounded-b-xl">
            <span className="text-xs text-gray-500"><span className="text-red-500 font-medium">*</span> Required fields</span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                {loading ? "Saving..." : mode === "create" ? "Create Lead" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
