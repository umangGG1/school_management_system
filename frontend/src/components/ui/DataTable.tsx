import type { ReactNode } from 'react';
import { colors } from '../../styles/tokens';

interface Column<T> {
  key     : keyof T | string;
  header  : string;
  render? : (row: T, index: number) => ReactNode;
  width?  : string;
}

interface DataTableProps<T> {
  columns : Column<T>[];
  rows    : T[];
  keyFn   : (row: T, i: number) => string | number;
}

export function DataTable<T>({ columns, rows, keyFn }: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} style={{
                textAlign: 'left', fontSize: 10, fontWeight: 700,
                color: colors.muted, textTransform: 'uppercase',
                letterSpacing: '.06em', padding: '9px 12px',
                background: '#f8fafc', borderBottom: `1px solid ${colors.border}`,
                width: col.width,
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyFn(row, i)} style={{ borderBottom: `1px solid ${colors.border}` }}>
              {columns.map(col => (
                <td key={String(col.key)} style={{ padding: '10px 12px', fontSize: 12, verticalAlign: 'middle' }}>
                  {col.render
                    ? col.render(row, i)
                    : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: colors.muted }}>
                No data to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
