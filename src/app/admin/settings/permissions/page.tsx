"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings as SettingsIcon,
  UserPlus,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getAllPermissionGroups,
  getPermissionGroupStatistics,
  createPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
  duplicatePermissionGroup,
  getAvailablePermissions,
  type PermissionGroup,
} from "@/lib/api";
import PermissionGroupModal from "./components/PermissionGroupModal";
import PermissionMatrixModal from "./components/PermissionMatrixModal";
import IndividualPermissions from "./components/IndividualPermissions";

export default function PermissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");
  
  // Permission Groups
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Available Permissions (for UI building)
  const [availablePermissions, setAvailablePermissions] = useState<any>(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "admin" && parsed.role !== "super_admin") {
      router.replace("/admin/dashboard");
      return;
    }
    fetchData();
  }, [router, statusFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const [groupsRes, statsRes, availableRes] = await Promise.all([
        getAllPermissionGroups({ status: statusFilter, search: searchTerm }),
        getPermissionGroupStatistics(),
        getAvailablePermissions(),
      ]);

      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (availableRes.success && availableRes.data) {
        setAvailablePermissions(availableRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(data: any) {
    setActionLoading(true);
    try {
      const res = await createPermissionGroup(data);
      if (res.success) {
        await fetchData();
        setShowCreateModal(false);
      } else {
        alert(res.message || "Failed to create permission group");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateGroup(data: any) {
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await updatePermissionGroup(selectedGroup.id, data);
      if (res.success) {
        await fetchData();
        setShowEditModal(false);
        setSelectedGroup(null);
      } else {
        alert(res.message || "Failed to update permission group");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteGroup() {
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      const res = await deletePermissionGroup(selectedGroup.id);
      if (res.success) {
        await fetchData();
        setShowDeleteModal(false);
        setSelectedGroup(null);
      } else {
        alert(res.message || "Failed to delete permission group");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDuplicateGroup(group: PermissionGroup) {
    try {
      const res = await duplicatePermissionGroup(group.id);
      if (res.success) {
        await fetchData();
      } else {
        alert(res.message || "Failed to duplicate permission group");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full -m-6">
        {/* Top Navigation Tabs - Full Width, Above Everything */}
        <div className="bg-white border-b border-gray-200 w-full px-6">
          <TabsList className="h-12 bg-transparent border-0 p-0 w-auto gap-0">
            <TabsTrigger 
              value="groups" 
              className="flex items-center gap-2 h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#1e3a8a] bg-transparent hover:bg-gray-50 font-medium"
            >
              <Shield className="w-4 h-4" />
              Permission Groups
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#1e3a8a] bg-transparent hover:bg-gray-50 font-medium"
            >
              <Users className="w-4 h-4" />
              Individual Permissions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Permission Groups Tab */}
        <TabsContent value="groups" className="flex-1 m-0 p-6 space-y-4">
            {/* Header with Create Button - Compact */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Permission Groups</h1>
                <p className="text-xs text-gray-500 mt-0.5">Create and manage reusable permission templates</p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>

            {/* Statistics Cards - Compact */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Groups</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
                  <p className="text-xs text-gray-500 font-medium">Active Groups</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.usersWithGroups}</p>
                  <p className="text-xs text-gray-500 font-medium">Users Assigned</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.usersWithoutGroups}</p>
                  <p className="text-xs text-gray-500 font-medium">Unassigned Users</p>
                </Card>
              </div>
            )}
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline" size="sm" onClick={fetchData}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </Card>

            {/* Groups Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No permission groups found</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="p-5 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                          {group.code && (
                            <p className="text-xs text-gray-500 font-mono">{group.code}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <Badge
                        variant="secondary"
                        className={group.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      >
                        {group.status === "active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {group.status}
                      </Badge>
                    </div>

                    {/* Description */}
                    {group.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{group.permissionCount || 0}</div>
                        <div className="text-xs text-gray-500">Permissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{group.staffCount || 0}</div>
                        <div className="text-xs text-gray-500">Staff</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateGroup(group)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        {/* Individual Permissions Tab */}
        <TabsContent value="users" className="flex-1 m-0 p-6">
            {availablePermissions ? (
              <IndividualPermissions availablePermissions={availablePermissions} />
            ) : (
              <Card className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading permissions...</p>
              </Card>
            )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateModal && availablePermissions && (
        <PermissionGroupModal
          mode="create"
          availablePermissions={availablePermissions}
          onSave={handleCreateGroup}
          onClose={() => setShowCreateModal(false)}
          loading={actionLoading}
        />
      )}

      {showEditModal && selectedGroup && availablePermissions && (
        <PermissionGroupModal
          mode="edit"
          group={selectedGroup}
          availablePermissions={availablePermissions}
          onSave={handleUpdateGroup}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGroup(null);
          }}
          loading={actionLoading}
        />
      )}

      {showViewModal && selectedGroup && availablePermissions && (
        <PermissionMatrixModal
          group={selectedGroup}
          availablePermissions={availablePermissions}
          onClose={() => {
            setShowViewModal(false);
            setSelectedGroup(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Delete Permission Group</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{selectedGroup.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleDeleteGroup}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? "Deleting..." : "Delete Group"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGroup(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
