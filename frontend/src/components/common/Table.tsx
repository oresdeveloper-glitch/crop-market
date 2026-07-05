import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export default function Table<T extends Record<string, any>>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-navy-100 dark:border-navy-700">
            {columns.map((col) => (
              <th key={col.key} className={`text-left px-4 py-3 label ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50 dark:divide-navy-700/50">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-navy-400">
                No data available
              </td>
            </tr>
          )}
          {data.map((item, i) => (
            <tr
              key={item.id || i}
              onClick={() => onRowClick?.(item)}
              className={`${onRowClick ? "cursor-pointer" : ""} hover:bg-navy-50/50 dark:hover:bg-navy-700/30 transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-navy-700 dark:text-navy-200 ${col.className || ""}`}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
