import { createContext, useContext, type ReactNode } from 'react';
import { theme } from 'antd';

interface ThemeContextType {
  algorithm: any;
}

const ThemeContext = createContext<ThemeContextType>({
  algorithm: theme.defaultAlgorithm,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ algorithm: theme.defaultAlgorithm }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
