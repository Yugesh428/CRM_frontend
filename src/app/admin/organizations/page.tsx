"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Building,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle,
  Copy,
  Mail,
  Phone,
  MapPin,
  Globe as GlobeIcon,
  Calendar,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  type Organization,
  type CreateOrganizationPayload,
  type UpdateOrganizationPayload,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const planOptions = [
  { value: "free", label: "Free", color: "bg-gray-100 text-gray-700" },
  { value: "basic", label: "Basic", color: "bg-blue-100 text-blue-700" },
  { value: "professional", label: "Professional", color: "bg-purple-100 text-purple-700" },
  { value: "enterprise", label: "Enterprise", color: "bg-green-100 text-green-700" },
];

const statusOptions = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "trial", label: "Trial", color: "bg-blue-100 text-blue-700" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-700" },
];

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateOrganizationPayload>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Nepal",
    subscriptionPlan: "free",
    maxUsers: 10,
    maxLeads: 1000,
    maxStudents: 500,
    maxStorage: 10,
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "super_admin") {
      router.replace("/admin/dashboard");
      return;
    }
    fetchOrganizations();
  }, [router, statusFilter, planFilter]);

  async function fetchOrganizations() {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;
      if (searchTerm) params.search = searchTerm;
      
      const res = await getAllOrganizations(params);
      if (res.success && res.data) {
        setOrganizations(res.data as any);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrganization() {
    setActionLoading(true);
    try {
      const res = await createOrganization(formData);
      if (res.success && res.data) {
        if (res.data.temporaryPassword) {
          setCreatedCredentials({
            email: res.data.admin.email,
            password: res.data.temporaryPassword,
          });
        }
        await fetchOrganizations();
        if (!res.data.temporaryPassword) {
          setShowCreateModal(false);
          alert("Organization created successfully! Credentials sent via email.");
        }
      } else {
        alert(res.message || "Failed to create organization");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateOrganization() {
    if (!selectedOrg) return;
    setActionLoading(true);
    try {
      const payload: UpdateOrganizationPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        subscriptionPlan: formData.subscriptionPlan,
        maxUsers: formData.maxUsers,
        maxLeads: formData.maxLeads,
        maxStudents: formData.maxStudents,
        maxStorage: formData.maxStorage,
      };
      const res = await updateOrganization(selectedOrg.id, payload);
      if (res.success) {
        await fetchOrganizations();
        setShowEditModal(false);
        setSelectedOrg(null);
      } else {
        alert(res.message || "Failed to update organization");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteOrganization() {
    if (!selectedOrg) return;
    setActionLoading(true);
    try {
      const res = await deleteOrganization(selectedOrg.id);
      if (res.success) {
        await fetchOrganizations();
        setShowDeleteModal(false);
        setSelectedOrg(null);
      } else {
        alert(res.message || "Failed to delete organization");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleStatus(org: Organization, newStatus: string) {
    if (!confirm(`${newStatus === "suspended" ? "Suspend" : "Activate"} ${org.name}?`)) return;
    try {
      const res = await toggleOrganizationStatus(org.id, newStatus);
      if (res.success) {
        await fetchOrganizations();
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  function openCreateModal() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Nepal",
      subscriptionPlan: "free",
      maxUsers: 10,
      maxLeads: 1000,
      maxStudents: 500,
      maxStorage: 10,
      adminName: "",
      adminEmail: "",
      adminPhone: "",
    });
    setCreatedCredentials(null);
    setShowCreateModal(true);
  }

  function openEditModal(org: Organization) {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      email: org.email,
      phone: org.phone || "",
      address: org.address || "",
      city: org.city || "",
      country: org.country || "Nepal",
      subscriptionPlan: org.subscriptionPlan,
      maxUsers: org.maxUsers,
      maxLeads: org.maxLeads,
      maxStudents: org.maxStudents,
      maxStorage: org.maxStorage,
    });
    setShowEditModal(true);
  }

  function openViewModal(org: Organization) {
    setSelectedOrg(org);
    setShowViewModal(true);
  }

  function openDeleteModal(org: Organization) {
    setSelectedOrg(org);
    setShowDeleteModal(true);
  }

  function closeModals() {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedOrg(null);
    setCreatedCredentials(null);
  }

  function copyCredentials() {
    if (createdCredentials) {
      navigator.clipboard.writeText(
        `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
      );
      alert("Credentials copied to clipboard!");
    }
  }

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  function getPlanBadge(plan: string) {
    const planOption = planOptions.find((p) => p.value === plan);
    return (
      <Badge variant="secondary" className={planOption?.color}>
        {planOption?.label || plan}
      </Badge>
    );
  }

  function getStatusBadge(status: string) {
    const statusOption = statusOptions.find((s) => s.value === status);
    return (
      <Badge variant="secondary" className={statusOption?.color}>
        {statusOption?.label || status}
      </Badge>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
            <p className="text-sm text-gray-500 mt-1">Manage consultancy organizations</p>
          </div>
          <Button onClick={openCreateModal} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchOrganizations()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
            >
              <option value="">All Plans</option>
              {planOptions.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={fetchOrganizations}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Organizations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrgs.length === 0 ? (
          <Card className="p-12 text-center">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No organizations found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrgs.map((org) => (
              <Card key={org.id} className="p-5 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{org.name}</h3>
                      <p className="text-xs text-gray-500">@{org.slug}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Plan */}
                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(org.status)}
                  {getPlanBadge(org.subscriptionPlan)}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{org.email}</span>
                  </div>
                  {org.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{org.city}, {org.country}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{org.userCount || 0}</div>
                    <div className="text-xs text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{org.currentStudents}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{org.maxUsers}</div>
                    <div className="text-xs text-gray-500">Max</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openViewModal(org)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(org)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(org, org.status === "active" ? "suspended" : "active")}
                  >
                    {org.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(org)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Create New Organization</h3>
                <p className="text-sm text-gray-500 mt-1">Add a new consultancy organization</p>
              </div>

              {createdCredentials ? (
                // Show credentials
                <div className="px-6 py-6 space-y-4">
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="text-sm font-medium">Organization created successfully!</div>
                  </div>

                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Admin Credentials</h4>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Email</label>
                      <p className="text-sm font-mono text-gray-900">{createdCredentials.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Temporary Password</label>
                      <p className="text-sm font-mono text-gray-900">{createdCredentials.password}</p>
                    </div>
                    <p className="text-xs text-red-600">
                      ⚠️ Please save these credentials. The password cannot be retrieved later.
                    </p>
                    <Button onClick={copyCredentials} variant="outline" size="sm" className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Credentials
                    </Button>
                  </div>

                  <Button onClick={closeModals} className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">
                    Close
                  </Button>
                </div>
              ) : (
                // Show form
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateOrganization();
                  }}
                  className="px-6 py-6 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="Zylo Consultancy"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="info@zylo.com"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="+977 1234567890"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="Street address"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="Kathmandu"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                        placeholder="Nepal"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Subscription Plan *
                      </label>
                      <select
                        required
                        value={formData.subscriptionPlan}
                        onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                      >
                        {planOptions.map((plan) => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Max Users
                      </label>
                      <input
                        type="number"
                        value={formData.maxUsers}
                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Admin User Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                          Admin Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                          Admin Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                          placeholder="admin@zylo.com"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                          Admin Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.adminPhone}
                          onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                          placeholder="+977 1234567890"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]"
                    >
                      {actionLoading ? "Creating..." : "Create Organization"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModals}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal - Similar structure */}
        {showEditModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Edit Organization</h3>
                <p className="text-sm text-gray-500 mt-1">Update organization details</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateOrganization();
                }}
                className="px-6 py-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Subscription Plan *
                    </label>
                    <select
                      required
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    >
                      {planOptions.map((plan) => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Max Users
                    </label>
                    <input
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]"
                  >
                    {actionLoading ? "Updating..." : "Update Organization"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Delete Organization</h3>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium mb-1">
                      Are you sure you want to delete this organization?
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>{selectedOrg.name}</strong> and all its data will be permanently removed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleDeleteOrganization}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading ? "Deleting..." : "Delete Organization"}
                  </Button>
                  <Button variant="outline" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedOrg.name}</h3>
                  <p className="text-sm text-gray-500">@{selectedOrg.slug}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModals}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrg.status)}
                  {getPlanBadge(selectedOrg.subscriptionPlan)}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Email</label>
                    <p className="text-sm text-gray-900">{selectedOrg.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Phone</label>
                    <p className="text-sm text-gray-900">{selectedOrg.phone || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 font-medium">Address</label>
                    <p className="text-sm text-gray-900">
                      {selectedOrg.address ? `${selectedOrg.address}, ` : ""}
                      {selectedOrg.city}, {selectedOrg.country}
                    </p>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Subscription Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Users</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedOrg.currentUsers} / {selectedOrg.maxUsers}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Students</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedOrg.currentStudents} / {selectedOrg.maxStudents}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Leads</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedOrg.currentLeads} / {selectedOrg.maxLeads}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Storage (GB)</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedOrg.currentStorage} / {selectedOrg.maxStorage}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button onClick={() => {
                    closeModals();
                    openEditModal(selectedOrg);
                  }} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Organization
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
