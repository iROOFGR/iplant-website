# iPlant Master Website

Production-oriented Next.js website for iPlant, an urban farming solutions company developing systems for real MENA conditions.

This master version combines the strongest parts of the earlier V4 and balanced builds:

- V4's clearer homepage flow, restrained typography, cinematic hero, full-width iRoof chapter and editorial field imagery.
- The later build's official brand assets, new HUG media, clearer benefits, accurate GREENSPIN explanation, controller-platform pathway, SEO, privacy, validation and contact-form safeguards.

## Preview locally

### Windows

Extract the ZIP and double-click `START_WEBSITE.bat`.

### macOS

Control-click `START_WEBSITE.command`, choose **Open**, and approve it the first time.

### Terminal

```bash
npm install
npm run dev
```

Open:

- English: `http://localhost:5218/en`
- Arabic: `http://localhost:5218/ar`

Node.js 20 or newer is recommended.

## Final homepage sequence

1. Five-film cinematic hero
2. Benefits and systems portfolio
3. Farming as a Service / HUG
4. iRoof
5. Flagship projects
6. Real systems, sites and people
7. Consultation & Studies
8. Virtual Farm
9. Final project CTA

The hero deliberately has **no progress bar, chapter numbers or numerical rail**. It contains only the opening statement, chapter copy, the instruction **“Scroll to start growing”**, and the closing CTA.

## Systems media treatment

The four system cards use the same structure, crop, typography and proportions. All cards open as still images. GREENSPIN's supplied video appears only as a quiet hover/focus enhancement, so it does not look like a different product format. On touch and reduced-motion devices, all four remain consistent still-image cards.

## Commands

```bash
npm run dev
npm run validate:content
npm run validate:source
npm run typecheck
npm run lint
npm run build
npm run check
```

## Environment variables

Copy `.env.example` to `.env.local` and complete the production values.

Required before launch:

```env
NEXT_PUBLIC_SITE_URL=https://your-final-domain.com
NEXT_PUBLIC_CONTROLLER_URL=https://your-controller-platform-domain.com
CONTACT_EMAIL=your-contact-email@example.com
RESEND_API_KEY=...
RESEND_FROM_EMAIL=iPlant website <website@your-domain.com>
```

The official iRoof URL is already configured as `https://www.iroofgr.com`.

When the controller URL is empty, controller buttons safely route to a controller-access enquiry instead of opening a broken link.

## Brand files

Approved website derivatives are in `public/brand/`:

- `iplant-wordmark-light.png`
- `iplant-wordmark-dark.png`
- `iplant-mark.png`
- favicon and social-preview assets

The original uploaded AI and PNG files are retained in `design-assets/brand-source/`. Do not recreate or substitute the leaf mark.

## Content management

English and Arabic content are stored in:

- `content/content.en.json`
- `content/content.ar.json`

Keep both structures identical. Run `npm run validate:content` after any edit.

## Deployment

The project is optimized for Vercel but can run on any standard Next.js host.

Before deployment:

```bash
npm ci
npm run check
npm run build
```

Then configure the environment variables and publish the generated Next.js application.

See `MASTER_HANDOFF.md`, `LAUNCH_CHECKLIST.md`, `CONTENT_CONFIRMATION.md` and `QA_REPORT.md` for final handoff details.
