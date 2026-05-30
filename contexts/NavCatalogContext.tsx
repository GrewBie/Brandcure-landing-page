"use client";

import type { NavItem } from "@/types/navigator";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NavCatalogContextValue = {
  /** Current page's voice-navigable items (set by RegisterNavCatalog). */
  catalog: NavItem[];
  setCatalog: (items: NavItem[]) => void;
  /** Increments whenever something asks to open the voice orb (e.g. chat). */
  voiceRequestId: number;
  requestVoice: () => void;
};

const NavCatalogContext = createContext<NavCatalogContextValue | null>(null);

export function NavCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<NavItem[]>([]);
  const [voiceRequestId, setVoiceRequestId] = useState(0);

  const requestVoice = useCallback(() => {
    setVoiceRequestId((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ catalog, setCatalog, voiceRequestId, requestVoice }),
    [catalog, voiceRequestId, requestVoice],
  );

  return (
    <NavCatalogContext.Provider value={value}>
      {children}
    </NavCatalogContext.Provider>
  );
}

export function useNavCatalog() {
  const ctx = useContext(NavCatalogContext);
  if (!ctx) {
    throw new Error("useNavCatalog must be used within NavCatalogProvider");
  }
  return ctx;
}
