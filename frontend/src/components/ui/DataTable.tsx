interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No data',
  onRowClick
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                } ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-3 text-sm ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
