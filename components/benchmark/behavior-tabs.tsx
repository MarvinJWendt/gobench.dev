"use client";

import { useBehavior } from "./behavior-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { capitalize } from "@/lib/benchmark-utils";
import { cn } from "@/lib/utils";

interface BehaviorTabsProps {
  className?: string;
}

export function BehaviorTabs({ className }: BehaviorTabsProps) {
  const ctx = useBehavior();
  if (!ctx) return null;

  const { behavior, setBehavior, behaviors } = ctx;

  return (
    <Tabs value={behavior} onValueChange={setBehavior} className={cn(className)}>
      <TabsList>
        <TabsTrigger value="combined">Combined</TabsTrigger>
        {behaviors.map((b) => (
          <TabsTrigger key={b} value={b}>
            {capitalize(b)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
