"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type CurveType = "monotone" | "linear";

interface CurveTypeContextValue {
  curveType: CurveType;
  setCurveType: (t: CurveType) => void;
}

const CurveTypeContext = createContext<CurveTypeContextValue | null>(null);

export function CurveTypeProvider({ children }: { children: ReactNode }) {
  const [curveType, setCurveType] = useState<CurveType>("monotone");

  return (
    <CurveTypeContext.Provider value={{ curveType, setCurveType }}>
      {children}
    </CurveTypeContext.Provider>
  );
}

/** Returns the curve type context. Throws if used outside a CurveTypeProvider. */
export function useCurveType(): CurveTypeContextValue {
  const ctx = useContext(CurveTypeContext);
  if (!ctx)
    throw new Error("useCurveType must be used within a CurveTypeProvider");
  return ctx;
}
