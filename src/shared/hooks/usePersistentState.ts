import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * A useState that loads its initial value from localStorage once and
 * persists every change back to it. Not wired into AppContext/FinanceContext
 * yet (they predate this hook and are already tested) — available for
 * future modules so the load/parse/persist boilerplate isn't rewritten
 * every time.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw));
    } catch (e) {
      console.error(`Failed to load persisted state for "${key}"`, e);
    } finally {
      setLoaded(true);
    }
    // Only re-run if the key itself changes; loading is a one-time effect per key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state, loaded]);

  return [state, setState];
}
