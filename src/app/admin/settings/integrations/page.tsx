"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Mail,
  MessageSquare,
  CreditCard,
  Globe,
  Database,
  Cloud,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Power,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  status: "active" | "inactive" | "error";
  isConfigured: boolean;
  lastSync?: string;
  config?: any;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: "smtp",
    name: "Email (SMTP)",
    category: "communication",
    description: "Send emails via SMTP server for notifications and communications",
    icon: Mail,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    category: "communication",
    description: "Send SMS notifications to students and staff via Twilio",
    icon: MessageSquare,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "stripe",
    name: "Stripe Payments",
    category: "payment",
    description: "Accept payments and process transactions via Stripe",
    icon: CreditCard,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "payment",
    description: "Process payments through PayPal gateway",
    icon: CreditCard,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    category: "productivity",
    description: "Sync appointments and events with Google Calendar",
    icon: Globe,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "aws_s3",
    name: "AWS S3",
    category: "storage",
    description: "Store documents and files in Amazon S3 cloud storage",
    icon: Cloud,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    category: "storage",
    description: "Manage and optimize images and media files",
    icon: Cloud,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "automation",
    description: "Automate workflows by connecting with 5000+ apps",
    icon: Zap,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "slack",
    name: "Slack",
    category: "communication",
    description: "Send notifications and updates to Slack channels",
    icon: MessageSquare,
    status: "inactive",
    isConfigured: false,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Sync leads and contacts with Salesforce CRM",
    icon: Database,
    status: "inactive",
    isConfigured: false,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  payment: "Payment Gateways",
  productivity: "Productivity",
  storage: "Cloud Storage",
  automation: "Automation",
  crm: "CRM",
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  productivity: "bg-purple-100 text-purple-700",
  storage: "bg-orange-100 text-orange-700",
  automation: "bg-pink-100 text-pink-700",
  crm: "bg-indigo-100 text-indigo-700",
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "admin" && parsed.role !== "super_admin") {
      router.replace("/admin/dashboard");
      return;
    }
  }, [router]);

  const categories = ["all", ...new Set(integrations.map((i) => i.category))];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: integrations.length,
    active: integrations.filter((i) => i.status === "active").length,
    configured: integrations.filter((i) => i.isConfigured).length,
    inactive: integrations.filter((i) => i.status === "inactive").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Connect external services to enhance your CRM capabilities
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-medium">Total Integrations</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-500 font-medium">Active</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.configured}</p>
            <p className="text-xs text-gray-500 font-medium">Configured</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            <p className="text-xs text-gray-500 font-medium">Inactive</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#1e3a8a] hover:bg-[#1e40af]" : ""}
                >
                  {category === "all" ? "All" : CATEGORY_LABELS[category]}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="p-5 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`mt-1 text-xs ${CATEGORY_COLORS[integration.category]}`}
                      >
                        {CATEGORY_LABELS[integration.category]}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                  {integration.status === "active" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-700 font-medium">Active</span>
                    </>
                  )}
                  {integration.status === "inactive" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <span className="text-xs text-gray-600 font-medium">Not Configured</span>
                    </>
                  )}
                  {integration.status === "error" && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-700 font-medium">Connection Error</span>
                    </>
                  )}
                </div>

                {/* Last Sync */}
                {integration.lastSync && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last synced: {integration.lastSync}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {integration.isConfigured ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={integration.status === "active" ? "text-red-600" : "text-green-600"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <Card className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No integrations found</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
