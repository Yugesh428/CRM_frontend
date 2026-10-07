"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Building2, MapPin, Phone, Settings } from "lucide-react";
import type { Campus, University } from "@/lib/api";

interface CampusModalProps {
  mode: "create" | "edit";
  campus?: Campus;
  universities: University[];
  onSave: (data: Partial<Campus>) => void;
  onClose: () => void;
  loading?: boolean;
}

const INTAKES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20";
const lbl = "block text-sm font-medium text-gray-700 mb-1";

export default function CampusModal({ mode, campus, universities, onSave, onClose, loading }: CampusModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: campus?.name || "",
    universityId: campus?.universityId || "",
    campusType: campus?.campusType || "main",
    status: campus?.status || "active",
    address: campus?.address || "",
    city: campus?.city || "",
    state: campus?.state || "",
    country: campus?.country || "",
    postalCode: campus?.postalCode || "",
    latitude: campus?.latitude ?? "",
    longitude: campus?.longitude ?? "",
    phone: campus?.phone || "",
    fax: campus?.fax || "",
    email: campus?.email || "",
    website: campus?.website || "",
    description: campus?.description || "",
    establishedYear: campus?.establishedYear ?? "",
    totalArea: campus?.totalArea || "",
    totalStudents: campus?.totalStudents ?? "",
    totalFaculty: campus?.totalFaculty ?? "",
    imageUrl: campus?.imageUrl || "",
    mapUrl: campus?.mapUrl || "",
    facilities: campus?.facilities || ([] as string[]),
    intakes: campus?.intakes || ([] as string[]),
    availableDepartments: campus?.availableDepartments || ([] as string[]),
  });
  const [facilityInput, setFacilityInput] = useState("");
  const [deptInput, setDeptInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(field: string, value: any) {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function toggleIntake(intake: string) {
    setFormData((p) => ({
      ...p,
      intakes: p.intakes.includes(intake) ? p.intakes.filter((i) => i !== intake) : [...p.intakes, intake],
    }));
  }

  function addFacility() {
    const v = facilityInput.trim();
    if (v && !formData.facilities.includes(v)) {
      setFormData((p) => ({ ...p, facilities: [...p.facilities, v] }));
    }
    setFacilityInput("");
  }

  function removeFacility(f: string) {
    setFormData((p) => ({ ...p, facilities: p.facilities.filter((x) => x !== f) }));
  }

  function addDept() {
    const v = deptInput.trim();
    if (v && !formData.availableDepartments.includes(v)) {
      setFormData((p) => ({ ...p, availableDepartments: [...p.availableDepartments, v] }));
    }
    setDeptInput("");
  }

  function removeDept(d: string) {
    setFormData((p) => ({ ...p, availableDepartments: p.availableDepartments.filter((x) => x !== d) }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Campus name is required";
    if (!formData.universityId) e.universityId = "University is required";
    if (!formData.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Record<string, any> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        payload[k] = v;
      } else if (v !== "") {
        payload[k] = v;
      }
    });
    onSave(payload);
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "location", label: "Location", icon: MapPin },
    { id: "contact", label: "Contact & Details", icon: Phone },
    { id: "settings", label: "Facilities", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="max-w-3xl w-full my-8 flex flex-col max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200">

          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === "create" ? "Add Campus" : "Edit Campus"}
                </h2>
                <p className="text-sm text-blue-100">
                  {mode === "create" ? "Create a new campus listing" : "Update campus information"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b bg-gray-50 px-6 flex-shrink-0">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">

            {/* Basic Info */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={lbl}>Campus Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Main Campus"
                    className={`${inp} ${errors.name ? "border-red-500" : ""}`} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={lbl}>University <span className="text-red-500">*</span></label>
                  <select value={formData.universityId} onChange={(e) => handleChange("universityId", e.target.value)}
                    className={`${inp} ${errors.universityId ? "border-red-500" : ""}`}>
                    <option value="">Select a university</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
                </div>

                <div>
                  <label className={lbl}>Campus Type</label>
                  <select value={formData.campusType} onChange={(e) => handleChange("campusType", e.target.value)} className={inp}>
                    <option value="main">Main</option>
                    <option value="branch">Branch</option>
                    <option value="satellite">Satellite</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className={lbl}>Status</label>
                  <select value={formData.status} onChange={(e) => handleChange("status", e.target.value)} className={inp}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under_construction">Under Construction</option>
                    <option value="temporarily_closed">Temporarily Closed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={lbl}>Description</label>
                  <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Brief description of the campus..." rows={3} className={inp} />
                </div>

                <div>
                  <label className={lbl}>Established Year</label>
                  <input type="number" value={formData.establishedYear} onChange={(e) => handleChange("establishedYear", e.target.value)}
                    placeholder="e.g. 1995" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Total Area</label>
                  <input type="text" value={formData.totalArea} onChange={(e) => handleChange("totalArea", e.target.value)}
                    placeholder="e.g. 50 acres" className={inp} />
                </div>
              </div>
            )}

            {/* Location */}
            {activeTab === "location" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={lbl}>Address <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.address} onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Street address"
                    className={`${inp} ${errors.address ? "border-red-500" : ""}`} />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className={lbl}>City</label>
                  <input type="text" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="City" className={inp} />
                </div>

                <div>
                  <label className={lbl}>State / Province</label>
                  <input type="text" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} placeholder="State" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Country</label>
                  <input type="text" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} placeholder="Country" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Postal Code</label>
                  <input type="text" value={formData.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} placeholder="Postal code" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Latitude</label>
                  <input type="number" step="0.0000001" value={formData.latitude} onChange={(e) => handleChange("latitude", e.target.value)} placeholder="e.g. -37.8136" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Longitude</label>
                  <input type="number" step="0.0000001" value={formData.longitude} onChange={(e) => handleChange("longitude", e.target.value)} placeholder="e.g. 144.9631" className={inp} />
                </div>

                <div className="md:col-span-2">
                  <label className={lbl}>Map URL (Google Maps embed)</label>
                  <input type="url" value={formData.mapUrl} onChange={(e) => handleChange("mapUrl", e.target.value)} placeholder="https://maps.google.com/..." className={inp} />
                </div>
              </div>
            )}

            {/* Contact & Details */}
            {activeTab === "contact" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1234567890" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Fax</label>
                  <input type="text" value={formData.fax} onChange={(e) => handleChange("fax", e.target.value)} placeholder="Fax number" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="campus@university.edu" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Website</label>
                  <input type="url" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://..." className={inp} />
                </div>

                <div>
                  <label className={lbl}>Total Students</label>
                  <input type="number" value={formData.totalStudents} onChange={(e) => handleChange("totalStudents", e.target.value)} placeholder="e.g. 5000" className={inp} />
                </div>

                <div>
                  <label className={lbl}>Total Faculty</label>
                  <input type="number" value={formData.totalFaculty} onChange={(e) => handleChange("totalFaculty", e.target.value)} placeholder="e.g. 250" className={inp} />
                </div>

                <div className="md:col-span-2">
                  <label className={lbl}>Image URL</label>
                  <input type="url" value={formData.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} placeholder="https://..." className={inp} />
                </div>
              </div>
            )}

            {/* Facilities / Intakes / Departments */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Facilities</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={facilityInput} onChange={(e) => setFacilityInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                      placeholder="e.g. Library (press Enter)" className={`${inp} flex-1`} />
                    <Button variant="outline" size="sm" type="button" onClick={addFacility}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.facilities.map((f) => (
                      <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {f}
                        <button onClick={() => removeFacility(f)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={lbl}>Available Departments</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={deptInput} onChange={(e) => setDeptInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDept())}
                      placeholder="e.g. Engineering (press Enter)" className={`${inp} flex-1`} />
                    <Button variant="outline" size="sm" type="button" onClick={addDept}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.availableDepartments.map((d) => (
                      <span key={d} className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                        {d}
                        <button onClick={() => removeDept(d)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Intakes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {INTAKES.map((intake) => (
                      <label key={intake} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.intakes.includes(intake)} onChange={() => toggleIntake(intake)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a]" />
                        <span className="text-sm text-gray-700 capitalize">{intake}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between flex-shrink-0 rounded-b-xl">
            <p className="text-xs text-gray-500"><span className="text-red-500">*</span> Required fields</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                {loading ? "Saving..." : mode === "create" ? "Create Campus" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
