import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Resolves the effective theme ('light' | 'dark') from the stored preference.
 * When preference is 'system', defers to the OS color scheme.
 */
function resolveTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Applies or removes the 'dark' class on <html> based on the resolved theme.
 */
function applyTheme(preference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }) {
  // Initialize synchronously from localStorage to match the inline script in index.html.
  // Falls back to 'system' so new users automatically follow their OS preference.
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('tracksy_theme') || 'system';
  });

  // Apply theme whenever the preference changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('tracksy_theme', theme);
  }, [theme]);

  // When theme is 'system', listen for OS preference changes and re-apply
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  /**
   * Cycles: light → dark → system → light
   * Exposed for the simple toggle button in the header.
   */
  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  /**
   * Directly set the theme preference to 'light', 'dark', or 'system'.
   */
  const setTheme = useCallback((value) => {
    if (!['light', 'dark', 'system'].includes(value)) {
      console.warn(`ThemeContext: invalid theme value "${value}". Use 'light', 'dark', or 'system'.`);
      return;
    }
    setThemeState(value);
  }, []);

  // The resolved theme is useful for components that need to know the actual
  // applied theme (e.g. to render the correct icon in ThemeToggle).
  const resolvedTheme = resolveTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
