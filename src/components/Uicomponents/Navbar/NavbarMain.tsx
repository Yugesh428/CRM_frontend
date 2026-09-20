"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, MessageCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function NavbarMain() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Destinations", href: "#", active: true },
    { name: "Courses", href: "#" },
    { name: "Services", href: "#" },
    { name: "Scholarships", href: "#" },
    { name: "Events", href: "#" },
    { name: "Success Stories", href: "#" },
  ];

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl text-primary leading-tight">
              Zylo Consultancy
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold">
              Study Abroad & Global Admissions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links using Shadcn NavigationMenu */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.name}>
                <NavigationMenuLink
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    link.active
                      ? "text-primary border-b-2 border-primary rounded-none bg-transparent"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Action Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="https://wa.me/yournumber"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-primary rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            WhatsApp Us
          </Link>
          <Link href="#consultation">
            <Button className="bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium px-5 py-2 h-auto">
              Book Free Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle using Shadcn Sheet */}
        <div className="lg:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-slate-600" />
              }
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left font-heading font-bold text-xl text-primary mb-6">
                Zylo Consultancy
              </SheetTitle>

              <div className="flex flex-col space-y-4 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-medium ${
                      link.active ? "text-primary" : "text-slate-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-6 flex flex-col gap-3 border-t border-slate-100 mt-6">
                  <Link
                    href="https://wa.me/yournumber"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-primary rounded-lg text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />{" "}
                    WhatsApp Us
                  </Link>
                  <Link
                    href="#consultation"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2 bg-green-700 text-white text-center rounded-lg text-sm font-medium"
                  >
                    Book Free Consultation
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
