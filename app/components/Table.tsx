'use client';
import React from 'react';

// Reusable Tailwind CSS classes for table elements
const tableClasses = "min-w-full divide-y divide-gray-200";
const theadClasses = "bg-gray-50";
const thClasses = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
const tbodyClasses = "bg-white divide-y divide-gray-200";
const trClasses = "cursor-pointer hover:bg-gray-50";
const tdClasses = "px-6 py-4 whitespace-nowrap text-sm";

// Interface for table props
interface TableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: string | ((item: T) => React.ReactNode);
  }[];
  onRowClick: (item: T) => void;
  searchQuery?: string;
}

// Reusable Table Component
export default function Table<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  searchQuery = '',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className={theadClasses}>
          <tr>
            {columns.map(col => (
              <th key={col.header} className={thClasses}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tbodyClasses}>
          {data.map(item => (
            <tr key={item.id} onClick={() => onRowClick(item)} className={trClasses}>
              {columns.map(col => (
                <td key={col.header} className={tdClasses}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No results match your search' : 'No data available'}
        </div>
      )}
    </div>
  );
}
