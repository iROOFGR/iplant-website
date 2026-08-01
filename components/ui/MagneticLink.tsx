"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

/**
 * Button that leans toward the cursor. Pointer-driven only — disabled on
 * coarse pointers, where there is no cursor to lean toward, and under
 * reduced motion.
 *
 * `x`/`y` are physical, but this offset is relative to the cursor's own
 * position, so it is correct in both directions without a dirSign.
 */
export function MagneticLink({
  href,
  children,
  className = "",
  external = false,
  strength = 0.32,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const canMagnetise = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || !canMagnetise()) return;
    registerGsap();
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      x: (event.clientX - rect.left - rect.width / 2) * strength,
      y: (event.clientY - rect.top - rect.height / 2) * strength,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  const props = {
    ref,
    className,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
