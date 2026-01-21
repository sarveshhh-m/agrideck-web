'use client';

import { Search, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import type { TableColumn, SortState } from '@/lib/admin/types';

interface DataTableHeaderProps<T> {
  columns: TableColumn<T>[];
  sort: SortState;
  onSort: (column: keyof T) => void;
  onSearch: (value: string) => void;
  onFilter: (key: string, value: any) => void;
  searchValue: string;
  filterValues: Record<string, any>;
}

export default function DataTableHeader<T extends Record<string, any>>({
  columns,
  sort,
  onSort,
  onSearch,
  onFilter,
  searchValue,
  filterValues,
}: DataTableHeaderProps<T>) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {columns.some(c => c.searchable) && (
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={e => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {columns
          .filter(c => c.filterType && c.filterType !== 'text')
          .map(column => (
            <select
              key={String(column.key)}
              value={filterValues[String(column.key)] || ''}
              onChange={e => onFilter(String(column.key), e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {column.label}</option>
              {column.filterOptions?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
      </div>
    </div>
  );
}
