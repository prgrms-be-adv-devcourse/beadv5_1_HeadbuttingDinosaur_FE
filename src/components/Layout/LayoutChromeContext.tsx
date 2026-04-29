import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Source: docs/redesign/layout.plan.md §3-2.
 *
 * `paletteOpen` is exposed on top of the §3-2 listed members so the consumer
 * (Layout) can wire it into <CommandPalette open={…} onClose={…} /> per §3-13
 * without lifting the state outside the provider.
 */
export interface ChromeContextValue {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  toggleTheme: () => void;
  logout: () => void;
  focusSearch: () => void;
  registerSearchInput: (el: HTMLInputElement | null) => void;
}

export interface LayoutChromeProviderProps {
  children: React.ReactNode;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const LayoutChromeContext = createContext<ChromeContextValue | null>(null);

export function LayoutChromeProvider({
  children,
  onToggleTheme,
  onLogout,
}: LayoutChromeProviderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const registerSearchInput = useCallback(
    (el: HTMLInputElement | null) => {
      searchInputRef.current = el;
    },
    [],
  );

  const value = useMemo<ChromeContextValue>(
    () => ({
      paletteOpen,
      openPalette,
      closePalette,
      toggleTheme: onToggleTheme,
      logout: onLogout,
      focusSearch,
      registerSearchInput,
    }),
    [
      paletteOpen,
      openPalette,
      closePalette,
      onToggleTheme,
      onLogout,
      focusSearch,
      registerSearchInput,
    ],
  );

  return (
    <LayoutChromeContext.Provider value={value}>
      {children}
    </LayoutChromeContext.Provider>
  );
}

export function useChrome(): ChromeContextValue {
  const ctx = useContext(LayoutChromeContext);
  if (!ctx) {
    throw new Error('useChrome must be used within a LayoutChromeProvider');
  }
  return ctx;
}
