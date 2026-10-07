"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Award, CheckCircle, Clock, XCircle,
  AlertCircle, FileText, BookOpen, Building2,
  Edit, Globe, Mail, Phone, Users, RefreshCw,
  DollarSign, GraduationCap, Calendar, MapPin,
} from "lucide-react";
import { getScholarshipById, type Scholarship } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:    { label: "Active",    color: "bg-green-100 text-green-700",  icon: CheckCircle },
  upcoming:  { label: "Upcoming",  color: "bg-blue-100 text-blue-700",    icon: Clock },
  expired:   { label: "Expired",   color: "bg-gray-100 text-gray-600",    icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-700",      icon: AlertCircle },
  draft:     { label: "Draft",     color: "bg-amber-100 text-amber-700",  icon: FileText },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  merit_based:         { label: "Merit Based",         color: "bg-blue-100 text-blue-700" },
  academic_excellence: { label: "Academic Excellence", color: "bg-purple-100 text-purple-700" },
  need_based:          { label: "Need Based",          color: "bg-orange-100 text-orange-700" },
  early_application:   { label: "Early Application",   color: "bg-teal-100 text-teal-700" },
  country_specific:    { label: "Country Specific",    color: "bg-indigo-100 text-indigo-700" },
  course_specific:     { label: "Course Specific",     color: "bg-cyan-100 text-cyan-700" },
  diversity:           { label: "Diversity",           color: "bg-pink-100 text-pink-700" },
  sports:              { label: "Sports",              color: "bg-green-100 text-green-700" },
  research:            { label: "Research",            color: "bg-violet-100 text-violet-700" },
  alumni:              { label: "Alumni",              color: "bg-amber-100 text-amber-700" },
  partial:             { label: "Partial",             color: "bg-rose-100 text-rose-700" },
  full_tuition:        { label: "Full Tuition",        color: "bg-emerald-100 text-emerald-700" },
  other:               { label: "Other",               color: "bg-gray-100 text-gray-700" },
};

const AMOUNT_TYPE_LABELS: Record<string, string> = {
  fixed_amount: "Fixed Amount", percentage: "Percentage",
  full_tuition: "Full Tuition", partial_tuition: "Partial Tuition",
};

function InfoRow({ label, value, icon }: { label: string; value: any; icon?: any }) {
  const Icon = icon;
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 break-words">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: any; color: string }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900 leading-tight">{value || "—"}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    getScholarshipById(params.id as string)
      .then(r => { if (r.success && r.data) setScholarship(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading scholarship details...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (!scholarship) return (
    <AdminLayout>
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Not Found</h3>
          <Button onClick={() => router.push("/admin/scholarships")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scholarships
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );

  const statusConf = STATUS_CONFIG[scholarship.status] || STATUS_CONFIG.active;
  const typeConf = TYPE_CONFIG[scholarship.type] || TYPE_CONFIG.other;
  const StatusIcon = statusConf.icon;

  function formatAmount() {
    if (scholarship!.amountType === "full_tuition") return "Full Tuition Coverage";
    if (scholarship!.amountType === "percentage" && scholarship!.percentage) return `${scholarship!.percentage}% Discount`;
    if (scholarship!.amount) return `${scholarship!.currency} ${scholarship!.amount.toLocaleString()}`;
    return scholarship!.amountDescription || "—";
  }

  const isDeadlineSoon = scholarship.deadline &&
    new Date(scholarship.deadline) > new Date() &&
    (new Date(scholarship.deadline).getTime() - Date.now()) < 14 * 24 * 60 * 60 * 1000;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/scholarships")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{scholarship.name}</h1>
              <p className="text-xs text-gray-500">{scholarship.university?.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
        </div>

        {/* Hero */}
        <Card className="p-6 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold">{scholarship.name}</h2>
                  <p className="text-white/70 text-sm">{scholarship.university?.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`${typeConf.color} text-xs`}>{typeConf.label}</Badge>
                <Badge className="bg-white/20 text-white text-xs">{AMOUNT_TYPE_LABELS[scholarship.amountType]}</Badge>
                {scholarship.renewable && (
                  <Badge className="bg-green-400/30 text-green-100 text-xs flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Renewable
                  </Badge>
                )}
                {scholarship.automaticConsideration && (
                  <Badge className="bg-blue-400/30 text-blue-100 text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Auto Consideration
                  </Badge>
                )}
              </div>
              {scholarship.description && (
                <p className="text-white/70 text-sm leading-relaxed">{scholarship.description}</p>
              )}
            </div>
            <Badge className={`${statusConf.color} text-sm px-3 py-1.5 flex items-center gap-1.5`}>
              <StatusIcon className="w-4 h-4" /> {statusConf.label}
            </Badge>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Award Amount" value={formatAmount()} icon={DollarSign} color="from-green-500 to-green-600" />
          <StatCard label="Total Awards"     value={scholarship.numberOfAwards}                icon={Award}    color="from-blue-500 to-blue-600" />
          <StatCard label="Awards Remaining" value={scholarship.awardsRemaining}               icon={Users}    color="from-purple-500 to-purple-600" />
          <StatCard label="Deadline"         value={scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Open"} icon={Calendar} color={isDeadlineSoon ? "from-red-500 to-red-600" : "from-orange-500 to-orange-600"} />
        </div>

        {/* Deadline warning */}
        {isDeadlineSoon && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Deadline is within 14 days — {new Date(scholarship.deadline!).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Amount Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#1e3a8a]" /> Amount Details
            </h3>
            <InfoRow label="Amount Type"        value={AMOUNT_TYPE_LABELS[scholarship.amountType]} />
            {scholarship.amount       && <InfoRow label="Amount"      value={`${scholarship.currency} ${scholarship.amount.toLocaleString()}`} />}
            {scholarship.percentage   && <InfoRow label="Percentage"  value={`${scholarship.percentage}%`} />}
            <InfoRow label="Currency"           value={scholarship.currency} />
            {scholarship.amountDescription && <InfoRow label="Description" value={scholarship.amountDescription} />}
            <InfoRow label="Duration"           value={scholarship.duration} />
            <InfoRow label="Renewable"          value={scholarship.renewable ? "Yes" : "No"} />
            {scholarship.renewable && scholarship.renewalCriteria && (
              <InfoRow label="Renewal Criteria" value={scholarship.renewalCriteria} />
            )}
          </Card>

          {/* Eligibility */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#1e3a8a]" /> Eligibility
            </h3>
            {scholarship.eligibilityCriteria && <InfoRow label="Criteria" value={scholarship.eligibilityCriteria} />}
            {scholarship.minimumGpa    && <InfoRow label="Minimum GPA"   value={scholarship.minimumGpa} />}
            {scholarship.minimumIelts  && <InfoRow label="Minimum IELTS" value={scholarship.minimumIelts} />}
            {scholarship.minimumPte    && <InfoRow label="Minimum PTE"   value={scholarship.minimumPte} />}
            {scholarship.minimumToefl  && <InfoRow label="Minimum TOEFL" value={scholarship.minimumToefl} />}
            {scholarship.eligibleCountries && <InfoRow label="Eligible Countries" value={scholarship.eligibleCountries} icon={MapPin} />}
            {scholarship.eligibleNationalities && <InfoRow label="Eligible Nationalities" value={scholarship.eligibleNationalities} />}
            {!scholarship.eligibilityCriteria && !scholarship.minimumGpa && !scholarship.minimumIelts && (
              <p className="text-sm text-gray-500 py-4">No specific eligibility criteria listed</p>
            )}
          </Card>

          {/* Application */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1e3a8a]" /> Application Details
            </h3>
            {scholarship.applicationOpenDate && <InfoRow label="Application Opens" value={new Date(scholarship.applicationOpenDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />}
            {scholarship.deadline && <InfoRow label="Deadline" value={new Date(scholarship.deadline).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />}
            <InfoRow label="Process" value={scholarship.applicationProcess} />
            <InfoRow label="Auto Consideration" value={scholarship.automaticConsideration ? "Yes — considered with admission" : "No — separate application required"} />
            {scholarship.requiredDocuments && <InfoRow label="Required Documents" value={scholarship.requiredDocuments} />}
          </Card>

          {/* Contact */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1e3a8a]" /> Contact & Links
            </h3>
            {scholarship.websiteUrl && (
              <div className="py-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Website</div>
                <a href={scholarship.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {scholarship.websiteUrl}
                </a>
              </div>
            )}
            {scholarship.contactEmail && (
              <div className="py-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <a href={`mailto:${scholarship.contactEmail}`}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {scholarship.contactEmail}
                </a>
              </div>
            )}
            {scholarship.contactPhone && (
              <div className="py-3">
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {scholarship.contactPhone}
                </div>
              </div>
            )}
            {!scholarship.websiteUrl && !scholarship.contactEmail && !scholarship.contactPhone && (
              <p className="text-sm text-gray-500 py-4">No contact information provided</p>
            )}
          </Card>
        </div>

        {/* Linked To */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1e3a8a]" /> Linked To
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scholarship.university && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">University</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{scholarship.university.name}</p>
                {scholarship.university.country && <p className="text-xs text-gray-500">{scholarship.university.country}</p>}
              </div>
            )}
            {scholarship.course && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Course</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{scholarship.course.name}</p>
                <p className="text-xs text-gray-500">{scholarship.course.code}</p>
              </div>
            )}
            {scholarship.intake && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Intake</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{scholarship.intake.label}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notes & Terms */}
        {(scholarship.notes || scholarship.termsAndConditions) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {scholarship.notes && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1e3a8a]" /> Notes
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{scholarship.notes}</p>
              </Card>
            )}
            {scholarship.termsAndConditions && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1e3a8a]" /> Terms & Conditions
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{scholarship.termsAndConditions}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
