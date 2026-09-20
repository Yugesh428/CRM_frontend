import EventCard from "./EventCard";

export default function EventsSection() {
  const events = [
    {
      locationTag: "Kathmandu Grand Fair",
      subTag: "100% Free Entry",
      title: "USA & UK Global Admissions Expo",
      description:
        "Meet official delegates from 35+ top universities. On-the-spot profile evaluations and $5,000 spot scholarships.",
      date: "Saturday, May 18, 2025",
      time: "10:00 AM - 4:00 PM",
      venue: "Hotel Yak & Yeti",
      address: "Durbar Marg, Kathmandu",
      theme: "blue" as const,
    },
    {
      locationTag: "Pokhara Expo",
      subTag: "Fast-Filling",
      title: "Australia & Canada Education Conclave",
      description:
        "Learn about latest post-study visa updates, regional PR concessions, and application fee waivers.",
      date: "Friday, May 24, 2025",
      time: "11:00 AM - 5:00 PM",
      venue: "Hotel Barahi",
      address: "Lakeside, Pokhara",
      theme: "green" as const,
    },
    {
      locationTag: "Chitwan Fair",
      subTag: "Free IELTS Mock",
      title: "Europe & Ireland STEM Admissions Day",
      description:
        "Focus on low-tuition degrees in Germany & Ireland tech programs. Free live English diagnostic tests on site.",
      date: "Sunday, June 2, 2025",
      time: "10:00 AM - 3:30 PM",
      venue: "Zylo Branch Hall",
      address: "Lions Chowk, Narayangarh",
      theme: "purple" as const,
    },
  ];

  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
            Meet University Admissions Officers
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 leading-tight mb-4">
            Find Free In-Person Study Abroad Fairs Near You
          </h2>
          <p className="text-slate-600 text-lg">
            Bring your academic transcripts for on-the-spot assessments,
            application fee waivers, and direct interviews.
          </p>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {events.map((event, index) => (
            <EventCard
              key={index}
              locationTag={event.locationTag}
              subTag={event.subTag}
              title={event.title}
              description={event.description}
              date={event.date}
              time={event.time}
              venue={event.venue}
              address={event.address}
              theme={event.theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
