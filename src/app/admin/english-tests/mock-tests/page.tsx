"use client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function MockTestsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
        <p className="text-gray-500 mt-1">Manage practice tests</p>
      </div>
    </AdminLayout>
  );
}
