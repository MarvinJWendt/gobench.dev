import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/benchmark-utils";

interface SummaryCardProps {
  fastest: string;
  slowest: string;
}

export function SummaryCard({ fastest, slowest }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        {/* Fastest */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/10">
            <Trophy className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fastest</p>
            <a
              href={`#${slugify(fastest)}`}
              className="font-semibold text-green-400 link-underline"
            >
              {fastest}
            </a>
          </div>
        </div>

        {/* Slowest */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slowest</p>
            <a
              href={`#${slugify(slowest)}`}
              className="font-semibold text-destructive link-underline"
            >
              {slowest}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
