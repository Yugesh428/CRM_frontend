"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Globe,
  MapPin,
  GraduationCap,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  School,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getAllUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  toggleUniversityStatus,
  type University,
} from "@/lib/api";
import UniversityModal from "./components/UniversityModal";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  public: { label: "Public", color: "bg-blue-100 text-blue-700" },
  private: { label: "Private", color: "bg-purple-100 text-purple-700" },
  semi_government: { label: "Semi-Government", color: "bg-indigo-100 text-indigo-700" },
};

const PARTNER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  partner: { label: "Partner", color: "bg-green-100 text-green-700", icon: CheckCircle },
  preferred_partner: { label: "Preferred Partner", color: "bg-emerald-100 text-emerald-700", icon: Award },
  non_partner: { label: "Non-Partner", color: "bg-gray-100 text-gray-700", icon: Clock },
};

export default function UniversitiesPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    fetchUniversities();
  }, [router, countryFilter, typeFilter, partnerFilter, statusFilter]);

  async function fetchUniversities() {
    setLoading(true);
    try {
      const res = await getAllUniversities({
        search: searchTerm,
        country: countryFilter,
        type: typeFilter,
        partnerStatus: partnerFilter,
        isActive: statusFilter,
      });
      
      if (res.success && res.data) {
        setUniversities(Array.isArray(res.data) ? res.data : res.data.universities || []);
      }
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUniversity() {
    if (!selectedUniversity) return;
    setActionLoading(true);
    try {
      const res = await deleteUniversity(selectedUniversity.id);
      if (res.success) {
        await fetchUniversities();
        setShowDeleteModal(false);
        setSelectedUniversity(null);
      } else {
        alert(res.message || "Failed to delete university");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateUniversity(data: Partial<University>) {
    setActionLoading(true);
    try {
      const res = await createUniversity(data);
      if (res.success) {
        await fetchUniversities();
        setShowCreateModal(false);
      } else {
        alert(res.message || "Failed to create university");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateUniversity(data: Partial<University>) {
    if (!selectedUniversity) return;
    setActionLoading(true);
    try {
      const res = await updateUniversity(selectedUniversity.id, data);
      if (res.success) {
        await fetchUniversities();
        setShowEditModal(false);
        setSelectedUniversity(null);
      } else {
        alert(res.message || "Failed to update university");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      const res = await toggleUniversityStatus(id, !currentStatus);
      if (res.success) {
        await fetchUniversities();
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  function handleSearch() {
    fetchUniversities();
  }

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      uni.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: universities.length,
    active: universities.filter((u) => u.isActive).length,
    partners: universities.filter((u) => u.partnerStatus === "partner" || u.partnerStatus === "preferred_partner").length,
    avgRating: (universities.reduce((acc, u) => acc + (u.rating || 0), 0) / universities.length).toFixed(1),
  };

  const countries = Array.from(new Set(universities.map(u => u.country).filter(Boolean)));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your university partners and listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-medium">Total Universities</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-500 font-medium">Active Universities</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.partners}</p>
            <p className="text-xs text-gray-500 font-medium">Partner Universities</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgRating || "N/A"}</p>
            <p className="text-xs text-gray-500 font-medium">Average Rating</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, city, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Partners</option>
              {Object.entries(PARTNER_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={statusFilter === undefined ? "" : statusFilter.toString()}
              onChange={(e) => setStatusFilter(e.target.value === "" ? undefined : e.target.value === "true")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {(searchTerm || countryFilter || typeFilter || partnerFilter || statusFilter !== undefined) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setCountryFilter("");
                  setTypeFilter("");
                  setPartnerFilter("");
                  setStatusFilter(undefined);
                }}
              >
                Clear Filters
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Universities Grid/Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUniversities.length === 0 ? (
          <Card className="p-12 text-center">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No universities found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || countryFilter || typeFilter || partnerFilter || statusFilter !== undefined
                ? "Try adjusting your filters"
                : "Get started by adding your first university"}
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">University</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Location</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Partner Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Courses</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Campuses</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Rating</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniversities.map((uni, idx) => {
                    const PartnerIcon = PARTNER_STATUS_CONFIG[uni.partnerStatus]?.icon || Clock;
                    return (
                      <tr
                        key={uni.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {uni.logoUrl ? (
                              <img src={uni.logoUrl} alt={uni.name} className="w-9 h-9 object-contain rounded-lg border border-gray-200 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {uni.name?.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">{uni.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">{uni.code}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {uni.city}, {uni.country}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="secondary" className={TYPE_CONFIG[uni.type]?.color}>
                            {TYPE_CONFIG[uni.type]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="secondary" className={PARTNER_STATUS_CONFIG[uni.partnerStatus]?.color}>
                            <PartnerIcon className="w-3 h-3 mr-1" />
                            {PARTNER_STATUS_CONFIG[uni.partnerStatus]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap font-semibold text-gray-900">{uni.courseCount || 0}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap font-semibold text-gray-900">{uni.campusCount || 1}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {uni.rating ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              {uni.rating}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge variant="secondary" className={uni.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {uni.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/universities/${uni.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedUniversity(uni); setShowEditModal(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedUniversity(uni); setShowDeleteModal(true); }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUniversity && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Delete University</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{selectedUniversity.name}</strong>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDeleteUniversity}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? "Deleting..." : "Delete University"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUniversity(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <UniversityModal
          mode="create"
          onSave={handleCreateUniversity}
          onClose={() => setShowCreateModal(false)}
          loading={actionLoading}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUniversity && (
        <UniversityModal
          mode="edit"
          university={selectedUniversity}
          onSave={handleUpdateUniversity}
          onClose={() => { setShowEditModal(false); setSelectedUniversity(null); }}
          loading={actionLoading}
        />
      )}
    </AdminLayout>
  );
}
