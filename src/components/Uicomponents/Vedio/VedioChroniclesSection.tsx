import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoCard from "./VedioCard";

export default function VideoChroniclesSection() {
  const videos = [
    {
      thumbnailSrc:
        "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=800&auto=format&fit=crop", // Sydney
      title: "How I got my Australian Subclass 500 Visa in 14 days",
      studentName: "Suman B.",
      university: "University of Sydney",
      showZyloLogo: true,
    },
    {
      thumbnailSrc:
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=800&auto=format&fit=crop", // London
      title: "Overcoming a Low IELTS Band to Secure a UK Offer",
      studentName: "Bibek & Sneha",
      university: "London South Bank",
      showZyloLogo: false, // Example of hiding the logo on some cards
    },
    {
      thumbnailSrc:
        "https://images.unsplash.com/photo-1519832979-6fa011b87667?q=80&w=800&auto=format&fit=crop", // US Campus
      title: "F-1 Visa Interview Questions: Exactly What the Consular Asked",
      studentName: "Kiran K.",
      university: "UT Arlington (USA)",
      showZyloLogo: false,
    },
  ];

  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">
            Student Video Chronicles
          </h2>

          {/* Navigation Arrows (Placeholder for Carousel functionality) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full border-slate-200 text-slate-500 hover:text-primary hover:border-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full border-slate-200 text-slate-500 hover:text-primary hover:border-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video Cards Grid / Scroll Container */}
        {/* We use flex and overflow-x-auto to make it horizontally scrollable like a carousel */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {videos.map((video, index) => (
            <div
              key={index}
              className="min-w-[300px] md:min-w-[400px] lg:min-w-0 lg:flex-1 snap-start"
            >
              <VideoCard
                thumbnailSrc={video.thumbnailSrc}
                title={video.title}
                studentName={video.studentName}
                university={video.university}
                showZyloLogo={video.showZyloLogo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
