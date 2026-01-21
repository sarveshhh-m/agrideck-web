'use client';

import DataTableHeader from './DataTableHeader';
import DataTableBody from './DataTableBody';
import DataTablePagination from './DataTablePagination';
import type { TableConfig, SortState, PaginationState, FilterState } from '@/lib/admin/types';

interface DataTableProps<T> {
  config: TableConfig<T>;
  data: T[];
  loading: boolean;
  filters: FilterState;
  sort: SortState<T>;
  pagination: PaginationState;
  totalPages: number;
  onSort: (column: keyof T) => void;
  onFilter: (key: string, value: any) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function DataTable<T extends Record<string, any>>({
  config,
  data,
  loading,
  filters,
  sort,
  pagination,
  totalPages,
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  return (
    <div className="space-y-6">
      <DataTableHeader
        columns={config.columns}
        sort={sort}
        onSort={onSort}
        onSearch={value => onFilter('search', value)}
        onFilter={onFilter}
        searchValue={filters.search || ''}
        filterValues={filters}
      />

      <DataTableBody
        data={data}
        columns={config.columns}
        sort={sort}
        onSort={onSort}
        loading={loading}
        onRowClick={config.rowLink ? row => (window.location.href = config.rowLink!(row)) : undefined}
      />

      <DataTablePagination
        pagination={pagination}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
