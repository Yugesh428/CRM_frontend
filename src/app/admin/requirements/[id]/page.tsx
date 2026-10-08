"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Edit, Trash2, Copy, CheckCircle, XCircle, Clock,
  BookOpen, Globe, GraduationCap, Briefcase, FileCheck, AlertCircle,
} from "lucide-react";
import {
  getCourseRequirementById,
  deleteCourseRequirement,
  copyCourseRequirement,
  type CourseRequirement,
} from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-600", icon: XCircle },
  draft: { label: "Draft", color: "bg-amber-100 text-amber-700", icon: Clock },
};

const STUDY_GAP_LABELS: Record<string, string> = {
  no_gap_allowed: "No Gap Allowed",
  up_to_1_year: "Up to 1 Year",
  up_to_2_years: "Up to 2 Years",
  up_to_3_years: "Up to 3 Years",
  up_to_5_years: "Up to 5 Years",
  no_restriction: "No Restriction",
};

export default function RequirementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [requirement, setRequirement] = useState<CourseRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    if (id) fetchRequirement();
  }, [id]);

  async function fetchRequirement() {
    setLoading(true);
    try {
      const res = await getCourseRequirementById(id);
      if (res.success && res.data) setRequirement(res.data);
      else router.push("/admin/requirements");
    } catch (e) {
      console.error(e);
      router.push("/admin/requirements");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      const res = await deleteCourseRequirement(id);
      if (res.success) router.push("/admin/requirements");
      else alert(res.message || "Failed to delete");
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!requirement) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Requirement not found</p>
        </div>
      </AdminLayout>
    );
  }

  const statusConf = STATUS_CONFIG[requirement.status || "active"] || STATUS_CONFIG.active;
  const StatusIcon = statusConf.icon;

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <Icon className="w-5 h-5 text-[#1e3a8a]" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </Card>
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/requirements")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Requirement Details</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {requirement.course?.name} • {requirement.university?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/requirements/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" onClick={() => setShowDelete(true)} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Section title="Basic Information" icon={BookOpen}>
          <div className="space-y-0">
            <InfoRow label="Course" value={`${requirement.course?.name} (${requirement.course?.code})`} />
            <InfoRow label="University" value={requirement.university?.name} />
            {requirement.intake && (
              <InfoRow label="Intake" value={`${requirement.intake.month} ${requirement.intake.year}`} />
            )}
            <InfoRow label="Applicable Country" value={requirement.applicableCountry || "Global (All Countries)"} />
            <InfoRow label="Study Level" value={requirement.studyLevel ? requirement.studyLevel.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—"} />
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={`${statusConf.color} text-xs inline-flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusConf.label}
              </Badge>
            </div>
          </div>
        </Section>

        {/* Academic Requirements */}
        <Section title="Academic Requirements" icon={GraduationCap}>
          <div className="space-y-0">
            {requirement.minimumGPA && <InfoRow label="Minimum GPA" value={`${Number(requirement.minimumGPA).toFixed(2)} GPA`} />}
            {requirement.minimumPercentage && <InfoRow label="Minimum Percentage" value={`${requirement.minimumPercentage}%`} />}
            {requirement.minimumQualification && <InfoRow label="Minimum Qualification" value={requirement.minimumQualification} />}
            
            {requirement.requiredSubjects && requirement.requiredSubjects.length > 0 && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Required Subjects</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {requirement.requiredSubjects.map((sub, i) => (
                    <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">{sub}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {requirement.subjectNotes && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Subject Notes</span>
                <p className="text-sm text-gray-900 mt-1">{requirement.subjectNotes}</p>
              </div>
            )}
            
            {requirement.academicRequirementNotes && (
              <div className="py-2">
                <span className="text-sm text-gray-600">Academic Notes</span>
                <p className="text-sm text-gray-900 mt-1">{requirement.academicRequirementNotes}</p>
              </div>
            )}
            
            {!requirement.minimumGPA && !requirement.minimumPercentage && !requirement.minimumQualification && (
              <p className="text-sm text-gray-400 italic">No academic requirements specified</p>
            )}
          </div>
        </Section>

        {/* English Tests */}
        <Section title="English Language Requirements" icon={Globe}>
          <div className="space-y-4">
            {/* IELTS */}
            {requirement.ieltsOverall && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">IELTS</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Overall:</span>{" "}
                    <span className="font-bold text-gray-900">{requirement.ieltsOverall}</span>
                  </div>
                  {requirement.ieltsListening && <div><span className="text-gray-600">L:</span> <span className="font-semibold">{requirement.ieltsListening}</span></div>}
                  {requirement.ieltsReading && <div><span className="text-gray-600">R:</span> <span className="font-semibold">{requirement.ieltsReading}</span></div>}
                  {requirement.ieltsWriting && <div><span className="text-gray-600">W:</span> <span className="font-semibold">{requirement.ieltsWriting}</span></div>}
                  {requirement.ieltsSpeaking && <div><span className="text-gray-600">S:</span> <span className="font-semibold">{requirement.ieltsSpeaking}</span></div>}
                </div>
              </div>
            )}

            {/* PTE */}
            {requirement.pteOverall && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">PTE</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Overall:</span>{" "}
                    <span className="font-bold text-gray-900">{requirement.pteOverall}</span>
                  </div>
                  {requirement.pteListening && <div><span className="text-gray-600">L:</span> <span className="font-semibold">{requirement.pteListening}</span></div>}
                  {requirement.pteReading && <div><span className="text-gray-600">R:</span> <span className="font-semibold">{requirement.pteReading}</span></div>}
                  {requirement.pteWriting && <div><span className="text-gray-600">W:</span> <span className="font-semibold">{requirement.pteWriting}</span></div>}
                  {requirement.pteSpeaking && <div><span className="text-gray-600">S:</span> <span className="font-semibold">{requirement.pteSpeaking}</span></div>}
                </div>
              </div>
            )}

            {/* TOEFL */}
            {requirement.toeflTotal && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">TOEFL</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Total:</span>{" "}
                    <span className="font-bold text-gray-900">{requirement.toeflTotal}</span>
                  </div>
                  {requirement.toeflListening && <div><span className="text-gray-600">L:</span> <span className="font-semibold">{requirement.toeflListening}</span></div>}
                  {requirement.toeflReading && <div><span className="text-gray-600">R:</span> <span className="font-semibold">{requirement.toeflReading}</span></div>}
                  {requirement.toeflWriting && <div><span className="text-gray-600">W:</span> <span className="font-semibold">{requirement.toeflWriting}</span></div>}
                  {requirement.toeflSpeaking && <div><span className="text-gray-600">S:</span> <span className="font-semibold">{requirement.toeflSpeaking}</span></div>}
                </div>
              </div>
            )}

            {/* Other Tests */}
            {(requirement.duolingoScore || requirement.satTotal || requirement.actScore || requirement.greTotal || requirement.gmatTotal) && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Other Tests</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {requirement.duolingoScore && <div><span className="text-gray-600">Duolingo:</span> <span className="font-semibold">{requirement.duolingoScore}</span></div>}
                  {requirement.satTotal && <div><span className="text-gray-600">SAT:</span> <span className="font-semibold">{requirement.satTotal}</span></div>}
                  {requirement.actScore && <div><span className="text-gray-600">ACT:</span> <span className="font-semibold">{requirement.actScore}</span></div>}
                  {requirement.greTotal && <div><span className="text-gray-600">GRE:</span> <span className="font-semibold">{requirement.greTotal}</span></div>}
                  {requirement.gmatTotal && <div><span className="text-gray-600">GMAT:</span> <span className="font-semibold">{requirement.gmatTotal}</span></div>}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex flex-wrap gap-2 pt-2">
              {requirement.moiAccepted && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">✓ MOI Accepted</Badge>
              )}
              {requirement.englishWaiverAvailable && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">✓ Waiver Available</Badge>
              )}
            </div>

            {requirement.englishRequirementNotes && (
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-600">Notes:</span>
                <p className="text-sm text-gray-900 mt-1">{requirement.englishRequirementNotes}</p>
              </div>
            )}

            {!requirement.ieltsOverall && !requirement.pteOverall && !requirement.toeflTotal && (
              <p className="text-sm text-gray-400 italic">No English test requirements specified</p>
            )}
          </div>
        </Section>

        {/* Work Experience */}
        {requirement.workExperienceRequired && (
          <Section title="Work Experience" icon={Briefcase}>
            <div className="space-y-0">
              <InfoRow label="Required" value="Yes" />
              {requirement.workExperienceYears && <InfoRow label="Minimum Years" value={`${requirement.workExperienceYears} years`} />}
              {requirement.workExperienceDetails && (
                <div className="py-2">
                  <span className="text-sm text-gray-600">Details</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.workExperienceDetails}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Study Gap */}
        {requirement.studyGapPolicy && requirement.studyGapPolicy !== "no_restriction" && (
          <Section title="Study Gap Policy" icon={Clock}>
            <div className="space-y-0">
              <InfoRow label="Policy" value={STUDY_GAP_LABELS[requirement.studyGapPolicy] || requirement.studyGapPolicy} />
              {requirement.studyGapNotes && (
                <div className="py-2">
                  <span className="text-sm text-gray-600">Notes</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.studyGapNotes}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Documents */}
        {requirement.requiredDocuments && requirement.requiredDocuments.length > 0 && (
          <Section title="Required Documents" icon={FileCheck}>
            <div className="flex flex-wrap gap-2 mb-3">
              {requirement.requiredDocuments.map((doc, i) => (
                <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">{doc}</Badge>
              ))}
            </div>
            {requirement.documentNotes && (
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-600">Notes:</span>
                <p className="text-sm text-gray-900 mt-1">{requirement.documentNotes}</p>
              </div>
            )}
          </Section>
        )}

        {/* Additional Requirements */}
        {(requirement.additionalRequirements || requirement.scholarshipRequirements || requirement.interviewRequired || requirement.portfolioRequired || requirement.countrySpecificNotes) && (
          <Section title="Additional Requirements" icon={AlertCircle}>
            <div className="space-y-3">
              {requirement.additionalRequirements && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Additional Requirements</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.additionalRequirements}</p>
                </div>
              )}
              {requirement.scholarshipRequirements && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Scholarship Requirements</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.scholarshipRequirements}</p>
                </div>
              )}
              {requirement.interviewRequired && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Interview</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.interviewRequired}</p>
                </div>
              )}
              {requirement.portfolioRequired && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Portfolio</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.portfolioRequired}</p>
                </div>
              )}
              {requirement.countrySpecificNotes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Country Specific Notes</span>
                  <p className="text-sm text-gray-900 mt-1">{requirement.countrySpecificNotes}</p>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Requirement</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this requirement? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setShowDelete(false)} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
