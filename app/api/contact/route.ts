import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { enquirySchema } from "@/lib/validation";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  // Keep the lightweight in-memory fallback bounded. Production deployments
  // that need cross-instance enforcement should replace this with a shared
  // rate-limit store.
  if (attempts.size > 1_000) {
    for (const [key, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(key);
    }
  }
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  attempts.set(ip, current);
  return current.count > MAX_REQUESTS;
}

/**
 * Contact endpoint. Sends through Resend when RESEND_API_KEY is configured.
 * Without it the request still succeeds and the client falls back to the
 * visible mailto and WhatsApp routes, so the form is never a dead end.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "unsupported_media_type" }, { status: 415 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false, error: "invalid_origin" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_origin" }, { status: 403 });
    }
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled means a bot. Return success so it learns nothing.
  if (data.website) return NextResponse.json({ ok: true, delivered: false });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, delivered: false, reason: "not_configured" });
  }

  const lines = Object.entries(data)
    .filter(([key, value]) => key !== "website" && value)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: site.resendFromEmail,
        to: [site.contactEmail],
        reply_to: data.email,
        subject: `${data.type === "hug" ? "HUG / service" : "Project / consultation"} enquiry — ${data.name}`,
        text: lines,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
