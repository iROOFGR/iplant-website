import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Section";

/**
 * Inner-page opening. Deliberately quieter than the homepage hero — the
 * cinematic treatment is spent once, on the homepage, and never repeated.
 */
export function PageHero({
  eyebrow,
  headline,
  intro,
  image,
  backHref,
  backLabel,
}: {
  eyebrow?: string;
  headline: string;
  intro?: string;
  image?: string;
  /** Renders a return link. Detail pages are otherwise a dead end. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="relative isolate bg-ink text-paper">
      {image && (
        <div className="grain absolute inset-0" aria-hidden="true">
          <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        </div>
      )}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="eyebrow group inline-flex items-center gap-2 text-paper/80 transition-colors hover:text-aqua"
          >
            {/* Mirrors under RTL, where "back" points the other way. */}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
            >
              ←
            </span>
            {backLabel}
          </Link>
        ) : (
          eyebrow && <Eyebrow>{eyebrow}</Eyebrow>
        )}
        <h1 className="h1 mt-4 max-w-[20ch]">{headline}</h1>
        {intro && <p className="lead measure mt-6 text-paper/88">{intro}</p>}
      </div>
    </header>
  );
}
