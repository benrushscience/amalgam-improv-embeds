# Beat Lights

A silent traffic light timer for improv beats. Green, yellow, and red stay horizontal, from left to right. The active lamp and scene elapsed timer share a color. No account, build, network fonts, or external libraries are needed.

## Use

Start with a three-minute scene and three one-minute beats. Each beat runs **30 seconds green, 15 seconds yellow, and 15 seconds red**, then automatically moves to the next beat. The final red cue stays on with **Scene complete** when the scene ends; the elapsed timer stops at the total duration.

- **Divide evenly:** enter a scene length (`m:ss`, `h:mm:ss`, or seconds), 1–24 beats, and yellow/red warning seconds. Green gets the remaining time. For shorter beats, warning windows scale proportionally to use at most half the beat; whole-second rounding can skip a warning color in very short beats. Remainder seconds go to the first beats so the total stays exact.
- **Fine-tune:** independently edit each beat's optional name and green/yellow/red seconds. Zero skips a color; every beat needs at least one second. The scene can be up to 24 hours. These edits update the total automatically.
- **Start / pause / resume:** timing settings lock after playback begins. Reset returns to the beginning and unlocks settings. Play again starts a completed scene from Beat 1.
- **Full screen:** the beat occupies roughly the top sixth, lights the middle two-thirds, and elapsed time the bottom sixth. Move the pointer, tap, or tab to reveal playback and exit controls. Escape exits; Space plays/pauses, R resets, F toggles fullscreen. On normal pages, Space activates a focused button as usual. Typing in settings does not trigger shortcuts.
- Valid settings are remembered in this browser when local storage is available. Reloading resets playback. Screen wake lock is requested while running where supported; keep the browser open and visible for practice.

Color labels and cue announcements supplement the lights for accessibility. There are no sounds or flashing effects. Green means explore; yellow means prepare a shift; red means transition, heighten, or follow something new. Use those cues however they serve your scene.

## GitHub Pages and Squarespace embed

Public page: https://benrushscience.github.io/amalgam-improv-embeds/utilities/beat-lights/

Paste into a Squarespace Code Block:

```html
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/beat-lights/"
  title="Beat Lights — improv scene timer"
  style="display:block;width:100%;height:1100px;border:0;background:#101211;"
  allow="fullscreen; screen-wake-lock"
  allowfullscreen>
</iframe>
<p><a href="https://benrushscience.github.io/amalgam-improv-embeds/utilities/beat-lights/" target="_blank" rel="noopener">Open Beat Lights in a new tab</a></p>
```

The iframe scrolls for longer custom beat lists or narrower screens. Native fullscreen requires the iframe permission above and browser support; otherwise the stage fills the iframe. The new-tab link is useful for dedicated displays or browsers that restrict fullscreen.

## Maintain and verify

- `index.html` — page structure and accessible controls.
- `beat-lights.css` — responsive console and fullscreen stage.
- `beat-lights.js` — settings, playback, storage, and fullscreen interaction.
- `timing.mjs` — pure duration and cue calculations.
- `timing.test.mjs` — default boundaries, uneven divisions, short beats, skipped phases, and validation checks.

Run `node --test utilities/beat-lights/timing.test.mjs` from the repository. Preview with `python -m http.server 8765`, then open `http://localhost:8765/utilities/beat-lights/`. Commit and publish through the existing GitHub Pages workflow; no build changes are necessary.
