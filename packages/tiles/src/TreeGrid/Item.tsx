import clsx from 'clsx';
import { type ComponentProps, type ReactNode, useContext, useEffect } from 'react';
import { NestedContext } from './Group.js';
import { Context } from './Root.js';

export interface ItemProps extends ComponentProps<'tr'> {
  /**
   * Unique ID for this item
   * ⚠️ must not conflict with any other items, or any parent groups!
   */
  id: string;
  actions?: ReactNode;
  hidden?: boolean;
}

export default function Item({ actions, children, className, hidden, id, ...rest }: ItemProps) {
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
      hidden={!isParentExpanded || hidden || undefined}
    >
      <th scope='row' className='tz-treegrid-item-name' tabIndex={0}>
        {children}
      </th>
      <td className='tz-treegrid-actions'>{actions}</td>
    </tr>
  );
}
