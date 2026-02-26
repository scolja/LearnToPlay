'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, type Theme } from '@/lib/theme-context';

const themes: { value: Theme; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'light',   label: 'Light' },
  { value: 'dark',    label: 'Dark' },
];

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') {
    return (
      <svg className="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (theme === 'light') {
    return (
      <svg className="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  // Classic — scroll/book icon
  return (
    <svg className="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function OptionIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (theme === 'light') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="theme-toggle" ref={ref}>
      <button
        className="theme-toggle-btn"
        onClick={() => setOpen(!open)}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <ThemeIcon theme={theme} />
      </button>

      {open && (
        <div className="theme-dropdown" role="listbox" aria-label="Theme selection">
          {themes.map(t => (
            <button
              key={t.value}
              className={`theme-option${t.value === theme ? ' active' : ''}`}
              onClick={() => { setTheme(t.value); setOpen(false); }}
              role="option"
              aria-selected={t.value === theme}
            >
              <span className="theme-option-icon">
                <OptionIcon theme={t.value} />
              </span>
              <span className="theme-option-label">{t.label}</span>
              {t.value === theme && (
                <svg className="theme-option-check" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="3"
                     strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
