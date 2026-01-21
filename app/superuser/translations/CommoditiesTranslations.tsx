'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';

type Commodity = Tables<'commodities'> & {
  commodity_translations: Tables<'commodity_translations'>[];
};

type Language = {
  code: string;
  name: string;
};

export default function CommoditiesTranslations() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch commodities
      const { data: commoditiesData, error: commoditiesError } = await supabase
        .from('commodities')
        .select(
          `
          *,
          commodity_translations (*)
        `
        )
        .order('name');

      if (commoditiesError) throw commoditiesError;
      setCommodities(commoditiesData || []);

      // Fetch languages
      const { data: languagesData, error: languagesError } = await supabase
        .from('languages')
        .select('code, name')
        .order('code');

      if (languagesError) throw languagesError;
      setLanguages(languagesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTranslation = async (commodityId: number, field: 'name' | 'unit', value: string) => {
    try {
      const { error } = await supabase.from('commodity_translations').upsert(
        {
          commodity_id: commodityId,
          language_code: selectedLanguage,
          [field]: value,
        },
        {
          onConflict: 'commodity_id,language_code',
          ignoreDuplicates: false,
        }
      );

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  const toggleNeedsReview = async (commodityId: number, needsReview: boolean) => {
    try {
      const { error } = await supabase
        .from('commodity_translations')
        .update({ needs_review: needsReview })
        .eq('commodity_id', commodityId)
        .eq('language_code', selectedLanguage);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating needs_review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading commodities...</span>
      </div>
    );
  }

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
            Select Language to Edit:
          </label>
        </div>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Stats Badge */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
          {commodities.length} Commodities
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
          Editing: {selectedLang?.name || selectedLanguage.toUpperCase()}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Commodity (English)
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {selectedLang?.name || selectedLanguage.toUpperCase()} Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {selectedLang?.name || selectedLanguage.toUpperCase()} Unit
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Needs Review
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {commodities.map((commodity, index) => {
              const translation = commodity.commodity_translations.find(
                t => t.language_code === selectedLanguage
              );

              return (
                <tr
                  key={commodity.id}
                  className={`hover:bg-blue-50 transition-colors ${
                    translation?.needs_review ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400">
                        {index + 1}
                      </span>
                      <div className="text-sm font-semibold text-gray-900">
                        {commodity.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.name || ''}
                      onChange={e => updateTranslation(commodity.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} name`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.unit || ''}
                      onChange={e => updateTranslation(commodity.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} unit`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={translation?.needs_review || false}
                          onChange={e => toggleNeedsReview(commodity.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {commodities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No commodities found</p>
        </div>
      )}
    </div>
  );
}
