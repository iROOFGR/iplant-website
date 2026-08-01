import type { ReactNode } from "react";

const TONES = {
  paper: "bg-paper text-ink",
  warm: "bg-paper-warm text-ink",
  sand: "bg-sand-soft text-ink",
  ink: "bg-ink text-paper",
  forest: "bg-forest text-paper",
} as const;

export type Tone = keyof typeof TONES;

/**
 * Section shell. `tone` drives the page's value curve: the hero is near-black,
 * the middle warms through sand and paper, iRoof is the brightest point, and
 * the closing call to action returns to ink.
 */
export function Section({
  children,
  tone = "paper",
  className = "",
  id,
  labelledBy,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONES[tone]} ${className}`}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow opacity-75 ${className}`}>{children}</p>;
}
