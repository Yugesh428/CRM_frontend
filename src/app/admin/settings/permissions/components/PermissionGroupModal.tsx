"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Shield, Check, ChevronDown, ChevronRight, Info } from "lucide-react";

interface PermissionGroupModalProps {
  mode: "create" | "edit";
  group?: any;
  availablePermissions: any;
  onSave: (data: any) => void;
  onClose: () => void;
  loading?: boolean;
}

const SCOPE_LABELS = {
  own: "Own",
  assigned: "Assigned",
  department: "Department",
  all: "All",
};

const SCOPE_DESCRIPTIONS = {
  own: "Only records created by this user",
  assigned: "Only records assigned to this user",
  department: "All records in user's department",
  all: "All records system-wide",
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

export default function PermissionGroupModal({
  mode,
  group,
  availablePermissions,
  onSave,
  onClose,
  loading,
}: PermissionGroupModalProps) {
  const [formData, setFormData] = useState({
    name: group?.name || "",
    code: group?.code || "",
    description: group?.description || "",
    status: group?.status || "active",
  });

  const [permissions, setPermissions] = useState<
    Array<{ module: string; action: string; scope: string }>
  >(group?.permissions || []);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<any>({});

  const permissionMatrix = availablePermissions?.permissionMatrix || {};
  const scopes = availablePermissions?.scopes || ["own", "assigned", "department", "all"];

  useEffect(() => {
    // Auto-expand modules that have permissions in edit mode
    if (mode === "edit" && group?.permissions) {
      const modules = new Set(group.permissions.map((p: any) => p.module));
      setExpandedModules(modules);
    }
  }, [mode, group]);

  function validate() {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.code && !/^[A-Z0-9_]{2,20}$/.test(formData.code)) {
      newErrors.code = "Code must be 2-20 uppercase letters, numbers, or underscores";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      ...formData,
      permissions,
    });
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

  function togglePermission(module: string, action: string) {
    const exists = hasPermission(module, action);
    if (exists) {
      setPermissions(permissions.filter((p) => !(p.module === module && p.action === action)));
    } else {
      setPermissions([...permissions, { module, action, scope: "assigned" }]);
    }
  }

  function updateScope(module: string, action: string, scope: string) {
    setPermissions(
      permissions.map((p) =>
        p.module === module && p.action === action ? { ...p, scope } : p
      )
    );
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
  }

  function deselectAllInModule(module: string) {
    setPermissions(permissions.filter((p) => p.module !== module));
  }

  const moduleHasAnyPermission = (module: string) => {
    return permissions.some((p) => p.module === module);
  };

  const totalPermissions = permissions.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === "create" ? "Create Permission Group" : "Edit Permission Group"}
              </h2>
              <p className="text-sm text-blue-100">
                Define permissions and access levels for staff roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Counselor, Receptionist, Visa Officer"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., COUN, RECEP, VISA"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role and responsibilities..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Permissions Matrix
              </h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {totalPermissions} Permissions Selected
              </Badge>
            </div>

            {/* Scope Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {Object.entries(SCOPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{SCOPE_DESCRIPTIONS[key as keyof typeof SCOPE_DESCRIPTIONS]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modules */}
            <div className="space-y-2">
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

                            return (
                              <div
                                key={`${module}-${action}`}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                  isChecked
                                    ? "bg-white border-blue-300 shadow-sm"
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
                                        ? "bg-blue-600 border-blue-600"
                                        : "bg-white border-gray-300 hover:border-blue-400"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>

                                {/* Action Name */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900">
                                    {ACTION_LABELS[action] || action}
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
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalPermissions}</span> permissions configured
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              {loading ? "Saving..." : mode === "create" ? "Create Group" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
