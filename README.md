# Arafath & Hafsa — Wedding invitation

Live website: https://arafath-msm.github.io/Wedding-invite/

A responsive English wedding website with warm ivory paper, burgundy stationery, champagne gold details, and sage-and-rose botanicals. Static HTML, CSS, and JavaScript; no build or installation required. `theme.css` contains the coordinated visual palette and readability refinements.

## Local preview

Run `npm start` (on PowerShell with restricted scripts, use `npm.cmd start`), then open http://localhost:3000. Run `npm.cmd run check` to check JavaScript syntax.

## Before publishing

- Confirmed names: Mohamed Arafath and Fathima Hafsa. The supplied Google Maps link is configured in both HTML and JavaScript.
- The supplied hall photograph is `assets/Escall-hall-photo.jpeg`. The venue section displays the full photograph and its credits, with an illustration fallback if loading fails.
- The invitation date is October 4, 2026 at 7 PM. Calendar and countdown use Sri Lanka time (UTC+05:30).
- Edit wedding configuration in `script.js` and matching visible text and metadata in `index.html` if details change.
- Review the original invitation image before publication: it includes family names and addresses.

## Features

An animated hand cue and a gentle pulse on the opening button guide guests to tap the envelope. Navigation uses inline SVG icons to keep arrow shapes consistent across iPhone, Android, and desktop fonts.

Textured envelope entrance with a silk ribbon, embossed gold seal, subtle sparkles, floating motion, and pointer tilt. Opening releases the ribbon, lifts the flap, raises a keepsake card, and reveals the page with celebratory petals. Guests open it with a click, tap, Enter, or Space; a footer button replays it. Names and the wedding date stay inside the envelope until opened. The page behind the envelope is hidden and inert until opened. Mobile layouts fill the visual viewport and follow browser-toolbar resizing, with safe-area padding. Motion uses standard transforms for wider mobile compatibility. Reduced-motion users receive an immediate reveal by default and can explicitly choose “Play opening animation.” Without JavaScript, the invitation remains readable.

Animated SVG botanical artwork, floating petals, scroll reveals, live countdown, downloadable calendar event, exact venue map link, original invitation, native sharing with clipboard/download fallback, responsive layouts. Fonts load from Google Fonts, with local Georgia/Arial fallbacks; artwork is local.

`node tests/browser-check.cjs` checks the entrance, actual movement of the floating envelope and rising letter, reveal, replay, focus, names, photo, Maps link, viewport fit at 1440/375/390/320/430px, touch input, browser-toolbar resizing, reduced motion and explicit animation opt-in, and JavaScript exceptions. Requires the local server and Chrome installed at the Windows default path. Mobile checks emulate touch and viewport sizes; they do not substitute for testing on physical iPhones. It creates ignored preview screenshots and a temporary Chrome profile.

## GitHub Pages

GitHub Pages publishes the repository root from `main`. Push changes to `main` to redeploy automatically. All asset links are relative to support the `/Wedding-invite/` project path. `.nojekyll` enables plain static publishing. `server.js` is only the local preview server.

To run the browser checks against the deployed site, use `node tests/browser-check.cjs https://arafath-msm.github.io/Wedding-invite/`.

## Design references

The palette and stationery treatment were informed by [Digby & Rose’s ivory, burgundy, and gold invitation suite](https://www.digbyrose.com/2026/luxury-beveled-edge-letterpress-invitations-custom-die-cut-washington-dc-wedding-invitations/) and [Greenvelope’s layered digital invitations](https://www.greenvelope.com/wedding-invitations). Artwork and interaction code are local original work; no third-party design images or templates were copied.
