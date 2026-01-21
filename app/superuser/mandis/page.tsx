import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MandisTable from './MandisTable';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function MandisPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Mandi Translations"
        description="Manage mandi (market) names and translations across languages"
      />
      <Card padding="lg">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <MandisTable />
        </Suspense>
      </Card>
    </DashboardLayout>
  );
}
