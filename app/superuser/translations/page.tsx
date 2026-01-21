'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TranslationsOverview from './TranslationsOverview';
import CommoditiesTranslations from './CommoditiesTranslations';
import MandisTranslations from './MandisTranslations';
import StatesTranslations from './StatesTranslations';

type TabType = 'overview' | 'commodities' | 'mandis' | 'states';

export default function TranslationsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (tabParam && ['overview', 'commodities', 'mandis', 'states'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', component: TranslationsOverview },
    { id: 'commodities' as TabType, name: 'Commodities', component: CommoditiesTranslations },
    { id: 'mandis' as TabType, name: 'Mandis', component: MandisTranslations },
    { id: 'states' as TabType, name: 'States', component: StatesTranslations },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TranslationsOverview;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Translations Management</h1>
            <p className="text-gray-600 mt-2">
              Manage translations for commodities, markets, and states
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ActiveComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
