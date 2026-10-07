"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Check,
  X,
  Mail,
  Phone,
  Briefcase,
  Shield,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/lib/api";

const roleOptions = [
  { value: "admin", label: "Admin", color: "bg-purple-100 text-purple-700" },
  { value: "receptionist", label: "Receptionist", color: "bg-blue-100 text-blue-700" },
  { value: "visa_officer", label: "Visa Officer", color: "bg-green-100 text-green-700" },
  { value: "documentation_officer", label: "Documentation Officer", color: "bg-orange-100 text-orange-700" },
  { value: "counselor", label: "Counselor", color: "bg-pink-100 text-pink-700" },
  { value: "teacher", label: "Teacher", color: "bg-cyan-100 text-cyan-700" },
  { value: "student", label: "Student", color: "bg-gray-100 text-gray-700" },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateUserPayload>({
    fullName: "",
    email: "",
    role: "admin",
    phone: "",
    designation: "",
    employeeCode: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchUsers();
  }, [router, roleFilter, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === "active";
      
      const res = await getAllUsers(params) as any;
      // Backend returns { success, meta, data: User[] }
      const list = Array.isArray(res.data) ? res.data : res.data?.users || [];
      setUsers(list);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    setActionLoading(true);
    try {
      const res = await createUser(formData);
      if (res.success && res.data) {
        setGeneratedPassword(res.data.generatedPassword);
        setShowPassword(true);
        await fetchUsers();
        // Don't close modal yet, show password first
      } else {
        alert(res.message || "Failed to create user");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateUser() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const payload: UpdateUserPayload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        designation: formData.designation,
      };
      const res = await updateUser(selectedUser.id, payload);
      if (res.success) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        alert(res.message || "Failed to update user");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await deleteUser(selectedUser.id);
      if (res.success) {
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        alert(res.message || "Failed to delete user");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleStatus(user: User) {
    try {
      const res = await toggleUserStatus(user.id);
      if (res.success) {
        await fetchUsers();
      } else {
        alert(res.message || "Failed to toggle status");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  async function handleResetPassword(user: User) {
    if (!confirm(`Reset password for ${user.fullName}?`)) return;
    try {
      const res = await resetUserPassword(user.id);
      if (res.success && res.data) {
        alert(`New password: ${res.data.newPassword}\n\nPlease save this password and share it with the user.`);
      } else {
        alert(res.message || "Failed to reset password");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  function openCreateModal() {
    setFormData({
      fullName: "",
      email: "",
      role: "admin",
      phone: "",
      designation: "",
      employeeCode: "",
    });
    setGeneratedPassword("");
    setShowPassword(false);
    setShowCreateModal(true);
  }

  function openEditModal(user: User) {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role as any,
      phone: user.phone || "",
      designation: user.designation || "",
      employeeCode: user.employeeCode || "",
    });
    setShowEditModal(true);
  }

  function openDeleteModal(user: User) {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }

  function closeModals() {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setGeneratedPassword("");
    setShowPassword(false);
  }

  function copyPassword() {
    navigator.clipboard.writeText(generatedPassword);
    alert("Password copied to clipboard!");
  }

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  function getRoleBadge(role: string) {
    const roleOption = roleOptions.find((r) => r.value === role);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleOption?.color || "bg-gray-100 text-gray-700"}`}>
        {roleOption?.label || role}
      </span>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage admin users and staff members</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
          >
            <option value="">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-semibold text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.employeeCode || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1.5 text-gray-900 mb-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Reset Password"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new user to your system</p>
            </div>

            {generatedPassword ? (
              // Show generated password
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm font-medium">User created successfully!</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Generated Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword}
                      readOnly
                      className="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={copyPassword}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Please save this password and share it with the user. It cannot be retrieved later.
                  </p>
                </div>
              </div>
            ) : (
              // Show form
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateUser();
                }}
                className="px-6 py-6 space-y-4"
              >
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
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
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    placeholder="Senior Officer"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    placeholder="EMP001"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {actionLoading ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {generatedPassword && (
              <div className="px-6 pb-6">
                <button
                  onClick={closeModals}
                  className="w-full px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500 mt-1">Update user information</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
              }}
              className="px-6 py-6 space-y-4"
            >
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {actionLoading ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">
                    Are you sure you want to delete this user?
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>{selectedUser.fullName}</strong> ({selectedUser.email}) will be permanently removed. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {actionLoading ? "Deleting..." : "Delete User"}
                </button>
                <button
                  onClick={closeModals}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
