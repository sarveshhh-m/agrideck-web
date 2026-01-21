'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FilterState, SortState, PaginationState, TableColumn, TableConfig } from './types';

export function useDataTable<T extends Record<string, any>>(config: TableConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState<T>>(
    config.defaultSort ? { column: String(config.defaultSort.column), direction: config.defaultSort.direction } : null
  );
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: config.pageSize || 20,
    totalCount: 0,
  });

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(config.table).select('*', { count: 'exact' });

      const searchableColumns = config.columns.filter(c => c.searchable);
      if (filters.search && searchableColumns.length > 0) {
        const searchConditions = searchableColumns
          .map(col => `${String(col.key)}.ilike.%${filters.search}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'search' && value !== '' && value !== null && value !== undefined) {
          const column = config.columns.find(c => String(c.key) === key);
          if (column?.filterType === 'boolean') {
            query = query.eq(key, value === 'true');
          } else if (column?.filterType === 'select') {
            query = query.eq(key, value);
          } else {
            query = query.ilike(key, `%${value}%`);
          }
        }
      });

      if (sort) {
        query = query.order(String(sort.column), { ascending: sort.direction === 'asc' });
      }

      query = query.range((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize - 1);

      const { data: result, error, count } = await query;

      if (error) throw error;
      setData(result || []);
      setPagination(prev => ({ ...prev, totalCount: count || 0 }));
    } catch (error) {
      console.error(`Error fetching ${config.table}:`, error);
    } finally {
      setLoading(false);
    }
  }, [config.table, config.columns, filters, sort, pagination.page, pagination.pageSize, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = useCallback((column: keyof T) => {
    setSort(prev => {
      if (prev?.column === column) {
        return prev.direction === 'asc' ? { column, direction: 'desc' } : null;
      }
      return { column: String(column), direction: 'asc' };
    });
  }, []);

  const handleFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const paginatedData = useMemo(() => data, [data]);

  return {
    data: paginatedData,
    loading,
    filters,
    sort,
    pagination,
    handleSort,
    handleFilter,
    handlePageChange,
    handlePageSizeChange,
    refresh,
    totalPages: Math.ceil(pagination.totalCount / pagination.pageSize),
  };
}
