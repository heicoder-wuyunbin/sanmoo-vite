import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'sanmoo-blog-theme';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (next: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const [localTheme] = useState<ThemeMode>(readInitialTheme);
    return {
      theme: localTheme,
      isDark: localTheme === 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
};

export default useTheme;
