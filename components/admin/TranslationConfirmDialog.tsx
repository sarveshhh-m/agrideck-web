'use client';

import { X, AlertCircle, Sparkles } from 'lucide-react';

interface TranslationConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'single' | 'batch';
  translationType: 'commodity' | 'mandi';
  itemName?: string;
  itemCount?: number;
  targetLanguage: string;
  loading?: boolean;
}

export function TranslationConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  translationType,
  itemName,
  itemCount,
  targetLanguage,
  loading = false,
}: TranslationConfirmDialogProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    if (type === 'single') {
      return `Confirm AI Translation`;
    }
    return `Confirm Batch AI Translation`;
  };

  const getMessage = () => {
    if (type === 'single') {
      return (
        <>
          You are about to use AI to translate{' '}
          <span className="font-semibold text-gray-900">{itemName}</span> to{' '}
          <span className="font-semibold text-gray-900">{targetLanguage}</span>.
        </>
      );
    }
    return (
      <>
        You are about to use AI to translate{' '}
        <span className="font-semibold text-gray-900">{itemCount}</span>{' '}
        {translationType === 'commodity' ? 'commodities' : 'mandis'} to{' '}
        <span className="font-semibold text-gray-900">{targetLanguage}</span>.
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>{getMessage()}</p>
              <p className="mt-2">This will consume AI credits from your account.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Translating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Confirm & Translate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
