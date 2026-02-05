import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from '@terrazzo/icons';
import ColorPicker, { COLOR_PICKER_SPACES } from '@terrazzo/react-color-picker';
import { Select, SelectItem } from '@terrazzo/tiles';
import type { ColorValueNormalized } from '@terrazzo/token-tools';
import useColor from '@terrazzo/use-color';
import c from './EditableColorToken.module.css';

export interface EditableColorTokenProps {
  id: string;
  mode?: string;
  value: ColorValueNormalized;
}

export default function EditableColorToken({ id, value }: EditableColorTokenProps) {
  const [color, setColor] = useColor(value);

  return (
    <div className={c.container}>
      <Popover.Root>
        <Popover.Trigger className={c.swatch} aria-label={`Edit ${id}`} style={{ '--color': color.css }} />
        <Popover.Portal>
          <Popover.Content className={c.popover}>
            <ColorPicker color={color} setColor={setColor} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className={c.components}>
        <Select
          className={c.colorSpaceDropdown}
          value={color.original.space.id}
          trigger={color.original.space.id}
          triggerIcon={<ChevronDown />}
          onValueChange={(space) => setColor(color[space as keyof typeof color] ?? color.original)}
        >
          {Object.entries(COLOR_PICKER_SPACES).map(([id, label]) => (
            <SelectItem className={c.colorSpaceDropdownItem} key={id} value={id}>
              {label}
            </SelectItem>
          ))}
        </Select>
        {color.original.coords.map((v, i) => (
          <output className={c.channel} key={i}>
            {trimTrailingZeros(String(v).slice(0, 6))}
          </output>
        ))}
      </div>
      <output className={c.alpha}>{trimTrailingZeros(String(color.original.alpha ?? 1 * 100).slice(0, 6))}%</output>
    </div>
  );
}

function trimTrailingZeros(value: string) {
  return value.replace(/\.0+$/, '').replace(/(?<=\.[^.]+)0+$/, '');
}
