# The Yes, And Machine — v1

An Amalgam Improv Three.js experiment: two toy improvisers on a miniature stage, with randomized scene suggestions, draggable stage rotation, and adjustable animation energy.

Live page: https://benrushscience.github.io/amalgam-improv-embeds/test-3js/

## Embed v1

Paste this into an HTML page or a Squarespace HTML Code Block. On GitHub Pages, use an HTML file or a Markdown page that permits raw HTML. The iframe remains scrollable if its content exceeds the assigned height.

```html
<!-- Amalgam Yes, And Machine embed v1 -->
<style>
  .amalgam-3js-demo { width: 100%; height: 920px; border: 0; display: block; }
  @media (max-width: 680px) {
    .amalgam-3js-demo { height: 1320px; }
  }
</style>
<iframe
  class="amalgam-3js-demo"
  src="https://benrushscience.github.io/amalgam-improv-embeds/test-3js/"
  title="Amalgam Improv — The Yes, And Machine"
  loading="lazy">
</iframe>
```

## Run locally

From the repository root, run `python -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/test-3js/. Use HTTP rather than opening the HTML as a local file, because JavaScript modules require it.

No build step or API keys are required. Three.js **0.180.0 / r180** is vendored in `vendor/` with its MIT license. The files are the unmodified `build/three.module.js` and `build/three.core.js` distributions from the `three@0.180.0` npm package. Both must be kept together when updating. See the [official Three.js installation guide](https://threejs.org/manual/en/installation.html).

## Files and editing

- `index.html`: page structure and initial suggestions.
- `style.css`: responsive layout and Amalgam brand palette.
- `app.js`: suggestion lists, stage geometry, lighting, interaction, and animation.
- `vendor/`: pinned Three.js modules and license.
- `verification/`: desktop and mobile browser screenshots.

Edit `places`, `relationships`, and `twists` at the top of `app.js` to change the suggestion pool. Synchronize the initial suggestion in `index.html` if changing the defaults. Suggestions are fictional scene starters, not event listings.

## Browser verification

Tested with Playwright-controlled Chromium on September 9, 2026 (America/Chicago):

- Three.js r180 initialized and visibly rendered the stage at 1280 × 900.
- Normal startup had zero console errors or warnings.
- “Make a scene” updated the scene count and all three suggestion fields.
- Paused canvas screenshots were identical across a time interval.
- Pointer dragging changed the rendered image while paused.
- Resuming animation changed rendered pixels over time.
- Keyboard End on the energy slider selected “Full weird.”
- Reduced-motion preference started with motion paused after reload.
- At 390 × 844, the page stacked correctly with no horizontal overflow; a full-page screenshot was inspected.
- Simulated WebGL 2 unavailability displayed the fallback and left the suggestion generator functional. Three.js emits an expected console error during this deliberately induced failure.
- `node --check test-3js/app.js` passed.

Animation stops when paused, when the document is hidden, and when the stage leaves the viewport. WebGL 2 is required for the 3D scene; text suggestions remain usable if graphics initialization fails. Touch layout was tested through viewport emulation, not on a physical phone.
