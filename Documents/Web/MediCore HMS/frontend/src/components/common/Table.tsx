import { ReactNode, TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'onClick'> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id' as keyof T,
  onRowClick,
  emptyMessage = 'No data available',
  className,
  ...props
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-secondary-200">
      <table className={cn('min-w-full divide-y divide-secondary-200', className)} {...props}>
        <thead className="bg-secondary-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-secondary-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={String(item[keyField]) ?? rowIndex}
                className={cn(
                  'hover:bg-secondary-50 transition-colors duration-150',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column) => {
                  const value = item[column.key as keyof T];
                  return (
                    <td key={column.key} className={cn('px-6 py-4 whitespace-nowrap text-sm text-secondary-800', column.className)}>
                      {column.render ? column.render(item) : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
