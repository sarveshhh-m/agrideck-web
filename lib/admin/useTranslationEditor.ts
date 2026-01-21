'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type Change<T extends string> = {
  itemId: number;
  itemName: string;
  field: T;
  oldValue: string | boolean;
  newValue: string | boolean;
  languageCode?: string;
};

interface UseTranslationEditorOptions<T extends string> {
  table: string;
  translationTable: string;
  nameField: T;
  conflictColumns: string;
}

export function useTranslationEditor<T extends string>({
  table,
  translationTable,
  nameField,
  conflictColumns,
}: UseTranslationEditorOptions<T>) {
  const [pendingChanges, setPendingChanges] = useState<Change<T>[]>([]);
  const [saving, setSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const supabase = createClient();

  const addChange = useCallback((change: Change<T>) => {
    setPendingChanges(prev => {
      const filtered = prev.filter(
        c =>
          !(
            c.itemId === change.itemId &&
            c.field === change.field &&
            c.languageCode === change.languageCode
          )
      );

      if (change.oldValue === change.newValue) {
        return filtered;
      }

      return [...filtered, change];
    });
  }, []);

  const updateItemName = useCallback((itemId: number, currentName: string, newName: string) => {
    addChange({
      itemId,
      itemName: currentName,
      field: nameField,
      oldValue: currentName,
      newValue: newName,
    });
  }, [nameField, addChange]);

  const updateTranslation = useCallback((
    itemId: number,
    itemName: string,
    languageCode: string,
    field: string,
    currentValue: any,
    newValue: string
  ) => {
    addChange({
      itemId,
      itemName,
      field: field as T,
      oldValue: currentValue || '',
      newValue,
      languageCode,
    });
  }, [addChange]);

  const toggleNeedsReview = useCallback((
    itemId: number,
    itemName: string,
    languageCode: string,
    currentValue: boolean,
    newValue: boolean
  ) => {
    addChange({
      itemId,
      itemName,
      field: 'needs_review' as T,
      oldValue: currentValue,
      newValue,
      languageCode,
    });
  }, [addChange]);

  const saveChanges = useCallback(async (items: any[]) => {
    if (pendingChanges.length === 0) return;

    setSaving(true);
    try {
      const nameChanges = pendingChanges.filter(c => c.field === nameField);
      const translationChanges = pendingChanges.filter(c => c.field !== nameField);

      for (const change of nameChanges) {
        const { error } = await supabase
          .from(table)
          .update({ name: change.newValue as string })
          .eq('id', change.itemId);

        if (error) throw error;
      }

      const translationGroups = new Map<string, any>();
      for (const change of translationChanges) {
        const key = `${change.itemId}-${change.languageCode}`;
        if (!translationGroups.has(key)) {
          translationGroups.set(key, {
            [`${table.slice(0, -1)}_id`]: change.itemId,
            language_code: change.languageCode,
          });
        }
        translationGroups.get(key)[change.field] = change.newValue;
      }

      for (const translation of translationGroups.values()) {
        const { error } = await supabase
          .from(translationTable)
          .upsert(translation, {
            onConflict: conflictColumns,
            ignoreDuplicates: false,
          });

        if (error) throw error;
      }

      setPendingChanges([]);
      setShowReview(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [pendingChanges, table, translationTable, nameField, conflictColumns, supabase]);

  const discardChanges = useCallback(() => {
    setPendingChanges([]);
    setShowReview(false);
  }, []);

  return {
    pendingChanges,
    saving,
    showReview,
    setShowReview,
    updateItemName,
    updateTranslation,
    toggleNeedsReview,
    saveChanges,
    discardChanges,
  };
}
