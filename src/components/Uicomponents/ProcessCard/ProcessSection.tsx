import {
  UserCheck,
  FileText,
  GraduationCap,
  Award,
  ShieldCheck,
  Plane,
} from "lucide-react";
import ProcessCard from "./processCard";
import ConsultationForm from "./ConsultationForm";

export default function ProcessSection() {
  const steps = [
    {
      number: 1,
      title: "Profile Evaluation & Matching",
      description:
        "In-depth analysis of your GPA, backlogs, finances, and long-term career aspirations to curate 6 best-fit universities.",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      number: 2,
      title: "Standardized Test Prep",
      description:
        "Certified master trainers for IELTS, TOEFL, PTE, GRE, and SAT with free mock exam portals and diagnostic drills.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      number: 3,
      title: "Admissions & SOP/LOR Polishing",
      description:
        "Dedicated native editorial desk reviewing personal statements and resumes to surpass admissions committee standards.",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      number: 4,
      title: "Scholarships & Education Loans",
      description:
        "Direct submission for merit, sports, and country bursaries plus hassle-free pre-approved collateral/non-collateral loan ties.",
      icon: <Award className="w-5 h-5" />,
    },
    {
      number: 5,
      title: "Visa Dossier & Mock Interviews",
      description:
        "Ex-embassy advisor consultation, bulletproof financial documentation, and real-time stress testing interview simulations.",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      number: 6,
      title: "Pre-Departure, Housing & Forex",
      description:
        "Airport pickup sync, verified student apartment bookings, overseas health cover (OSHC), and student bank accounts.",
      icon: <Plane className="w-5 h-5" />,
    },
  ];

  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
            End-to-End International Roadmaps
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 leading-tight mb-4">
            From Your First Question to Your Campus Arrival
          </h2>
          <p className="text-slate-600 text-lg">
            Step-by-step clarity engineered to eliminate bureaucratic anxiety,
            missed application deadlines, and visa confusion.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.7fr_1fr] gap-12 items-start">
          {/* Left Side: Process Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map((step) => (
              <ProcessCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </div>

          {/* Right Side: Consultation Form */}
          <div className="w-full">
            <ConsultationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
