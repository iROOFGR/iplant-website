import Image from "next/image";
import type { Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { RevealImage } from "@/components/ui/RevealImage";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { LoopVideo } from "@/components/ui/LoopVideo";

type Props = { locale: Locale; content: Content };

/**
 * Note on widths: `ch` resolves against the *element's own* font-size, so a
 * cap like max-w-[24ch] belongs on the heading itself. Put it on a wrapper
 * div and it silently measures against 16px body text, collapsing a display
 * heading into a narrow column jammed against the inline start.
 */

function Cta({
  href,
  label,
  locale,
  external,
  variant = "solid",
}: {
  href: string;
  label: string;
  locale: Locale;
  external?: boolean;
  variant?: "solid" | "outline" | "aqua";
}) {
  const styles = {
    solid: "bg-forest text-paper hover:bg-forest-light",
    outline: "border border-current hover:border-forest hover:text-forest",
    aqua: "bg-aqua text-ink",
  }[variant];

  return (
    <MagneticLink
      href={resolveHref(href, locale)}
      external={external}
      className={`btn ${styles}`}
    >
      {label}
    </MagneticLink>
  );
}

/* ------------------------------------------------------------------ FaaS */

export function FaasSection({ locale, content }: Props) {
  const faas = content.faas;
  return (
    <Section tone="sand" id="faas" labelledBy="faas-heading">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <Eyebrow>{faas.eyebrow}</Eyebrow>
          <AnimatedText
            as="h2"
            id="faas-heading"
            text={faas.headline}
            className="h1 mt-4 block max-w-[13ch]"
          />
          <Reveal>
            <p className="lead measure mt-6 text-ink/75">{faas.description}</p>
            <p className="h2 mt-8 text-forest">
              <bdi>{faas.price}</bdi>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta href={faas.primaryCta.href} label={faas.primaryCta.label} locale={locale} />
              <Cta
                href={faas.secondaryCta.href}
                label={faas.secondaryCta.label}
                locale={locale}
                variant="outline"
              />
            </div>
            <p className="mt-6 text-sm text-ink/55">{faas.pricingNote}</p>
          </Reveal>
        </div>

        <div>
          {/* Portrait footage shot inside a running HUG. A static product
              photo told you what the unit looks like; this shows it working,
              which is what "fully managed" actually has to sell. */}
          <div className="grain relative aspect-[478/850] max-h-[68vh] overflow-hidden rounded-sm">
            <LoopVideo
              src={faas.video}
              webm={faas.videoWebm}
              poster={faas.poster}
              className="size-full object-cover"
            />
          </div>
          <Reveal as="ul" className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {faas.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink/80">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-forest" aria-hidden="true" />
                {item}
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- iRoof */

export function IroofSection({ locale, content }: Props) {
  const iroof = content.iroof;
  return (
    // The brightest point on the page. After a near-black hero and a warm
    // middle, iRoof opens into real daylight — that swing is the page's
    // main structural rhythm.
    <section
      id="iroof"
      aria-labelledby="iroof-heading"
      className="bg-paper-warm text-ink"
    >
      {/* Full-bleed video band. The tray footage runs edge to edge as the
          backdrop rather than sitting in a box, and the still photograph
          overlaps its lower edge so the two read as one composition. */}
      <div className="relative">
        <div className="grain relative h-[62vh] min-h-[420px] w-full overflow-hidden md:h-[78vh]">
          <LoopVideo
            src={iroof.video}
            webm={iroof.videoWebm}
            poster={iroof.poster}
            className="size-full object-cover"
          />
          {/* Two light washes instead of one heavy overlay: a horizontal
              one that gives the dark headline something to sit on, and a
              soft vertical fade that blends the band into the section.
              The middle of the frame stays clear so the footage reads. */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-paper-warm via-paper-warm/55 to-transparent rtl:bg-gradient-to-l"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-paper-warm/70 via-transparent to-paper-warm"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
              <AnimatedText
                as="h2"
                id="iroof-heading"
                text={iroof.headline}
                className="display block max-w-[13ch] text-ink drop-shadow-[0_2px_18px_rgba(250,248,244,0.55)]"
                accentWords={2}
                accentClassName="text-forest"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 pb-20 md:pb-28 lg:grid-cols-[1.05fr_1fr] lg:items-end">
            {/* Lifted up over the video band to create the overlap. */}
            <RevealImage
              src={iroof.image}
              className="grain -mt-16 aspect-3/2 rounded-sm shadow-2xl md:-mt-28"
              sizes="(max-width: 1024px) 100vw, 52vw"
            />
            <Reveal className="pt-4">
              <p className="lead measure text-ink/75">{iroof.description}</p>
              <div className="mt-8">
                <Cta href={iroof.cta.href} label={iroof.cta.label} locale={locale} external />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Consultation */

export function ConsultationSection({ locale, content }: Props) {
  const consultation = content.consultation;
  const [primary, ...supporting] = consultation.images;

  return (
    <Section tone="forest" id="consultation" labelledBy="consultation-heading">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          {/* Three separate images, never merged into a collage. */}
          {primary && (
            <RevealImage
              src={primary.src}
              alt={primary.alt}
              className="grain aspect-3/2 rounded-sm"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {supporting.map((image) => (
              <RevealImage
                key={image.src}
                src={image.src}
                alt={image.alt}
                className="grain aspect-4/3 rounded-sm"
                sizes="(max-width: 1024px) 50vw, 25vw"
                parallax={5}
              />
            ))}
          </div>
        </div>

        <div>
          <Eyebrow className="text-paper">{consultation.eyebrow}</Eyebrow>
          <AnimatedText
            as="h2"
            id="consultation-heading"
            text={consultation.headline}
            className="h1 mt-4 block max-w-[14ch] text-paper"
          />
          <Reveal>
            <p className="lead measure mt-6 text-paper/75">{consultation.description}</p>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {consultation.services.map((service) => (
                <li key={service} className="flex items-start gap-3 text-paper/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aqua" aria-hidden="true" />
                  {service}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Cta
                href={consultation.cta.href}
                label={consultation.cta.label}
                locale={locale}
                variant="aqua"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- Virtual Farm */

export function VirtualFarmInvite({ locale, content }: Props) {
  const vf = content.virtualFarm;
  return (
    <Section tone="paper" labelledBy="vf-heading">
      <div className="mx-auto max-w-4xl text-center">
        <Eyebrow className="mx-auto">{vf.eyebrow}</Eyebrow>
        <AnimatedText as="h2" id="vf-heading" text={vf.headline} className="display mt-4 block" />
        <Reveal>
          <p className="lead mx-auto mt-6 max-w-[52ch] text-ink/75">{vf.description}</p>
          <div className="mt-9 flex justify-center">
            <Cta href={vf.cta.href} label={vf.cta.label} locale={locale} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ About band */

export function AboutBand({ locale, content }: Props) {
  const about = content.aboutBand;
  return (
    <section aria-labelledby="about-heading" className="relative isolate bg-ink text-paper">
      <div className="grain absolute inset-0" aria-hidden="true">
        <Image src={about.image} alt="" fill sizes="100vw" className="object-cover opacity-30" />
      </div>
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <AnimatedText
          as="h2"
          id="about-heading"
          text={about.headline}
          className="h1 block max-w-[16ch]"
        />
        <Reveal>
          <p className="lead measure mt-6 text-paper/80">{about.description}</p>
          <div className="mt-8">
            <MagneticLink
              href={resolveHref(about.cta.href, locale)}
              className="inline-block btn border border-paper/35 text-paper hover:border-aqua hover:text-aqua"
            >
              {about.cta.label}
            </MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Final CTA */

export function FinalCta({ locale, content }: Props) {
  const cta = content.finalCta;
  return (
    <Section tone="ink" labelledBy="final-heading">
      <AnimatedText
        as="h2"
        id="final-heading"
        text={cta.headline}
        className="display block max-w-[15ch]"
      />
      <Reveal>
        <p className="lead measure mt-6 text-paper/75">{cta.description}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <MagneticLink
            href={resolveHref(cta.primaryCta.href, locale)}
            className="btn bg-aqua text-ink"
          >
            {cta.primaryCta.label}
          </MagneticLink>
          <MagneticLink
            href={resolveHref(cta.secondaryCta.href, locale)}
            external
            className="inline-block btn border border-paper/35 text-paper hover:border-aqua hover:text-aqua"
          >
            {cta.secondaryCta.label}
          </MagneticLink>
        </div>
      </Reveal>
    </Section>
  );
}
