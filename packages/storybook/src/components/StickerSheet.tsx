import type { ReactElement } from 'react';
import c from './StickerSheet.module.css';

export interface StickerSheetProps {
  columns: string[];
  rows: string[];
  variants: (ReactElement | { title: string; component: ReactElement })[];
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
              <th className={c.th} scope='row'>
                {row}
              </th>
              {rowVariants.map((variant, i) => (
                <td key={'title' in variant ? `${variant.title}-${i}` : i} className={c.td}>
                  {'component' in variant ? variant.component : variant}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
