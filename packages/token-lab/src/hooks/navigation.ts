import { useLayoutEffect, useState, type Dispatch, type SetStateAction } from 'react';

export interface NavState {
  selected: string[];
}

/**
 * Naviation
 * The simple version of this app only uses a single route with clientside search params, so we can
 * implement routing using a couple Jotai atoms without the need for a heavier router.
 */
export default function useNavigation(): [NavState, Dispatch<SetStateAction<NavState>>] {
  const [navState, setNavState] = useState<NavState>(
    typeof window !== 'undefined'
      ? { selected: deserializeSelected(new URLSearchParams(window.location.search).get('selected')) }
      : { selected: [] },
  );

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const search = new URLSearchParams(window.location.search);
    search.set('selected', serializeSelected(navState.selected));
  }, [serializeSelected(navState.selected)]);

  return [navState, setNavState];
}

function serializeSelected(selected: string[]): string {
  return selected.join(',');
}

function deserializeSelected(selected: string | null): string[] {
  return selected?.split(',') ?? [];
}
