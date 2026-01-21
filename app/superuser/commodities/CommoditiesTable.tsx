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

type PendingChange = {
  commodityId: number;
  commodityName: string;
  field: 'name' | 'unit' | 'needs_review' | 'commodity_name';
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

export default function CommoditiesTable() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch commodities and translations
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

  const fetchCommodities = async () => {
    try {
      const { data, error } = await supabase
        .from('commodities')
        .select(
          `
          *,
          commodity_translations (*)
        `
        )
        .order('name');

      if (error) throw error;
      setCommodities(data || []);
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  };

  const trackChange = (
    commodityId: number,
    commodityName: string,
    field: 'name' | 'unit' | 'needs_review' | 'commodity_name',
    oldValue: string | boolean,
    newValue: string | boolean,
    languageCode?: string
  ) => {
    setPendingChanges(prev => {
      // Remove existing change for this field
      const filtered = prev.filter(
        change =>
          !(
            change.commodityId === commodityId &&
            change.field === field &&
            change.languageCode === languageCode
          )
      );

      // If new value equals old value, don't add the change
      if (newValue === oldValue) {
        return filtered;
      }

      // Add new change
      return [
        ...filtered,
        { commodityId, commodityName, field, oldValue, newValue, languageCode },
      ];
    });
  };

  const updateCommodityName = (commodityId: number, commodityName: string, newName: string) => {
    const commodity = commodities.find(c => c.id === commodityId);
    if (!commodity) return;

    trackChange(commodityId, commodityName, 'commodity_name', commodity.name, newName);

    // Update local state
    setCommodities(prev =>
      prev.map(c => (c.id === commodityId ? { ...c, name: newName } : c))
    );
  };

  const updateTranslation = (
    commodityId: number,
    commodityName: string,
    languageCode: string,
    field: 'name' | 'unit',
    value: string
  ) => {
    const commodity = commodities.find(c => c.id === commodityId);
    if (!commodity) return;

    const translation = commodity.commodity_translations.find(
      t => t.language_code === languageCode
    );
    const oldValue = translation?.[field] || '';

    trackChange(commodityId, commodityName, field, oldValue, value, languageCode);

    // Update local state
    setCommodities(prev =>
      prev.map(c => {
        if (c.id !== commodityId) return c;

        const existingTranslation = c.commodity_translations.find(
          t => t.language_code === languageCode
        );

        if (existingTranslation) {
          return {
            ...c,
            commodity_translations: c.commodity_translations.map(t =>
              t.language_code === languageCode ? { ...t, [field]: value } : t
            ),
          };
        } else {
          return {
            ...c,
            commodity_translations: [
              ...c.commodity_translations,
              {
                commodity_id: commodityId,
                language_code: languageCode,
                [field]: value,
                needs_review: true,
              } as Tables<'commodity_translations'>,
            ],
          };
        }
      })
    );
  };

  const toggleNeedsReview = (
    commodityId: number,
    commodityName: string,
    languageCode: string,
    needsReview: boolean
  ) => {
    const commodity = commodities.find(c => c.id === commodityId);
    if (!commodity) return;

    const translation = commodity.commodity_translations.find(
      t => t.language_code === languageCode
    );
    const oldValue = translation?.needs_review || false;

    trackChange(commodityId, commodityName, 'needs_review', oldValue, needsReview, languageCode);

    // Update local state
    setCommodities(prev =>
      prev.map(c => {
        if (c.id !== commodityId) return c;

        return {
          ...c,
          commodity_translations: c.commodity_translations.map(t =>
            t.language_code === languageCode ? { ...t, needs_review: needsReview } : t
          ),
        };
      })
    );
  };

  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;

    setSaving(true);
    try {
      // Group changes by type
      const commodityNameChanges = pendingChanges.filter(c => c.field === 'commodity_name');
      const translationChanges = pendingChanges.filter(c => c.field !== 'commodity_name');

      // Update commodity names
      for (const change of commodityNameChanges) {
        const { error } = await supabase
          .from('commodities')
          .update({ name: change.newValue as string })
          .eq('id', change.commodityId);

        if (error) throw error;
      }

      // Group translation changes by commodity and language
      const translationGroups = new Map<string, any>();
      for (const change of translationChanges) {
        const key = `${change.commodityId}-${change.languageCode}`;
        if (!translationGroups.has(key)) {
          translationGroups.set(key, {
            commodity_id: change.commodityId,
            language_code: change.languageCode,
          });
        }
        translationGroups.get(key)[change.field] = change.newValue;
      }

      // Upsert all translations
      for (const translation of translationGroups.values()) {
        const { error } = await supabase
          .from('commodity_translations')
          .upsert(translation, {
            onConflict: 'commodity_id,language_code',
            ignoreDuplicates: false,
          });

        if (error) throw error;
      }

      // Clear pending changes and refresh data
      setPendingChanges([]);
      setShowReview(false);
      await fetchCommodities();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    setShowReview(false);
    fetchCommodities();
  };

  const uploadImage = async (commodityId: number, file: File) => {
    setUploadingImages(prev => new Set(prev).add(commodityId));
    try {
      // Upload to Supabase Storage with the pattern: commodities/{id}.jpg
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `commodities/${commodityId}.${fileExt}`;

      // Delete existing file if it exists
      await supabase.storage.from('agrideck').remove([filePath]);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('agrideck')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Refresh commodities to show new image
      await fetchCommodities();
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(prev => {
        const next = new Set(prev);
        next.delete(commodityId);
        return next;
      });
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Commodity (English)
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image
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
                      <input
                        type="text"
                        value={commodity.name}
                        onChange={e => updateCommodityName(commodity.id, commodity.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold transition-all hover:border-gray-400"
                        placeholder="Enter commodity name"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      {/* Image Preview */}
                      {commodity.image && (
                        <div className="relative group">
                          <img
                            src={`${commodity.image}?t=${Date.now()}`}
                            alt={commodity.name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      {/* Upload Button */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImages.has(commodity.id)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadImage(commodity.id, file);
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5">
                          {uploadingImages.has(commodity.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-700 border-t-transparent"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Upload
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.name || ''}
                      onChange={e => updateTranslation(commodity.id, commodity.name, selectedLanguage, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} name`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.unit || ''}
                      onChange={e => updateTranslation(commodity.id, commodity.name, selectedLanguage, 'unit', e.target.value)}
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
                          onChange={e => toggleNeedsReview(commodity.id, commodity.name, selectedLanguage, e.target.checked)}
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

      {/* Pending Changes Section */}
      {pendingChanges.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pendingChanges.length} Pending {pendingChanges.length === 1 ? 'Change' : 'Changes'}
                  </h3>
                  <p className="text-sm text-gray-600">Review your changes before saving</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showReview ? 'Hide' : 'Review'} Changes
                </button>
                <button
                  onClick={discardChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Discard
                </button>
                <button
                  onClick={saveAllChanges}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Changes Review Panel */}
            {showReview && (
              <div className="mt-4 max-h-96 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Commodity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Language</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Old Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingChanges.map((change, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{change.commodityName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                          {change.field === 'commodity_name' ? 'English Name' : change.field}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {change.languageCode ? languages.find(l => l.code === change.languageCode)?.name || change.languageCode : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {change.field === 'needs_review'
                            ? (change.oldValue ? 'Yes' : 'No')
                            : (change.oldValue as string) || '(empty)'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-700">
                          {change.field === 'needs_review'
                            ? (change.newValue ? 'Yes' : 'No')
                            : (change.newValue as string)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
