"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";
import { Eyebrow, Section } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { prefersReducedData, prefersReducedMotion } from "@/lib/gsap";

function startMotion(event: React.SyntheticEvent<HTMLElement>) {
  const video = event.currentTarget.querySelector("video");
  if (!video || prefersReducedMotion() || prefersReducedData()) return;
  if (video.preload !== "auto") {
    video.preload = "auto";
    video.load();
  }
  void video.play().catch(() => {});
}

function stopMotion(event: React.SyntheticEvent<HTMLElement>) {
  const video = event.currentTarget.querySelector("video");
  if (!video) return;
  video.pause();
  video.currentTime = 0;
}

function SystemCard({
  item,
  locale,
}: {
  item: Content["systems"]["items"][number];
  locale: Locale;
}) {
  const hasVideo = "video" in item && Boolean(item.video);
  const href = resolveHref(item.href, locale);

  return (
    <article
      className="group overflow-hidden rounded-sm border border-paper/10 bg-ink-soft"
      onMouseEnter={startMotion}
      onFocus={startMotion}
      onMouseLeave={stopMotion}
      onBlur={stopMotion}
    >
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.035] group-focus-within:scale-[1.035]"
        />
        {hasVideo ? (
          <video
            poster={("poster" in item && item.poster) || item.image}
            preload="none"
            muted
            loop
            playsInline
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <source src={("video" in item && item.video) || ""} type="video/mp4" />
          </video>
        ) : null}
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/18 to-transparent" aria-hidden="true" />
        <span className="absolute inset-x-0 bottom-0 block p-5 md:p-7">
          <span className="h3 block text-paper">{item.title}</span>
          {"fullName" in item && item.fullName ? <span className="mt-1 block text-sm text-paper/58">{item.fullName}</span> : null}
        </span>
      </Link>

      <div className="p-5 pt-5 md:p-7">
        <p className="measure text-paper/72">{item.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((tag) => <li key={tag} className="rounded-full border border-paper/14 px-3 py-1.5 text-xs text-paper/62">{tag}</li>)}
        </ul>
        <Link href={href} className="mt-6 inline-flex items-center gap-2 font-medium text-aqua">
          {item.title}<span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export function SystemsGrid({ locale, content }: { locale: Locale; content: Content }) {
  return (
    <Section tone="ink" id="systems" labelledBy="systems-heading">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div>
          <Eyebrow>{content.systems.eyebrow}</Eyebrow>
          <AnimatedText as="h2" id="systems-heading" text={content.systems.heading} className="h1 mt-4 block max-w-[21ch] text-paper" />
        </div>
        <p className="lead max-w-[45ch] text-paper/62 lg:justify-self-end">{content.systems.benefitsHeading}</p>
      </div>

      {/* The new turn-on film belongs to the systems story rather than forming
          another standalone homepage chapter. */}
      {/* `aspect-ratio` plus `min-height` makes the ratio drive the WIDTH once
          the minimum kicks in: 250px tall at 16/6 forces 667px wide, which
          overflowed the viewport on phones. Width is pinned first, and the
          height floor only applies from md up where there is room for it. */}
      <div className="grain relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-sm sm:aspect-[16/7] md:mt-12 md:aspect-[16/6] md:min-h-[330px]">
        <LoopVideo
          src="/media/systems/turn-on.mp4"
          webm="/media/systems/turn-on.webm"
          poster="/media/systems/turn-on-poster.webp"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/10 to-ink/25" aria-hidden="true" />
        <p className="absolute bottom-5 start-5 max-w-[18ch] text-[clamp(1.35rem,2.4vw,2.35rem)] font-semibold leading-tight text-paper md:bottom-8 md:start-8">
          {locale === "ar" ? "من هيكل هادئ إلى نظام حيّ ومنتج." : "From quiet structure to living production."}
        </p>
      </div>

      <ul className="mt-5 grid gap-px overflow-hidden rounded-sm border border-paper/10 bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
        {content.systems.benefits.map((benefit) => (
          <li key={benefit.title} className="bg-ink px-5 py-6 md:px-6">
            <h3 className="text-[1.02rem] font-semibold text-paper">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-paper/58">{benefit.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {content.systems.items.map((item) => (
          <SystemCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </Section>
  );
}
