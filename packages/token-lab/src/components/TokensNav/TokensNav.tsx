import { MagnifyingGlass, TokenIcon } from '@terrazzo/icons';
import { TreeGrid } from '@terrazzo/tiles';
import { useState } from 'react';
import useTokens from '../../hooks/tokens.js';
import useNavigation from '../../hooks/navigation.js';
import c from './TokensNav.module.css';

export default function TokensNav() {
  const [search, setSearch] = useState(''); // TODO: search param

  // Note: "tokens" is a string that is allowed to be invalid / in a mid-edit state.
  // The parse result is guaranteed to be the latest, valid parse result without
  // errors (though during initial load, it will be an empty object)
  const { tokens, parseResult, parseError } = useTokens();
  const [navState, setNavState] = useNavigation();

  if (!parseResult.tokens) {
    return <div className={c.error}>{parseError ? String(parseError) : 'There was an error parsing tokens.json'}</div>;
  }

  return (
    <div className={c.container}>
      <MagnifyingGlass className={c.searchIcon} color='var(--tz-color-text-3)' />
      <input
        className={c.search}
        type='search'
        onKeyUp={(ev) => {
          setSearch(ev.currentTarget.value);
        }}
      />
      <TreeGrid.Root
        className={c.tree}
        defaultExpanded={navState.selection}
        defaultSelected={navState.selection}
        onSelectItems={(ids) => {
          setNavState({ selection: ids });
        }}
      >
        <TokensNavLevel data={JSON.parse(tokens)} search={search.toLowerCase()} />
      </TreeGrid.Root>
    </div>
  );
}

function TokensNavLevel({ path = [], data, search }: { path?: string[]; data: unknown; search?: string }) {
  const { parseResult } = useTokens();

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  return Object.entries(data).map(([k, v]) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      return null;
    }
    const id = [...path, k].join('.');

    // token
    if ('$value' in v) {
      // filter out non-matching tokens
      // TODO: filter out empty groups?
      const isFiltered = search && !id.toLowerCase().includes(search);
      const { $type } = parseResult.tokens[id] ?? {};
      return (
        <TreeGrid.Item key={k} id={id} hidden={isFiltered}>
          <>
            <TokenIcon type={$type} className={c.tokenIcon} />
            {k}
          </>
        </TreeGrid.Item>
      );
    }
    // group
    return (
      <TreeGrid.Group key={k} id={id} name={k}>
        <TokensNavLevel path={[...path, k]} data={v} search={search} />
      </TreeGrid.Group>
    );
  });
}
