'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type FontSize = 'small' | 'normal' | 'large' | 'x-large';

interface SettingsContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const STORAGE_KEY = 'ltp_font_size';
const VALID_SIZES: FontSize[] = ['small', 'normal', 'large', 'x-large'];

const SettingsContext = createContext<SettingsContextValue>({
  fontSize: 'normal',
  setFontSize: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (stored && VALID_SIZES.includes(stored)) {
      setFontSizeState(stored);
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
    if (size === 'normal') {
      document.documentElement.removeAttribute('data-font-size');
    } else {
      document.documentElement.setAttribute('data-font-size', size);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
