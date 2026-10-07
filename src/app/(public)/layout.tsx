import Navbar from "@/components/Uicomponents/Navbar";
import Footer from "@/components/Uicomponents/Footer/Footer";
import FloatingChat from "@/components/Uicomponents/FloatingChat/floatingChat";

// Public site layout — Navbar + Footer + FloatingChat.
// Only pages inside (public)/ inherit this.
// Admin routes at /admin/* are unaffected.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <FloatingChat />
    </>
  );
}
