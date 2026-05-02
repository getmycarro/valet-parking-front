import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

export interface ThemeToggle {
  mounted: boolean;
  isDark: boolean;
  toggle: () => void;
}

export function useThemeToggle(): ThemeToggle {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { mounted, isDark: theme === "dark", toggle };
}
