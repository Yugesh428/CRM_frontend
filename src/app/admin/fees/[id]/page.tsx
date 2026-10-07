"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, DollarSign, CheckCircle, Clock,
  XCircle, FileText, BookOpen, Building2,
  Edit, AlertCircle, Calendar, TrendingUp,
} from "lucide-react";
import { getFeeById, type Fee } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  current:  { label: "Current",  color: "bg-green-100 text-green-700",  icon: CheckCircle },
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700",    icon: Clock },
  expired:  { label: "Expired",  color: "bg-gray-100 text-gray-600",    icon: XCircle },
  draft:    { label: "Draft",    color: "bg-amber-100 text-amber-700",  icon: FileText },
};

const PERIOD_LABELS: Record<string, string> = {
  per_year: "Per Year", per_semester: "Per Semester",
  per_trimester: "Per Trimester", per_credit: "Per Credit", total_course: "Total Course",
};

function FeeRow({ label, amount, currency, highlight }: { label: string; amount?: number; currency?: string; highlight?: boolean }) {
  if (!amount && amount !== 0) return null;
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${highlight ? "font-semibold" : ""}`}>
      <span className={`text-sm ${highlight ? "text-gray-900" : "text-gray-600"}`}>{label}</span>
      <span className={`text-sm ${highlight ? "text-gray-900" : "text-gray-700"}`}>
        {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: any; icon: any; color: string; sub?: string }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900">{value || "—"}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}

export default function FeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [fee, setFee] = useState<Fee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    getFeeById(params.id as string)
      .then(r => { if (r.success && r.data) setFee(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading fee details...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (!fee) return (
    <AdminLayout>
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Record Not Found</h3>
          <Button onClick={() => router.push("/admin/fees")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fees
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );

  const statusConf = STATUS_CONFIG[fee.status] || STATUS_CONFIG.current;
  const StatusIcon = statusConf.icon;
  const cur = fee.currency || "";

  const additionalFees = [
    { label: "Application Fee",      amount: fee.applicationFee },
    { label: "Deposit",               amount: fee.deposit },
    { label: "Enrollment Fee",        amount: fee.enrollmentFee },
    { label: "Registration Fee",      amount: fee.registrationFee },
    { label: "Insurance Fee",         amount: fee.insuranceFee },
    { label: "Student Services Fee",  amount: fee.studentServicesFee },
    { label: "Material Fee",          amount: fee.materialFee },
    { label: "Technology Fee",        amount: fee.technologyFee },
    { label: "Other Fees",            amount: fee.otherFees },
  ].filter(f => f.amount && f.amount > 0);

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/fees")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {cur} {fee.tuitionFee?.toLocaleString()} — {PERIOD_LABELS[fee.feePeriod] || fee.feePeriod}
              </h1>
              <p className="text-xs text-gray-500">{fee.course?.name} · Academic Year {fee.academicYear}</p>
            </div>
          </div>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
        </div>

        {/* Hero */}
        <Card className="p-6 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-white/80" />
                <div>
                  <h2 className="text-3xl font-bold">{cur} {fee.tuitionFee?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  <p className="text-white/70 text-sm">{PERIOD_LABELS[fee.feePeriod]} · {fee.academicYear}</p>
                </div>
              </div>
              {fee.estimatedTotalCost && (
                <p className="text-white/60 text-sm">Est. Total Cost: {cur} {fee.estimatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              )}
            </div>
            <Badge className={`${statusConf.color} text-sm px-3 py-1.5 flex items-center gap-1.5`}>
              <StatusIcon className="w-4 h-4" /> {statusConf.label}
            </Badge>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tuition Fee"     value={`${cur} ${fee.tuitionFee?.toLocaleString()}`} icon={DollarSign} color="from-green-500 to-green-600" sub={PERIOD_LABELS[fee.feePeriod]} />
          <StatCard label="Application Fee" value={fee.applicationFee ? `${cur} ${fee.applicationFee?.toLocaleString()}` : "None"} icon={FileText} color="from-blue-500 to-blue-600" />
          <StatCard label="Living Cost"     value={fee.estimatedLivingCost ? `${cur} ${fee.estimatedLivingCost?.toLocaleString()}` : "N/A"} icon={TrendingUp} color="from-purple-500 to-purple-600" sub="Per year" />
          <StatCard label="Academic Year"   value={fee.academicYear} icon={Calendar} color="from-orange-500 to-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fee Breakdown */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#1e3a8a]" /> Fee Breakdown
            </h3>
            <FeeRow label="Tuition Fee" amount={fee.tuitionFee} currency={cur} highlight />
            {additionalFees.map(f => (
              <FeeRow key={f.label} label={f.label} amount={f.amount} currency={cur} />
            ))}
            {fee.estimatedLivingCost && fee.estimatedLivingCost > 0 && (
              <FeeRow label="Est. Living Cost (p.a.)" amount={fee.estimatedLivingCost} currency={cur} />
            )}
            {fee.estimatedTotalCost && fee.estimatedTotalCost > 0 && (
              <div className="mt-3 pt-3 border-t-2 border-gray-200">
                <FeeRow label="Estimated Total Cost" amount={fee.estimatedTotalCost} currency={cur} highlight />
              </div>
            )}
            {fee.otherFeesDescription && (
              <p className="text-xs text-gray-500 mt-2 italic">{fee.otherFeesDescription}</p>
            )}
          </Card>

          {/* Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1e3a8a]" /> Fee Details
            </h3>
            <InfoRow label="Academic Year"   value={fee.academicYear} />
            <InfoRow label="Fee Period"       value={PERIOD_LABELS[fee.feePeriod]} />
            <InfoRow label="Currency"         value={fee.currency} />
            <InfoRow label="Status"           value={statusConf.label} />
            <InfoRow label="GST Included"     value={fee.gstIncluded ? `Yes${fee.gstPercentage ? ` (${fee.gstPercentage}%)` : ""}` : "No"} />
            <InfoRow label="Effective From"   value={fee.effectiveFrom ? new Date(fee.effectiveFrom).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
            <InfoRow label="Effective Until"  value={fee.effectiveUntil ? new Date(fee.effectiveUntil).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
          </Card>
        </div>

        {/* Linked To */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1e3a8a]" /> Linked To
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fee.university && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">University</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{fee.university.name}</p>
                {fee.university.country && <p className="text-xs text-gray-500">{fee.university.country}</p>}
              </div>
            )}
            {fee.course && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Course</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{fee.course.name}</p>
                <p className="text-xs text-gray-500">{fee.course.code}</p>
              </div>
            )}
            {fee.intake && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Intake</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{fee.intake.label}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {fee.feeNotes && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1e3a8a]" /> Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{fee.feeNotes}</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
