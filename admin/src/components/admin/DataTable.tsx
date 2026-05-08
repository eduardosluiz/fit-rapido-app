'use client';

import { ReactNode } from 'react';
import { Card } from './Card';
import '@/app/admin/data-table.css';

interface DataTableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  emptyIcon?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon = 'bx-inbox',
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Carregando...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <i className={`bx ${emptyIcon} text-6xl text-gray-300 mb-4`}></i>
          <p className="text-gray-600 font-medium">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={column.className || ''}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={keyExtractor(row)}>
                {columns.map((column, colIndex) => {
                  // Se existe função render, usar ela (prioridade)
                  let cellContent: ReactNode;
                  if (column.render) {
                    cellContent = column.render(row);
                  } else if (typeof column.accessor === 'function') {
                    cellContent = column.accessor(row);
                  } else {
                    cellContent = row[column.accessor];
                  }

                  return (
                    <td
                      key={colIndex}
                      className={column.className || ''}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
