import TestimonialCard from "./TestimonialCard";

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      badgeText: "Visa Granted",
      badgeType: "visa" as const,
      quote:
        "I had a 2-year study gap after my Bachelor's and was terrified my visa would get rejected. The team at Zylo restructured my SOP to clearly explain my work tenure, prepped me through 4 tough mock interviews, and secured my UK visa in 11 days!",
      name: "Pooja Thapa",
      degreeInfo: "MSc Data Science • Univ. of Leeds",
      country: "(UK)",
      imageSrc:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", // Placeholder female student
    },
    {
      rating: 5,
      badgeText: "$18,000 Scholarship",
      badgeType: "scholarship" as const,
      quote:
        "Other agencies charged upfront consultation fees and only recommended private colleges. Zylo was 100% free, matched me directly to Arizona State University, and found an automatic merit scholarship that shaved $18,000 off my tuition.",
      name: "Rohan Adhikari",
      degreeInfo: "BS Software Eng • Arizona State Univ",
      country: "(USA)",
      imageSrc:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop", // Placeholder male student
    },
    {
      rating: 5,
      badgeText: "Visa Granted",
      badgeType: "visa" as const,
      quote:
        "Applying to Australia in 2024 felt daunting because of high financial scrutiny. Zylo's financial documentation specialists guided my parents seamlessly. My Genuine Student (GS) assessment was cleared on first submission.",
      name: "Ananya Shrestha",
      degreeInfo: "Master of Public Health • Monash Univ",
      country: "(Aus)",
      imageSrc:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop", // Placeholder female student
    },
  ];

  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <p className="text-green-600 font-bold text-xs uppercase tracking-widest mb-3">
            Proven Outcomes
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 leading-tight mb-4">
            Real Students. Real Visas. Zero Consultation Fees.
          </h2>
          <p className="text-slate-600 text-lg">
            Read unfiltered stories from students who turned their study abroad
            dream into reality with Zylo.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              rating={testimonial.rating}
              badgeText={testimonial.badgeText}
              badgeType={testimonial.badgeType}
              quote={testimonial.quote}
              name={testimonial.name}
              degreeInfo={testimonial.degreeInfo}
              country={testimonial.country}
              imageSrc={testimonial.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
