import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';
import { useEffect } from 'react';

export interface NavState {
  selection: string[];
}

/**
 * Naviation
 * The simple version of this app only uses a single route with clientside search params, so we can
 * implement routing using a couple Jotai atoms without the need for a heavier router.
 */
export default function useNavigation() {
  const state = useStore($state);

  // keep search params synced with state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('selected', serializeSelected(state.selection));
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }, [state]);

  return [state, $state.set] as const;
}

function serializeSelected(selected: string[]) {
  return selected.join(',');
}

function deserializeSelected(selected: string) {
  return selected.split(',');
}

const rawParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
const parsed: NavState = {
  selection: deserializeSelected(rawParams.get('selected') || ''),
};

const $state = atom(parsed);
