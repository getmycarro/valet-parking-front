import { useEffect, useState } from 'react';

/**
 * Theme hook — toggles `dark` class on <html>, persists in localStorage.
 * Fixes the previous bug where clicking the toggle didn't change colors
 * by making the source of truth React state synced with the DOM class.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('gmc-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('gmc-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return { theme, isDark: theme === 'dark', toggle, setTheme };
}
