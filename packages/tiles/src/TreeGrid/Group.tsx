import { TriangleRight } from '@terrazzo/icons';
import clsx from 'clsx';
import { type ComponentProps, type ReactNode, createContext, useContext, useEffect } from 'react';
import { Context } from './Root.js';

export interface GroupProps extends Omit<ComponentProps<'tr'>, 'name'> {
  /** Visible name of this group */
  name?: ReactNode;
  /**
   * Unique ID for this group
   * ⚠️ must not conflict with any of its items, or parent groups!
   */
  id: string;
  actions?: ReactNode;
}

/** Increase the level every time TreeGrid.Group is nested */
export const NestedContext = createContext({
  level: 1,
  isParentExpanded: true,
  parentID: '$root',
});

export default function Group({ children, className, id, name, actions, ...rest }: GroupProps) {
  const { expanded, selected, registerID } = useContext(Context);
  const { level, isParentExpanded, parentID } = useContext(NestedContext);

  const isSelfExpanded = expanded.has(id);

  useEffect(() => {
    registerID(parentID, id);
  }, [parentID, id]);

  return (
    <>
      <tr
        id={id}
        {...rest}
        className={clsx('tz-treegrid-group', className)}
        aria-level={level}
        aria-expanded={isSelfExpanded}
        aria-selected={selected.has(id)}
        data-treegrid-group
        hidden={!isParentExpanded || undefined}
      >
        <th scope='row' tabIndex={0} className='tz-treegrid-group-name'>
          <TriangleRight className='tz-treegrid-caret' data-expanded={isSelfExpanded || undefined} />
          {name}
        </th>
        <td>{actions}</td>
      </tr>
      <NestedContext.Provider
        value={{
          level: level + 1,
          isParentExpanded: isParentExpanded ? isSelfExpanded : isParentExpanded,
          parentID: id,
        }}
      >
        {children}
      </NestedContext.Provider>
    </>
  );
}
