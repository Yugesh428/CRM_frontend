/* eslint-disable react/no-unescaped-entities */
import { Headphones, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsultationForm() {
  const intakes = ["Fall 2025", "Spring 2026", "Fall 2026"];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-lg sticky top-24">
      {/* Form Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-primary p-3 rounded-xl shrink-0">
          <Headphones className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-xl text-slate-900 leading-tight">
            Book Your FREE 1-on-1 Advisory Call
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Speak directly with a Licensed Education Counselor
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Student Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Aarav Sharma"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="name@domain.com"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone Number (WhatsApp preferred) *
          </label>
          <div className="flex gap-2">
            <select className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-primary">
              <option>NP +977</option>
              <option>US +1</option>
              <option>UK +44</option>
              <option>AU +61</option>
            </select>
            <input
              type="tel"
              placeholder="98XXXXXXXX"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Destination & Study Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Destination *
            </label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
              <option>USA</option>
              <option>UK</option>
              <option>Australia</option>
              <option>Canada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Study Level *
            </label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>PhD</option>
            </select>
          </div>
        </div>

        {/* Target Intake Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Target Intake Year *
          </label>
          <div className="flex gap-2">
            {intakes.map((intake, index) => (
              <button
                key={intake}
                className={`flex-1 text-xs font-semibold py-2.5 rounded-lg border transition-colors ${
                  index === 0
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary"
                }`}
              >
                {intake}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button className="w-full mt-8 bg-green-800 hover:bg-green-900 text-white font-semibold py-6 text-base rounded-lg shadow-md transition-all">
        Schedule My Free Consultation Now
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      {/* Footer Trust Text */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>100% Confidential. No hidden fees or binding contracts.</span>
      </div>
    </div>
  );
}
