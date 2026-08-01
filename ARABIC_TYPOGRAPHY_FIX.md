# Arabic typography and visibility fix — v12.1

This release keeps the approved English design and homepage structure unchanged. It corrects Arabic-only typography and visibility problems.

## Changes

- Replaced the previous Arabic font with **Noto Sans Arabic** in weights 400–700.
- Kept IBM Plex Sans for English and Latin product names such as HUG, GREENSPIN and iRoof.
- Ensured buttons, form fields, selects and textareas inherit the Arabic typeface.
- Removed per-word clipping masks from Arabic headings so dots, ascenders and descenders remain visible.
- Disabled decorative reveal transforms on Arabic text and imagery to prevent content remaining transparent when fonts or ScrollTrigger load late.
- Increased Arabic heading line-height and corrected narrow `ch`-based wrapping.
- Increased contrast for small Arabic metadata, footer copy and navigation labels.
- Delayed the full Arabic desktop navigation until wider screens; the mobile menu is used earlier to prevent long labels from being compressed or hidden.
- Increased the Arabic menu, back-link and footer text visibility.
- Kept full RTL direction, keyboard navigation and bilingual route behavior.

## Preview

Run `START_WEBSITE.bat`, then open:

- Arabic: `http://localhost:5218/ar`
- English: `http://localhost:5218/en`

Use a newly extracted folder so an older local server or `.next` cache cannot be mistaken for this version.
