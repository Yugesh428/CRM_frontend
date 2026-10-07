"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">
            Welcome to Zylo Admin Portal 👋
          </h1>
          <p className="text-blue-200 text-sm">
            Manage your consultancy operations from one powerful dashboard
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Total Users", 
              value: "—", 
              icon: Users,
              color: "bg-blue-500",
              change: "+12%"
            },
            { 
              label: "Applications", 
              value: "—", 
              icon: BookOpen,
              color: "bg-green-500",
              change: "+8%"
            },
            { 
              label: "Pending Review", 
              value: "—", 
              icon: Clock,
              color: "bg-yellow-500",
              change: "-5%"
            },
            { 
              label: "Success Rate", 
              value: "98%", 
              icon: TrendingUp,
              color: "bg-purple-500",
              change: "+2%"
            },
          ].map(({ label, value, icon: Icon, color, change }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { text: "New user registered", time: "2 min ago", type: "success" },
                { text: "Application submitted", time: "15 min ago", type: "info" },
                { text: "Visa approved", time: "1 hour ago", type: "success" },
                { text: "Document pending", time: "2 hours ago", type: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === "success" ? "bg-green-500" :
                    item.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <p className="text-sm text-gray-700 flex-1">{item.text}</p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              {[
                { label: "Active Applications", value: 42, total: 100, color: "bg-blue-500" },
                { label: "Pending Approvals", value: 15, total: 42, color: "bg-yellow-500" },
                { label: "Completed This Month", value: 28, total: 50, color: "bg-green-500" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700 font-medium">{stat.label}</span>
                    <span className="text-sm text-gray-900 font-bold">{stat.value}/{stat.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.color} rounded-full transition-all`}
                      style={{ width: `${(stat.value / stat.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
