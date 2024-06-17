import type { ReactElement } from 'react';
import c from './StickerSheet.module.css';

export interface StickerSheetProps {
  columns: string[];
  rows: string[];
  variants: { title: string; component: ReactElement }[];
}

export default function StickerSheet({ columns, rows, variants }: StickerSheetProps) {
  return (
    <table className={c.wrapper}>
      <thead>
        <tr>
          <th>&nbsp;</th>
          {columns.map((col) => (
            <th key={col} className={c.th}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const start = i * columns.length;
          const rowVariants = variants.slice(start, start + columns.length);
          return (
            <tr key={row}>
              <th className={c.th} scope="row">
                {row}
              </th>
              {rowVariants.map((variant, i) => (
                <td key={i} className={c.td}>
                  {variant}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
