import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatesTable from './StatesTable';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function StatesPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="States Management"
        description="Manage state names and translations across languages"
      />
      <Card padding="lg">
        <Suspense fallback={<div className="text-center py-8">Loading states...</div>}>
          <StatesTable />
        </Suspense>
      </Card>
    </DashboardLayout>
  );
}
