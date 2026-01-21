export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { label: string; value: any }[];
};

export type TableConfig<T> = {
  table: string;
  columns: TableColumn<T>[];
  defaultSort?: { column: keyof T; direction: 'asc' | 'desc' };
  pageSize?: number;
  enableActions?: boolean;
  rowLink?: (row: T) => string;
};

export type FilterState = Record<string, any>;

export type SortState<T = any> = { column: keyof T | string; direction: 'asc' | 'desc' } | null;

export type PaginationState = {
  page: number;
  pageSize: number;
  totalCount: number;
};
