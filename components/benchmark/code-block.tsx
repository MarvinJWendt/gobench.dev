"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Code } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CodeBlockProps {
  /** Pre-rendered HTML from Shiki */
  highlightedHtml: string;
  title?: string;
}

export function CodeBlock({
  highlightedHtml,
  title = "Source Code",
}: CodeBlockProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Code className="h-4 w-4" />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="mt-2 overflow-x-auto rounded-lg border bg-[#1e1e2e] text-sm [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
