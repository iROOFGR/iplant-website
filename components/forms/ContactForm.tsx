"use client";

import { useId, useRef, useState } from "react";
import { site, type Locale } from "@/config/site";
import type { Content } from "@/lib/content";
import type { EnquiryType } from "@/lib/validation";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

const inputClass =
  "w-full rounded-sm border border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-forest";

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <p>
      <label htmlFor={id} className="mb-2 block text-sm text-ink/75">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        // Email and phone are always LTR, even on an Arabic page.
        dir={type === "email" || type === "tel" ? "ltr" : undefined}
        className={inputClass}
      />
    </p>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
}) {
  const id = useId();
  return (
    <p>
      <label htmlFor={id} className="mb-2 block text-sm text-ink/75">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select id={id} name={name} required={required} className={inputClass} defaultValue="">
        <option value="" disabled />
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </p>
  );
}

export function ContactForm({
  content,
  locale,
  initialType = "project",
}: {
  content: Content;
  locale: Locale;
  initialType?: EnquiryType;
}) {
  const [type, setType] = useState<EnquiryType>(initialType);
  const [status, setStatus] = useState<Status>("idle");
  const [issues, setIssues] = useState<string[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);
  const t = content.forms;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setIssues([]);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        delivered?: boolean;
        issues?: Record<string, string[]>;
      };

      if (!result.ok) {
        setIssues(Object.keys(result.issues ?? {}));
        setStatus("error");
        summaryRef.current?.focus();
        return;
      }
      setStatus(result.delivered === false ? "fallback" : "sent");
    } catch {
      setStatus("error");
      summaryRef.current?.focus();
    }
  }

  if (status === "fallback") {
    const subject = encodeURIComponent(type === "hug" ? t.tabs.hug : t.tabs.project);
    return (
      <div role="status" className="rounded-sm border border-amber-300/70 bg-amber-50 p-8 text-ink">
        <h2 className="h3">{t.fallbackTitle}</h2>
        <p className="mt-3 text-ink/75">{t.fallbackBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`mailto:${site.email}?subject=${subject}`} className="inline-block rounded-full bg-forest px-6 py-3 font-medium text-paper">
            {site.email}
          </a>
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-forest px-6 py-3 font-medium text-forest">
            {content.site.whatsappLabel}
          </a>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-sm border border-forest/30 bg-white p-8">
        <h2 className="h3">{t.successTitle}</h2>
        <p className="mt-3 text-ink/75">{t.successBody}</p>
        <a
          href={site.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-forest px-6 py-3 font-medium text-paper"
        >
          {content.site.whatsappLabel}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div role="group" aria-label={t.tabs[type]} className="mb-8 flex flex-wrap gap-2">
        {(["hug", "project"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={type === value}
            onClick={() => setType(value)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              type === value
                ? "bg-forest text-paper"
                : "border border-line text-ink/70 hover:border-forest hover:text-forest"
            }`}
          >
            {t.tabs[value]}
          </button>
        ))}
      </div>

      {status === "error" && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-sm border border-red-300 bg-red-50 p-4 text-red-900"
        >
          <p className="font-medium">{t.errorTitle}</p>
          <p className="mt-1 text-sm">{t.errorBody}</p>
          {issues.length > 0 && (
            <ul className="mt-2 list-disc text-sm ps-5">
              {issues.map((issue) => (
                <li key={issue}>{t.fields[issue as keyof typeof t.fields] ?? issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.name} name="name" required autoComplete="name" />
        <Field
          label={type === "hug" ? t.fields.organizationOptional : t.fields.organization}
          name="organization"
          required={type === "project"}
          autoComplete="organization"
        />
        <Field
          label={type === "hug" ? t.fields.city : t.fields.cityCountry}
          name="city"
          required
          autoComplete="address-level2"
        />

        {type === "hug" ? (
          <>
            <SelectField label={t.fields.setting} name="setting" options={t.settings} required />
            <Field label={t.fields.units} name="units" />
          </>
        ) : (
          <>
            <SelectField
              label={t.fields.projectType}
              name="projectType"
              options={t.projectTypes}
              required
            />
            <Field label={t.fields.space} name="space" />
          </>
        )}

        <Field label={t.fields.email} name="email" type="email" required autoComplete="email" />
        <Field label={t.fields.phone} name="phone" type="tel" required autoComplete="tel" />

        {type === "project" && <Field label={t.fields.timeline} name="timeline" />}
      </div>

      <p className="mt-5">
        <label htmlFor="enquiry-message" className="mb-2 block text-sm text-ink/75">
          {type === "project" ? t.fields.challenge : t.fields.message}
          {type === "project" && <span aria-hidden="true"> *</span>}
        </label>
        <textarea
          id="enquiry-message"
          name={type === "project" ? "challenge" : "message"}
          rows={5}
          required={type === "project"}
          className={inputClass}
        />
      </p>

      {/* Honeypot. Hidden from people, and from assistive technology. */}
      <p className="absolute -start-[9999px]" aria-hidden="true">
        <label htmlFor="website-field">Website</label>
        <input id="website-field" name="website" tabIndex={-1} autoComplete="off" />
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-forest px-7 py-3.5 font-medium text-paper transition-colors hover:bg-forest-light disabled:opacity-60"
        >
          {status === "sending" ? t.sending : t.submit}
        </button>
        <p className="text-sm text-ink/60">{t.fallbackNote}</p>
      </div>
      <p className="mt-5 max-w-2xl text-xs leading-relaxed text-ink/48">
        {t.privacyPrefix}{" "}
        <a href={`/${locale}/privacy`} className="underline decoration-forest/30 underline-offset-4 transition-colors hover:text-forest">
          {t.privacyLink}
        </a>
      </p>
    </form>
  );
}
