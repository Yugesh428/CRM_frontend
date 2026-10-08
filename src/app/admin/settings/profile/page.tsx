"use client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ProfileSettingsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account</p>
      </div>
    </AdminLayout>
  );
}
