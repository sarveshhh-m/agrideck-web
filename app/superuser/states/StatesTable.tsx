"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database";
import {
  Languages,
  MapPin,
  PenSquare,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  List,
  Map,
  Sparkles,
  Trash2,
} from "lucide-react";
import Badge from "@/app/components/Badge";
import SearchInput from "@/app/components/SearchInput";

// Type definitions
type State = Tables<"states"> & {
  state_translations: Tables<"state_translations">[];
};
type Language = { code: string; name: string };
type PendingChange = {
  stateId: number;
  stateName: string;
  field: "name" | "state_name";
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

const LanguageSelector = ({
  languages,
  selected,
  onChange,
}: {
  languages: Language[];
  selected: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex items-center gap-3">
    <Languages className="w-6 h-6 text-indigo-600" />
    <select
      id="language-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white text-md font-medium text-gray-700 hover:bg-gray-50"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.code.toUpperCase()})
        </option>
      ))}
    </select>
  </div>
);

// --- Main Component ---

export default function StatesTable() {
  const [states, setStates] = useState<State[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const [statesRes, languagesRes] = await Promise.all([
        supabase
          .from("states")
          .select(`*, state_translations(*)`)
          .order("name"),
        supabase.from("languages").select("code, name").order("code"),
      ]);
      if (statesRes.error) throw statesRes.error;
      if (languagesRes.error) throw languagesRes.error;
      setStates(statesRes.data || []);
      setLanguages(languagesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchStates = async () => {
    try {
      const { data, error } = await supabase
        .from("states")
        .select(`*, state_translations(*)`)
        .order("name");
      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const trackChange = (
    stateId: number,
    stateName: string,
    field: PendingChange["field"],
    oldValue: any,
    newValue: any,
    languageCode?: string,
  ) => {
    setPendingChanges((prev) => {
      const filtered = prev.filter(
        (c) =>
          !(
            c.stateId === stateId &&
            c.field === field &&
            c.languageCode === languageCode
          ),
      );
      if (newValue === oldValue) return filtered;
      return [
        ...filtered,
        { stateId, stateName, field, oldValue, newValue, languageCode },
      ];
    });
  };

  const updateStateName = (stateId: number, newName: string) => {
    const state = states.find((s) => s.id === stateId);
    if (!state) return;
    trackChange(stateId, state.name, "state_name", state.name, newName);
    setStates((prev) =>
      prev.map((s) => (s.id === stateId ? { ...s, name: newName } : s)),
    );
  };

  const updateTranslation = (
    stateId: number,
    languageCode: string,
    value: string,
  ) => {
    const state = states.find((s) => s.id === stateId);
    if (!state) return;
    const translation = state.state_translations.find(
      (t) => t.language_code === languageCode,
    );
    const oldValue = translation?.name || "";
    trackChange(stateId, state.name, "name", oldValue, value, languageCode);
    setStates((prev) =>
      prev.map((s) => {
        if (s.id !== stateId) return s;
        const existing = s.state_translations.find(
          (t) => t.language_code === languageCode,
        );
        if (existing) {
          return {
            ...s,
            state_translations: s.state_translations.map((t) =>
              t.language_code === languageCode ? { ...t, name: value } : t,
            ),
          };
        }
        return {
          ...s,
          state_translations: [
            ...s.state_translations,
            {
              state_id: stateId,
              language_code: languageCode,
              name: value,
            } as any,
          ],
        };
      }),
    );
  };

  const removeTranslation = (stateId: number, languageCode: string) => {
    updateTranslation(stateId, languageCode, "");
  };

  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;
    setSaving(true);
    try {
      const stateNameChanges = pendingChanges.filter(
        (c) => c.field === "state_name",
      );
      for (const change of stateNameChanges) {
        await supabase
          .from("states")
          .update({ name: change.newValue as string })
          .eq("id", change.stateId);
      }
      const translationChanges = pendingChanges.filter(
        (c) => c.field !== "state_name",
      );
      const groups: Record<string, any> = {};
      for (const change of translationChanges) {
        const key = `${change.stateId}-${change.languageCode}`;
        if (!groups[key]) {
          groups[key] = {
            state_id: change.stateId,
            language_code: change.languageCode,
          };
        }
        groups[key][change.field] = change.newValue;
      }
      for (const translation of Object.values(groups)) {
        await supabase
          .from("state_translations")
          .upsert(translation, { onConflict: "state_id,language_code" });
      }
      setPendingChanges([]);
      setShowReview(false);
      await fetchStates();
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    setShowReview(false);
    fetchStates();
  };

  const showBatchTranslationConfirm = () => {
    const statesNeedingTranslation = filteredStates.filter(
      (state) =>
        !state.state_translations
          .find((t) => t.language_code === selectedLanguage)
          ?.name?.trim(),
    );

    if (statesNeedingTranslation.length === 0) {
      alert("No states need translation for the selected language.");
      return;
    }

    const itemsToTranslate = statesNeedingTranslation.slice(0, 100);
    const langName =
      languages.find((l) => l.code === selectedLanguage)?.name ||
      selectedLanguage;

    console.log(
      `[StatesTable] Starting batch translation for ${itemsToTranslate.length} states in a single API call`,
    );

    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: itemsToTranslate.length });

    try {
      const items = itemsToTranslate.map((s) => ({ id: s.id, name: s.name }));

      fetch("/api/gemini/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "state",
          items,
          targetLanguage: selectedLanguage,
          languageName: langName,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.error || "Batch translation failed");
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log(`[StatesTable] Batch translation result:`, data);

          let successCount = 0;
          let failCount = 0;

          for (const result of data.translations || []) {
            if (result.translation) {
              updateTranslation(result.id, selectedLanguage, result.translation);
              successCount++;
            } else {
              failCount++;
            }
          }

          setBatchProgress({
            current: itemsToTranslate.length,
            total: itemsToTranslate.length,
          });
          console.log(
            `[StatesTable] Batch translation complete: ${successCount} success, ${failCount} failed`,
          );
          alert(
            `Batch translation complete!\nSuccess: ${successCount}\nFailed: ${failCount}`,
          );
        })
        .catch((error) => {
          console.error("[StatesTable] Batch translation failed:", error);
          alert(
            `Failed to generate translations: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        })
        .finally(() => {
          setBatchGenerating(false);
          setBatchProgress(null);
        });
    } catch (error) {
      console.error("[StatesTable] Batch translation setup failed:", error);
      alert("Failed to start batch translation");
      setBatchGenerating(false);
      setBatchProgress(null);
    }
  };

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      const searchMatch =
        !searchQuery.trim() ||
        state.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        state.state_translations.some((t) =>
          t.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        );
      return searchMatch;
    });
  }, [states, searchQuery]);

  const paginatedStates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStates.slice(start, start + pageSize);
  }, [filteredStates, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStates.length / pageSize);

  if (loading) return <TableSkeleton />;

  const selectedLangName =
    languages.find((l) => l.code === selectedLanguage)?.name ||
    selectedLanguage.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg border flex flex-wrap items-center justify-between gap-4">
        <LanguageSelector
          languages={languages}
          selected={selectedLanguage}
          onChange={setSelectedLanguage}
        />
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search states..."
          className="flex-1 min-w-[250px]"
        />
        {batchGenerating ? (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              Translating {batchProgress?.current}/{batchProgress?.total}...
            </span>
          </div>
        ) : (
          <button
            onClick={showBatchTranslationConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Batch Translate (Max 100)
          </button>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Badge type="role" value={`${filteredStates.length} States`} />
          <Badge type="status" value={`Editing: ${selectedLangName}`} />
        </div>
      </div>

      {/* Table and Pagination */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <MapPin className="w-4 h-4 inline mr-2" />
                State (English)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {selectedLangName} Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStates.map((state) => {
              const translation = state.state_translations.find(
                (t) => t.language_code === selectedLanguage,
              );
              return (
                <tr
                  key={state.id}
                  className="hover:bg-indigo-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {state.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={translation?.name || ""}
                        onChange={(e) =>
                          updateTranslation(
                            state.id,
                            selectedLanguage,
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter name..."
                      />
                      {translation?.name && (
                        <button
                          onClick={() =>
                            removeTranslation(state.id, selectedLanguage)
                          }
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors flex-shrink-0"
                          title={`Remove ${selectedLangName} name`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination and Page Size */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        <div className="text-sm text-gray-600">
          {filteredStates.length === 0
            ? "0 states"
            : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredStates.length)} of ${filteredStates.length}`}
        </div>
      </div>

      {filteredStates.length > 0 && (
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredStates.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold">No States Found</h3>
          <p>
            {searchQuery
              ? "Try a different search term"
              : "No states to display"}
          </p>
        </div>
      )}

      {/* Pending Changes Bar */}
      {pendingChanges.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-indigo-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${showReview ? "bg-yellow-100" : "bg-indigo-100"}`}
                >
                  {showReview ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {pendingChanges.length} Pending{" "}
                    {pendingChanges.length === 1 ? "Change" : "Changes"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review your changes before saving
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  {showReview ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {showReview ? "Hide" : "Review"}
                </button>
                <button
                  onClick={discardChanges}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Discard
                </button>
                <button
                  onClick={saveAllChanges}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Loader2
                    className={`w-4 h-4 ${saving ? "animate-spin" : "hidden"}`}
                  />
                  <Save className={`w-4 h-4 ${saving ? "hidden" : ""}`} />
                  Save Changes
                </button>
              </div>
            </div>
            {showReview && (
              <div className="mt-4 max-h-64 overflow-y-auto bg-gray-50 rounded-lg border p-2">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left text-xs font-semibold uppercase">
                        State
                      </th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">
                        Field
                      </th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">
                        Old
                      </th>
                      <th className="p-2 text-left text-xs font-semibold uppercase">
                        New
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {pendingChanges.map((c, i) => (
                      <tr key={i}>
                        <td className="p-2 text-sm font-medium">
                          {c.stateName}
                        </td>
                        <td className="p-2 text-sm">
                          {c.field === "state_name"
                            ? `Name (EN)`
                            : `Name (${c.languageCode})`}
                        </td>
                        <td className="p-2 text-sm text-gray-500 line-through">
                          "{c.oldValue as string}"
                        </td>
                        <td className="p-2 text-sm text-green-600 font-semibold">
                          "{c.newValue as string}"
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
