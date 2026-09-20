import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface EventCardProps {
  locationTag: string;
  subTag: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  theme: "blue" | "green" | "purple";
}

export default function EventCard({
  locationTag,
  subTag,
  title,
  description,
  date,
  time,
  venue,
  address,
  theme,
}: EventCardProps) {
  // Dynamic colors based on the theme prop
  const themeStyles = {
    blue: {
      tagBg: "bg-blue-50",
      tagText: "text-primary",
      buttonText: "text-primary",
      buttonBorder: "border-primary/30 hover:border-primary hover:bg-blue-50",
    },
    green: {
      tagBg: "bg-green-50",
      tagText: "text-green-700",
      buttonText: "text-green-700",
      buttonBorder:
        "border-green-700/30 hover:border-green-700 hover:bg-green-50",
    },
    purple: {
      tagBg: "bg-purple-50",
      tagText: "text-purple-700",
      buttonText: "text-purple-700",
      buttonBorder:
        "border-purple-700/30 hover:border-purple-700 hover:bg-purple-50",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      {/* Top Row: Tags */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${currentTheme.tagBg} ${currentTheme.tagText}`}
        >
          {locationTag}
        </div>
        <div className="text-[10px] font-semibold text-slate-500 text-right mt-1">
          {subTag}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-lg text-slate-900 leading-tight mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
        {description}
      </p>

      {/* Details (Date, Time, Venue) */}
      <div className="flex flex-col gap-2.5 mb-8">
        <div className="flex items-start gap-2 text-xs text-slate-700 font-medium">
          <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            {date} <span className="text-slate-400 mx-1">•</span> {time}
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-700 font-medium">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            {venue}, {address}
          </span>
        </div>
      </div>

      {/* Button */}
      <button
        className={`w-full py-2.5 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 mt-auto ${currentTheme.buttonBorder} ${currentTheme.buttonText}`}
      >
        Register Free Seat
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
