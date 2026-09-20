import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DestinationCardProps {
  country: string;
  flagCode: string;
  image: string;
  overlayText: string;
  description: string;
  tuition: string;
  intakes: string;
  ctaText: string;
}

export default function DestinationCard({
  country,
  flagCode,
  image,
  overlayText,
  description,
  tuition,
  intakes,
  ctaText,
}: DestinationCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Image Container */}
      <div className="relative w-full h-44 overflow-hidden">
        <Image
          src={image}
          alt={country}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Left Badge (Flag + Country) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
          <img
            src={`https://flagcdn.com/w20/${flagCode}.png`}
            alt={country}
            className="w-3.5 h-3.5 object-contain"
          />
          {country}
        </div>

        {/* Bottom Right Overlay Tag */}
        <div className="absolute bottom-3 right-3 bg-green-700 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-md">
          {overlayText}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
          {country}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
          {description}
        </p>

        {/* Stats Grid */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mb-5 text-xs">
          <div className="flex flex-col gap-1 w-1/2 pr-2">
            <span className="text-slate-400 font-medium">Avg. Tuition:</span>
            <span className="text-slate-800 font-semibold">{tuition}</span>
          </div>
          <div className="flex flex-col gap-1 w-1/2 border-l border-slate-100 pl-3">
            <span className="text-slate-400 font-medium">Intakes:</span>
            <span className="text-slate-800 font-semibold">{intakes}</span>
          </div>
        </div>

        {/* CTA Link */}
        <Link
          href="#"
          className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:text-green-700 transition-colors mt-auto"
        >
          {ctaText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
