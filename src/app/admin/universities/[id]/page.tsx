"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  GraduationCap,
  Star,
  BookOpen,
  Calendar,
  DollarSign,
  Award,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  FileText,
  School,
} from "lucide-react";
import {
  getUniversityById,
  updateUniversity,
  deleteUniversity,
  getCampusesByUniversity,
  getAllCourses,
  getAllIntakes,
  getAllFees,
  getAllScholarships,
  type University,
  type Campus,
  type Course,
  type Intake,
  type Fee,
  type Scholarship,
} from "@/lib/api";
import UniversityModal from "../components/UniversityModal";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  public: { label: "Public", color: "bg-blue-100 text-blue-700" },
  private: { label: "Private", color: "bg-purple-100 text-purple-700" },
  semi_government: { label: "Semi-Government", color: "bg-indigo-100 text-indigo-700" },
};

const PARTNER_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  partner: { label: "Partner", color: "bg-green-100 text-green-700", icon: CheckCircle },
  preferred_partner: { label: "Preferred Partner", color: "bg-emerald-100 text-emerald-700", icon: Award },
  non_partner: { label: "Non-Partner", color: "bg-gray-100 text-gray-700", icon: Clock },
};

// Converts any YouTube URL (watch, youtu.be, shorts, embed) into a proper embeddable URL
function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/embed/")[1];
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1];
      }
    }

    if (!videoId) return null;
    // Strip any trailing params/slashes from the extracted id
    videoId = videoId.split(/[?&/]/)[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default function UniversityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const universityId = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchUniversity();
  }, [universityId]);

  async function fetchUniversity() {
    setLoading(true);
    try {
      const [uniRes, campusRes, courseRes, intakeRes, feeRes, scholarshipRes] = await Promise.all([
        getUniversityById(universityId),
        getCampusesByUniversity(universityId),
        getAllCourses({ universityId }),
        getAllIntakes({ universityId }),
        getAllFees({ universityId }),
        getAllScholarships({ universityId }),
      ]);
      
      if (uniRes.success && uniRes.data) setUniversity(uniRes.data);
      if (campusRes.success && campusRes.data) setCampuses(campusRes.data.campuses || []);
      if (courseRes.success && courseRes.data) {
        setCourses(Array.isArray(courseRes.data) ? courseRes.data : courseRes.data.courses || []);
      }
      if (intakeRes.success && intakeRes.data) {
        setIntakes(Array.isArray(intakeRes.data) ? intakeRes.data : []);
      }
      if (feeRes.success && feeRes.data) {
        setFees(Array.isArray(feeRes.data) ? feeRes.data : []);
      }
      if (scholarshipRes.success && scholarshipRes.data) {
        setScholarships(Array.isArray(scholarshipRes.data) ? scholarshipRes.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch university:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: Partial<University>) {
    setActionLoading(true);
    try {
      const res = await updateUniversity(universityId, data);
      if (res.success) {
        await fetchUniversity();
        setShowEditModal(false);
      } else {
        alert(res.message || "Failed to update");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      const res = await deleteUniversity(universityId);
      if (res.success) {
        router.push("/admin/universities");
      } else {
        alert(res.message || "Failed to delete");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!university) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">University Not Found</h3>
            <p className="text-sm text-gray-500 mb-4">The university you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/admin/universities")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Universities
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const PartnerIcon = PARTNER_CONFIG[university.partnerStatus]?.icon || Clock;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/universities")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{university.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">University Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Cover + Overview Card */}
        <Card className="overflow-hidden">
          {university.coverImageUrl && (
            <div className="h-48 w-full overflow-hidden">
              <img src={university.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start gap-6">
              {university.logoUrl ? (
                <img src={university.logoUrl} alt={university.name} className="w-20 h-20 object-contain rounded-xl border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {university.name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{university.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {university.city}{university.city && university.country ? ", " : ""}{university.country}
                    </div>
                    {university.website && (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[#1e3a8a] hover:underline mt-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {university.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="secondary" className={university.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {university.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="secondary" className={PARTNER_CONFIG[university.partnerStatus]?.color}>
                      <PartnerIcon className="w-3 h-3 mr-1" />
                      {PARTNER_CONFIG[university.partnerStatus]?.label}
                    </Badge>
                    {university.type && (
                      <Badge variant="secondary" className={TYPE_CONFIG[university.type]?.color}>
                        {TYPE_CONFIG[university.type]?.label}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Courses</p>
                      <p className="text-sm font-bold text-gray-900">{university.courseCount ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Campuses</p>
                      <p className="text-sm font-bold text-gray-900">{university.campusCount ?? 1}</p>
                    </div>
                  </div>
                  {university.ranking && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ranking</p>
                        <p className="text-sm font-bold text-gray-900">{university.ranking}</p>
                      </div>
                    </div>
                  )}
                  {university.rating && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="text-sm font-bold text-gray-900">{university.rating} / 5</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {["overview", "courses", "campuses", "intakes", "fees", "scholarships"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#1e3a8a] text-[#1e3a8a]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About */}
            {university.description && (
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <School className="w-5 h-5 text-[#1e3a8a]" />
                  About
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{university.description}</p>
              </Card>
            )}

            {/* Key Details */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1e3a8a]" />
                Key Details
              </h3>
              <div className="space-y-3">
                {university.establishedYear && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Established</span>
                    <span className="text-sm font-medium text-gray-900">{university.establishedYear}</span>
                  </div>
                )}
                {university.totalStudents && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Total Students</span>
                    <span className="text-sm font-medium text-gray-900">{university.totalStudents}</span>
                  </div>
                )}
                {university.accreditation && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Accreditation</span>
                    <span className="text-sm font-medium text-gray-900">{university.accreditation}</span>
                  </div>
                )}
                {university.applicationFee && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Application Fee</span>
                    <span className="text-sm font-medium text-gray-900">{university.applicationFee}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Code</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{university.code}</span>
                </div>
              </div>
            </Card>

            {/* Intakes */}
            {university.intakes && university.intakes.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1e3a8a]" />
                  Available Intakes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {university.intakes.map((intake) => (
                    <Badge key={intake} variant="secondary" className="bg-blue-50 text-blue-700 capitalize">
                      {intake}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Admission Requirements */}
            {university.admissionRequirements && (
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1e3a8a]" />
                  Admission Requirements
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{university.admissionRequirements}</p>
              </Card>
            )}

            {/* Scholarships */}
            {university.scholarshipsAvailable && (
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1e3a8a]" />
                  Scholarships Available
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{university.scholarshipsAvailable}</p>
              </Card>
            )}

            {/* Media Gallery */}
            {university.media && (university.media.images.length > 0 || university.media.videos.length > 0) && (
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <School className="w-5 h-5 text-[#1e3a8a]" />
                  Gallery
                </h3>
                {university.media.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {university.media.images.map((img) => (
                        <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                          <img src={img.url} alt={img.altText || "Gallery image"} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {university.media.videos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Videos</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {university.media.videos.map((vid) => (
                        <div key={vid.id} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-black">
                          <video src={vid.url} controls className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Intro Video */}
            {university.introVideoUrl && (
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <School className="w-5 h-5 text-[#1e3a8a]" />
                  Introduction Video
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  {(() => {
                    const embedUrl = getYoutubeEmbedUrl(university.introVideoUrl);
                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      );
                    }
                    return <video src={university.introVideoUrl} controls className="w-full h-full object-contain" />;
                  })()}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            {courses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Courses Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Courses linked to this university will appear here.</p>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/courses")}>
                  Manage Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4 hover:shadow-md transition-shadow">
                    {course.coverImageUrl && (
                      <img src={course.coverImageUrl} alt={course.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-1">{course.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{course.code}</p>
                    {course.shortDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.shortDescription}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        {course.level && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {course.level.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                      {course.tuitionFee && (
                        <span className="text-sm font-semibold text-gray-900">
                          {course.currency} {course.tuitionFee.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => router.push(`/admin/courses/${course.id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campuses Tab */}
        {activeTab === "campuses" && (
          <div>
            {campuses.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Campuses Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Campuses linked to this university will appear here.</p>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/campuses")}>
                  Manage Campuses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campuses.map((campus) => (
                  <Card key={campus.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campus.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {campus.city}, {campus.country}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize ${
                          campus.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campus.status}
                      </Badge>
                    </div>

                    {campus.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campus.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
                      {campus.totalStudents && (
                        <div>
                          <p className="text-gray-500 text-xs">Students</p>
                          <p className="font-semibold text-gray-900">{campus.totalStudents.toLocaleString()}</p>
                        </div>
                      )}
                      {campus.totalFaculty && (
                        <div>
                          <p className="text-gray-500 text-xs">Faculty</p>
                          <p className="font-semibold text-gray-900">{campus.totalFaculty}</p>
                        </div>
                      )}
                    </div>

                    {campus.facilities && campus.facilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {campus.facilities.slice(0, 3).map((facility, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                            {facility}
                          </Badge>
                        ))}
                        {campus.facilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{campus.facilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => router.push(`/admin/campuses/${campus.id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Intakes Tab */}
        {activeTab === "intakes" && (
          <div>
            {intakes.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Intakes Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Intakes linked to this university will appear here.</p>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/intakes")}>
                  Manage Intakes
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intakes.map((intake) => (
                  <Card key={intake.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#1e3a8a]" />
                          <span className="font-bold text-gray-900">
                            {intake.label || `${intake.month.charAt(0).toUpperCase() + intake.month.slice(1)} ${intake.year}`}
                          </span>
                        </div>
                        {intake.isFeatured && (
                          <span className="text-xs text-yellow-600 font-medium">★ Featured</span>
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize text-xs ${
                          intake.status === "open" ? "bg-green-100 text-green-700" :
                          intake.status === "closed" ? "bg-gray-100 text-gray-700" :
                          intake.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {intake.status}
                      </Badge>
                    </div>

                    {intake.course && (
                      <div className="flex items-start gap-2 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium line-clamp-1">{intake.course.name}</span>
                      </div>
                    )}

                    {intake.courseStartDate && (
                      <div className="text-xs text-gray-500 mb-3">
                        Start: {new Date(intake.courseStartDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}

                    {intake.applicationDeadline && (
                      <div className="text-xs text-gray-500 mb-3">
                        Deadline: {new Date(intake.applicationDeadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}

                    {intake.totalSeats !== undefined && intake.totalSeats > 0 && (
                      <div className="text-xs py-2 border-t border-gray-100 mb-3">
                        <span className="text-gray-500">Seats: </span>
                        <span className="font-medium text-gray-700">
                          {intake.availableSeats ?? intake.totalSeats} / {intake.totalSeats} available
                        </span>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/admin/intakes/${intake.id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div>
            {fees.length === 0 ? (
              <Card className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Fee Records Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Fee records linked to this university will appear here.</p>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/fees")}>
                  Manage Fees
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fees.map((fee) => (
                  <Card key={fee.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-[#1e3a8a]" />
                          <span className="font-bold text-gray-900">
                            {fee.currency} {fee.tuitionFee?.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {fee.feePeriod?.replace(/_/g, " ")} · {fee.academicYear}
                        </span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize text-xs ${
                          fee.status === "current" ? "bg-green-100 text-green-700" :
                          fee.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                          fee.status === "expired" ? "bg-gray-100 text-gray-700" :
                          "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {fee.status}
                      </Badge>
                    </div>

                    {fee.course && (
                      <div className="flex items-start gap-2 mb-3">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium line-clamp-1">{fee.course.name}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5 py-3 border-t border-gray-100 mb-3 text-xs">
                      {fee.applicationFee !== undefined && fee.applicationFee > 0 && (
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-400">Application</span>
                          <span className="font-medium text-gray-700">{fee.currency} {fee.applicationFee.toLocaleString()}</span>
                        </div>
                      )}
                      {fee.deposit !== undefined && fee.deposit > 0 && (
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-400">Deposit</span>
                          <span className="font-medium text-gray-700">{fee.currency} {fee.deposit.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/admin/fees/${fee.id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scholarships Tab */}
        {activeTab === "scholarships" && (
          <div>
            {scholarships.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Scholarships Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Scholarships linked to this university will appear here.</p>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]" onClick={() => router.push("/admin/scholarships")}>
                  Manage Scholarships
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{scholarship.name}</h4>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize text-xs flex-shrink-0 ${
                          scholarship.status === "active" ? "bg-green-100 text-green-700" :
                          scholarship.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                          scholarship.status === "expired" ? "bg-gray-100 text-gray-700" :
                          scholarship.status === "suspended" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {scholarship.status}
                      </Badge>
                    </div>

                    <Badge 
                      variant="secondary" 
                      className="text-xs mb-3 capitalize"
                    >
                      {scholarship.type?.replace(/_/g, " ")}
                    </Badge>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {scholarship.amountType === "full_tuition" ? "Full Tuition" :
                           scholarship.amountType === "percentage" && scholarship.percentage ? `${scholarship.percentage}% off` :
                           scholarship.amount ? `${scholarship.currency} ${scholarship.amount.toLocaleString()}` :
                           scholarship.amountDescription || "—"}
                        </div>
                        <div className="text-xs text-gray-500">{scholarship.amountType?.replace(/_/g, " ")}</div>
                      </div>
                    </div>

                    {scholarship.course && (
                      <div className="flex items-start gap-1.5 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500 line-clamp-1">{scholarship.course.name}</span>
                      </div>
                    )}

                    {scholarship.deadline && (
                      <div className="text-xs text-gray-500 mb-3">
                        Deadline: {new Date(scholarship.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/admin/scholarships/${scholarship.id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <UniversityModal
          mode="edit"
          university={university}
          onSave={handleUpdate}
          onClose={() => setShowEditModal(false)}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Delete University</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{university.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleDelete} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Deleting..." : "Delete University"}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
