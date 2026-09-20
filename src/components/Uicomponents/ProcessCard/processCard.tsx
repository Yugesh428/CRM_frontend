import { ReactNode } from "react";

interface ProcessCardProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
}

export default function ProcessCard({
  number,
  title,
  description,
  icon,
}: ProcessCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Top Row: Number and Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">
          {number}
        </div>
        <div className="text-primary">{icon}</div>
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-lg text-slate-900 mb-2 leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
