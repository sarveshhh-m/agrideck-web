'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TranslationStats {
  total: number;
  needsReview: number;
  completed: number;
  languages: string[];
}

interface AllStats {
  commodities: TranslationStats;
  mandis: TranslationStats;
  states: TranslationStats;
}

export default function TranslationsOverview() {
  const [stats, setStats] = useState<AllStats>({
    commodities: { total: 0, needsReview: 0, completed: 0, languages: [] },
    mandis: { total: 0, needsReview: 0, completed: 0, languages: [] },
    states: { total: 0, needsReview: 0, completed: 0, languages: [] },
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      // Fetch stats for all translation types in parallel
      const [commoditiesStats, mandisStats, statesStats] = await Promise.all([
        fetchStats('commodities'),
        fetchStats('mandis'),
        fetchStats('states'),
      ]);

      setStats({
        commodities: commoditiesStats,
        mandis: mandisStats,
        states: statesStats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (
    type: 'commodities' | 'mandis' | 'states'
  ): Promise<TranslationStats> => {
    try {
      let table: string;
      let translationTable: string;

      if (type === 'commodities') {
        table = 'commodities';
        translationTable = 'commodity_translations';
      } else if (type === 'mandis') {
        table = 'mandis';
        translationTable = 'mandi_translations';
      } else {
        table = 'states';
        translationTable = 'state_translations';
      }

      // Get total count
      const { count: totalCount } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      // Get translations needing review
      const { count: reviewCount } = await supabase
        .from(translationTable)
        .select('*', { count: 'exact', head: true })
        .eq('needs_review', true);

      // Get unique languages
      const { data: translations } = await supabase.from(translationTable).select('language_code');

      const languages = Array.from(new Set(translations?.map(t => t.language_code) || [])).sort();

      return {
        total: totalCount || 0,
        needsReview: reviewCount || 0,
        completed: (totalCount || 0) - (reviewCount || 0),
        languages,
      };
    } catch (error) {
      console.error(`Error fetching ${type} stats:`, error);
      return { total: 0, needsReview: 0, completed: 0, languages: [] };
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Commodities Stats */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commodities</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-medium">{stats.commodities.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Needs Review:</span>
              <span className="text-sm font-medium text-yellow-600">
                {stats.commodities.needsReview}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="text-sm font-medium text-green-600">
                {stats.commodities.completed}
              </span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-gray-500">Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.commodities.languages.slice(0, 3).map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
                {stats.commodities.languages.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{stats.commodities.languages.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mandis Stats */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mandis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-medium">{stats.mandis.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Needs Review:</span>
              <span className="text-sm font-medium text-yellow-600">
                {stats.mandis.needsReview}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="text-sm font-medium text-green-600">{stats.mandis.completed}</span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-gray-500">Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.mandis.languages.slice(0, 3).map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
                {stats.mandis.languages.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{stats.mandis.languages.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* States Stats */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">States</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-medium">{stats.states.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Needs Review:</span>
              <span className="text-sm font-medium text-yellow-600">
                {stats.states.needsReview}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="text-sm font-medium text-green-600">{stats.states.completed}</span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-gray-500">Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.states.languages.slice(0, 3).map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
                {stats.states.languages.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{stats.states.languages.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = '/superuser/translations?tab=commodities')}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Manage Commodities
          </button>
          <button
            onClick={() => (window.location.href = '/superuser/translations?tab=mandis')}
            className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Manage Mandis
          </button>
          <button
            onClick={() => (window.location.href = '/superuser/translations?tab=states')}
            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
            Manage States
          </button>
        </div>
      </div>
    </div>
  );
}
