'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';

type State = Tables<'states'> & {
  state_translations: Tables<'state_translations'>[];
};

type Language = {
  code: string;
  name: string;
};

type PendingChange = {
  stateId: number;
  stateName: string;
  field: 'name' | 'needs_review' | 'state_name';
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

export default function StatesTable() {
  const [states, setStates] = useState<State[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch states
      const { data: statesData, error: statesError } = await supabase
        .from('states')
        .select(
          `
          *,
          state_translations (*)
        `
        )
        .order('name');

      if (statesError) throw statesError;
      setStates(statesData || []);

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

  const addPendingChange = (change: PendingChange) => {
    setPendingChanges(prev => {
      // Remove existing change for same state/field/language
      const filtered = prev.filter(
        c =>
          !(
            c.stateId === change.stateId &&
            c.field === change.field &&
            c.languageCode === change.languageCode
          )
      );
      // Only add if value actually changed from original
      if (change.oldValue === change.newValue) {
        return filtered;
      }
      return [...filtered, change];
    });
  };

  const updateStateName = (stateId: number, currentName: string, newName: string) => {
    // Update local state immediately
    setStates(prev =>
      prev.map(state => (state.id === stateId ? { ...state, name: newName } : state))
    );

    // Track change
    addPendingChange({
      stateId,
      stateName: currentName,
      field: 'state_name',
      oldValue: currentName,
      newValue: newName,
    });
  };

  const updateTranslation = (stateId: number, stateName: string, field: 'name', value: string) => {
    // Update local state immediately
    setStates(prev =>
      prev.map(state => {
        if (state.id !== stateId) return state;

        const translations = state.state_translations || [];
        const existingTranslation = translations.find(t => t.language_code === selectedLanguage);

        if (existingTranslation) {
          return {
            ...state,
            state_translations: translations.map(t =>
              t.language_code === selectedLanguage ? { ...t, [field]: value } : t
            ),
          };
        } else {
          return {
            ...state,
            state_translations: [
              ...translations,
              {
                state_id: stateId,
                language_code: selectedLanguage,
                [field]: value,
                needs_review: false,
              } as Tables<'state_translations'>,
            ],
          };
        }
      })
    );

    // Track change
    const translation = states
      .find(s => s.id === stateId)
      ?.state_translations.find(t => t.language_code === selectedLanguage);

    addPendingChange({
      stateId,
      stateName,
      field,
      oldValue: translation?.[field] || '',
      newValue: value,
      languageCode: selectedLanguage,
    });
  };

  const toggleNeedsReview = (stateId: number, stateName: string, needsReview: boolean) => {
    // Update local state immediately
    setStates(prev =>
      prev.map(state => {
        if (state.id !== stateId) return state;

        const translations = state.state_translations || [];
        const existingTranslation = translations.find(t => t.language_code === selectedLanguage);

        if (existingTranslation) {
          return {
            ...state,
            state_translations: translations.map(t =>
              t.language_code === selectedLanguage ? { ...t, needs_review: needsReview } : t
            ),
          };
        } else {
          return {
            ...state,
            state_translations: [
              ...translations,
              {
                state_id: stateId,
                language_code: selectedLanguage,
                name: '',
                needs_review: needsReview,
              } as Tables<'state_translations'>,
            ],
          };
        }
      })
    );

    // Track change
    const translation = states
      .find(s => s.id === stateId)
      ?.state_translations.find(t => t.language_code === selectedLanguage);

    addPendingChange({
      stateId,
      stateName,
      field: 'needs_review',
      oldValue: translation?.needs_review || false,
      newValue: needsReview,
      languageCode: selectedLanguage,
    });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      for (const change of pendingChanges) {
        if (change.field === 'state_name') {
          // Update state name
          const { error } = await supabase
            .from('states')
            .update({ name: change.newValue as string })
            .eq('id', change.stateId);

          if (error) throw error;
        } else if (change.field === 'needs_review') {
          // Update needs_review
          const { error } = await supabase
            .from('state_translations')
            .update({ needs_review: change.newValue as boolean })
            .eq('state_id', change.stateId)
            .eq('language_code', change.languageCode!);

          if (error) throw error;
        } else {
          // Update translation
          const { error } = await supabase.from('state_translations').upsert(
            {
              state_id: change.stateId,
              language_code: change.languageCode!,
              [change.field]: change.newValue,
            },
            {
              onConflict: 'state_id,language_code',
              ignoreDuplicates: false,
            }
          );

          if (error) throw error;
        }
      }

      // Clear pending changes and refresh data
      setPendingChanges([]);
      setShowReview(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    setShowReview(false);
    fetchData(); // Reload original data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading states...</span>
      </div>
    );
  }

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
          {states.length} States
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 font-medium">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  State (English)
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {selectedLang?.name || selectedLanguage.toUpperCase()} Name
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
            {states.map((state, index) => {
              const translation = state.state_translations.find(
                t => t.language_code === selectedLanguage
              );

              return (
                <tr
                  key={state.id}
                  className={`hover:bg-purple-50 transition-colors ${
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
                        value={state.name}
                        onChange={e => {
                          const originalState = states.find(s => s.id === state.id);
                          updateStateName(state.id, originalState?.name || state.name, e.target.value);
                        }}
                        className="text-sm font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none px-1 py-0.5 transition-colors"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={translation?.name || ''}
                      onChange={e => updateTranslation(state.id, state.name, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all hover:border-gray-400"
                      placeholder={`Enter ${selectedLanguage} name`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={translation?.needs_review || false}
                          onChange={e => toggleNeedsReview(state.id, state.name, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {states.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No states found</p>
        </div>
      )}

      {/* Pending Changes Panel */}
      {pendingChanges.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900">
                    {pendingChanges.length} Pending Change{pendingChanges.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  {showReview ? 'Hide' : 'Review'} Changes
                  <svg
                    className={`w-4 h-4 transition-transform ${showReview ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={discardChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Discard
                </button>
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

            {/* Review Table */}
            {showReview && (
              <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">State</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Field</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Language</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Old Value</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingChanges.map((change, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{change.stateName}</td>
                          <td className="px-4 py-2 text-gray-700 capitalize">
                            {change.field === 'state_name' ? 'State Name (EN)' : change.field.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {change.languageCode ? change.languageCode.toUpperCase() : 'EN'}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {typeof change.oldValue === 'boolean'
                              ? change.oldValue
                                ? '✓ Yes'
                                : '✗ No'
                              : change.oldValue || '(empty)'}
                          </td>
                          <td className="px-4 py-2 text-purple-600 font-medium">
                            {typeof change.newValue === 'boolean'
                              ? change.newValue
                                ? '✓ Yes'
                                : '✗ No'
                              : change.newValue || '(empty)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
