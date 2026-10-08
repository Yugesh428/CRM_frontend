"use client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function FinancialReportsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">Revenue and payment analytics</p>
      </div>
    </AdminLayout>
  );
}
