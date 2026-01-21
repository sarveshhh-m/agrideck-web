'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';

type Mandi = Tables<'mandis'> & {
  mandi_translations: Tables<'mandi_translations'>[];
  districts: { name: string } | null;
  states: { name: string } | null;
};

type Language = {
  code: string;
  name: string;
};

type PendingChange = {
  mandiId: number;
  mandiName: string;
  field: 'name' | 'district' | 'needs_review' | 'mandi_name';
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

export default function MandisTable() {
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch mandis with translations
      const { data: mandisData, error: mandisError } = await supabase
        .from('mandis')
        .select(
          `
          *,
          mandi_translations (*),
          districts (name),
          states (name)
        `
        )
        .order('name');

      if (mandisError) throw mandisError;
      setMandis(mandisData || []);

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

  const fetchMandis = async () => {
    try {
      const { data, error } = await supabase
        .from('mandis')
        .select(
          `
          *,
          mandi_translations (*),
          districts (name),
          states (name)
        `
        )
        .order('name');

      if (error) throw error;
      setMandis(data || []);
    } catch (error) {
      console.error('Error fetching mandis:', error);
    }
  };

  const trackChange = (
    mandiId: number,
    mandiName: string,
    field: 'name' | 'district' | 'needs_review' | 'mandi_name',
    oldValue: string | boolean,
    newValue: string | boolean,
    languageCode?: string
  ) => {
    setPendingChanges(prev => {
      const filtered = prev.filter(
        change =>
          !(
            change.mandiId === mandiId &&
            change.field === field &&
            change.languageCode === languageCode
          )
      );

      if (newValue === oldValue) {
        return filtered;
      }

      return [
        ...filtered,
        { mandiId, mandiName, field, oldValue, newValue, languageCode },
      ];
    });
  };

  const updateMandiName = (mandiId: number, mandiName: string, newName: string) => {
    const mandi = mandis.find(m => m.id === mandiId);
    if (!mandi) return;

    trackChange(mandiId, mandiName, 'mandi_name', mandi.name, newName);

    setMandis(prev =>
      prev.map(m => (m.id === mandiId ? { ...m, name: newName } : m))
    );
  };

  const updateTranslation = (
    mandiId: number,
    mandiName: string,
    languageCode: string,
    field: 'name' | 'district',
    value: string
  ) => {
    const mandi = mandis.find(m => m.id === mandiId);
    if (!mandi) return;

    const translation = mandi.mandi_translations.find(
      t => t.language_code === languageCode
    );
    const oldValue = translation?.[field] || '';

    trackChange(mandiId, mandiName, field, oldValue, value, languageCode);

    setMandis(prev =>
      prev.map(m => {
        if (m.id !== mandiId) return m;

        const existingTranslation = m.mandi_translations.find(
          t => t.language_code === languageCode
        );

        if (existingTranslation) {
          return {
            ...m,
            mandi_translations: m.mandi_translations.map(t =>
              t.language_code === languageCode ? { ...t, [field]: value } : t
            ),
          };
        } else {
          return {
            ...m,
            mandi_translations: [
              ...m.mandi_translations,
              {
                mandi_id: mandiId,
                language_code: languageCode,
                [field]: value,
                needs_review: true,
              } as Tables<'mandi_translations'>,
            ],
          };
        }
      })
    );
  };

  const toggleNeedsReview = (
    mandiId: number,
    mandiName: string,
    languageCode: string,
    needsReview: boolean
  ) => {
    const mandi = mandis.find(m => m.id === mandiId);
    if (!mandi) return;

    const translation = mandi.mandi_translations.find(
      t => t.language_code === languageCode
    );
    const oldValue = translation?.needs_review || false;

    trackChange(mandiId, mandiName, 'needs_review', oldValue, needsReview, languageCode);

    setMandis(prev =>
      prev.map(m => {
        if (m.id !== mandiId) return m;

        return {
          ...m,
          mandi_translations: m.mandi_translations.map(t =>
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
      const mandiNameChanges = pendingChanges.filter(c => c.field === 'mandi_name');
      const translationChanges = pendingChanges.filter(c => c.field !== 'mandi_name');

      for (const change of mandiNameChanges) {
        const { error } = await supabase
          .from('mandis')
          .update({ name: change.newValue as string })
          .eq('id', change.mandiId);

        if (error) throw error;
      }

      const translationGroups = new Map<string, any>();
      for (const change of translationChanges) {
        const key = `${change.mandiId}-${change.languageCode}`;
        if (!translationGroups.has(key)) {
          translationGroups.set(key, {
            mandi_id: change.mandiId,
            language_code: change.languageCode,
          });
        }
        translationGroups.get(key)[change.field] = change.newValue;
      }

      for (const translation of translationGroups.values()) {
        const { error } = await supabase
          .from('mandi_translations')
          .upsert(translation, {
            onConflict: 'mandi_id,language_code',
            ignoreDuplicates: false,
          });

        if (error) throw error;
      }

      setPendingChanges([]);
      setShowReview(false);
      await fetchMandis();
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
    fetchMandis();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading mandis...</span>
      </div>
    );
  }

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
          {mandis.length} Mandis
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Mandi (English)
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  District
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  State
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {selectedLang?.name || selectedLanguage.toUpperCase()} Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {selectedLang?.name || selectedLanguage.toUpperCase()} District
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
            {mandis.map((mandi, index) => {
              const translation = mandi.mandi_translations.find(
                t => t.language_code === selectedLanguage
              );

              return (
                <tr
                  key={mandi.id}
                  className={`hover:bg-green-50 transition-colors ${
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
                        value={mandi.name}
                        onChange={e => updateMandiName(mandi.id, mandi.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold transition-all hover:border-gray-400"
                        placeholder="Enter mandi name"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {mandi.districts?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {mandi.states?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.name || ''}
                      onChange={e => updateTranslation(mandi.id, mandi.name, selectedLanguage, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} name`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.district || ''}
                      onChange={e => updateTranslation(mandi.id, mandi.name, selectedLanguage, 'district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} district`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={translation?.needs_review || false}
                          onChange={e => toggleNeedsReview(mandi.id, mandi.name, selectedLanguage, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mandis.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No mandis found</p>
        </div>
      )}

      {/* Pending Changes Section */}
      {pendingChanges.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
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
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mandi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Language</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Old Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingChanges.map((change, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{change.mandiName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                          {change.field === 'mandi_name' ? 'English Name' : change.field}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {change.languageCode ? languages.find(l => l.code === change.languageCode)?.name || change.languageCode : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {change.field === 'needs_review'
                            ? (change.oldValue ? 'Yes' : 'No')
                            : (change.oldValue as string) || '(empty)'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-700">
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
