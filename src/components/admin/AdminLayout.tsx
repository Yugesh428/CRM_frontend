"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building,
  School,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
  GraduationCap,
  Globe,
  Calendar,
  UserCheck,
  FileCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserPlus,
  FileSpreadsheet,
  DollarSign,
  Award,
  ClipboardList,
  Target,
  UserCog,
  Briefcase,
  Building2,
  MapPin,
  CalendarDays,
  ClipboardCheck,
  PieChart,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string | number;
  fullName: string;
  email: string;
  role: string;
}

interface NavItem {
  icon: any;
  label: string;
  href?: string;
  badge?: string;
  roles?: string[];
  children?: NavItem[];
}

// Hierarchical Menu Structure based on Permission Modules
const navItems: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/admin/dashboard", 
    roles: ["super_admin", "admin"] 
  },
  
  // ========================================
  // SUPER ADMIN ONLY - Platform Management
  // ========================================
  { 
    icon: Building, 
    label: "Organizations", 
    href: "/admin/organizations", 
    roles: ["super_admin"] 
  },
  { 
    icon: ShieldCheck, 
    label: "Platform Admins", 
    href: "/admin/users", 
    roles: ["super_admin"] 
  },
  
  // ========================================
  // ADMIN - People Management
  // ========================================
  {
    icon: Users,
    label: "People",
    roles: ["admin"],
    children: [
      { icon: UserPlus, label: "Leads", href: "/admin/leads" },
      { icon: GraduationCap, label: "Students", href: "/admin/students" },
      { icon: UserCog, label: "Staff", href: "/admin/staff" },
      { icon: UserCheck, label: "Counselors", href: "/admin/counselors" },
      { icon: Briefcase, label: "Departments", href: "/admin/departments" },
    ],
  },
  
  // ========================================
  // ADMIN - Academic Management
  // ========================================
  {
    icon: School,
    label: "Academic",
    roles: ["admin"],
    children: [
      { icon: Building2, label: "Universities", href: "/admin/universities" },
      { icon: MapPin, label: "Campuses", href: "/admin/campuses" },
      { icon: BookOpen, label: "Courses", href: "/admin/courses" },
      { icon: CalendarDays, label: "Intakes", href: "/admin/intakes" },
      { icon: ClipboardList, label: "Requirements", href: "/admin/requirements" },
      { icon: DollarSign, label: "Fees", href: "/admin/fees" },
      { icon: Award, label: "Scholarships", href: "/admin/scholarships" },
    ],
  },
  
  // ========================================
  // ADMIN - Application & Visa
  // ========================================
  {
    icon: FileCheck,
    label: "Applications",
    roles: ["admin"],
    children: [
      { icon: FileSpreadsheet, label: "All Applications", href: "/admin/applications" },
      { icon: FileText, label: "Documents", href: "/admin/documents" },
      { icon: Target, label: "Follow-ups", href: "/admin/followups" },
    ],
  },
  {
    icon: Globe,
    label: "Visa Management",
    roles: ["admin"],
    children: [
      { icon: FileCheck, label: "Visa Cases", href: "/admin/visa/cases" },
      { icon: ClipboardCheck, label: "Checklist", href: "/admin/visa/checklist" },
      { icon: Calendar, label: "Interviews", href: "/admin/visa/interviews" },
      { icon: DollarSign, label: "Financial Docs", href: "/admin/visa/financial" },
      { icon: ClipboardList, label: "Biometrics", href: "/admin/visa/biometrics" },
      { icon: FileText, label: "Decisions", href: "/admin/visa/decisions" },
    ],
  },
  
  // ========================================
  // ADMIN - English Tests
  // ========================================
  {
    icon: GraduationCap,
    label: "English Tests",
    roles: ["admin"],
    children: [
      { icon: Users, label: "Test Batches", href: "/admin/english-tests/batches" },
      { icon: Calendar, label: "Class Sessions", href: "/admin/english-tests/sessions" },
      { icon: ClipboardList, label: "Mock Tests", href: "/admin/english-tests/mock-tests" },
      { icon: FileText, label: "Study Materials", href: "/admin/english-tests/materials" },
      { icon: ClipboardCheck, label: "Test Results", href: "/admin/english-tests/results" },
      { icon: Calendar, label: "Attendance", href: "/admin/english-tests/attendance" },
    ],
  },
  
  // ========================================
  // ADMIN - Front Desk
  // ========================================
  {
    icon: ClipboardList,
    label: "Front Desk",
    roles: ["admin"],
    children: [
      { icon: Calendar, label: "Appointments", href: "/admin/appointments" },
      { icon: Users, label: "Visitors", href: "/admin/visitors" },
      { icon: Calendar, label: "Staff Attendance", href: "/admin/attendance" },
    ],
  },
  
  // ========================================
  // ADMIN - Reports & Analytics
  // ========================================
  {
    icon: PieChart,
    label: "Reports",
    roles: ["admin"],
    children: [
      { icon: PieChart, label: "Analytics", href: "/admin/reports/analytics" },
      { icon: FileSpreadsheet, label: "Lead Reports", href: "/admin/reports/leads" },
      { icon: FileText, label: "Application Reports", href: "/admin/reports/applications" },
      { icon: DollarSign, label: "Financial Reports", href: "/admin/reports/financial" },
      { icon: Users, label: "Staff Reports", href: "/admin/reports/staff" },
    ],
  },
  
  // ========================================
  // ADMIN - Communication
  // ========================================
  { 
    icon: MessageSquare, 
    label: "Messages", 
    href: "/admin/messages",
    badge: "New",
    roles: ["admin"] 
  },
  
  // ========================================
  // Settings (Both roles)
  // ========================================
  {
    icon: Settings,
    label: "Settings",
    roles: ["super_admin", "admin"],
    children: [
      { icon: UserCog, label: "Profile", href: "/admin/settings/profile" },
      { icon: ShieldCheck, label: "Permissions", href: "/admin/settings/permissions" },
      { icon: Webhook, label: "Integrations", href: "/admin/settings/integrations" },
      { icon: Settings, label: "General", href: "/admin/settings/general" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const stored = localStorage.getItem("admin_user");

    if (!token || !stored) {
      router.replace("/admin/login");
      return;
    }

    try {
      const parsed: AdminUser = JSON.parse(stored);
      if (parsed.role !== "admin" && parsed.role !== "super_admin") {
        router.replace("/admin/login");
        return;
      }
      setUser(parsed);
      
      // Auto-expand active menu on mount
      const activeMenu = navItems.find(item => 
        item.children?.some(child => pathname.startsWith(child.href || ""))
      );
      if (activeMenu && activeMenu.label) {
        setExpandedMenus([activeMenu.label]);
      }
    } catch {
      router.replace("/admin/login");
    }
  }, [router, pathname]);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.replace("/admin/login");
  }

  function toggleMenu(label: string) {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  function renderNavItem(item: NavItem, level: number = 0) {
    const isExpanded = expandedMenus.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? pathname === item.href : false;
    const hasActiveChild = hasChildren && item.children!.some(child => 
      pathname.startsWith(child.href || "")
    );

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              hasActiveChild
                ? "bg-[#1e3a8a]/10 text-[#1e3a8a]"
                : "text-gray-700 hover:bg-gray-100",
              collapsed && "justify-center"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", hasActiveChild && "text-[#1e3a8a]")} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </>
            )}
          </button>
          
          {!collapsed && isExpanded && (
            <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-[#1e3a8a] text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          collapsed && "justify-center",
          level > 0 && "text-sm"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-white")} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-4 border-b border-gray-200",
          collapsed && "justify-center px-2"
        )}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">Zylo CRM</h1>
              <p className="text-xs text-gray-500 truncate">
                {user.role === "super_admin" ? "Super Admin" : "Admin Panel"}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map(item => renderNavItem(item))}
        </nav>

        <Separator />

        {/* User Section */}
        <div className="p-3 border-t border-gray-200">
          <div className={cn(
            "flex items-center gap-3 mb-2",
            collapsed && "justify-center"
          )}>
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="bg-[#1e3a8a] text-white font-semibold text-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
          
          {collapsed && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 px-2"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        collapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex-1" />

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarFallback className="bg-[#1e3a8a] text-white text-xs font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
