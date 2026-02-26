'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme, type Theme } from '@/lib/theme-context';
import { useSettings, type FontSize } from '@/lib/settings-context';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'classic',
    label: 'Classic',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

const fontSizes: { value: FontSize; label: string; sampleSize: string }[] = [
  { value: 'small',   label: 'S',  sampleSize: '13px' },
  { value: 'normal',  label: 'A',  sampleSize: '16px' },
  { value: 'large',   label: 'A',  sampleSize: '20px' },
  { value: 'x-large', label: 'A',  sampleSize: '24px' },
];

const DISMISS_THRESHOLD = 0.3; // 30% of panel height

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useSettings();

  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const touchStartY = useRef(0);
  const panelHeight = useRef(0);

  // Animated close — slide down then unmount
  const animateClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDragY(0);
      onClose();
    }, 200);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, animateClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Touch handlers for swipe-to-dismiss
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    if (panelRef.current) {
      panelHeight.current = panelRef.current.offsetHeight;
    }
    setIsDragging(true);
    setDragY(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only allow dragging downward (positive = down)
    setDragY(Math.max(0, dy));
  }, [isDragging]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (panelHeight.current > 0 && dragY / panelHeight.current > DISMISS_THRESHOLD) {
      // Past threshold — dismiss
      animateClose();
    } else {
      // Snap back
      setDragY(0);
    }
  }, [isDragging, dragY, animateClose]);

  if (!open && !closing) return null;

  const panelStyle: React.CSSProperties = {};
  if (isDragging) {
    panelStyle.transform = `translateY(${dragY}px)`;
    panelStyle.transition = 'none';
  } else if (closing) {
    panelStyle.transform = 'translateY(100%)';
    panelStyle.transition = 'transform 0.2s ease-in';
  } else if (dragY > 0) {
    // Snapping back
    panelStyle.transform = 'translateY(0)';
    panelStyle.transition = 'transform 0.2s ease-out';
  }

  return (
    <div
      className={`sd-overlay${closing ? ' sd-closing' : ''}`}
      onClick={animateClose}
    >
      <div
        ref={panelRef}
        className="sd-panel"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="sd-drag-handle">
          <div className="sd-drag-bar" />
        </div>

        {/* Header */}
        <div className="sd-header">
          <h2 className="sd-title">Settings</h2>
          <button className="sd-close" onClick={animateClose} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme */}
        <div className="sd-section">
          <div className="sd-label">Theme</div>
          <div className="sd-segmented">
            {themes.map(t => (
              <button
                key={t.value}
                className={`sd-seg-btn${t.value === theme ? ' sd-seg-active' : ''}`}
                onClick={() => setTheme(t.value)}
              >
                <span className="sd-seg-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="sd-section">
          <div className="sd-label">Font Size</div>
          <div className="sd-segmented">
            {fontSizes.map(s => (
              <button
                key={s.value}
                className={`sd-seg-btn sd-font-btn${s.value === fontSize ? ' sd-seg-active' : ''}`}
                onClick={() => setFontSize(s.value)}
              >
                <span style={{ fontSize: s.sampleSize, lineHeight: 1 }}>{s.label}</span>
              </button>
            ))}
          </div>
          <p className="sd-preview">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>
    </div>
  );
}
