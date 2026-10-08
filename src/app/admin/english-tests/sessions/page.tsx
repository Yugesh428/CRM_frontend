"use client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ClassSessionsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Sessions</h1>
        <p className="text-gray-500 mt-1">Schedule and manage classes</p>
      </div>
    </AdminLayout>
  );
}
