"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface CpuSelectionContextValue {
  /** All available CPU counts, sorted ascending. */
  cpuCounts: number[];
  /** Currently selected CPU counts, sorted ascending. At least one is always selected. */
  selectedCpus: number[];
  /** Replace the full selection. Ignored if the new set is empty. */
  setSelection: (cpus: number[]) => void;
}

const CpuSelectionContext = createContext<CpuSelectionContextValue | null>(null);

interface CpuSelectionProviderProps {
  cpuCounts: number[];
  children: ReactNode;
}

export function CpuSelectionProvider({
  cpuCounts,
  children,
}: CpuSelectionProviderProps) {
  const sorted = [...cpuCounts].sort((a, b) => a - b);

  // Default: min and max CPU counts
  const defaultSelected =
    sorted.length > 1
      ? [sorted[0], sorted[sorted.length - 1]]
      : [...sorted];

  const [selectedCpus, setSelectedCpus] = useState<number[]>(defaultSelected);

  const setSelection = (cpus: number[]) => {
    if (cpus.length === 0) return;
    setSelectedCpus([...cpus].sort((a, b) => a - b));
  };

  return (
    <CpuSelectionContext.Provider
      value={{ cpuCounts: sorted, selectedCpus, setSelection }}
    >
      {children}
    </CpuSelectionContext.Provider>
  );
}

export function useCpuSelection(): CpuSelectionContextValue {
  const ctx = useContext(CpuSelectionContext);
  if (!ctx)
    throw new Error(
      "useCpuSelection must be used within a CpuSelectionProvider",
    );
  return ctx;
}
