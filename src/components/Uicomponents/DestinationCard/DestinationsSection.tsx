import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DestinationCard from "./DestinationCard";

export default function DestinationsSection() {
  const destinations = [
    {
      country: "United States",
      flagCode: "us",
      image:
        "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop", // US Campus
      overlayText: "3-Year STEM OPT",
      description: "Ivy League, Tier-1 Public Unis & Silicon Valley careers.",
      tuition: "$22k - $55k/yr",
      intakes: "Fall (Aug) & Spring (Jan)",
      ctaText: "Explore 450+ US Unis",
    },
    {
      country: "United Kingdom",
      flagCode: "gb",
      image:
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=800&auto=format&fit=crop", // UK University
      overlayText: "1-Year Masters",
      description:
        "Russell Group excellence and 2-year Graduate Route work visa.",
      tuition: "£14k - £28k/yr",
      intakes: "Sept & Jan / Feb",
      ctaText: "Explore 160+ UK Unis",
    },
    {
      country: "Australia",
      flagCode: "au",
      image:
        "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=800&auto=format&fit=crop", // Sydney Uni
      overlayText: "High Min. Wage",
      description:
        "Group of Eight (Go8) research universities and clear PR pathways.",
      tuition: "AUD 28k - 45k/yr",
      intakes: "Feb & July / Nov",
      ctaText: "Explore 42+ Aus Unis",
    },
    {
      country: "Canada",
      flagCode: "ca",
      image:
        "https://images.unsplash.com/photo-1519832979-6fa011b87667?q=80&w=800&auto=format&fit=crop", // Canadian Campus
      overlayText: "Up to 3-Yr PGWP",
      description:
        "Co-op paid internships, welcoming immigration, and top quality of life.",
      tuition: "CAD 18k - 38k/yr",
      intakes: "Sept & Jan / May",
      ctaText: "Explore 95+ Canadian Unis",
    },
    {
      country: "Germany",
      flagCode: "de",
      image:
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop", // German University
      overlayText: "Zero Tuition Fee",
      description:
        "Tuition-free public universities, TUP network, and 18-month job search.",
      tuition: "€0 - €3k/yr (Public)",
      intakes: "Winter (Oct) & Summer",
      ctaText: "Explore 70+ German Unis",
    },
    {
      country: "Ireland",
      flagCode: "ie",
      image:
        "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=800&auto=format&fit=crop", // Irish Campus
      overlayText: "European Tech Hub",
      description:
        "HQ for Google, Meta, Pfizer with 2-year post-study work permit.",
      tuition: "€11k - €25k/yr",
      intakes: "September & January",
      ctaText: "Explore Irish Unis",
    },
    {
      country: "New Zealand",
      flagCode: "nz",
      image:
        "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=800&auto=format&fit=crop", // NZ University
      overlayText: "Safe & Welcoming",
      description:
        "All 8 universities ranked in top 3% worldwide with generous spouse work rights.",
      tuition: "NZD 24k - 38k/yr",
      intakes: "Feb & July",
      ctaText: "Explore 8 NZ Unis",
    },
    {
      country: "Dubai / UAE",
      flagCode: "ae",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800&auto=format&fit=crop", // Dubai Skyline
      overlayText: "Fast 2-Yr Visa",
      description:
        "Branch campuses of UK & Australian unis with tax-free career growth.",
      tuition: "AED 45k - 80k/yr",
      intakes: "Sept & Jan / May",
      ctaText: "Explore Dubai Campuses",
    },
  ];

  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
              Global Horizons
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 leading-tight mb-4">
              Your Perfect Study Destination is Just One Click Away
            </h2>
            <p className="text-slate-600 text-lg">
              Compare post-study work visas, tuition estimates, and university
              tiers across top host countries.
            </p>
          </div>

          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:text-green-700 transition-colors shrink-0 pb-1"
          >
            Compare All Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <DestinationCard
              key={index}
              country={dest.country}
              flagCode={dest.flagCode}
              image={dest.image}
              overlayText={dest.overlayText}
              description={dest.description}
              tuition={dest.tuition}
              intakes={dest.intakes}
              ctaText={dest.ctaText}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
