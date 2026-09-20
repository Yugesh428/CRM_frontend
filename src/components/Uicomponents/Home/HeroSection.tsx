import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  Lock,
  CheckCircle2,
  Star,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const destinations = [
    { code: "us", label: "United States" },
    { code: "gb", label: "United Kingdom" },
    { code: "au", label: "Australia" },
    { code: "ca", label: "Canada" },
    { code: "de", label: "Germany" },
    { code: "ie", label: "Ireland" },
  ];

  return (
    <section className="relative w-full bg-background text-slate-900 py-8 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col z-10">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-semibold w-fit mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Certified by British Council, ICEF & AIRC</span>
            <span className="text-slate-400">•</span>
            <span>100% Free Advisory</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 leading-[1.1] mb-6">
            Not sure which{" "}
            <span className="text-primary underline decoration-primary/30 underline-offset-8 decoration-4">
              course
            </span>
            ,{" "}
            <span className="text-primary underline decoration-primary/30 underline-offset-8 decoration-4">
              university
            </span>
            , or country fits your future?
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-600 mb-8 max-w-xl">
            Get honest, 1-on-1 guidance customized to your budget, GPA, and
            career dreams. Free admissions matching, 99.2% visa success rate,
            and end-to-end guidance from licensed global counselors.
          </p>

          {/* Destination Pills */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Popular Study Destinations Today:
            </p>
            <div className="flex flex-wrap gap-2">
              {destinations.map((dest) => (
                <button
                  key={dest.code}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  <img
                    src={`https://flagcdn.com/w20/${dest.code}.png`}
                    alt={dest.label}
                    className="w-4 h-4 object-contain"
                  />
                  {dest.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link href="#consultation">
              <Button className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-md transition-all hover:shadow-lg">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#scholarship">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-primary border-primary/20 bg-white hover:bg-blue-50 font-semibold px-8 py-6 text-base rounded-xl shadow-sm"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Scholarship Eligibility
              </Button>
            </Link>
          </div>

          {/* Bottom Trust Text */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>No agency fees</span>
            <span className="text-slate-300">•</span>
            <span>100% Transparent university shortlisting</span>
            <span className="text-slate-300">•</span>
            <span>Direct partner tie-ups</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:ml-auto mt-12 lg:mt-0">
          {/* Main Image Container */}
          <div className="relative rounded-4xl overflow-hidden shadow-2xl border-4 border-white z-10 aspect-4/5 lg:aspect-auto lg:h-150 w-full">
            <Image
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"
              alt="Happy student studying abroad"
              fill
              unoptimized
              className="object-cover"
              priority
            />
            {/* Subtle overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/20 to-transparent" />
          </div>

          {/* Floating Card 1: Visa Approved (Top Right) */}
          <div className="absolute -top-6 -right-4 lg:-right-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Visa Approved
              </p>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                Univ. of Melbourne (Australia)
              </p>
            </div>
          </div>

          {/* Floating Card 2: Reviews (Middle Right) */}
          <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center z-20 w-32 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xl font-bold text-slate-800">4.9</span>
              <span className="text-xs text-slate-400 font-medium">/5.0</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium text-center leading-tight">
              12,400+ Verified Reviews
            </p>
          </div>

          {/* Floating Card 3: Grants (Bottom Left) */}
          <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary">$45M+ Secured</p>
              <p className="text-[11px] font-medium text-slate-500">
                Institutional Student Grants
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
