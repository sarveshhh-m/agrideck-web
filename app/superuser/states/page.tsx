import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatesTable from './StatesTable';

export default function StatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">States Management</h1>
            <p className="text-gray-600 mt-2">
              Manage state names and translations across languages
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <Suspense fallback={<div>Loading states...</div>}>
              <StatesTable />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
