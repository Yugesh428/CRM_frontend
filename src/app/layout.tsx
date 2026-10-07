import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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

// Root layout — only sets up html/body/fonts.
// Navbar, Footer & FloatingChat live in (public)/layout.tsx
// so admin routes never inherit them.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </body>
    </html>
  );
}
