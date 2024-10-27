import type { ColorValueNormalized } from '@terrazzo/token-tools';
import useColor from '@terrazzo/use-color';
import c from './EditableColorToken.module.css';

export interface EditableColorTokenProps {
  id: string;
  mode?: string;
  value: ColorValueNormalized;
}

export default function EditableColorToken({ id, mode = '.', value }: EditableColorTokenProps) {
  const [color] = useColor(value);

  return (
    <button className={c.btn} type='button' aria-label={`Edit ${id}`}>
      <div className={c.swatch} style={{ '--color': color.css }} />
    </button>
  );
}
