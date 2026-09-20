import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  const destinations = [
    "Study in USA",
    "Study in United Kingdom",
    "Study in Australia",
    "Study in Canada",
    "Study in Germany",
    "Study in Ireland",
  ];

  const services = [
    "Undergraduate Programs",
    "Postgraduate Programs",
    "Visa Assistance",
    "Scholarship Finder",
    "Free Eligibility Assessment",
    "Accreditations & Partners",
  ];

  const offices = [
    {
      city: "Kathmandu (HQ)",
      address: "Putalisadak Plaza, Level 4, Kathmandu",
      phone: "+977 (1) 424-9988",
    },
    {
      city: "Pokhara Hub",
      address: "Lakeside Marg, Center Point, Pokhara",
    },
    {
      city: "Sydney Office",
      address: "Castlereagh St, Sydney NS 2000",
    },
  ];

  return (
    <footer className="w-full bg-[#0b1120] text-slate-300 pt-16 md:pt-24 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Column 1: Logo & Description */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-white leading-tight">
                  Zylo Consultancy
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Empowering students across Asia with honest, transparent, and
              certified global educational counseling. Partnered with 1,100+
              accredited colleges and universities globally.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <Link
                href="#"
                aria-label="Facebook"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors text-white"
              >
                <span aria-hidden="true" className="block w-4 text-center text-xs font-bold leading-4">
                  f
                </span>
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors text-white"
              >
                <span aria-hidden="true" className="block w-4 text-center text-sm leading-4">
                  ◎
                </span>
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors text-white"
              >
                <span aria-hidden="true" className="block w-4 text-center text-[10px] font-bold leading-4">
                  in
                </span>
              </Link>
              <Link
                href="#"
                aria-label="X (formerly Twitter)"
                className="p-2 bg-slate-800 rounded-full hover:bg-primary transition-colors text-white"
              >
                <span aria-hidden="true" className="block w-4 text-center text-xs font-bold leading-4">
                  𝕏
                </span>
              </Link>
            </div>
          </div>

          {/* Column 2: Destinations */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Destinations
            </h4>
            <ul className="flex flex-col gap-3">
              {destinations.map((item, index) => (
                <li key={index}>
                  <Link
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Advisory Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Advisory Services
            </h4>
            <ul className="flex flex-col gap-3">
              {services.map((item, index) => (
                <li key={index}>
                  <Link
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Global Offices */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Global Offices
            </h4>
            <div className="flex flex-col gap-6">
              {offices.map((office, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="font-semibold text-white text-sm">
                    {office.city}
                  </span>
                  <span className="text-xs text-slate-400 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
                    {office.address}
                  </span>
                  {office.phone && (
                    <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {office.phone}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © 2025 Zylo Consultancy Inc. Certified by ICEF, AIRC, and British
            Council. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="#"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-700 hidden md:block">•</span>
            <Link
              href="#"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-slate-700 hidden md:block">•</span>
            <Link
              href="#"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Security & Ethical Compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
