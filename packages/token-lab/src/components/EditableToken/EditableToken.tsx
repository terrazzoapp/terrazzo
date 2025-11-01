import type { TokenNormalized } from '@terrazzo/token-tools';
import clsx from 'clsx';
import EditableColorToken from '../EditableColorToken/EditableColorToken.js';
import EditableFontFamilyToken from '../EditableFontFamilyToken/EditableFontFamilyToken.js';
import c from './EditableToken.module.css';

export interface TokenProps {
  token: TokenNormalized;
  /** ordered listing of modes ("." is always first, even if omitted) */
  modes?: string[];
}

export default function EditableToken({ token, modes = ['.'] }: TokenProps) {
  const localName = token.id.replace(`${token.group.id}.`, '');

  switch (token.$type) {
    case 'color': {
      return (
        <tr>
          <th scope='row' className={clsx(c.cell)}>
            {localName}
          </th>
          {modes.map((mode) => (
            <td key={mode} className={clsx(c.cell)}>
              <EditableColorToken id={token.id} mode={mode} value={token.mode[mode]!.$value} />
            </td>
          ))}
        </tr>
      );
    }
    case 'fontFamily': {
      return (
        <tr>
          <th scope='row' className={clsx(c.cell)}>
            {localName}
          </th>
          {modes.map((mode) => (
            <td key={mode} className={clsx(c.cell)}>
              <EditableFontFamilyToken id={token.id} mode={mode} value={token.mode[mode]!} />
            </td>
          ))}
        </tr>
      );
    }
    default: {
      return (
        <tr>
          <th scope='row' className={clsx(c.cell)}>
            {localName}
          </th>
          {modes.map((mode) => (
            <td key={mode} className={clsx(c.cell)}>
              {mode in token.mode && JSON.stringify(token.mode[mode])}
            </td>
          ))}
        </tr>
      );
    }
  }
}
