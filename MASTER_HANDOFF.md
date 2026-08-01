# iPlant Master Clean Handoff

## Final design decision

This project uses the earlier V4 as the visual and structural foundation because it had the clearest rhythm and strongest restraint. Only the useful later improvements were merged into it. The result avoids both extremes: it is more informative and launch-ready than V4, but does not carry the long, disconnected sections or oversized typography of the later experiments.

## Experience principles

- One coherent journey rather than a collection of design demonstrations.
- Strong media moments separated by calmer explanatory sections.
- Real project evidence over generic futuristic decoration.
- Clear benefits without unverified numerical claims.
- Large-screen typography that remains proportional to viewport height.
- English and Arabic treated as equal launch languages.

## Homepage flow

### 1. Cinematic hero

Five supplied films tell one continuous story:

1. Arid conditions
2. Water and nutrient mixing
3. Precise delivery
4. Controlled growing
5. Harvest to plate

The hero contains:

- Opening headline and supporting sentence
- One main text line per film chapter
- “Scroll to start growing”
- Final HUG and project CTAs

It intentionally excludes:

- Progress bars
- Chapter numbers
- Numerical indicators
- Decorative UI dashboards

Desktop uses scroll-linked video. Mobile uses simpler chapter playback. Reduced-motion and reduced-data users receive a static editorial version.

### 2. Benefits and systems

The systems section explains the commercial value before presenting products:

- More precise water use
- Year-round growing
- Premium produce close to where it is used
- Smart control, automation and AI-supported operation

The short “turn on” film is integrated into this chapter rather than becoming another full homepage section.

The four systems are presented with equal card dimensions and identical information hierarchy:

- HUG
- GREENSPIN
- Productive Rooftop Farming
- Smart Controllers, Automation & AI

GREENSPIN has motion available, but the card always begins with a still and preserves the same appearance as the other three. Video is an optional hover/focus enhancement, not a different layout.

### 3. Farming as a Service

Uses the opening-HUG video to show a real operating unit. The offer, inclusions and “from 200 JOD/month” pricing remain visible and easy to understand without a long sticky sequence.

### 4. iRoof

Preserves the stronger V4 treatment: daylight, full-width tray video and overlapping installation image. It links externally to `https://www.iroofgr.com`.

### 5. Projects

Homepage uses three concise project cards. The Projects route contains the full Challenge → Solution → Result editorial treatment.

### 6. Real work

The field mosaic uses supplied real images and restrained scroll movement to show installations, crops, controllers, trials and people. It is an authenticity chapter, not another product gallery.

### 7–9. Conversion path

Consultation → Virtual Farm → final project CTA creates a clear ending rather than adding more product chapters.

## GREENSPIN wording

GREENSPIN is described as a rotating vertical system that uses the region's abundant natural daylight. The carousel moves trays through the growing cycle while water and nutrients recirculate. The copy avoids publishing the “300 sunny days” number until it is approved and sourced.

## Controller platform

Controller access appears in:

- Header on wide screens
- Mobile menu
- Footer
- Smart Controllers, Automation & AI page

Set the final domain with:

```env
NEXT_PUBLIC_CONTROLLER_URL=https://...
```

Until set, all pathways lead to a controller-access enquiry.

## SEO and discoverability

Included:

- Localized titles and descriptions
- Canonical URLs
- English/Arabic language alternates and x-default
- Open Graph and Twitter metadata
- Organization and service structured data
- XML sitemap
- robots configuration
- Manifest and brand icons
- Indexable supporting copy beside media
- Semantic headings and internal links
- Page-specific social images where appropriate

## Accessibility and performance

Included:

- Keyboard navigation and visible focus
- Escape and focus behavior in the mobile menu
- Reduced-motion and reduced-data alternatives
- Static video posters
- Lazy loading below the fold
- Progressive hero-video loading
- Accessible forms and fallback delivery states
- RTL-safe Arabic layouts
- Heading IDs for labelled regions

## Production notes

Content and source validators pass. A full dependency installation and production build could not be completed in the isolated handoff environment because its package mirror did not contain one locked package archive. Run `npm ci`, `npm run check` and `npm run build` in the normal deployment environment before publishing.
