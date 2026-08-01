import type { Content } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A deliberate break in the page's rhythm.
 *
 * Every other section runs eyebrow → headline → copy → CTA. This one has no
 * headline and no call to action: four facts, set large, and nothing to click.
 * It reads as a pause after the case studies rather than another pitch — which
 * is the point, because these are the claims a client checks rather than reads.
 *
 * No revenue figures here by decision: validation and deployment only.
 */
export function CredibilityStrip({ content }: { content: Content }) {
  const { eyebrow, items } = content.credibility;

  return (
    <section aria-labelledby="credibility-heading" className="bg-forest text-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
        <h2 id="credibility-heading" className="eyebrow text-aqua">
          {eyebrow}
        </h2>

        <Reveal as="ul" className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.value} className="border-t border-line-dark pt-5">
              <p className="h3 text-paper">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/65">{item.label}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
