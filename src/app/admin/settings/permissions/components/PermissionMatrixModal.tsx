"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Shield, ChevronDown, ChevronRight, Check, Users, Info } from "lucide-react";
import { getPermissionGroupMembers } from "@/lib/api";

interface PermissionMatrixModalProps {
  group: any;
  availablePermissions: any;
  onClose: () => void;
}

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

export default function PermissionMatrixModal({
  group,
  availablePermissions,
  onClose,
}: PermissionMatrixModalProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const permissions = group?.permissions || [];

  useEffect(() => {
    // Auto-expand all modules that have permissions
    const modules = new Set(permissions.map((p: any) => p.module));
    setExpandedModules(modules);
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoadingMembers(true);
    try {
      const res = await getPermissionGroupMembers(group.id);
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoadingMembers(false);
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

  // Group permissions by module
  const permissionsByModule: Record<string, any[]> = {};
  permissions.forEach((perm: any) => {
    if (!permissionsByModule[perm.module]) {
      permissionsByModule[perm.module] = [];
    }
    permissionsByModule[perm.module].push(perm);
  });

  const totalPermissions = permissions.length;
  const modulesWithPermissions = Object.keys(permissionsByModule);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-5xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{group.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {group.code && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {group.code}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={
                    group.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {group.status}
                </Badge>
              </div>
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
        <div className="flex-1 overflow-y-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1e3a8a]">{totalPermissions}</div>
              <div className="text-sm text-gray-600">Total Permissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1e3a8a]">{modulesWithPermissions.length}</div>
              <div className="text-sm text-gray-600">Modules Configured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1e3a8a]">{members.length}</div>
              <div className="text-sm text-gray-600">Staff Members</div>
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 mb-1">Description</div>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Staff Members */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Assigned Staff Members</h3>
            </div>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No staff members assigned to this permission group yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-semibold">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{member.fullName}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                    {member.employeeCode && (
                      <Badge variant="secondary" className="text-xs">
                        {member.employeeCode}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permissions Matrix */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Permission Matrix</h3>
            </div>

            {modulesWithPermissions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No permissions configured for this group
              </p>
            ) : (
              <div className="space-y-3">
                {modulesWithPermissions.map((module) => {
                  const isExpanded = expandedModules.has(module);
                  const modulePerms = permissionsByModule[module] || [];

                  return (
                    <Card key={module} className="overflow-hidden">
                      {/* Module Header */}
                      <div
                        className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleModule(module)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                          <Shield className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {MODULE_LABELS[module] || module}
                            </div>
                            <div className="text-xs text-blue-600">
                              {modulePerms.length} permissions granted
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {modulePerms.length}
                        </Badge>
                      </div>

                      {/* Permissions List */}
                      {isExpanded && (
                        <div className="p-4 space-y-2 bg-white border-t border-gray-100">
                          {modulePerms.map((perm: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900">
                                    {ACTION_LABELS[perm.action] || perm.action}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    {module}.{perm.action}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`${SCOPE_COLORS[perm.scope as keyof typeof SCOPE_COLORS] || "bg-gray-100 text-gray-700"} border`}
                              >
                                {SCOPE_LABELS[perm.scope as keyof typeof SCOPE_LABELS] || perm.scope}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
          <Button onClick={onClose} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
