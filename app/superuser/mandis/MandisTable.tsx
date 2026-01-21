'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';
import { Languages, MapPin, Building, PenSquare, Eye, EyeOff, Save, X, AlertTriangle, CheckCircle, Loader2, List, Sparkles } from 'lucide-react';
import Badge from '@/app/components/Badge';
import SearchInput from '@/app/components/SearchInput';
import FilterDropdown from '@/app/components/FilterDropdown';
import Pagination from '@/app/components/Pagination';

// Type definitions
type Mandi = Tables<'mandis'> & {
  mandi_translations: Tables<'mandi_translations'>[];
  districts: { name: string } | null;
  states: { name: string } | null;
};
type Language = { code: string; name: string };
type State = { id: string; name: string };
type District = { id: string; name: string };
type PendingChange = {
  mandiId: number;
  mandiName: string;
  field: 'name' | 'district' | 'mandi_name';
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500, 1000];

// --- Sub-components ---

const TableSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
    ))}
  </div>
);

const LanguageSelector = ({ languages, selected, onChange }: { languages: Language[]; selected: string; onChange: (val: string) => void; }) => (
  <div className="flex items-center gap-3">
    <Languages className="w-6 h-6 text-indigo-600" />
    <select
      id="language-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white text-md font-medium text-gray-700 hover:bg-gray-50"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.code.toUpperCase()})
        </option>
      ))}
    </select>
  </div>
);

// --- Main Component ---

export default function MandisTable() {
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [generatingTranslation, setGeneratingTranslation] = useState<number | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [languagesRes, statesRes] = await Promise.all([
          supabase.from('languages').select('code, name').order('code'),
          supabase.from('states').select('id, name').order('name')
        ]);
        if (languagesRes.error) throw languagesRes.error;
        if (statesRes.error) throw statesRes.error;
        setLanguages(languagesRes.data || []);
        setStates(statesRes.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, [supabase]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        let query = supabase.from('districts').select('id, name').order('name');
        if (selectedState) {
          query = query.eq('state_id', selectedState);
        }
        const { data, error } = await query;
        if (error) throw error;
        setDistricts(data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedState, supabase]);

  const fetchMandis = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('mandis')
        .select(
          `*, mandi_translations(*), districts(name), states(name)`,
          { count: 'exact' }
        )
        .order('name')
        .range(from, to);

      if (selectedState) {
        query = query.eq('state_id', selectedState);
      }
      if (selectedDistrict) {
        query = query.eq('district_id', selectedDistrict);
      }
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,districts.name.ilike.%${searchQuery.trim()}%,states.name.ilike.%${searchQuery.trim()}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setMandis(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching mandis:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedState, selectedDistrict, searchQuery, supabase]);

  useEffect(() => {
    fetchMandis();
  }, [fetchMandis]);

  // State Updates & Change Tracking
  const trackChange = (mandiId: number, mandiName: string, field: PendingChange['field'], oldValue: any, newValue: any, languageCode?: string) => {
    setPendingChanges(prev => {
      const filtered = prev.filter(c => !(c.mandiId === mandiId && c.field === field && c.languageCode === languageCode));
      if (newValue === oldValue) return filtered;
      return [...filtered, { mandiId, mandiName, field, oldValue, newValue, languageCode }];
    });
  };

  const updateTranslation = (mandiId: number, languageCode: string, field: 'name' | 'district', value: string) => {
    const mandi = mandis.find(m => m.id === mandiId);
    if (!mandi) return;
    const translation = mandi.mandi_translations.find(t => t.language_code === languageCode);
    const oldValue = translation?.[field] || '';
    trackChange(mandi.id, mandi.name, field, oldValue, value, languageCode);
    setMandis(prev => prev.map(m => {
      if (m.id !== mandiId) return m;
      const existing = m.mandi_translations.find(t => t.language_code === languageCode);
      if (existing) {
        return { ...m, mandi_translations: m.mandi_translations.map(t => t.language_code === languageCode ? { ...t, [field]: value } : t) };
      }
      return { ...m, mandi_translations: [...m.mandi_translations, { mandi_id: mandiId, language_code: languageCode, [field]: value } as any] };
    }));
  };
  
  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;
    setSaving(true);
    try {
      const mandiNameChanges = pendingChanges.filter(c => c.field === 'mandi_name');
      for (const change of mandiNameChanges) {
        await supabase.from('mandis').update({ name: change.newValue as string }).eq('id', change.mandiId);
      }
      const translationChanges = pendingChanges.filter(c => c.field !== 'mandi_name');
      const translationGroups = new Map<string, any>();
      for (const change of translationChanges) {
        const key = `${change.mandiId}-${change.languageCode}`;
        if (!translationGroups.has(key)) {
          translationGroups.set(key, { mandi_id: change.mandiId, language_code: change.languageCode });
        }
        translationGroups.get(key)[change.field] = change.newValue;
      }
      for (const translation of translationGroups.values()) {
        await supabase.from('mandi_translations').upsert(translation, { onConflict: 'mandi_id,language_code' });
      }
      setPendingChanges([]);
      setShowReview(false);
      await fetchMandis();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    setShowReview(false);
    fetchMandis();
  };

  const generateTranslation = async (mandiId: number, name: string, district: string) => {
    console.log(`[MandisTable] Starting translation generation for mandi: ${name} (ID: ${mandiId})`);
    setGeneratingTranslation(mandiId);
    try {
      const langName = languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
      console.log(`[MandisTable] Calling API for language: ${selectedLanguage} (${langName})`);
      
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mandi',
          name,
          district,
          targetLanguage: selectedLanguage,
          languageName: langName,
        }),
      });

      console.log(`[MandisTable] API Response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[MandisTable] API Error:`, errorData);
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      console.log(`[MandisTable] API Response data:`, data);

      const { name: translatedName, district: translatedDistrict } = data;
      console.log(`[MandisTable] Translated name: "${translatedName}", district: "${translatedDistrict}"`);
      
      if (translatedName) {
        updateTranslation(mandiId, selectedLanguage, 'name', translatedName);
      }
      if (translatedDistrict) {
        updateTranslation(mandiId, selectedLanguage, 'district', translatedDistrict);
      }
    } catch (error) {
      console.error('[MandisTable] Error generating translation:', error);
      alert(`Failed to generate translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingTranslation(null);
    }
  };

  const batchTranslate = async () => {
    const mandisNeedingTranslation = mandis.filter(mandi => {
      const translation = mandi.mandi_translations.find(t => t.language_code === selectedLanguage);
      return !translation?.name?.trim() || !translation?.district?.trim();
    });

    if (mandisNeedingTranslation.length === 0) {
      alert('No mandis need translation for the selected language.');
      return;
    }

    const itemsToTranslate = mandisNeedingTranslation.slice(0, 100);
    const langName = languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

    console.log(`[MandisTable] Starting batch translation for ${itemsToTranslate.length} mandis in a single API call`);

    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: itemsToTranslate.length });

    try {
      const items = itemsToTranslate.map(m => ({ 
        id: m.id, 
        name: m.name, 
        district: m.districts?.name || '' 
      }));
      
      const response = await fetch('/api/gemini/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mandi',
          items,
          targetLanguage: selectedLanguage,
          languageName: langName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch translation failed');
      }

      const data = await response.json();
      console.log(`[MandisTable] Batch translation result:`, data);

      let successCount = 0;
      let failCount = 0;

      for (const result of data.translations || []) {
        if (result.name) {
          updateTranslation(result.id, selectedLanguage, 'name', result.name);
        }
        if (result.district) {
          updateTranslation(result.id, selectedLanguage, 'district', result.district);
        }
        if (result.name || result.district) {
          successCount++;
        } else {
          failCount++;
        }
      }

      setBatchProgress({ current: itemsToTranslate.length, total: itemsToTranslate.length });
      console.log(`[MandisTable] Batch translation complete: ${successCount} success, ${failCount} failed`);
      alert(`Batch translation complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
    } catch (error) {
      console.error('[MandisTable] Batch translation failed:', error);
      alert(`Failed to generate translations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBatchGenerating(false);
      setBatchProgress(null);
    }
  };

  // Memoized Data
  const paginatedMandis = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return mandis.slice(start, end);
  }, [mandis, currentPage, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Render Logic
  if (loading) return <TableSkeleton />;
  
  const selectedLangName = languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
        <div className="flex flex-wrap items-center gap-4">
          <LanguageSelector languages={languages} selected={selectedLanguage} onChange={setSelectedLanguage} />
          {batchGenerating ? (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                Translating {batchProgress?.current}/{batchProgress?.total}...
              </span>
            </div>
          ) : (
            <button
              onClick={batchTranslate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Batch Translate (Max 100)
            </button>
          )}
          <FilterDropdown label="State" value={selectedState} onChange={(e) => {setSelectedState(e.target.value); setSelectedDistrict(''); setCurrentPage(1);}} options={states.map(s => ({ value: s.id, label: s.name }))} defaultOptionLabel="All States" />
          <FilterDropdown label="District" value={selectedDistrict} onChange={(e) => {setSelectedDistrict(e.target.value); setCurrentPage(1);}} options={districts.map(d => ({ value: d.id, label: d.name }))} disabled={!selectedState} defaultOptionLabel="All Districts" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchInput value={searchQuery} onChange={(val) => {setSearchQuery(val); setCurrentPage(1);}} placeholder="Search by name, district, state..." className="flex-1 min-w-[250px]" />
          <div className="flex items-center gap-2 text-sm">
            <Badge type="role" value={`${totalCount} Mandis`} />
            <Badge type="status" value={`Editing: ${selectedLangName}`} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><PenSquare className="w-4 h-4 inline mr-2" />Mandi (English)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><MapPin className="w-4 h-4 inline mr-2" />Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{selectedLangName} Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{selectedLangName} District</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMandis.map(mandi => {
              const translation = mandi.mandi_translations.find(t => t.language_code === selectedLanguage);
              const needsTranslation = !translation?.name || !translation?.district;
              return (
                <tr key={mandi.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{mandi.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mandi.districts?.name}, {mandi.states?.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input type="text" value={translation?.name || ''} onChange={e => updateTranslation(mandi.id, selectedLanguage, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Enter name..." />
                      {needsTranslation && (
                        <button
                          onClick={() => generateTranslation(mandi.id, mandi.name, mandi.districts?.name || '')}
                          disabled={generatingTranslation === mandi.id}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors disabled:opacity-50 flex-shrink-0"
                          title={`Generate ${selectedLangName} name`}
                        >
                          {generatingTranslation === mandi.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input type="text" value={translation?.district || ''} onChange={e => updateTranslation(mandi.id, selectedLanguage, 'district', e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Enter district..." />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mandis.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold">No Mandis Found</h3>
          <p>{searchQuery ? 'Try a different search term' : 'No mandis to display'}</p>
        </div>
      )}

      {pendingChanges.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-indigo-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${showReview ? 'bg-yellow-100' : 'bg-indigo-100'}`}>
                  {showReview ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> : <CheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{pendingChanges.length} Pending {pendingChanges.length === 1 ? 'Change' : 'Changes'}</h3>
                  <p className="text-sm text-gray-600">Review your changes before saving</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowReview(!showReview)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  {showReview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showReview ? 'Hide' : 'Review'}
                </button>
                <button onClick={discardChanges} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2">
                  <X className="w-4 h-4" /> Discard
                </button>
                <button onClick={saveAllChanges} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  <Loader2 className={`w-4 h-4 ${saving ? 'animate-spin' : 'hidden'}`} />
                  <Save className={`w-4 h-4 ${saving ? 'hidden' : ''}`} />
                  Save Changes
                </button>
              </div>
            </div>
            {showReview && (
              <div className="mt-4 max-h-64 overflow-y-auto bg-gray-50 rounded-lg border p-2">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left text-xs font-semibold uppercase">Mandi</th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">Field</th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">Old</th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">New</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {pendingChanges.map((c, i) => (
                      <tr key={i}>
                        <td className="p-2 text-sm font-medium">{c.mandiName}</td>
                        <td className="p-2 text-sm">{c.field === 'mandi_name' ? `Name (EN)` : `Name (${c.languageCode})`}</td>
                        <td className="p-2 text-sm text-gray-500 line-through">"{c.oldValue as string}"</td>
                        <td className="p-2 text-sm text-green-600 font-semibold">"{c.newValue as string}"</td>
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
