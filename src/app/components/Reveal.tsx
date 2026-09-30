"use client";

import { useReveal } from "../hooks/useReveal";
import type { ReactNode, ElementType, CSSProperties } from "react";

type Variant =
  | "fade-up"
  | "fade-down"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "zoom-in";

type Props = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;      // en ms
  duration?: number;   // en ms
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
};

const variants: Record<Variant, string> = {
  "fade-up": "translate-y-10 opacity-0",
  "fade-down": "-translate-y-10 opacity-0",
  "fade-in": "opacity-0",
  "slide-left": "-translate-x-12 opacity-0",
  "slide-right": "translate-x-12 opacity-0",
  "zoom-in": "scale-95 opacity-0",
};

export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  className = "",
  as: Component = "div",
  style,
}: Props) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <Component
      ref={ref}
      className={`transform-gpu transition-all ease-out will-change-transform ${
        isVisible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : variants[variant]
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}