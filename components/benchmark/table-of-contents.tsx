"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  name: string;
  slug: string;
}

const tocLinkClass =
  "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-5 transition-colors";
const tocDotClass = (active: boolean) =>
  cn(
    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
    active ? "bg-primary" : "bg-muted-foreground/45 group-hover:bg-foreground/70",
  );

function TocLink({
  item,
  activeSlug,
}: {
  item: TocItem;
  activeSlug: string;
}) {
  const active = activeSlug === item.slug;
  return (
    <li key={item.slug}>
      <a
        href={`#${item.slug}`}
        className={cn(
          tocLinkClass,
          active
            ? "text-foreground bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <span className={tocDotClass(active)} />
        <span className="truncate">{item.name}</span>
      </a>
    </li>
  );
}

interface TableOfContentsProps {
  summarySlug: string;
  implementationItems: TocItem[];
  className?: string;
}

export function TableOfContents({
  summarySlug,
  implementationItems,
  className,
}: TableOfContentsProps) {
  const allSlugs = [
    summarySlug,
    ...implementationItems.map((i) => i.slug),
  ];
  const [activeSlug, setActiveSlug] = useState<string>(allSlugs[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const slug of allSlugs) {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [allSlugs.join(",")]);

  const summaryActive = activeSlug === summarySlug;

  return (
    <nav aria-label="On this page" className={cn("w-48", className)}>
      <a
        href={`#${summarySlug}`}
        className={cn(
          "mb-3 inline-block rounded-md px-2 py-1 text-xs font-medium transition-colors",
          summaryActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Performance Comparison
      </a>

      <h3 className="mb-2 pl-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/85">
        Implementations
      </h3>
      <ul className="space-y-1 border-l border-border/70 pl-3">
        {implementationItems.map((item) => (
          <TocLink key={item.slug} item={item} activeSlug={activeSlug} />
        ))}
      </ul>
    </nav>
  );
}

/** Compact inline TOC for mobile screens. */
export function InlineTableOfContents({
  summarySlug,
  implementationItems,
  className,
}: TableOfContentsProps) {
  return (
    <nav className={className}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <a
          href={`#${summarySlug}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Performance Comparison
        </a>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-sm font-semibold text-foreground">
          Implementations
        </span>
        {implementationItems.map((item) => (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
