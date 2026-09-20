import { cn } from "@/lib/utils";

export default function StatsSection() {
  const stats = [
    {
      value: "1,100+",
      label: "Direct University Partners",
      color: "text-primary", // Hard Blue
    },
    {
      value: "1,000,000+",
      label: "Students Guided Globally",
      color: "text-slate-900", // Dark Slate
    },
    {
      value: "99.2%",
      label: "Student Visa Approval Rate",
      color: "text-green-600", // Mint Green
    },
    {
      value: "$45M+",
      label: "Scholarships Awarded",
      color: "text-primary", // Hard Blue
    },
  ];

  return (
    <section className="relative w-full bg-background py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* The Main Card */}
        <div className="w-full bg-gradient-to-r from-[#f0fdf4] via-white to-[#eff6ff] rounded-3xl border border-slate-100 shadow-sm p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center justify-center text-center px-4",
                // Add vertical dividers on desktop, but remove them on mobile
                index !== stats.length - 1 && "lg:border-r border-slate-200",
              )}
            >
              <span
                className={cn(
                  "font-heading font-extrabold text-4xl md:text-5xl mb-2 tracking-tight",
                  stat.color,
                )}
              >
                {stat.value}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
