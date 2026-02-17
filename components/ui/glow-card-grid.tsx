"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GlowCardGridProps {
  children: React.ReactNode;
  className?: string;
}

// Tracks mouse position across all child GlowCards and toggles the shared hover state.
export function GlowCardGrid({ children, className }: GlowCardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards =
        container.querySelectorAll<HTMLElement>("[data-glow-card]");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
      });
    };

    const handleMouseEnter = () =>
      container.setAttribute("data-glow-active", "");
    const handleMouseLeave = () =>
      container.removeAttribute("data-glow-active");

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

// Card with a dual-layer radial glow: an outer border glow (all cards) and
// an inner surface glow (hovered card only).
export function GlowCard({ children, className }: GlowCardProps) {
  return (
    <div data-glow-card className={cn("glow-card", className)}>
      {/* Outer glow — follows mouse on ALL cards, visible through 1px border gap */}
      <div className="glow-card-border" />

      {/* Inner content, inset by 1px to reveal the border glow behind it */}
      <div className="glow-card-inner">
        {/* Inner glow — follows mouse only on the hovered card */}
        <div className="glow-card-glow" />

        {/* Card content */}
        <div className="glow-card-content flex flex-col gap-6 py-6 text-card-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
