import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CommoditiesTable from './CommoditiesTable';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function CommoditiesPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Commodity Translations"
        description="Manage commodity names and translations across languages"
      />
      <Card padding="lg">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <CommoditiesTable />
        </Suspense>
      </Card>
    </DashboardLayout>
  );
}
