/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { Star, CheckCircle2 } from "lucide-react";

interface TestimonialCardProps {
  rating: number;
  badgeText: string;
  badgeType: "visa" | "scholarship";
  quote: string;
  name: string;
  degreeInfo: string;
  country: string;
  imageSrc: string;
}

export default function TestimonialCard({
  rating,
  badgeText,
  badgeType,
  quote,
  name,
  degreeInfo,
  country,
  imageSrc,
}: TestimonialCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Top Row: Stars and Badge */}
      <div className="flex items-start justify-between mb-4">
        {/* Star Rating */}
        <div className="flex gap-0.5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Dynamic Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${
            badgeType === "visa"
              ? "bg-green-50 text-green-700"
              : "bg-indigo-50 text-primary"
          }`}
        >
          {badgeType === "visa" && <CheckCircle2 className="w-3 h-3" />}
          {badgeText}
        </div>
      </div>

      {/* Quote */}
      <p className="text-slate-700 text-sm italic leading-relaxed flex-1 mb-8">
        "{quote}"
      </p>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-5 mt-auto">
        {/* Author Details */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
            <Image src={imageSrc} alt={name} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm">{name}</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {degreeInfo} <span className="text-slate-300">•</span> {country}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
