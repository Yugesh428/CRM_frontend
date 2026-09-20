import {
  BadgeCheck,
  Globe,
  GraduationCap,
  BookOpen,
  FileText,
} from "lucide-react";

export default function AccreditationSection() {
  const accreditations = [
    {
      name: "British Council Certified",
      icon: <BadgeCheck className="w-5 h-5" />,
    },
    { name: "AIRC Accredited", icon: <Globe className="w-5 h-5" /> },
    {
      name: "ICEF Trained Agency",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    { name: "Pearson PTE Official", icon: <BookOpen className="w-5 h-5" /> },
    { name: "ETS TOEFL Alliance", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <section className="w-full bg-background py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* The Main Rounded Banner */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col items-center justify-center">
          {/* Section Title */}
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-center mb-8">
            Accredited by Leading International Education Authorities
          </p>

          {/* Badges Grid */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-6">
            {accreditations.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors cursor-default"
              >
                {/* Icon with subtle opacity matching the reference */}
                <div className="text-slate-500">{item.icon}</div>
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
