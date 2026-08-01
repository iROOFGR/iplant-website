import Image from "next/image";
import Link from "next/link";
import { site, type Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";

type SystemKey = "hug" | "greenspin" | "rooftop" | "automation";
type SystemPage =
  | Content["pages"]["hug"]
  | Content["pages"]["greenspin"]
  | Content["pages"]["rooftop"]
  | Content["pages"]["automation"];

const OUTCOME_IDS: Record<SystemKey, string[]> = {
  hug: ["produce", "calendar", "control"],
  greenspin: ["space", "water", "calendar"],
  rooftop: ["space", "resilience", "water"],
  automation: ["control", "water", "resilience"],
};

const SECONDARY_MEDIA: Record<SystemKey, string> = {
  hug: "/media/systems/hug-canopy.webp",
  greenspin: "/media/systems/greenspin.webp",
  rooftop: "/media/supporting/leaf-detail.webp",
  automation: "/media/systems/controller-field.webp",
};

function SystemGlyph({ system }: { system: SystemKey }) {
  if (system === "greenspin") {
    return (
      <svg viewBox="0 0 180 180" className="size-full" fill="none" aria-hidden="true">
        <ellipse cx="90" cy="90" rx="55" ry="72" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" />
        {[42, 70, 98, 126].map((y, i) => (
          <g key={y} transform={`translate(${i % 2 ? 16 : -16} 0)`}>
            <rect x="55" y={y} width="70" height="10" rx="5" fill="currentColor" opacity={0.25 + i * 0.12} />
            <path d={`M68 ${y}c4-12 12-13 18 0M94 ${y}c4-12 12-13 18 0`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        <path d="M135 52c15 17 18 46 7 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="m136 121 8 2 3-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (system === "automation") {
    return (
      <svg viewBox="0 0 180 180" className="size-full" fill="none" aria-hidden="true">
        <rect x="42" y="36" width="96" height="108" rx="12" stroke="currentColor" strokeWidth="2" />
        <path d="M62 65h56M62 90h28M62 116h42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".48" />
        <circle cx="116" cy="90" r="12" stroke="currentColor" strokeWidth="2" />
        <path d="m111 90 4 4 8-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 20v16M90 144v16M26 90h16M138 90h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      </svg>
    );
  }

  if (system === "rooftop") {
    return (
      <svg viewBox="0 0 180 180" className="size-full" fill="none" aria-hidden="true">
        <path d="m24 103 66-48 66 48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 98v44h90V98" stroke="currentColor" strokeWidth="2" />
        <path d="M55 91h70" stroke="currentColor" strokeWidth="9" strokeLinecap="round" opacity=".24" />
        {[64, 84, 104].map((x) => (
          <path key={x} d={`M${x} 90c-2-16 9-22 15-11-1 9-5 13-15 11Z`} fill="currentColor" opacity=".75" />
        ))}
        <path d="M70 119h40" stroke="currentColor" strokeWidth="2" strokeDasharray="5 6" opacity=".55" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 180" className="size-full" fill="none" aria-hidden="true">
      <rect x="45" y="26" width="90" height="128" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M58 55h64M58 88h64M58 121h64" stroke="currentColor" strokeWidth="2" opacity=".45" />
      {[68, 86, 104].map((x, i) => (
        <path key={x} d={`M${x} ${52 + i * 33}c-2-15 8-21 14-11 0 8-5 12-14 11Z`} fill="currentColor" opacity={0.55 + i * 0.15} />
      ))}
      <path d="M90 38v97" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" opacity=".4" />
    </svg>
  );
}

export function SystemDetailExperience({
  locale,
  content,
  system,
  page,
}: {
  locale: Locale;
  content: Content;
  system: SystemKey;
  page: SystemPage;
}) {
  const detail = content.systemDetail;
  const benefitIds = OUTCOME_IDS[system];
  const outcomes = content.benefits.items.filter((item) => benefitIds.includes(item.id));
  const detailImage = "detailImage" in page ? page.detailImage : undefined;
  const video = "video" in page ? page.video : undefined;
  const poster = "poster" in page ? page.poster : undefined;
  const note = "note" in page ? page.note : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-paper text-ink" aria-labelledby="system-logic-heading">
        <div className="pointer-events-none absolute -end-32 top-20 size-[34rem] rounded-full border border-forest/8" aria-hidden="true" />
        <div className="mx-auto grid max-w-[1480px] gap-14 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[1.07fr_.93fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="grain relative aspect-[16/11] overflow-hidden rounded-sm bg-ink shadow-[0_34px_110px_rgba(6,28,24,.18)]">
              {video && poster ? (
                <LoopVideo src={video} poster={poster} className="size-full object-cover" />
              ) : (
                <Image src={page.image} alt={page.title} fill sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-5 start-5 rounded-full border border-paper/15 bg-ink/62 px-4 py-2 font-mono text-[.62rem] uppercase tracking-[.15em] text-paper/70 backdrop-blur rtl:font-sans rtl:normal-case rtl:tracking-normal">
                {detail.mediaLabel}
              </div>
            </div>
            <div className="relative -mt-12 ms-auto grid w-[72%] grid-cols-[1fr_7rem] items-stretch overflow-hidden rounded-sm border-[7px] border-paper bg-forest text-paper shadow-2xl sm:grid-cols-[1fr_9rem]">
              <div className="relative min-h-36">
                <Image
                  src={detailImage ?? SECONDARY_MEDIA[system]}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 65vw, 36vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-center p-4 text-aqua">
                <SystemGlyph system={system} />
              </div>
            </div>
            {note ? <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink/58">{note}</p> : null}
          </div>

          <div>
            <p className="eyebrow text-forest/58">{detail.logicEyebrow}</p>
            <AnimatedText
              as="h2"
              id="system-logic-heading"
              text={detail.logicHeading}
              className="h1 mt-4 block max-w-[14ch]"
              accentWords={2}
              accentClassName="text-forest"
            />
            <Reveal as="ol" className="mt-10 border-s border-forest/16 ps-7">
              {page.points.map((point, index) => (
                <li key={point.title} className="group relative pb-12 last:pb-0">
                  <span className="absolute -start-[2.12rem] top-1 size-4 rounded-full border-2 border-paper bg-aqua shadow-[0_0_0_1px_rgba(16,64,53,.18)] transition-transform group-hover:scale-125" aria-hidden="true" />
                  <span className="font-mono text-[.62rem] text-forest/48"><bdi>{String(index + 1).padStart(2, "0")}</bdi></span>
                  <h3 className="h2 mt-2 max-w-[18ch]">{point.title}</h3>
                  <p className="measure mt-4 text-ink/72">{point.body}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {system === "hug" ? (
        <section className="relative overflow-hidden bg-[#081b17] text-paper" aria-labelledby="hug-walkthrough-heading">
          <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle at 75% 25%,rgba(40,214,192,.25),transparent 28%),linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "auto,74px 74px,74px 74px" }} />
          <div className="relative mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="grain relative aspect-[9/16] overflow-hidden rounded-[1.25rem] border-[8px] border-paper/8 bg-ink shadow-[0_36px_110px_rgba(0,0,0,.55)]">
                <LoopVideo src={content.faas.openingVideo} webm={content.faas.openingVideoWebm} poster={content.faas.openingPoster} alt={detail.hugWalkthrough.videoAlt} className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/58 via-transparent to-transparent" aria-hidden="true" />
              </div>
            </div>
            <div>
              <p className="eyebrow text-aqua">{detail.hugWalkthrough.eyebrow}</p>
              <AnimatedText as="h2" id="hug-walkthrough-heading" text={detail.hugWalkthrough.heading} className="h1 mt-5 block max-w-[13ch] text-paper" accentWords={2} accentClassName="text-[#f2b36c]" />
              <p className="lead mt-7 max-w-[46ch] text-paper/68">{detail.hugWalkthrough.body}</p>
              <ul className="mt-9 grid gap-3 sm:grid-cols-3">
                {detail.hugWalkthrough.points.map((point, index) => (
                  <li key={point} className="rounded-sm border border-paper/10 bg-paper/[.045] p-5">
                    <span className="font-mono text-[.62rem] text-aqua"><bdi>0{index + 1}</bdi></span>
                    <p className="mt-4 text-[1rem] leading-relaxed text-paper/72">{point}</p>
                  </li>
                ))}
              </ul>
              <Link href={resolveHref(detail.faasCta.href, locale)} className="mt-9 inline-flex min-h-14 items-center rounded-full bg-aqua px-8 text-[1rem] font-medium text-ink transition-transform hover:-translate-y-0.5">
                {detail.faasCta.label}<span className="ms-3" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden bg-[#071d18] text-paper" aria-labelledby="system-outcomes-heading">
        <div className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="eyebrow text-aqua">{detail.outcomesEyebrow}</p>
              <AnimatedText as="h2" id="system-outcomes-heading" text={detail.outcomesHeading} className="h1 mt-4 block max-w-[14ch]" />
            </div>
            <Reveal><p className="lead max-w-[48ch] text-paper/68">{detail.outcomesIntro}</p></Reveal>
          </div>

          <Reveal as="ul" className="mt-14 grid overflow-hidden rounded-sm border border-paper/10 md:grid-cols-3">
            {outcomes.map((outcome, index) => (
              <li key={outcome.id} className="group relative min-h-72 overflow-hidden border-b border-paper/10 p-7 last:border-b-0 md:border-b-0 md:border-e md:last:border-e-0">
                <span className="absolute -end-8 -top-8 font-mono text-[8rem] leading-none text-paper/[.025] transition-transform duration-700 group-hover:-translate-y-2"><bdi>0{index + 1}</bdi></span>
                <p className="eyebrow text-aqua/78">{outcome.kicker}</p>
                <h3 className="h2 mt-5 max-w-[13ch] text-paper">{outcome.title}</h3>
                <p className="mt-5 max-w-[34ch] text-paper/62">{outcome.body}</p>
                <p className="mt-8 inline-flex rounded-full border border-paper/12 px-3 py-1.5 text-xs text-paper/48">{outcome.proof}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-sand-soft text-ink" aria-labelledby="system-delivery-heading">
        <div className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-forest/58">{detail.deliveryEyebrow}</p>
              <AnimatedText as="h2" id="system-delivery-heading" text={detail.deliveryHeading} className="h1 mt-4 block max-w-[13ch]" accentWords={2} accentClassName="text-forest" />
            </div>
            <div>
              <ol className="grid gap-3 sm:grid-cols-2">
                {detail.deliverySteps.map((step, index) => (
                  <li key={step.title} className={`relative overflow-hidden rounded-sm border border-forest/12 bg-paper-warm p-6 ${index === 0 || index === 3 ? "sm:col-span-2" : ""}`}>
                    <span className="font-mono text-[.62rem] text-forest/46"><bdi>{String(index + 1).padStart(2, "0")}</bdi></span>
                    <h3 className="h3 mt-4">{step.title}</h3>
                    <p className="mt-3 max-w-[48ch] text-ink/68">{step.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={resolveHref(detail.primaryCta.href, locale)} className="inline-flex min-h-14 items-center rounded-full bg-forest px-8 text-[1rem] font-medium text-paper transition-transform hover:-translate-y-0.5">
                  {detail.primaryCta.label}
                </Link>
                {system === "hug" ? (
                  <Link href={resolveHref(detail.faasCta.href, locale)} className="inline-flex min-h-14 items-center rounded-full border border-forest/25 px-8 text-[1rem] font-medium text-forest transition-colors hover:border-forest hover:bg-forest hover:text-paper">
                    {detail.faasCta.label}
                  </Link>
                ) : null}
                {system === "automation" ? (
                  <Link
                    href={resolveHref(content.controllerPortal.href, locale)}
                    target={site.controllerUrl ? "_blank" : undefined}
                    rel={site.controllerUrl ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-14 items-center gap-3 rounded-full border border-aqua/45 bg-aqua/10 px-8 text-[1rem] font-medium text-forest transition-colors hover:bg-aqua"
                  >
                    <span className="size-2 rounded-full bg-aqua" aria-hidden="true" />
                    {content.controllerPortal.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
