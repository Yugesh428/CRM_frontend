"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, ChevronDown, Phone, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavbarTop() {
  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 text-slate-600 text-xs py-2 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Left: Accreditation */}
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-green-600" />
          <span>ICEF, AIRC & British Council Accredited Agency</span>
        </div>

        {/* Middle: Global Offices */}
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Global Offices: Kathmandu • Pokhara • Sydney • London</span>
        </div>

        {/* Right: Currency, Phone & Admin Login */}
        <div className="flex items-center gap-4">
          {/* Shadcn Dropdown for Currency */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 outline-none hover:text-primary transition-colors">
              <span>🇳🇵 Nepal (NPR)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem>🇳🇵 Nepal (NPR)</DropdownMenuItem>
              <DropdownMenuItem>🇺🇸 USA (USD)</DropdownMenuItem>
              <DropdownMenuItem>🇦🇺 Australia (AUD)</DropdownMenuItem>
              <DropdownMenuItem>🇬🇧 UK (GBP)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 font-medium text-primary">
            <Phone className="w-3.5 h-3.5" />
            <span>+1 (800) 995-ZYLO</span>
          </div>

          {/* Admin Login Link */}
          <Link
            href="/admin/login"
            className="flex items-center gap-1 text-slate-600 hover:text-[#1e3a8a] transition-colors font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
