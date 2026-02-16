"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface BehaviorContextValue {
  /** Currently active behavior name, or "combined" for the combined view. */
  behavior: string;
  setBehavior: (b: string) => void;
  /** All distinct behavior names (e.g., ["read", "write"]). */
  behaviors: string[];
}

const BehaviorContext = createContext<BehaviorContextValue | null>(null);

interface BehaviorProviderProps {
  behaviors: string[];
  children: ReactNode;
}

export function BehaviorProvider({ behaviors, children }: BehaviorProviderProps) {
  const [behavior, setBehavior] = useState("combined");

  return (
    <BehaviorContext.Provider value={{ behavior, setBehavior, behaviors }}>
      {children}
    </BehaviorContext.Provider>
  );
}

/** Returns the behavior context, or null if outside a BehaviorProvider (standard benchmarks). */
export function useBehavior(): BehaviorContextValue | null {
  return useContext(BehaviorContext);
}
