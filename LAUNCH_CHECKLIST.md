# iPlant Launch Checklist

## Required configuration

- [ ] Confirm the final public website domain in `NEXT_PUBLIC_SITE_URL`.
- [ ] Add the controller-platform domain in `NEXT_PUBLIC_CONTROLLER_URL`.
- [ ] Confirm `CONTACT_EMAIL`.
- [ ] Add `RESEND_API_KEY` and an approved `RESEND_FROM_EMAIL`.
- [ ] Add verified LinkedIn and Instagram URLs, or leave them empty.
- [ ] Confirm analytics requirements and consent approach before adding analytics.

## Content approval

- [ ] Review every item in `CONTENT_CONFIRMATION.md`.
- [ ] Confirm project partner names, locations and project status.
- [ ] Confirm HUG “from 200 JOD/month” wording and conditions.
- [ ] Approve all Arabic copy with a native commercial/technical reviewer.
- [ ] Confirm AI capabilities described on the automation page.
- [ ] Confirm GREENSPIN daylight, carousel, recirculation and optional-solar wording.

## Functional QA

- [ ] Logo returns to `/{locale}` from every page.
- [ ] Desktop and mobile navigation return to Home.
- [ ] English/Arabic switch preserves the current route.
- [ ] Five hero films transition without black frames.
- [ ] Hero has no numbers or progress bar.
- [ ] “Scroll to start growing” appears and disappears correctly.
- [ ] System cards have matching dimensions and initial still-image treatment.
- [ ] GREENSPIN hover/focus video does not auto-download on page load.
- [ ] HUG, GREENSPIN, rooftop and automation detail pages open correctly.
- [ ] Controller buttons open the real platform after its URL is configured.
- [ ] iRoof opens `https://www.iroofgr.com` in a new tab.
- [ ] Contact form sends through Resend when configured.
- [ ] Contact fallback clearly offers email/WhatsApp when delivery is unavailable.
- [ ] Sitemap, robots and privacy pages are accessible.

## Responsive QA

Test at minimum:

- [ ] 360 × 800
- [ ] 390 × 844
- [ ] 768 × 1024
- [ ] 1024 × 768
- [ ] 1366 × 768
- [ ] 1440 × 900
- [ ] 1920 × 1080

Check:

- [ ] No horizontal overflow.
- [ ] Hero subjects are not cropped incorrectly.
- [ ] Text and buttons remain comfortably sized on large screens.
- [ ] Arabic text does not clip inside animated masks.
- [ ] Mobile menu is keyboard- and touch-usable.

## Build and deployment

```bash
npm ci
npm run validate:content
npm run validate:source
npm run typecheck
npm run lint
npm run build
```

- [ ] Resolve all build warnings and errors.
- [ ] Deploy to a staging URL.
- [ ] Test real contact delivery on staging.
- [ ] Test social preview cards.
- [ ] Submit the sitemap to Google Search Console and Bing Webmaster Tools after launch.
- [ ] Verify indexing, canonical URLs and language alternates after deployment.
