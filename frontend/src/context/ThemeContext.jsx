import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("reduced-motion") === "true");

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    localStorage.setItem("reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  const value = useMemo(() => ({ reducedMotion, setReducedMotion }), [reducedMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}