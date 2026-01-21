import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UsersTable from './UsersTable';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts, roles, and status</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          </div>
          <div className="p-6">
            <Suspense fallback={<div>Loading users...</div>}>
              <UsersTable />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
