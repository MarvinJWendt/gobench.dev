"use client";

import { ChartSpline } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useCurveType } from "@/components/benchmark/curve-type-context";

export function CurveTypeToggle() {
  const { curveType, setCurveType } = useCurveType();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="ml-auto flex items-center gap-1.5">
          <ChartSpline className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={curveType === "monotone"}
            onCheckedChange={(checked) =>
              setCurveType(checked ? "monotone" : "linear")
            }
            size="sm"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Toggle between sharp and smooth lines</TooltipContent>
    </Tooltip>
  );
}
