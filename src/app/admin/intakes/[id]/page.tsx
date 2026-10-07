"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Calendar, CheckCircle, Clock, XCircle,
  AlertCircle, Users, BookOpen, Building2, Edit,
  MapPin, FileText,
} from "lucide-react";
import { getIntakeById, type Intake } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  upcoming:     { label: "Upcoming",     color: "bg-blue-100 text-blue-700",    icon: Clock },
  open:         { label: "Open",         color: "bg-green-100 text-green-700",  icon: CheckCircle },
  closing_soon: { label: "Closing Soon", color: "bg-orange-100 text-orange-700",icon: AlertCircle },
  closed:       { label: "Closed",       color: "bg-gray-100 text-gray-600",    icon: XCircle },
  cancelled:    { label: "Cancelled",    color: "bg-red-100 text-red-700",      icon: XCircle },
  full:         { label: "Full",         color: "bg-purple-100 text-purple-700",icon: Users },
};

function InfoRow({ label, value, icon }: { label: string; value: any; icon?: any }) {
  const Icon = icon;
  if (!value && value !== 0) return null;
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
        <div className="text-2xl font-bold text-gray-900">{value ?? "—"}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

function fmt(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function IntakeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    getIntakeById(params.id as string)
      .then(r => { if (r.success && r.data) setIntake(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading intake details...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (!intake) return (
    <AdminLayout>
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Intake Not Found</h3>
          <Button onClick={() => router.push("/admin/intakes")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Intakes
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );

  const statusConf = STATUS_CONFIG[intake.status] || STATUS_CONFIG.upcoming;
  const StatusIcon = statusConf.icon;
  const label = intake.label || `${intake.month.charAt(0).toUpperCase() + intake.month.slice(1)} ${intake.year}`;

  const seatsPercent = intake.totalSeats && intake.availableSeats !== undefined
    ? Math.round(((intake.totalSeats - intake.availableSeats) / intake.totalSeats) * 100)
    : null;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/intakes")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{label}</h1>
              <p className="text-xs text-gray-500">{intake.course?.name || "—"}</p>
            </div>
          </div>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
        </div>

        {/* Hero Card */}
        <Card className="p-6 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-white/80" />
                <div>
                  <h2 className="text-3xl font-bold">{label}</h2>
                  <p className="text-white/70 text-sm capitalize">{intake.month} {intake.year}</p>
                </div>
              </div>
              {intake.isFeatured && <span className="text-xs text-yellow-300 font-medium">★ Featured Intake</span>}
            </div>
            <Badge className={`${statusConf.color} text-sm px-3 py-1.5 flex items-center gap-1.5`}>
              <StatusIcon className="w-4 h-4" /> {statusConf.label}
            </Badge>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Seats"     value={intake.totalSeats}     icon={Users}    color="from-blue-500 to-blue-600" />
          <StatCard label="Available Seats" value={intake.availableSeats} icon={CheckCircle} color="from-green-500 to-green-600" />
          <StatCard label="Year"            value={intake.year}           icon={Calendar} color="from-purple-500 to-purple-600" />
          <StatCard label="Seats Filled %"  value={seatsPercent !== null ? `${seatsPercent}%` : "—"} icon={Users} color="from-orange-500 to-orange-600" />
        </div>

        {/* Seats Progress */}
        {seatsPercent !== null && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Seat Availability</h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{intake.totalSeats! - intake.availableSeats!} filled</span>
              <span>{intake.availableSeats} available</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${seatsPercent >= 90 ? "bg-red-500" : seatsPercent >= 70 ? "bg-orange-500" : "bg-green-500"}`}
                style={{ width: `${seatsPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{seatsPercent}% filled</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Key Dates */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1e3a8a]" /> Key Dates
            </h3>
            <InfoRow label="Course Start Date"    value={fmt(intake.courseStartDate)} />
            <InfoRow label="Course End Date"      value={fmt(intake.courseEndDate)} />
            <InfoRow label="Application Opens"    value={fmt(intake.applicationOpensDate)} />
            <InfoRow label="Application Deadline" value={fmt(intake.applicationDeadline)} />
            <InfoRow label="Orientation Date"     value={fmt(intake.orientationDate)} />
          </Card>

          {/* Course & University */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1e3a8a]" /> Linked To
            </h3>
            {intake.course && (
              <>
                <InfoRow label="Course" value={intake.course.name} icon={BookOpen} />
                <InfoRow label="Course Code" value={intake.course.code} />
                {intake.course.level && <InfoRow label="Level" value={intake.course.level} />}
              </>
            )}
            {intake.university && (
              <>
                <InfoRow label="University" value={intake.university.name} icon={Building2} />
                {intake.university.country && <InfoRow label="Country" value={intake.university.country} icon={MapPin} />}
              </>
            )}
            {intake.campus && (
              <InfoRow label="Campus" value={intake.campus.name} icon={Building2} />
            )}
          </Card>
        </div>

        {/* Notes */}
        {intake.notes && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1e3a8a]" /> Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{intake.notes}</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
