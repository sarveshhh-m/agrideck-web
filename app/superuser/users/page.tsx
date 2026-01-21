import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UsersTable from './UsersTable';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        description="Manage user accounts, roles, and status"
      />
      <Card padding="lg">
        <Suspense fallback={<div className="text-center py-8">Loading users...</div>}>
          <UsersTable />
        </Suspense>
      </Card>
    </DashboardLayout>
  );
}
