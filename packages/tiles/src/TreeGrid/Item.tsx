import clsx from 'clsx';
import { type ComponentProps, type ReactNode, useContext, useEffect } from 'react';
import { NestedContext } from './Group.js';
import { Context } from './Root.js';

export interface ItemProps extends Omit<ComponentProps<'tr'>, 'children'> {
  /** Visible name of this item */
  name?: ReactNode;
  /**
   * Unique ID for this item
   * ⚠️ must not conflict with any other items, or any parent groups!
   */
  id: string;
  actions?: ReactNode;
  children?: never;
}

export default function Item({ className, actions, id, name, ...rest }: ItemProps) {
  const { selected, registerID } = useContext(Context);
  const { level, isParentExpanded, parentID } = useContext(NestedContext);

  useEffect(() => {
    registerID(parentID, id);
  }, [parentID, id]);

  return (
    <tr
      {...rest}
      id={id}
      className={clsx('tz-treegrid-item', className)}
      aria-level={level}
      aria-selected={selected.has(id)}
      data-treegrid-item
      hidden={!isParentExpanded || undefined}
    >
      <th scope='row' className='tz-treegrid-item-name' tabIndex={0}>
        {name}
      </th>
      <td className='tz-treegrid-actions'>{actions}</td>
    </tr>
  );
}
