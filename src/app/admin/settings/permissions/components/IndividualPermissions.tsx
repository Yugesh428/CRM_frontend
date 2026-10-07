"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Save,
  RefreshCw,
  User,
  Users as UsersIcon,
  AlertCircle,
} from "lucide-react";
import {
  getAllUsers,
  getUserPermissions,
  setBulkPermissions,
  getAvailablePermissions,
} from "@/lib/api";

const SCOPE_LABELS = {
  own: "Own",
  assigned: "Assigned",
  department: "Department",
  all: "All",
};

const SCOPE_COLORS = {
  own: "bg-yellow-100 text-yellow-700 border-yellow-300",
  assigned: "bg-blue-100 text-blue-700 border-blue-300",
  department: "bg-purple-100 text-purple-700 border-purple-300",
  all: "bg-green-100 text-green-700 border-green-300",
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  students: "Students",
  universities: "Universities",
  campuses: "Campuses",
  courses: "Courses",
  intakes: "Intakes",
  requirements: "Requirements",
  fees: "Fees & Commissions",
  scholarships: "Scholarships",
  documents: "Documents",
  applications: "Applications",
  visa: "Visa Processing",
  ielts_pte: "English Tests (IELTS/PTE)",
  appointments: "Appointments",
  visitors: "Visitors",
  reports: "Reports",
  website: "Website",
  staff: "Staff Management",
  departments: "Departments",
  settings: "Settings",
  profile: "Profile",
};

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  assign: "Assign",
  reassign: "Reassign",
  manage: "Manage",
  approve: "Approve",
  submit: "Submit",
  verify: "Verify",
  reject: "Reject",
  upload: "Upload",
  download: "Download",
  publish: "Publish",
  export: "Export",
  convert: "Convert",
  mark_lost: "Mark Lost",
  add_note: "Add Note",
  add_followup: "Add Follow-up",
  reschedule: "Reschedule",
  cancel: "Cancel",
  view_own_stats: "View Own Stats",
  view_department_stats: "View Department Stats",
  view_all_stats: "View All Stats",
  record_results: "Record Results",
  record_interview: "Record Interview",
  record_offer: "Record Offer",
  record_acceptance: "Record Acceptance",
  record_decision: "Record Decision",
  update_status: "Update Status",
  update_checklist: "Update Checklist",
  request: "Request",
  mark_missing: "Mark Missing",
  manage_attendance: "Manage Attendance",
  manage_classes: "Manage Classes",
  manage_batches: "Manage Batches",
  deactivate: "Deactivate",
  view_attendance: "View Attendance",
  view_performance: "View Performance",
  view_activity: "View Activity",
  manage_permissions: "Manage Permissions",
  manage_roles: "Manage Roles",
  manage_configuration: "Manage Configuration",
  manage_notifications: "Manage Notifications",
  manage_integrations: "Manage Integrations",
  manage_security: "Manage Security",
};

interface IndividualPermissionsProps {
  availablePermissions: any;
}

export default function IndividualPermissions({ availablePermissions }: IndividualPermissionsProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [permissions, setPermissions] = useState<Array<{ module: string; action: string; scope: string }>>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const permissionMatrix = availablePermissions?.permissionMatrix || {};
  const scopes = availablePermissions?.scopes || ["own", "assigned", "department", "all"];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getAllUsers({});
      if (res.success && res.data) {
        // Filter out super_admin and admin roles
        const filteredUsers = res.data.filter(
          (u: any) => u.role !== "super_admin" && u.role !== "admin"
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectUser(user: any) {
    setSelectedUser(user);
    setLoading(true);
    setHasChanges(false);
    try {
      const res = await getUserPermissions(user.id);
      if (res.success && res.data) {
        setUserPermissions(res.data);
        // Set merged permissions (group + individual)
        setPermissions(res.data.mergedPermissions || []);
        
        // Auto-expand modules with permissions
        const modules = new Set((res.data.mergedPermissions || []).map((p: any) => p.module));
        setExpandedModules(modules);
      }
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePermissions() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await setBulkPermissions(selectedUser.id, permissions);
      if (res.success) {
        alert("Permissions saved successfully");
        setHasChanges(false);
        // Reload permissions
        await handleSelectUser(selectedUser);
      } else {
        alert(res.message || "Failed to save permissions");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  function toggleModule(module: string) {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  }

  function hasPermission(module: string, action: string): boolean {
    return permissions.some((p) => p.module === module && p.action === action);
  }

  function getPermissionScope(module: string, action: string): string {
    const perm = permissions.find((p) => p.module === module && p.action === action);
    return perm?.scope || "assigned";
  }

  function isFromGroup(module: string, action: string): boolean {
    if (!userPermissions?.groupPermissions) return false;
    return userPermissions.groupPermissions.some(
      (p: any) => p.module === module && p.action === action
    );
  }

  function togglePermission(module: string, action: string) {
    const exists = hasPermission(module, action);
    let newPerms;
    if (exists) {
      newPerms = permissions.filter((p) => !(p.module === module && p.action === action));
    } else {
      newPerms = [...permissions, { module, action, scope: "assigned" }];
    }
    setPermissions(newPerms);
    setHasChanges(true);
  }

  function updateScope(module: string, action: string, scope: string) {
    const newPerms = permissions.map((p) =>
      p.module === module && p.action === action ? { ...p, scope } : p
    );
    setPermissions(newPerms);
    setHasChanges(true);
  }

  function selectAllInModule(module: string) {
    const moduleActions = permissionMatrix[module] || [];
    const newPerms = [...permissions];
    
    // Remove existing permissions for this module
    const filtered = newPerms.filter((p) => p.module !== module);
    
    // Add all actions for this module
    moduleActions.forEach((action: string) => {
      filtered.push({ module, action, scope: "assigned" });
    });
    
    setPermissions(filtered);
    setHasChanges(true);
  }

  function deselectAllInModule(module: string) {
    setPermissions(permissions.filter((p) => p.module !== module));
    setHasChanges(true);
  }

  const moduleHasAnyPermission = (module: string) => {
    return permissions.some((p) => p.module === module);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPermissions = permissions.length;

  return (
    <div className="space-y-4">
      {/* User Selection - Compact Horizontal */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <UsersIcon className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Select User</h3>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>
          </div>
        </div>

        {loading && !selectedUser ? (
          <div className="flex items-center justify-center py-6 mt-3">
            <div className="w-5 h-5 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 mt-3">No staff found</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 mt-3 -mx-1 px-1">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`relative flex-shrink-0 w-32 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  selectedUser?.id === user.id
                    ? "bg-blue-50 border-blue-400 shadow-sm ring-2 ring-blue-200"
                    : "bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                }`}
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-bold text-lg">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-center w-full">
                  <div className="font-medium text-xs text-gray-900 truncate">{user.fullName}</div>
                  {user.employeeCode && (
                    <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                      {user.employeeCode}
                    </Badge>
                  )}
                </div>
                {selectedUser?.id === user.id && (
                  <div className="absolute top-1 right-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Permissions Panel */}
      <div>
        {!selectedUser ? (
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No User Selected</h3>
            <p className="text-sm text-gray-500">
              Select a user from the list to manage their individual permissions
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* User Header */}
            <Card className="p-4 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedUser.profilePhoto ? (
                    <img
                      src={selectedUser.profilePhoto}
                      alt={selectedUser.fullName}
                      className="w-12 h-12 rounded-full object-cover border-3 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg border-3 border-white/20">
                      {selectedUser.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                        {selectedUser.role}
                      </Badge>
                      {selectedUser.employeeCode && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                          {selectedUser.employeeCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{totalPermissions}</div>
                    <div className="text-xs text-blue-100">Permissions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectUser(selectedUser)}
                      disabled={saving || loading}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-8"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleSavePermissions}
                      disabled={saving || loading || !hasChanges}
                      className="bg-white text-[#1e3a8a] hover:bg-white/90 h-8"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Permission Group Info */}
            {userPermissions?.permissionGroupId && (
              <Card className="p-3 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 text-sm">
                        Inheriting {userPermissions.groupPermissions?.length || 0} permissions from group
                      </div>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Individual permissions will override group permissions
                      </p>
                    </div>
                  </div>
                  {hasChanges && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Unsaved</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Unsaved Changes Warning (if no permission group) */}
            {!userPermissions?.permissionGroupId && hasChanges && (
              <Card className="p-3 bg-orange-50 border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">You have unsaved changes</span>
                </div>
              </Card>
            )}

            {/* Save Button Row - Removed, now in header */}

            {/* Permissions Matrix */}
            {loading ? (
              <Card className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
              </Card>
            ) : (
              <div className="space-y-3">
                {Object.entries(permissionMatrix).map(([module, actions]: [string, any]) => {
                  const isExpanded = expandedModules.has(module);
                  const hasAny = moduleHasAnyPermission(module);

                  return (
                    <Card key={module} className={`overflow-hidden ${hasAny ? "ring-2 ring-blue-200" : ""}`}>
                      {/* Module Header */}
                      <div
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          hasAny ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleModule(module)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <Shield className={`w-4 h-4 ${hasAny ? "text-blue-600" : "text-gray-400"}`} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {MODULE_LABELS[module] || module}
                            </div>
                            {hasAny && (
                              <div className="text-xs text-blue-600">
                                {permissions.filter((p) => p.module === module).length} permissions
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasAny && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              Active
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              hasAny ? deselectAllInModule(module) : selectAllInModule(module);
                            }}
                          >
                            {hasAny ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                      </div>

                      {/* Actions Grid */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                          <div className="space-y-2">
                            {actions.map((action: string) => {
                              const isChecked = hasPermission(module, action);
                              const currentScope = getPermissionScope(module, action);
                              const fromGroup = isFromGroup(module, action);

                              return (
                                <div
                                  key={`${module}-${action}`}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    isChecked
                                      ? fromGroup
                                        ? "bg-purple-50 border-purple-300"
                                        : "bg-white border-blue-300 shadow-sm"
                                      : "bg-white border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <div
                                    onClick={() => togglePermission(module, action)}
                                    className="cursor-pointer"
                                  >
                                    <div
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        isChecked
                                          ? fromGroup
                                            ? "bg-purple-600 border-purple-600"
                                            : "bg-blue-600 border-blue-600"
                                          : "bg-white border-gray-300 hover:border-blue-400"
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>

                                  {/* Action Name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium text-sm text-gray-900">
                                        {ACTION_LABELS[action] || action}
                                      </div>
                                      {fromGroup && (
                                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                          From Group
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {module}.{action}
                                    </div>
                                  </div>

                                  {/* Scope Selector */}
                                  {isChecked && (
                                    <select
                                      value={currentScope}
                                      onChange={(e) => updateScope(module, action, e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 bg-white"
                                    >
                                      {scopes.map((scope: string) => (
                                        <option key={scope} value={scope}>
                                          {SCOPE_LABELS[scope as keyof typeof SCOPE_LABELS]}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
