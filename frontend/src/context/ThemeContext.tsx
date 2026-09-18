/**
 * @fileoverview Contexto de tema (claro/oscuro). Persiste la preferencia
 * en localStorage y provee el algoritmo de tema de Ant Design.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { theme } from 'antd';

/** Tipo del contexto de tema. */
interface ThemeContextType {
  /** Algoritmo de tema de Ant Design (defaultAlgorithm o darkAlgorithm). */
  algorithm: any;
  /** Indica si el tema oscuro está activo. */
  isDark: boolean;
  /** Alterna entre tema claro y oscuro. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  algorithm: theme.defaultAlgorithm,
  isDark: false,
  toggleTheme: () => {},
});

/** Proveedor del contexto de tema. Persiste la selección en localStorage. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return (
    <ThemeContext.Provider value={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook para acceder al contexto de tema. */
export const useTheme = () => useContext(ThemeContext);
