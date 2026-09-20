/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoCardProps {
  thumbnailSrc: string;
  title: string;
  studentName: string;
  university: string;
  showZyloLogo?: boolean;
}

export default function VideoCard({
  thumbnailSrc,
  title,
  studentName,
  university,
  showZyloLogo = true,
}: VideoCardProps) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
      {/* Background Image */}
      <Image
        src={thumbnailSrc}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Top Logo (Optional based on reference) */}
      {showZyloLogo && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary flex items-center gap-1 z-10">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Zylo Consultancy
        </div>
      )}

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Bottom Text Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end">
        <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1">
          "{title}"
        </h3>
        <p className="text-slate-300 text-[11px] font-medium">
          {studentName} <span className="text-slate-500 mx-1">•</span>{" "}
          {university}
        </p>
      </div>
    </div>
  );
}
