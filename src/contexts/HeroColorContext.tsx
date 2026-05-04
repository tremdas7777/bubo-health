import { createContext, useContext, useState, useCallback } from "react";

interface HeroColorContextType {
  barColor: string;
  setBarColor: (color: string) => void;
}

const HeroColorContext = createContext<HeroColorContextType>({
  barColor: "#4c1d95",
  setBarColor: () => {},
});

export function HeroColorProvider({ children }: { children: React.ReactNode }) {
  const [barColor, setBarColor] = useState("#4c1d95");
  const set = useCallback((c: string) => setBarColor(c), []);
  return (
    <HeroColorContext.Provider value={{ barColor, color: barColor, setBarColor: set } as any}>
      {children}
    </HeroColorContext.Provider>
  );
}

export function useHeroColor() {
  return useContext(HeroColorContext);
}
