"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Globe,
  GraduationCap, Target, User, Edit, Trash2,
  MessageSquare, Clock, CheckCircle, AlertCircle,
  FileText, Send, Plus, UserCheck, BookOpen,
  Languages, TrendingUp, Flag, DollarSign,
  Activity, PhoneCall, Video, Building2, Smartphone,
  X, ChevronDown, ChevronUp, Star,
} from "lucide-react";
import {
  getLeadById, updateLead, deleteLead, getUsersByRole, assignLead,
  getFollowUpsByLead, createFollowUp, updateFollowUp, deleteFollowUp,
  type Lead, type FollowUp, type CreateFollowUpPayload,
} from "@/lib/api";
import LeadModal from "../components/LeadModal";

// ─── Config maps ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertCircle },
  follow_up: { label: "Follow Up", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  contacted: { label: "Contacted", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Phone },
  qualified: { label: "Qualified", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  counseling_scheduled: { label: "Counseling", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Calendar },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Target },
  lost: { label: "Lost", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const FOLLOWUP_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  phone_call: { label: "Phone Call", icon: PhoneCall, color: "bg-blue-100 text-blue-600" },
  whatsapp: { label: "WhatsApp", icon: Smartphone, color: "bg-green-100 text-green-600" },
  email: { label: "Email", icon: Mail, color: "bg-purple-100 text-purple-600" },
  office_visit: { label: "Office Visit", icon: Building2, color: "bg-orange-100 text-orange-600" },
  online_meeting: { label: "Online Meeting", icon: Video, color: "bg-indigo-100 text-indigo-600" },
  sms: { label: "SMS", icon: MessageSquare, color: "bg-gray-100 text-gray-600" },
};

const FOLLOWUP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-100 text-blue-700" },
  no_response: { label: "No Response", color: "bg-gray-100 text-gray-600" },
  not_interested: { label: "Not Interested", color: "bg-red-100 text-red-700" },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-700" },
};

const OUTCOME_LABELS: Record<string, string> = {
  interested: "Interested",
  needs_more_info: "Needs More Info",
  price_concern: "Price Concern",
  timing_issue: "Timing Issue",
  comparing_options: "Comparing Options",
  ready_to_proceed: "Ready to Proceed",
  not_interested: "Not Interested",
  no_response: "No Response",
  callback_requested: "Callback Requested",
  documentation_sent: "Documentation Sent",
  meeting_scheduled: "Meeting Scheduled",
};

function fmt(val: any) {
  if (val === null || val === undefined || val === "") return null;
  return val;
}

function fmtDate(val: string | Date | undefined | null) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fmtDateTime(val: string | Date | undefined | null) {
  if (!val) return "—";
  return new Date(val).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function capitalize(str: string) {
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: any }) {
  const display = fmt(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      {display !== null ? (
        <span className="text-sm text-gray-900">{display}</span>
      ) : (
        <span className="text-sm text-gray-300 italic">Not provided</span>
      )}
    </div>
  );
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────
function ScoreCard({ label, value, max }: { label: string; value: any; max?: number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
      <span className="text-lg font-bold text-[#1e3a8a]">{value}</span>
      {max && <span className="text-xs text-gray-400">/{max}</span>}
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

// ─── FollowUp Modal ───────────────────────────────────────────────────────────
function FollowUpModal({
  leadId, counselors, onSave, onClose, loading, existing,
}: {
  leadId: string;
  counselors: any[];
  onSave: (data: CreateFollowUpPayload) => void;
  onClose: () => void;
  loading: boolean;
  existing?: FollowUp | null;
}) {
  const [form, setForm] = useState({
    leadId,
    counselorId: existing?.counselorId || (counselors[0]?.id ?? ""),
    followUpDate: existing?.followUpDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    followUpTime: existing?.followUpTime || "",
    followUpType: existing?.followUpType || "phone_call",
    discussion: existing?.discussion || "",
    studentRequirement: existing?.studentRequirement || "",
    counselorNotes: existing?.counselorNotes || "",
    followUpOutcome: existing?.followUpOutcome || "",
    nextFollowUpDate: existing?.nextFollowUpDate?.split("T")[0] || "",
    nextFollowUpTime: existing?.nextFollowUpTime || "",
    status: existing?.status || "pending",
    durationMinutes: existing?.durationMinutes || "",
    isUrgent: existing?.isUrgent || false,
    reminderNote: existing?.reminderNote || "",
  });

  function set(field: string, val: any) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  function handleSubmit() {
    onSave({
      ...form,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
    } as any);
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{existing ? "Edit Follow-Up" : "Add Follow-Up"}</h3>
              <p className="text-xs text-blue-200">Log a follow-up interaction</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Counselor</label>
              <select value={form.counselorId} onChange={(e) => set("counselorId", e.target.value)} className={inputCls}>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Follow-Up Type</label>
              <select value={form.followUpType} onChange={(e) => set("followUpType", e.target.value)} className={inputCls}>
                {Object.entries(FOLLOWUP_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Follow-Up Date</label>
              <input type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Follow-Up Time</label>
              <input type="time" value={form.followUpTime} onChange={(e) => set("followUpTime", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {Object.entries(FOLLOWUP_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Outcome</label>
              <select value={form.followUpOutcome} onChange={(e) => set("followUpOutcome", e.target.value)} className={inputCls}>
                <option value="">Select Outcome</option>
                {Object.entries(OUTCOME_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Duration (minutes)</label>
              <input type="number" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} placeholder="e.g. 30" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Next Follow-Up Date</label>
              <input type="date" value={form.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Discussion Summary</label>
            <textarea value={form.discussion} onChange={(e) => set("discussion", e.target.value)} rows={3} placeholder="What was discussed..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Student Requirement</label>
            <textarea value={form.studentRequirement} onChange={(e) => set("studentRequirement", e.target.value)} rows={2} placeholder="What the student needs..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Counselor Notes</label>
            <textarea value={form.counselorNotes} onChange={(e) => set("counselorNotes", e.target.value)} rows={2} placeholder="Internal notes..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Reminder Note</label>
            <input type="text" value={form.reminderNote} onChange={(e) => set("reminderNote", e.target.value)} placeholder="Optional reminder..." className={inputCls} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isUrgent" checked={form.isUrgent} onChange={(e) => set("isUrgent", e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
            <label htmlFor="isUrgent" className="text-sm text-gray-700 font-medium">Mark as Urgent</label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {loading ? "Saving..." : existing ? "Update" : "Add Follow-Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    fetchAll();
  }, [leadId]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [leadRes, followUpsRes, counselorsRes] = await Promise.all([
        getLeadById(leadId),
        getFollowUpsByLead(leadId),
        getUsersByRole("counselor"),
      ]);
      if (leadRes.success && leadRes.data) setLead(leadRes.data);
      if (followUpsRes.success && followUpsRes.data) setFollowUps(Array.isArray(followUpsRes.data) ? followUpsRes.data : []);
      if (counselorsRes.success && counselorsRes.data) setCounselors(counselorsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!lead) return;
    try {
      const res = await updateLead(lead.id, { status: newStatus });
      if (res.success) setLead((p) => p ? { ...p, status: newStatus } : p);
    } catch {}
  }

  async function handleUpdateLead(data: any) {
    if (!lead) return;
    setActionLoading(true);
    try {
      const res = await updateLead(lead.id, data);
      if (res.success) { await fetchAll(); setShowEditModal(false); }
      else alert(res.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDeleteLead() {
    if (!lead) return;
    setActionLoading(true);
    try {
      const res = await deleteLead(lead.id);
      if (res.success) router.push("/admin/leads");
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleSaveFollowUp(data: CreateFollowUpPayload) {
    setActionLoading(true);
    try {
      const res = editingFollowUp
        ? await updateFollowUp(editingFollowUp.id, data)
        : await createFollowUp(data);
      if (res.success) {
        await fetchAll();
        setShowFollowUpModal(false);
        setEditingFollowUp(null);
      } else alert(res.message || "Failed to save follow-up");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  async function handleDeleteFollowUp(id: string) {
    setActionLoading(true);
    try {
      const res = await deleteFollowUp(id);
      if (res.success) { setFollowUps((p) => p.filter((f) => f.id !== id)); setDeletingFollowUpId(null); }
      else alert(res.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(false); }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading lead details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Not Found</h3>
            <Button onClick={() => router.push("/admin/leads")} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const StatusIcon = STATUS_CONFIG[lead.status]?.icon || AlertCircle;
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academic", label: "Academic & English", icon: GraduationCap },
    { id: "followups", label: `Follow-Ups (${followUps.length})`, icon: PhoneCall },
  ];

  // Derive first/last name from fullName if individual fields are empty
  const nameParts = lead.fullName?.trim().split(" ") ?? [];
  const derivedFirstName = lead.firstName || nameParts[0] || "";
  const derivedLastName = lead.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
  const derivedMiddleName = lead.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");

  // Count how many optional fields are filled
  const filledFields = [lead.dateOfBirth, lead.gender, lead.nationality, lead.address,
    lead.city, lead.country, lead.highestQualification, lead.preferredCountry].filter(Boolean).length;
  const profileComplete = filledFields >= 4;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/leads")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{lead.fullName}</h1>
              <p className="text-xs text-gray-500">Lead · Added {fmtDate(lead.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {lead.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{lead.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`${STATUS_CONFIG[lead.status]?.color} border text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {STATUS_CONFIG[lead.status]?.label}
                    </Badge>
                    {lead.priority && (
                      <Badge className={`${PRIORITY_CONFIG[lead.priority]?.color} text-xs`}>
                        {lead.priority === "urgent" && <Star className="w-3 h-3 mr-1" />}
                        {capitalize(lead.priority)} Priority
                      </Badge>
                    )}
                    {lead.source && (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        {capitalize(lead.source)}
                      </Badge>
                    )}
                    {lead.leadType && (
                      <Badge className="bg-blue-50 text-blue-600 text-xs">
                        {capitalize(lead.leadType)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick status change */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Change Status</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact row */}
            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Email</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{lead.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Phone</div>
                  <div className="text-sm font-medium text-gray-900">{lead.phone}</div>
                </div>
              </div>

              {lead.preferredCountry && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Destination</div>
                    <div className="text-sm font-medium text-gray-900">{lead.preferredCountry}</div>
                  </div>
                </div>
              )}

              {lead.assignedCounselor && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {lead.assignedCounselor.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Counselor</div>
                    <div className="text-sm font-medium text-gray-900">{lead.assignedCounselor.fullName}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up alert */}
            {lead.nextFollowUpDate && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800">
                  Next follow-up: <strong>{fmtDate(lead.nextFollowUpDate)}</strong>
                </span>
              </div>
            )}
          </div>
        </Card>
        {/* ── Incomplete profile banner ── */}
        {!profileComplete && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-blue-800">
              This lead profile is incomplete. Click <strong>Edit</strong> to fill in personal details, academic background and study preferences.
            </span>
            <Button size="sm" variant="outline" className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100" onClick={() => setShowEditModal(true)}>
              <Edit className="w-3 h-3 mr-1" /> Complete Profile
            </Button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200">          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[#1e3a8a] text-[#1e3a8a]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* TAB: OVERVIEW                                                       */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-5">
              {/* Personal Info */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1e3a8a]" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoRow label="First Name" value={derivedFirstName} />
                  <InfoRow label="Middle Name" value={derivedMiddleName} />
                  <InfoRow label="Last Name" value={derivedLastName} />
                  <InfoRow label="Date of Birth" value={lead.dateOfBirth ? fmtDate(lead.dateOfBirth) : null} />
                  <InfoRow label="Gender" value={lead.gender ? capitalize(lead.gender) : null} />
                  <InfoRow label="Nationality" value={lead.nationality} />
                  <InfoRow label="Phone" value={lead.phone} />
                  <InfoRow label="Alt. Phone" value={lead.alternativePhone} />
                  <InfoRow label="Email" value={lead.email} />
                  <InfoRow label="Preferred Contact" value={lead.preferredContactMethod ? capitalize(lead.preferredContactMethod) : null} />
                </div>
              </Card>

              {/* Address */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1e3a8a]" /> Address
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <InfoRow label="Street Address" value={lead.address} />
                  </div>
                  <InfoRow label="City" value={lead.city} />
                  <InfoRow label="Province / State" value={lead.province} />
                  <InfoRow label="Country" value={lead.country} />
                </div>
              </Card>

              {/* Study Preferences */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1e3a8a]" /> Study Preferences
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoRow label="Preferred Country" value={lead.preferredCountry} />
                  <InfoRow label="2nd Preferred Country" value={lead.secondPreferredCountry} />
                  <InfoRow label="Study Destination" value={lead.studyDestination} />
                  <InfoRow label="Preferred University" value={lead.preferredUniversityName} />
                  <div className="md:col-span-2">
                    <InfoRow label="Preferred Course" value={lead.preferredCourseName} />
                  </div>
                  <InfoRow label="Degree Level" value={lead.degreeLevel ? capitalize(lead.degreeLevel) : null} />
                  <InfoRow label="Preferred Intake" value={lead.preferredIntake} />
                  <InfoRow label="Estimated Budget" value={lead.estimatedBudget} />
                </div>
              </Card>

              {/* Remarks */}
              {lead.remarks && (
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1e3a8a]" /> Remarks
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{lead.remarks}</p>
                </Card>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-5">
              {/* Lead Meta */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1e3a8a]" /> Lead Details
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Status" value={STATUS_CONFIG[lead.status]?.label} />
                  <InfoRow label="Priority" value={lead.priority ? capitalize(lead.priority) : null} />
                  <InfoRow label="Source" value={lead.source ? capitalize(lead.source) : null} />
                  <InfoRow label="Lead Type" value={lead.leadType ? capitalize(lead.leadType) : null} />
                  <InfoRow label="Last Contacted" value={fmtDate(lead.lastContactedDate)} />
                  <InfoRow label="Next Follow-Up" value={fmtDate(lead.nextFollowUpDate)} />
                  <InfoRow label="Created" value={fmtDateTime(lead.createdAt)} />
                  <InfoRow label="Updated" value={fmtDateTime(lead.updatedAt)} />
                </div>
              </Card>

              {/* Assigned Counselor */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1e3a8a]" /> Assigned Counselor
                </h3>
                {lead.assignedCounselor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      {lead.assignedCounselor.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{lead.assignedCounselor.fullName}</div>
                      <div className="text-xs text-gray-500">{lead.assignedCounselor.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <UserCheck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No counselor assigned</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Assign
                    </Button>
                  </div>
                )}
              </Card>

              {/* Quick Stats */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1e3a8a]" /> Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl font-bold text-blue-700">{followUps.length}</span>
                    <span className="text-xs text-blue-500 mt-0.5">Follow-Ups</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl font-bold text-green-700">
                      {followUps.filter((f) => f.status === "completed").length}
                    </span>
                    <span className="text-xs text-green-500 mt-0.5">Completed</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl font-bold text-yellow-700">
                      {followUps.filter((f) => f.status === "pending").length}
                    </span>
                    <span className="text-xs text-yellow-500 mt-0.5">Pending</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl font-bold text-red-700">
                      {followUps.filter((f) => f.isUrgent).length}
                    </span>
                    <span className="text-xs text-red-500 mt-0.5">Urgent</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* TAB: ACADEMIC & ENGLISH                                             */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        {activeTab === "academic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Academic Background */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1e3a8a]" /> Academic Background
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InfoRow label="Highest Qualification" value={lead.highestQualification} />
                </div>
                <InfoRow label="Institution" value={lead.institution} />
                <InfoRow label="Graduation Year" value={lead.graduationYear} />
                <InfoRow label="GPA / Percentage" value={lead.gpaPercentage} />
                <InfoRow label="Education Status" value={lead.currentEducationStatus ? capitalize(lead.currentEducationStatus) : null} />
                {lead.academicBackground && (
                  <div className="col-span-2">
                    <InfoRow label="Academic Background" value={lead.academicBackground} />
                  </div>
                )}
              </div>
            </Card>

            {/* English Test Status */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#1e3a8a]" /> English Proficiency
              </h3>
              <InfoRow label="Test Status" value={lead.englishTestStatus ? capitalize(lead.englishTestStatus) : null} />

              {/* IELTS */}
              {(lead.ieltsOverall || lead.ieltsListening) && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">IELTS</p>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreCard label="Overall" value={lead.ieltsOverall} max={9} />
                    <ScoreCard label="Listening" value={lead.ieltsListening} max={9} />
                    <ScoreCard label="Reading" value={lead.ieltsReading} max={9} />
                    <ScoreCard label="Writing" value={lead.ieltsWriting} max={9} />
                    <ScoreCard label="Speaking" value={lead.ieltsSpeaking} max={9} />
                  </div>
                  {lead.ieltsExamDate && (
                    <p className="text-xs text-gray-500 mt-2">Exam date: {fmtDate(lead.ieltsExamDate)}</p>
                  )}
                </div>
              )}

              {/* PTE */}
              {(lead.pteOverall || lead.pteListening) && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">PTE</p>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreCard label="Overall" value={lead.pteOverall} max={90} />
                    <ScoreCard label="Listening" value={lead.pteListening} max={90} />
                    <ScoreCard label="Reading" value={lead.pteReading} max={90} />
                    <ScoreCard label="Writing" value={lead.pteWriting} max={90} />
                    <ScoreCard label="Speaking" value={lead.pteSpeaking} max={90} />
                  </div>
                  {lead.pteExamDate && (
                    <p className="text-xs text-gray-500 mt-2">Exam date: {fmtDate(lead.pteExamDate)}</p>
                  )}
                </div>
              )}

              {/* TOEFL */}
              {(lead.toeflTotal || lead.toeflListening) && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">TOEFL</p>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreCard label="Total" value={lead.toeflTotal} max={120} />
                    <ScoreCard label="Listening" value={lead.toeflListening} max={30} />
                    <ScoreCard label="Reading" value={lead.toeflReading} max={30} />
                    <ScoreCard label="Writing" value={lead.toeflWriting} max={30} />
                    <ScoreCard label="Speaking" value={lead.toeflSpeaking} max={30} />
                  </div>
                  {lead.toeflExamDate && (
                    <p className="text-xs text-gray-500 mt-2">Exam date: {fmtDate(lead.toeflExamDate)}</p>
                  )}
                </div>
              )}

              {/* Duolingo */}
              {lead.duolingoScore && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Duolingo</p>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreCard label="Score" value={lead.duolingoScore} max={160} />
                  </div>
                  {lead.duolingoExamDate && (
                    <p className="text-xs text-gray-500 mt-2">Exam date: {fmtDate(lead.duolingoExamDate)}</p>
                  )}
                </div>
              )}

              {/* GRE / GMAT */}
              {(lead.greScore || lead.gmatScore) && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Other Tests</p>
                  <div className="grid grid-cols-3 gap-2">
                    {lead.greScore && <ScoreCard label="GRE" value={lead.greScore} max={340} />}
                    {lead.gmatScore && <ScoreCard label="GMAT" value={lead.gmatScore} max={800} />}
                  </div>
                </div>
              )}

              {/* No scores */}
              {!lead.ieltsOverall && !lead.ieltsListening && !lead.pteOverall &&
               !lead.toeflTotal && !lead.duolingoScore && !lead.greScore && !lead.gmatScore && (
                <div className="mt-4 text-center py-4 text-sm text-gray-400">No test scores recorded</div>
              )}
            </Card>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* TAB: FOLLOW-UPS                                                     */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        {activeTab === "followups" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Follow-Up History</h3>
              <Button
                onClick={() => { setEditingFollowUp(null); setShowFollowUpModal(true); }}
                className="bg-[#1e3a8a] hover:bg-[#1e40af]"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Follow-Up
              </Button>
            </div>

            {followUps.length === 0 ? (
              <Card className="p-12 text-center">
                <PhoneCall className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">No Follow-Ups Yet</h4>
                <p className="text-sm text-gray-500 mb-4">Log the first interaction with this lead.</p>
                <Button
                  onClick={() => { setEditingFollowUp(null); setShowFollowUpModal(true); }}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af]"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Follow-Up
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {followUps.map((fu) => {
                  const typeConf = FOLLOWUP_TYPE_CONFIG[fu.followUpType] || { label: fu.followUpType, icon: MessageSquare, color: "bg-gray-100 text-gray-600" };
                  const TypeIcon = typeConf.icon;
                  const statusConf = FOLLOWUP_STATUS_CONFIG[fu.status] || { label: fu.status, color: "bg-gray-100 text-gray-600" };

                  return (
                    <Card key={fu.id} className={`p-4 ${fu.isUrgent ? "border-l-4 border-l-red-400" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConf.color}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{typeConf.label}</span>
                            <Badge className={`${statusConf.color} text-xs`}>{statusConf.label}</Badge>
                            {fu.isUrgent && <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>}
                            {fu.followUpOutcome && (
                              <Badge className="bg-blue-50 text-blue-600 text-xs">{OUTCOME_LABELS[fu.followUpOutcome] || fu.followUpOutcome}</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(fu.followUpDate)} {fu.followUpTime && `at ${fu.followUpTime}`}
                            </span>
                            {fu.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {fu.durationMinutes} min
                              </span>
                            )}
                            {fu.counselor && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {fu.counselor.fullName}
                              </span>
                            )}
                          </div>

                          {fu.discussion && (
                            <p className="text-sm text-gray-700 mb-1 line-clamp-2">{fu.discussion}</p>
                          )}

                          {fu.counselorNotes && (
                            <p className="text-xs text-gray-500 italic mb-1">Note: {fu.counselorNotes}</p>
                          )}

                          {fu.nextFollowUpDate && (
                            <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Next follow-up: {fmtDate(fu.nextFollowUpDate)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingFollowUp(fu); setShowFollowUpModal(true); }}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingFollowUpId(fu.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Lead Modal ── */}
      {showEditModal && lead && (
        <LeadModal
          mode="edit"
          lead={lead}
          counselors={counselors}
          onSave={handleUpdateLead}
          onClose={() => setShowEditModal(false)}
          loading={actionLoading}
        />
      )}

      {/* ── Delete Lead Modal ── */}
      {showDeleteModal && lead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Lead</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete <strong>{lead.fullName}</strong>? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDeleteLead} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700">
                {actionLoading ? "Deleting..." : "Delete Lead"}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Follow-Up Modal ── */}
      {showFollowUpModal && (
        <FollowUpModal
          leadId={leadId}
          counselors={counselors}
          onSave={handleSaveFollowUp}
          onClose={() => { setShowFollowUpModal(false); setEditingFollowUp(null); }}
          loading={actionLoading}
          existing={editingFollowUp}
        />
      )}

      {/* ── Delete Follow-Up Confirm ── */}
      {deletingFollowUpId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Follow-Up</h3>
            <p className="text-sm text-gray-500 mb-5">This follow-up record will be permanently deleted.</p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDeleteFollowUp(deletingFollowUpId)}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeletingFollowUpId(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
