'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  pendingTranslations: number;
  completedDeals: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    pendingTranslations: 0,
    completedDeals: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch all stats in parallel
      const [usersResult, listingsResult, translationsResult, dealsResult] = await Promise.all([
        // Total users
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // Active listings
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        // Pending translations (commodity translations that need review)
        supabase
          .from('commodity_translations')
          .select('*', { count: 'exact', head: true })
          .eq('needs_review', true),
        // Completed deals
        supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('farmer_status', 'completed')
          .eq('buyer_status', 'completed'),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeListings: listingsResult.count || 0,
        pendingTranslations: translationsResult.count || 0,
        completedDeals: dealsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-gray-50 p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">Welcome to the AgriDeck Admin Dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-full">
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-full">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeListings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-full">
                <svg
                  className="w-7 h-7 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Translations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.pendingTranslations.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-full">
                <svg
                  className="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Deals</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.completedDeals.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 text-center py-8">
              Recent activity tracking coming soon...
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
