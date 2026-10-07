"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Building2, Globe, GraduationCap, Settings } from "lucide-react";
import type { University } from "@/lib/api";

interface UniversityModalProps {
  mode: "create" | "edit";
  university?: University;
  onSave: (data: Partial<University>) => void;
  onClose: () => void;
  loading?: boolean;
}

const INTAKES = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export default function UniversityModal({ mode, university, onSave, onClose, loading }: UniversityModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: university?.name || "",
    code: university?.code || "",
    country: university?.country || "",
    city: university?.city || "",
    description: university?.description || "",
    website: university?.website || "",
    ranking: university?.ranking || "",
    type: university?.type || "public",
    partnerStatus: university?.partnerStatus || "non_partner",
    isActive: university?.isActive !== undefined ? university.isActive : true,
    logoUrl: university?.logoUrl || "",
    coverImageUrl: university?.coverImageUrl || "",
    introVideoUrl: university?.introVideoUrl || "",
    brochureUrl: university?.brochureUrl || "",
    rating: university?.rating || "",
    establishedYear: university?.establishedYear || "",
    totalStudents: university?.totalStudents || "",
    accreditation: university?.accreditation || "",
    applicationFee: university?.applicationFee || "",
    admissionRequirements: university?.admissionRequirements || "",
    scholarshipsAvailable: university?.scholarshipsAvailable || "",
    intakes: university?.intakes || [] as string[],
    campusCount: university?.campusCount || 1,
    campusNames: university?.campusNames || [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "University name is required";
    if (!formData.code.trim()) e.code = "University code is required";
    if (!formData.country.trim()) e.country = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(field: string, value: any) {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function toggleIntake(intake: string) {
    setFormData((p) => ({
      ...p,
      intakes: p.intakes.includes(intake)
        ? p.intakes.filter((i) => i !== intake)
        : [...p.intakes, intake],
    }));
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(formData);
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "location", label: "Details", icon: Globe },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "settings", label: "Settings", icon: Settings },
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
                  {mode === "create" ? "Add University" : "Edit University"}
                </h2>
                <p className="text-sm text-blue-100">
                  {mode === "create" ? "Create a new university listing" : "Update university information"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">

            {/* Basic Info */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. University of Melbourne"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g. UNIMELB"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 ${errors.code ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="semi_government">Semi-Government</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="e.g. Australia"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 ${errors.country ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Melbourne"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Brief description of the university..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.university.edu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
                  <input
                    type="text"
                    value={formData.ranking}
                    onChange={(e) => handleChange("ranking", e.target.value)}
                    placeholder="e.g. QS #33"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>
              </div>
            )}

            {/* Details */}
            {activeTab === "location" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => handleChange("coverImageUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intro Video URL</label>
                  <input
                    type="url"
                    value={formData.introVideoUrl}
                    onChange={(e) => handleChange("introVideoUrl", e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brochure URL</label>
                  <input
                    type="url"
                    value={formData.brochureUrl}
                    onChange={(e) => handleChange("brochureUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0–5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleChange("rating", e.target.value)}
                    placeholder="e.g. 4.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => handleChange("establishedYear", e.target.value)}
                    placeholder="e.g. 1853"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
                  <input
                    type="text"
                    value={formData.totalStudents}
                    onChange={(e) => handleChange("totalStudents", e.target.value)}
                    placeholder="e.g. 50,000+"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
                  <input
                    type="text"
                    value={formData.accreditation}
                    onChange={(e) => handleChange("accreditation", e.target.value)}
                    placeholder="e.g. TEQSA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee</label>
                  <input
                    type="text"
                    value={formData.applicationFee}
                    onChange={(e) => handleChange("applicationFee", e.target.value)}
                    placeholder="e.g. $100 AUD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campus Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.campusCount}
                    onChange={(e) => handleChange("campusCount", parseInt(e.target.value) || 1)}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of campuses</p>
                </div>
              </div>
            )}

            {/* Academic */}
            {activeTab === "academic" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Requirements</label>
                  <textarea
                    value={formData.admissionRequirements}
                    onChange={(e) => handleChange("admissionRequirements", e.target.value)}
                    placeholder="Describe the general admission requirements..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scholarships Available</label>
                  <textarea
                    value={formData.scholarshipsAvailable}
                    onChange={(e) => handleChange("scholarshipsAvailable", e.target.value)}
                    placeholder="Describe available scholarships..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Intakes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {INTAKES.map((intake) => (
                      <label key={intake} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.intakes.includes(intake)}
                          onChange={() => toggleIntake(intake)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{intake}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Status</label>
                  <select
                    value={formData.partnerStatus}
                    onChange={(e) => handleChange("partnerStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  >
                    <option value="non_partner">Non-Partner</option>
                    <option value="partner">Partner</option>
                    <option value="preferred_partner">Preferred Partner</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a]"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    University is Active
                    <p className="text-xs text-gray-500 font-normal">Active universities are visible to students and staff</p>
                  </label>
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
                {loading ? "Saving..." : mode === "create" ? "Create University" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
