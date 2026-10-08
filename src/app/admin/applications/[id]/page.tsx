"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Edit, Trash2, AlertCircle, CheckCircle,
  XCircle, Clock, FileText, User, Building2, BookOpen,
  Calendar, Globe, Mail, Phone, MapPin, GraduationCap,
  FileCheck, ClipboardList, Send, Ban, DollarSign,
  UserCircle, Briefcase, Award, Languages, CalendarCheck,
  FileUp, MessageSquare, StickyNote, Link as LinkIcon,
} from "lucide-react";
import {
  getApplicationById,
  deleteApplication,
  type Application,
} from "@/lib/api";

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new:               { label: "New",               color: "bg-blue-100 text-blue-700 border-blue-200",       icon: AlertCircle },
  in_progress:       { label: "In Progress",       color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Clock },
  documents_pending: { label: "Docs Pending",      color: "bg-amber-100 text-amber-700 border-amber-200",    icon: Clock },
  ready_to_submit:   { label: "Ready to Submit",   color: "bg-cyan-100 text-cyan-700 border-cyan-200",       icon: CheckCircle },
  submitted:         { label: "Submitted",         color: "bg-purple-100 text-purple-700 border-purple-200", icon: Send },
  offer_received:    { label: "Offer Received",    color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  offer_accepted:    { label: "Offer Accepted",    color: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle },
  rejected:          { label: "Rejected",          color: "bg-red-100 text-red-700 border-red-200",          icon: XCircle },
  withdrawn:         { label: "Withdrawn",         color: "bg-gray-100 text-gray-600 border-gray-200",       icon: Ban },
  visa:              { label: "Visa",              color: "bg-teal-100 text-teal-700 border-teal-200",       icon: Globe },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 border-blue-200" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700 border-red-200" },
};

// ==========================================
// SECTION COMPONENT
// ==========================================
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <Icon className="w-5 h-5 text-[#1e3a8a]" />
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

// ==========================================
// INFO ROW COMPONENT
// ==========================================
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="col-span-2 text-sm text-gray-900">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function ApplicationViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    if (id) fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchApplication() {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplicationById(id);
      if (res.success && res.data) {
        setApplication(res.data);
      } else {
        setError(res.message || "Failed to load application");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!application) return;
    setDeleting(true);
    try {
      const res = await deleteApplication(application.id);
      if (res.success) {
        router.push("/admin/applications");
      } else {
        alert(res.message || "Failed to delete");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Application</h2>
            <p className="text-sm text-gray-600 mb-6">{error || "Application not found"}</p>
            <Button onClick={() => router.push("/admin/applications")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const statusConf = STATUS_CONFIG[application.status || "new"] || STATUS_CONFIG.new;
  const StatusIcon = statusConf.icon;
  const prioConf = PRIORITY_CONFIG[application.priority || "medium"] || PRIORITY_CONFIG.medium;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/applications")}
              className="mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.applicationNumber || "Application"}
                </h1>
                <Badge className={`${statusConf.color} border inline-flex items-center gap-1.5`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConf.label}
                </Badge>
                <Badge className={`${prioConf.color} border`}>
                  {prioConf.label} Priority
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Applied on {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/applications/${application.id}/documents`)}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <FileText className="w-4 h-4 mr-2" /> View Documents
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/applications?edit=${application.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDelete(true)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Student Information */}
            <Section title="Student Information" icon={User}>
              <InfoRow label="Full Name" value={application.student?.fullName} icon={UserCircle} />
              <InfoRow label="Email" value={application.student?.email} icon={Mail} />
              <InfoRow label="Phone" value={application.student?.phone} icon={Phone} />
              <InfoRow label="Country" value={application.student?.country} icon={Globe} />
              <InfoRow label="Nationality" value={application.student?.nationality} icon={Globe} />
            </Section>

            {/* Program Details */}
            <Section title="Program Details" icon={GraduationCap}>
              <InfoRow label="University" value={application.university?.name} icon={Building2} />
              <InfoRow label="Country" value={application.university?.country} icon={Globe} />
              <InfoRow label="Campus" value={application.campus?.name} icon={Building2} />
              <InfoRow label="Course" value={application.course?.name} icon={BookOpen} />
              <InfoRow label="Course Code" value={application.course?.code} icon={FileText} />
              <InfoRow label="Level" value={application.course?.level} icon={Award} />
              <InfoRow 
                label="Intake" 
                value={application.intake ? (application.intake.label || `${application.intake.month} ${application.intake.year}`) : undefined}
                icon={Calendar}
              />
            </Section>

            {/* Academic Information */}
            <Section title="Academic Information" icon={Award}>
              <InfoRow label="Highest Qualification" value={application.highestQualification} icon={GraduationCap} />
              <InfoRow label="Institution" value={application.institution} icon={Building2} />
              <InfoRow label="Graduation Year" value={application.graduationYear} icon={CalendarCheck} />
              <InfoRow label="GPA" value={application.gpa ? `${application.gpa} / 4.0` : undefined} icon={Award} />
              <InfoRow label="Percentage" value={application.percentage ? `${application.percentage}%` : undefined} icon={Award} />
            </Section>

            {/* English Test */}
            {application.englishTest && (
              <Section title="English Proficiency" icon={Languages}>
                <InfoRow label="Test Type" value={application.englishTest} icon={FileCheck} />
                <InfoRow label="Overall Score" value={application.englishTestOverallScore} icon={Award} />
                <InfoRow 
                  label="Test Date" 
                  value={application.englishTestDate ? new Date(application.englishTestDate).toLocaleDateString() : undefined}
                  icon={Calendar}
                />
                {application.englishTestScores && (
                  <>
                    <InfoRow label="Listening" value={application.englishTestScores.listening} />
                    <InfoRow label="Reading" value={application.englishTestScores.reading} />
                    <InfoRow label="Writing" value={application.englishTestScores.writing} />
                    <InfoRow label="Speaking" value={application.englishTestScores.speaking} />
                  </>
                )}
              </Section>
            )}

            {/* Submission Details */}
            {(application.submissionDate || application.submissionMethod || application.universityReferenceNumber) && (
              <Section title="Submission Details" icon={Send}>
                <InfoRow 
                  label="Submission Date" 
                  value={application.submissionDate ? new Date(application.submissionDate).toLocaleDateString() : undefined}
                  icon={Calendar}
                />
                <InfoRow label="Submission Method" value={application.submissionMethod} icon={FileUp} />
                <InfoRow label="University Reference" value={application.universityReferenceNumber} icon={FileText} />
                <InfoRow label="Portal ID" value={application.portalId} icon={LinkIcon} />
              </Section>
            )}

            {/* Notes */}
            {(application.notes || application.internalNotes) && (
              <Section title="Notes" icon={MessageSquare}>
                {application.notes && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Application Notes</div>
                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {application.notes}
                    </div>
                  </div>
                )}
                {application.internalNotes && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Internal Notes</div>
                    <div className="text-sm text-gray-900 bg-amber-50 p-3 rounded-lg whitespace-pre-wrap">
                      {application.internalNotes}
                    </div>
                  </div>
                )}
              </Section>
            )}

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#1e3a8a]" />
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Application Type</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {application.applicationType?.replace(/_/g, " ") || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Channel</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {application.applicationChannel?.replace(/_/g, " ") || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Priority</span>
                  <Badge className={`${prioConf.color} border text-xs`}>
                    {prioConf.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge className={`${statusConf.color} border text-xs inline-flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConf.label}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Assigned Counselor */}
            {application.assignedStaff && (
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1e3a8a]" />
                  Assigned Counselor
                </h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-semibold">
                    {application.assignedStaff.fullName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{application.assignedStaff.fullName}</div>
                    {application.assignedStaff.role && (
                      <div className="text-xs text-gray-500 capitalize">{application.assignedStaff.role}</div>
                    )}
                    {application.assignedStaff.email && (
                      <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {application.assignedStaff.email}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1e3a8a]" />
                Timeline
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-gray-500 mb-1">Created</div>
                  <div className="text-gray-900 font-medium">
                    {application.createdAt ? new Date(application.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Last Updated</div>
                  <div className="text-gray-900 font-medium">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]"
                  onClick={() => router.push(`/admin/applications?edit=${application.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Application
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {/* TODO: Navigate to documents */}}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {/* TODO: Navigate to activities */}}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Activities
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Application</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete application{" "}
                  <strong>{application.applicationNumber}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
