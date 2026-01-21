'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationState } from '@/lib/admin/types';

interface DataTablePaginationProps {
  pagination: PaginationState;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function DataTablePagination({
  pagination,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageSizes = [10, 20, 50, 100];

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <select
          value={pagination.pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {pagination.totalCount} total
        </span>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= totalPages}
          className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
