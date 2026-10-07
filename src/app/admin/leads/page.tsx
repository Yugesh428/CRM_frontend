"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  UserCheck,
  XCircle,
  MessageSquare,
} from "lucide-react";
import {
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  getUsersByRole,
  type Lead,
} from "@/lib/api";
import LeadModal from "./components/LeadModal";

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  priority: string;
  preferredCountry?: string;
  preferredCourseName?: string;
  assignedCounselor?: {
    fullName: string;
  };
  nextFollowUpDate?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  follow_up: { label: "Follow Up", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  contacted: { label: "Contacted", color: "bg-purple-100 text-purple-700", icon: Phone },
  qualified: { label: "Qualified", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  counseling_scheduled: { label: "Counseling", color: "bg-indigo-100 text-indigo-700", icon: Calendar },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-700", icon: Target },
  lost: { label: "Lost", color: "bg-red-100 text-red-700", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  referral: "Referral",
  walk_in: "Walk In",
  event: "Event",
  agent: "Agent",
  phone_inquiry: "Phone",
  email_inquiry: "Email",
  other: "Other",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    fetchData();
  }, [router, statusFilter, sourceFilter, priorityFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const [leadsRes, counselorsRes] = await Promise.all([
        getAllLeads({ 
          status: statusFilter, 
          source: sourceFilter,
          priority: priorityFilter,
          search: searchTerm 
        }),
        getUsersByRole("counselor"),
      ]);
      
      if (leadsRes.success && leadsRes.data) {
        setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.leads || []);
      }
      if (counselorsRes.success && counselorsRes.data) {
        setCounselors(counselorsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLead(data: any) {
    setActionLoading(true);
    try {
      const res = await createLead(data);
      if (res.success) {
        await fetchData();
        setShowCreateModal(false);
      } else {
        alert(res.message || "Failed to create lead");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateLead(data: any) {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const res = await updateLead(selectedLead.id, data);
      if (res.success) {
        await fetchData();
        setShowEditModal(false);
        setSelectedLead(null);
      } else {
        alert(res.message || "Failed to update lead");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteLead() {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const res = await deleteLead(selectedLead.id);
      if (res.success) {
        await fetchData();
        setShowDeleteModal(false);
        setSelectedLead(null);
      } else {
        alert(res.message || "Failed to delete lead");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  function handleSearch() {
    fetchData();
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesSource = !sourceFilter || lead.source === sourceFilter;
    const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    followUp: leads.filter((l) => l.status === "follow_up").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage your student inquiries</p>
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
              Add Lead
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-medium">Total Leads</p>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("new")}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            <p className="text-xs text-gray-500 font-medium">New Leads</p>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("follow_up")}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.followUp}</p>
            <p className="text-xs text-gray-500 font-medium">Follow Ups</p>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("qualified")}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
            <p className="text-xs text-gray-500 font-medium">Qualified</p>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("converted")}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
            <p className="text-xs text-gray-500 font-medium">Converted</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Sources</option>
              {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="">All Priority</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {(statusFilter || sourceFilter || priorityFilter || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setSourceFilter("");
                  setPriorityFilter("");
                  setSearchTerm("");
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

        {/* Leads Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || statusFilter || sourceFilter || priorityFilter
                  ? "Try adjusting your filters"
                  : "Get started by adding your first lead"}
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1e3a8a] hover:bg-[#1e40af]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => {
                    const StatusIcon = STATUS_CONFIG[lead.status]?.icon || AlertCircle;
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white font-semibold">
                              {lead.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{lead.fullName}</div>
                              {lead.preferredCountry && (
                                <div className="text-xs text-gray-500">{lead.preferredCountry}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {lead.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {lead.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className={STATUS_CONFIG[lead.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_CONFIG[lead.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className={PRIORITY_CONFIG[lead.priority]?.color}>
                            {PRIORITY_CONFIG[lead.priority]?.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {SOURCE_LABELS[lead.source]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.assignedCounselor ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-900">{lead.assignedCounselor.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/admin/leads/${lead.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modals */}
        {showCreateModal && (
          <LeadModal
            mode="create"
            counselors={counselors}
            onSave={handleCreateLead}
            onClose={() => setShowCreateModal(false)}
            loading={actionLoading}
          />
        )}

        {showEditModal && selectedLead && (
          <LeadModal
            mode="edit"
            lead={selectedLead}
            counselors={counselors}
            onSave={handleUpdateLead}
            onClose={() => {
              setShowEditModal(false);
              setSelectedLead(null);
            }}
            loading={actionLoading}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteModal && selectedLead && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Delete Lead</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{selectedLead.fullName}</strong>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDeleteLead}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? "Deleting..." : "Delete Lead"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLead(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
