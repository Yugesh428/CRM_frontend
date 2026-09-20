import HeroSection from "@/components/Uicomponents/Home/HeroSection";
import StatsSection from "@/components/Uicomponents/stats/statsSection";
import ProcessSection from "@/components/Uicomponents/ProcessCard/ProcessSection";
import DestinationsSection from "@/components/Uicomponents/DestinationCard/DestinationsSection";
import TestimonialsSection from "@/components/Uicomponents/Testimonial/TestimonialSection";
import AccreditationSection from "@/components/Uicomponents/AccreditationSection/AccreditationSection";
import EventsSection from "@/components/Uicomponents/EventCard/EventSections";
import VideoChroniclesSection from "@/components/Uicomponents/Vedio/VedioChroniclesSection";
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroSection />
      <StatsSection />
      <ProcessSection />
      <DestinationsSection />
      <TestimonialsSection />
      <AccreditationSection />
      <EventsSection />
      <VideoChroniclesSection />
    </div>
  );
}
