"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, ArrowLeft, Edit, Globe, Phone, Mail,
  Building2, Users, GraduationCap, Calendar, Flag,
  CheckCircle, Clock, Hammer, XCircle, AlertCircle,
  ExternalLink, Map, Building, BookOpen,
} from "lucide-react";
import { getCampusById, type Campus } from "@/lib/api";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  main: { label: "Main", color: "bg-blue-100 text-blue-700" },
  branch: { label: "Branch", color: "bg-purple-100 text-purple-700" },
  satellite: { label: "Satellite", color: "bg-indigo-100 text-indigo-700" },
  online: { label: "Online", color: "bg-cyan-100 text-cyan-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-600", icon: XCircle },
  under_construction: { label: "Under Construction", color: "bg-amber-100 text-amber-700", icon: Hammer },
  temporarily_closed: { label: "Temporarily Closed", color: "bg-red-100 text-red-700", icon: Clock },
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

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: any; color: string }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value || 0}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function CampusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campusId = params.id as string;

  const [campus, setCampus] = useState<Campus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchCampus();
  }, [campusId]);

  async function fetchCampus() {
    setLoading(true);
    try {
      const res = await getCampusById(campusId);
      if (res.success && res.data) setCampus(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading campus details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!campus) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Campus Not Found</h3>
            <Button onClick={() => router.push("/admin/campuses")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campuses
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const statusConf = STATUS_CONFIG[campus.status] || STATUS_CONFIG.inactive;
  const StatusIcon = statusConf.icon;
  const typeConf = TYPE_CONFIG[campus.campusType] || TYPE_CONFIG.main;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/campuses")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{campus.name}</h1>
              {campus.university && <p className="text-xs text-gray-500">{campus.university.name}</p>}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" /> Edit Campus
          </Button>
        </div>

        {/* Hero Card */}
        <Card className="overflow-hidden">
          {campus.imageUrl ? (
            <div className="h-64 w-full overflow-hidden relative">
              <img src={campus.imageUrl} alt={campus.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Badge className={`${typeConf.color} text-xs`}>{typeConf.label}</Badge>
                <Badge className={`${statusConf.color} text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConf.label}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center relative">
              <Building2 className="w-20 h-20 text-white/30" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Badge className={`${typeConf.color} text-xs`}>{typeConf.label}</Badge>
                <Badge className={`${statusConf.color} text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConf.label}
                </Badge>
              </div>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{campus.name}</h2>
            {campus.description && <p className="text-sm text-gray-600 leading-relaxed">{campus.description}</p>}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={campus.totalStudents?.toLocaleString()} icon={Users} color="from-blue-500 to-blue-600" />
          <StatCard label="Total Faculty" value={campus.totalFaculty} icon={GraduationCap} color="from-purple-500 to-purple-600" />
          <StatCard label="Facilities" value={campus.facilities?.length || 0} icon={Building} color="from-green-500 to-green-600" />
          <StatCard label="Departments" value={campus.availableDepartments?.length || 0} icon={BookOpen} color="from-orange-500 to-orange-600" />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Location & Contact */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1e3a8a]" /> Location & Contact
            </h3>
            <div className="space-y-0">
              <InfoRow label="Address" value={campus.address} icon={MapPin} />
              <InfoRow label="City" value={campus.city} />
              <InfoRow label="State / Province" value={campus.state} />
              <InfoRow label="Country" value={campus.country} icon={Flag} />
              <InfoRow label="Postal Code" value={campus.postalCode} />
              {campus.phone && <InfoRow label="Phone" value={campus.phone} icon={Phone} />}
              {campus.email && <InfoRow label="Email" value={campus.email} icon={Mail} />}
              {campus.website && (
                <div className="flex items-start gap-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Website</div>
                    <a href={campus.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      {campus.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Campus Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1e3a8a]" /> Campus Details
            </h3>
            <div className="space-y-0">
              <InfoRow label="Campus Type" value={typeConf.label} />
              <InfoRow label="Status" value={statusConf.label} />
              {campus.establishedYear && <InfoRow label="Established" value={campus.establishedYear} icon={Calendar} />}
              {campus.totalArea && <InfoRow label="Total Area" value={campus.totalArea} />}
              <InfoRow label="Total Students" value={campus.totalStudents?.toLocaleString()} icon={Users} />
              <InfoRow label="Total Faculty" value={campus.totalFaculty} icon={GraduationCap} />
            </div>
          </Card>
        </div>

        {/* Facilities */}
        {campus.facilities && campus.facilities.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1e3a8a]" /> Facilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {campus.facilities.map((f) => (
                <span key={f} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                  {f}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Departments */}
        {campus.availableDepartments && campus.availableDepartments.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1e3a8a]" /> Available Departments
            </h3>
            <div className="flex flex-wrap gap-2">
              {campus.availableDepartments.map((d) => (
                <span key={d} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100 font-medium">
                  {d}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Intakes */}
        {campus.intakes && campus.intakes.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1e3a8a]" /> Intakes
            </h3>
            <div className="flex flex-wrap gap-2">
              {campus.intakes.map((i) => (
                <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-medium capitalize">
                  {i}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Map */}
        {campus.mapUrl && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-[#1e3a8a]" /> Location Map
            </h3>
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={campus.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
