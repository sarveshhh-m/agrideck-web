"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database";
import {
  Upload,
  Languages,
  Tag,
  ImageIcon,
  Save,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
  List,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import Badge from "@/app/components/Badge";
import { TranslationConfirmDialog } from "@/components/admin/TranslationConfirmDialog";
import { ImageGenerationConfirmDialog } from "@/components/admin/ImageGenerationConfirmDialog";

// Type definitions from original file
type Commodity = Tables<"commodities"> & {
  commodity_translations: Tables<"commodity_translations">[];
};
type Language = { code: string; name: string };
type PendingChange = {
  commodityId: number;
  commodityName: string;
  field: "name" | "unit" | "needs_review" | "commodity_name";
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500, 1000];

// --- Sub-components for a cleaner structure ---

// Loading Skeleton
const TableSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
    ))}
  </div>
);

// Language Selector Dropdown
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
      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.code.toUpperCase()})
        </option>
      ))}
    </select>
  </div>
);

// Image Uploader Component
const ImageUploader = ({
  commodity,
  onUpload,
  isUploading,
  onGenerateAI,
  isGeneratingAI,
}: {
  commodity: Commodity;
  onUpload: (id: number, file: File | Blob) => void;
  isUploading: boolean;
  onGenerateAI: (commodityId: number, name: string) => void;
  isGeneratingAI: boolean;
}) => (
  <div className="flex items-center gap-2">
    <img
      src={`${commodity.image}?t=${new Date().getTime()}`}
      alt={commodity.name}
      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
      onError={(e) => {
        e.currentTarget.src =
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /%3E%3C/svg%3E';
      }}
    />
    <div className="flex flex-col gap-1">
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(commodity.id, file);
            e.target.value = "";
          }}
        />
        <div className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>
      </label>
      <button
        onClick={() => onGenerateAI(commodity.id, commodity.name)}
        disabled={isGeneratingAI}
        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors disabled:opacity-50"
        title="Generate with Google Imagen"
      >
        {isGeneratingAI ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

// --- Main CommoditiesTable Component ---

export default function CommoditiesTable() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set(),
  );
  const [generatingTranslation, setGeneratingTranslation] = useState<
    number | null
  >(null);
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [pendingImage, setPendingImage] = useState<{
    commodityId: number;
    commodityName: string;
    imageData: string;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingTranslation, setPendingTranslation] = useState<{
    type: 'single' | 'batch';
    commodityId?: number;
    commodityName?: string;
    itemCount?: number;
  } | null>(null);
  const [imageConfirmDialogOpen, setImageConfirmDialogOpen] = useState(false);
  const [pendingImageGeneration, setPendingImageGeneration] = useState<{
    commodityId: number;
    commodityName: string;
  } | null>(null);
  const supabase = createClient();

  // Data fetching and state management (mostly unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: commoditiesData, error: commoditiesError } =
          await supabase
            .from("commodities")
            .select(`*, commodity_translations (*)`)
            .order("name");
        if (commoditiesError) throw commoditiesError;
        setCommodities(commoditiesData || []);

        const { data: languagesData, error: languagesError } = await supabase
          .from("languages")
          .select("code, name")
          .order("code");
        if (languagesError) throw languagesError;
        setLanguages(languagesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const fetchCommodities = async () => {
    try {
      const { data, error } = await supabase
        .from("commodities")
        .select(`*, commodity_translations (*)`)
        .order("name");
      if (error) throw error;
      setCommodities(data || []);
    } catch (error) {
      console.error("Error fetching commodities:", error);
    }
  };

  const trackChange = (
    commodityId: number,
    commodityName: string,
    field: PendingChange["field"],
    oldValue: any,
    newValue: any,
    languageCode?: string,
  ) => {
    setPendingChanges((prev) => {
      const filtered = prev.filter(
        (c) =>
          !(
            c.commodityId === commodityId &&
            c.field === field &&
            c.languageCode === languageCode
          ),
      );
      if (newValue === oldValue) return filtered;
      return [
        ...filtered,
        { commodityId, commodityName, field, oldValue, newValue, languageCode },
      ];
    });
  };

  const updateCommodityName = (commodityId: number, newName: string) => {
    const commodity = commodities.find((c) => c.id === commodityId);
    if (!commodity) return;
    trackChange(
      commodityId,
      commodity.name,
      "commodity_name",
      commodity.name,
      newName,
    );
    setCommodities((prev) =>
      prev.map((c) => (c.id === commodityId ? { ...c, name: newName } : c)),
    );
  };

  const updateTranslation = (
    commodityId: number,
    languageCode: string,
    value: string,
  ) => {
    const commodity = commodities.find((c) => c.id === commodityId);
    if (!commodity) return;
    const translation = commodity.commodity_translations.find(
      (t) => t.language_code === languageCode,
    );
    const oldValue = translation?.name || "";
    trackChange(
      commodityId,
      commodity.name,
      "name",
      oldValue,
      value,
      languageCode,
    );
    setCommodities((prev) =>
      prev.map((c) => {
        if (c.id !== commodityId) return c;
        const existing = c.commodity_translations.find(
          (t) => t.language_code === languageCode,
        );
        if (existing) {
          return {
            ...c,
            commodity_translations: c.commodity_translations.map((t) =>
              t.language_code === languageCode ? { ...t, name: value } : t,
            ),
          };
        }
        return {
          ...c,
          commodity_translations: [
            ...c.commodity_translations,
            {
              commodity_id: commodityId,
              language_code: languageCode,
              name: value,
              needs_review: true,
            } as any,
          ],
        };
      }),
    );
  };

  const removeTranslation = (commodityId: number, languageCode: string) => {
    updateTranslation(commodityId, languageCode, "");
  };

  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;
    setSaving(true);
    try {
      const commodityNameChanges = pendingChanges.filter(
        (c) => c.field === "commodity_name",
      );
      for (const change of commodityNameChanges) {
        await supabase
          .from("commodities")
          .update({ name: change.newValue as string })
          .eq("id", change.commodityId);
      }
      const translationChanges = pendingChanges.filter(
        (c) => c.field !== "commodity_name",
      );
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
      for (const translation of translationGroups.values()) {
        await supabase
          .from("commodity_translations")
          .upsert(translation, { onConflict: "commodity_id,language_code" });
      }
      setPendingChanges([]);
      setShowReview(false);
      await fetchCommodities();
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    setShowReview(false);
    fetchCommodities();
  };

  const uploadImage = async (commodityId: number, file: File | Blob) => {
    setUploadingImages((prev) => new Set(prev).add(commodityId));
    try {
      const actualFile =
        file instanceof File
          ? file
          : new File([file], "image.jpg", { type: "image/jpeg" });
      const filePath = `commodities/${commodityId}.jpg`;
      await supabase.storage.from("agrideck").remove([filePath]);
      await supabase.storage
        .from("agrideck")
        .upload(filePath, actualFile, { cacheControl: "3600", upsert: true });
      await fetchCommodities();
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImages((prev) => {
        const next = new Set(prev);
        next.delete(commodityId);
        return next;
      });
    }
  };

  const showSingleTranslationConfirm = (commodityId: number, name: string) => {
    setPendingTranslation({
      type: 'single',
      commodityId,
      commodityName: name,
    });
    setConfirmDialogOpen(true);
  };

  const performSingleTranslation = async () => {
    if (!pendingTranslation || pendingTranslation.type !== 'single') return;

    const { commodityId, commodityName } = pendingTranslation;
    if (!commodityId || !commodityName) return;

    console.log(
      `[CommoditiesTable] Starting translation generation for commodity: ${commodityName} (ID: ${commodityId})`,
    );
    setGeneratingTranslation(commodityId);
    try {
      console.log(
        `[CommoditiesTable] Calling API for language: ${selectedLanguage}`,
      );
      const response = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "commodity",
          name: commodityName,
          targetLanguage: selectedLanguage,
          languageName:
            languages.find((l) => l.code === selectedLanguage)?.name ||
            selectedLanguage,
        }),
      });

      console.log(`[CommoditiesTable] API Response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[CommoditiesTable] API Error:`, errorData);
        throw new Error(errorData.error || "Translation failed");
      }

      const data = await response.json();
      console.log(`[CommoditiesTable] API Response data:`, data);

      const { translation } = data;
      console.log(`[CommoditiesTable] Translation result: "${translation}"`);

      if (translation) {
        console.log(
          `[CommoditiesTable] Updating translation for commodity ID: ${commodityId}`,
        );
        updateTranslation(commodityId, selectedLanguage, translation);
        console.log(`[CommoditiesTable] Translation updated successfully`);
      } else {
        console.warn(`[CommoditiesTable] Translation is empty`);
      }
      setConfirmDialogOpen(false);
      setPendingTranslation(null);
    } catch (error) {
      console.error("[CommoditiesTable] Error generating translation:", error);
      alert(
        `Failed to generate translation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setConfirmDialogOpen(false);
      setPendingTranslation(null);
    } finally {
      setGeneratingTranslation(null);
    }
  };

  const showImageGenerationConfirm = (commodityId: number, name: string) => {
    setPendingImageGeneration({
      commodityId,
      commodityName: name,
    });
    setImageConfirmDialogOpen(true);
  };

  const performImageGeneration = async () => {
    if (!pendingImageGeneration) return;

    const { commodityId, commodityName } = pendingImageGeneration;

    console.log(
      `[CommoditiesTable] Starting image generation for commodity: ${commodityName} (ID: ${commodityId})`,
    );
    setGeneratingImage(commodityId);
    try {
      console.log(`[CommoditiesTable] Calling image generation API`);
      const response = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commodityName }),
      });

      console.log(`[CommoditiesTable] API Response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[CommoditiesTable] API Error:`, errorData);
        throw new Error(errorData.error || "Image generation failed");
      }

      const data = await response.json();
      console.log(
        `[CommoditiesTable] API Response data length:`,
        data.image?.length,
      );

      if (data.image) {
        console.log(`[CommoditiesTable] Setting image for preview and upload`);
        console.log(
          `[CommoditiesTable] Image data length: ${data.image.length}`,
        );
        setPendingImage({
          commodityId,
          commodityName,
          imageData: data.image,
        });
        setPreviewImage(`data:image/jpeg;base64,${data.image}`);
        console.log(`[CommoditiesTable] Image ready for preview and upload`);
      }
      setImageConfirmDialogOpen(false);
      setPendingImageGeneration(null);
    } catch (error) {
      console.error("[CommoditiesTable] Error generating image:", error);
      alert(
        `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setImageConfirmDialogOpen(false);
      setPendingImageGeneration(null);
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleImageUpload = async () => {
    if (!pendingImage) return;

    try {
      console.log(
        `[CommoditiesTable] Uploading generated image for ${pendingImage.commodityName}`,
      );

      const byteCharacters = atob(pendingImage.imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      await uploadImage(pendingImage.commodityId, blob);
      console.log(
        `[CommoditiesTable] Image uploaded successfully (512x512 JPG)`,
      );
      setPendingImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("[CommoditiesTable] Error uploading image:", error);
      alert(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleImageCancel = () => {
    console.log(`[CommoditiesTable] Image generation cancelled`);
    setPendingImage(null);
    setPreviewImage(null);
  };

  async function processImageTo512x512Jpg(
    base64Image: string,
  ): Promise<string> {
    console.log(`[CommoditiesTable] Processing image to 512x512 JPG...`);

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = 512;
        canvas.height = 512;

        if (ctx) {
          ctx.drawImage(img, 0, 0, 512, 512);

          const jpgData = canvas.toDataURL("image/jpeg", 0.8);
          const base64 = jpgData.split(",")[1];

          console.log(
            `[CommoditiesTable] Processed image size: ${base64.length} bytes`,
          );
          resolve(base64);
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = `data:image/png;base64,${base64Image}`;
    });
  }

  const showBatchTranslationConfirm = () => {
    const commoditiesNeedingTranslation = filteredCommodities.filter(
      (commodity) =>
        !commodity.commodity_translations
          .find((t) => t.language_code === selectedLanguage)
          ?.name?.trim(),
    );

    if (commoditiesNeedingTranslation.length === 0) {
      alert("No commodities need translation for the selected language.");
      return;
    }

    const itemCount = Math.min(commoditiesNeedingTranslation.length, 100);
    setPendingTranslation({
      type: 'batch',
      itemCount,
    });
    setConfirmDialogOpen(true);
  };

  const performBatchTranslation = async () => {
    if (!pendingTranslation || pendingTranslation.type !== 'batch') return;

    const commoditiesNeedingTranslation = filteredCommodities.filter(
      (commodity) =>
        !commodity.commodity_translations
          .find((t) => t.language_code === selectedLanguage)
          ?.name?.trim(),
    );

    const itemsToTranslate = commoditiesNeedingTranslation.slice(0, 100);
    const langName =
      languages.find((l) => l.code === selectedLanguage)?.name ||
      selectedLanguage;

    console.log(
      `[CommoditiesTable] Starting batch translation for ${itemsToTranslate.length} commodities in a single API call`,
    );

    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: itemsToTranslate.length });

    try {
      const items = itemsToTranslate.map((c) => ({ id: c.id, name: c.name }));

      const response = await fetch("/api/gemini/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "commodity",
          items,
          targetLanguage: selectedLanguage,
          languageName: langName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Batch translation failed");
      }

      const data = await response.json();
      console.log(`[CommoditiesTable] Batch translation result:`, data);

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
        `[CommoditiesTable] Batch translation complete: ${successCount} success, ${failCount} failed`,
      );
      alert(
        `Batch translation complete!\nSuccess: ${successCount}\nFailed: ${failCount}`,
      );
      setConfirmDialogOpen(false);
      setPendingTranslation(null);
    } catch (error) {
      console.error("[CommoditiesTable] Batch translation failed:", error);
      alert(
        `Failed to generate translations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setConfirmDialogOpen(false);
      setPendingTranslation(null);
    } finally {
      setBatchGenerating(false);
      setBatchProgress(null);
    }
  };

  const sortedCommodities = useMemo(() => {
    return [...commodities].sort((a, b) => {
      const aTranslation = a.commodity_translations
        .find((t) => t.language_code === selectedLanguage)
        ?.name?.trim();
      const bTranslation = b.commodity_translations
        .find((t) => t.language_code === selectedLanguage)
        ?.name?.trim();
      const aHasName = !!aTranslation;
      const bHasName = !!bTranslation;
      const aHasImage = !!a.image;
      const bHasImage = !!b.image;
      const aPriority =
        aHasImage && aHasName ? 2 : !aHasImage && !aHasName ? 0 : 1;
      const bPriority =
        bHasImage && bHasName ? 2 : !bHasImage && !bHasName ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.name.localeCompare(b.name);
    });
  }, [commodities, selectedLanguage]);

  const filteredCommodities = useMemo(() => {
    if (!searchQuery.trim()) return sortedCommodities;
    const query = searchQuery.toLowerCase().trim();
    return sortedCommodities.filter((commodity) => {
      const englishName = commodity.name?.toLowerCase() || "";
      const translation = commodity.commodity_translations.find(
        (t) => t.language_code === selectedLanguage,
      );
      const translatedName = translation?.name?.toLowerCase() || "";
      return englishName.includes(query) || translatedName.includes(query);
    });
  }, [sortedCommodities, searchQuery, selectedLanguage]);

  const paginatedCommodities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCommodities.slice(start, start + pageSize);
  }, [filteredCommodities, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCommodities.length / pageSize);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading) return <TableSkeleton />;

  const selectedLangName =
    languages.find((l) => l.code === selectedLanguage)?.name ||
    selectedLanguage.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-4">
          <LanguageSelector
            languages={languages}
            selected={selectedLanguage}
            onChange={setSelectedLanguage}
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
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge
            type="role"
            value={`${filteredCommodities.length} Commodities`}
          />
          <Badge type="status" value={`Editing: ${selectedLangName}`} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search commodities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
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
            {filteredCommodities.length === 0
              ? "0 commodities"
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredCommodities.length)} of ${filteredCommodities.length}`}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Commodity (English)
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                <ImageIcon className="w-4 h-4 inline mr-2" /> Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">
                {selectedLangName} Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCommodities.map((commodity) => {
              const translation = commodity.commodity_translations.find(
                (t) => t.language_code === selectedLanguage,
              );
              return (
                <tr
                  key={commodity.id}
                  className={`hover:bg-indigo-50 transition-colors ${translation?.needs_review ? "bg-yellow-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <span className="w-full px-3 py-2 text-sm font-medium text-gray-900">
                      {commodity.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ImageUploader
                      commodity={commodity}
                      onUpload={uploadImage}
                      isUploading={uploadingImages.has(commodity.id)}
                      onGenerateAI={showImageGenerationConfirm}
                      isGeneratingAI={generatingImage === commodity.id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={translation?.name || ""}
                        onChange={(e) =>
                          updateTranslation(
                            commodity.id,
                            selectedLanguage,
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder={`Enter ${selectedLangName} name...`}
                      />
                      {!translation?.name ? (
                        <button
                          onClick={() =>
                            showSingleTranslationConfirm(commodity.id, commodity.name)
                          }
                          disabled={generatingTranslation === commodity.id}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex-shrink-0 disabled:opacity-50"
                          title={`Generate ${selectedLangName} name`}
                        >
                          {generatingTranslation === commodity.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            removeTranslation(commodity.id, selectedLanguage)
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

      {filteredCommodities.length > 0 && (
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {filteredCommodities.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold">No Commodities Found</h3>
          <p>
            {searchQuery
              ? "Try a different search term"
              : "No commodities to display"}
          </p>
        </div>
      )}

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
                  )}{" "}
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
                  />{" "}
                  <Save className={`w-4 h-4 ${saving ? "hidden" : ""}`} /> Save
                  Changes
                </button>
              </div>
            </div>
            {showReview && (
              <div className="mt-4 max-h-64 overflow-y-auto bg-gray-50 rounded-lg border p-2">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left text-xs font-semibold uppercase">
                        Commodity
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
                          {c.commodityName}
                        </td>
                        <td className="p-2 text-sm">
                          {c.field === "commodity_name"
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

      {pendingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Generated Image
              </h3>
              <button
                onClick={handleImageCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Commodity:{" "}
                <span className="font-medium">
                  {pendingImage?.commodityName}
                </span>{" "}
                <span className="text-gray-400">(512x512 JPG)</span>
              </p>
              {previewImage && (
                <img
                  src={previewImage}
                  alt={`Generated image for ${pendingImage?.commodityName}`}
                  className="w-full h-64 object-contain rounded-lg border bg-gray-50"
                />
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={handleImageCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUpload}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <TranslationConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingTranslation(null);
        }}
        onConfirm={pendingTranslation?.type === 'single' ? performSingleTranslation : performBatchTranslation}
        type={pendingTranslation?.type || 'single'}
        translationType="commodity"
        itemName={pendingTranslation?.commodityName}
        itemCount={pendingTranslation?.itemCount}
        targetLanguage={languages.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}
        loading={generatingTranslation !== null || batchGenerating}
      />

      <ImageGenerationConfirmDialog
        isOpen={imageConfirmDialogOpen}
        onClose={() => {
          setImageConfirmDialogOpen(false);
          setPendingImageGeneration(null);
        }}
        onConfirm={performImageGeneration}
        itemName={pendingImageGeneration?.commodityName || ''}
        loading={generatingImage !== null}
      />
    </div>
  );
}
