import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Uicomponents/Navbar";
import Footer from "@/components/Uicomponents/Footer/Footer"; // Import Footer
import FloatingChat from "@/components/Uicomponents/FloatingChat/floatingChat"; // Import FloatingChat

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zylo Consultancy | Study Abroad Experts",
  description:
    "Get free honest guidance on tuition, living costs, loans, scholarships & visa approvals - matched to your profile, budget, grades and goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        poppins.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Navbar />

        {/* Main content area grows to push footer down */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer is now global */}
        <Footer />

        {/* Floating Chat Button is now global */}
        <FloatingChat />
      </body>
    </html>
  );
}
