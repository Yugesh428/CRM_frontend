"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Edit, BookOpen, GraduationCap, Clock,
  DollarSign, Calendar, Globe, Award, Star,
  CheckCircle, XCircle, AlertCircle, Building2,
  FileText, TrendingUp, Languages, Briefcase,
} from "lucide-react";
import { getCourseById, type Course } from "@/lib/api";

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  high_school: { label: "High School", color: "bg-gray-100 text-gray-700" },
  foundation: { label: "Foundation", color: "bg-teal-100 text-teal-700" },
  certificate: { label: "Certificate", color: "bg-orange-100 text-orange-700" },
  diploma: { label: "Diploma", color: "bg-green-100 text-green-700" },
  advanced_diploma: { label: "Advanced Diploma", color: "bg-lime-100 text-lime-700" },
  bachelor: { label: "Bachelor", color: "bg-blue-100 text-blue-700" },
  graduate_diploma: { label: "Graduate Diploma", color: "bg-indigo-100 text-indigo-700" },
  master: { label: "Master", color: "bg-purple-100 text-purple-700" },
  phd: { label: "PhD", color: "bg-red-100 text-red-700" },
  postdoctoral: { label: "Postdoctoral", color: "bg-pink-100 text-pink-700" },
};

const MODE_CONFIG: Record<string, { label: string; color: string }> = {
  on_campus: { label: "On Campus", color: "bg-emerald-100 text-emerald-700" },
  online: { label: "Online", color: "bg-cyan-100 text-cyan-700" },
  hybrid: { label: "Hybrid", color: "bg-indigo-100 text-indigo-700" },
  distance: { label: "Distance", color: "bg-amber-100 text-amber-700" },
};

function InfoRow({ label, value, icon }: { label: string; value: any; icon?: any }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 break-words">{value || "—"}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, subtext }: { label: string; value: any; icon: any; color: string; subtext?: string }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value || "—"}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        {subtext && <div className="text-xs text-gray-400 mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchCourse();
  }, [courseId]);

  async function fetchCourse() {
    setLoading(true);
    try {
      const res = await getCourseById(courseId);
      if (res.success && res.data) setCourse(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading course details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
            <Button onClick={() => router.push("/admin/universities")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Universities
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const levelConf = LEVEL_CONFIG[course.level] || { label: course.level, color: "bg-gray-100 text-gray-700" };
  const modeConf = MODE_CONFIG[course.mode] || { label: course.mode, color: "bg-gray-100 text-gray-700" };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-xs text-gray-500">{course.code}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" /> Edit Course
          </Button>
        </div>

        {/* Hero Card */}
        <Card className="overflow-hidden">
          {course.coverImageUrl ? (
            <div className="h-64 w-full overflow-hidden relative">
              <img src={course.coverImageUrl} alt={course.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Badge className={`${levelConf.color} text-xs`}>{levelConf.label}</Badge>
                <Badge className={`${modeConf.color} text-xs`}>{modeConf.label}</Badge>
                {course.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {course.isActive ? (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    <XCircle className="w-3 h-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center relative">
              <BookOpen className="w-20 h-20 text-white/30" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Badge className={`${levelConf.color} text-xs`}>{levelConf.label}</Badge>
                <Badge className={`${modeConf.color} text-xs`}>{modeConf.label}</Badge>
                {course.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {course.isActive ? (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    <XCircle className="w-3 h-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h2>
            {course.shortDescription && <p className="text-sm text-gray-600 mb-2">{course.shortDescription}</p>}
            {course.description && <p className="text-sm text-gray-500 leading-relaxed">{course.description}</p>}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Tuition Fee" 
            value={course.tuitionFee ? `${course.currency || "$"}${course.tuitionFee.toLocaleString()}` : "—"} 
            icon={DollarSign} 
            color="from-green-500 to-green-600"
            subtext={course.feeFrequency || undefined}
          />
          <StatCard 
            label="Duration" 
            value={course.duration || (course.durationMonths ? `${course.durationMonths} months` : "—")} 
            icon={Clock} 
            color="from-blue-500 to-blue-600" 
          />
          <StatCard 
            label="IELTS Required" 
            value={course.ieltsOverall || "—"} 
            icon={Languages} 
            color="from-purple-500 to-purple-600"
            subtext="Overall"
          />
          <StatCard 
            label="Min GPA" 
            value={course.minimumGPA || "—"} 
            icon={TrendingUp} 
            color="from-orange-500 to-orange-600" 
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Course Information */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1e3a8a]" /> Course Information
            </h3>
            <div className="space-y-0">
              <InfoRow label="Course Code" value={course.code} icon={FileText} />
              <InfoRow label="Level" value={levelConf.label} icon={GraduationCap} />
              <InfoRow label="Mode" value={modeConf.label} icon={Globe} />
              <InfoRow label="Discipline" value={course.discipline} icon={Briefcase} />
              <InfoRow label="Specialization" value={course.specialization} />
              <InfoRow label="Duration" value={course.duration || (course.durationMonths ? `${course.durationMonths} months` : undefined)} icon={Clock} />
            </div>
          </Card>

          {/* Fees & Requirements */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#1e3a8a]" /> Fees & Requirements
            </h3>
            <div className="space-y-0">
              <InfoRow 
                label="Tuition Fee" 
                value={course.tuitionFee ? `${course.currency || "$"}${course.tuitionFee.toLocaleString()}` : undefined} 
                icon={DollarSign} 
              />
              <InfoRow label="Fee Frequency" value={course.feeFrequency} />
              <InfoRow 
                label="Application Fee" 
                value={course.applicationFee ? `${course.currency || "$"}${course.applicationFee}` : undefined} 
              />
              {course.isScholarshipAvailable && course.scholarshipAmount && (
                <InfoRow 
                  label="Scholarship Available" 
                  value={`${course.currency || "$"}${course.scholarshipAmount.toLocaleString()}`} 
                  icon={Award} 
                />
              )}
              <InfoRow label="Minimum GPA" value={course.minimumGPA} icon={TrendingUp} />
            </div>
          </Card>

          {/* English Requirements */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#1e3a8a]" /> English Requirements
            </h3>
            <div className="space-y-0">
              {course.ieltsOverall && <InfoRow label="IELTS Overall" value={course.ieltsOverall} />}
              {course.pteOverall && <InfoRow label="PTE Overall" value={course.pteOverall} />}
              {course.toeflTotal && <InfoRow label="TOEFL Total" value={course.toeflTotal} />}
              {!course.ieltsOverall && !course.pteOverall && !course.toeflTotal && (
                <p className="text-sm text-gray-500 py-4">No English requirements specified</p>
              )}
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1e3a8a]" /> Additional Information
            </h3>
            <div className="space-y-0">
              <InfoRow label="Featured" value={course.isFeatured ? "Yes" : "No"} icon={Star} />
              <InfoRow label="Status" value={course.isActive ? "Active" : "Inactive"} />
              <InfoRow label="Scholarship Available" value={course.isScholarshipAvailable ? "Yes" : "No"} icon={Award} />
              <InfoRow label="Created At" value={new Date(course.createdAt).toLocaleDateString()} icon={Calendar} />
              <InfoRow label="Updated At" value={new Date(course.updatedAt).toLocaleDateString()} />
            </div>
          </Card>
        </div>

        {/* Intakes */}
        {course.intakes && course.intakes.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1e3a8a]" /> Available Intakes
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.intakes.map((intake) => (
                <span key={intake} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-medium capitalize">
                  {intake}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
