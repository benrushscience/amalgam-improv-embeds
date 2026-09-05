# Alphabet vocal warm-up — v9

`index.html` contains the complete page, styles, and browser JavaScript. It has no libraries, downloaded samples, microphone access, or build step. Choose Piano (default), Sine wave, Bell, or Trumpet. Instrument sounds are synthesized approximations, using different partials and volume envelopes; sine wave is a pure tone.

The page uses Amalgam's burnt orange (`#E55937`) background with off-white (`#F7F6F3`) text. Selection controls use pale yellow (`#FFE974`) at 88% opacity with black (`#000000`) text; buttons, the letter display, and sequence boxes use solid yellow. Disabled controls use a dashed border. Eight controls fit into two desktop rows of four under the Controls legend, with a two-column layout on phones.

Small decorative SVG pixel clouds drift behind the interface. They ignore pointer events and become stationary when the visitor prefers reduced motion. No image files or external assets are required.

Animations can be switched On or Off, including during playback, without restarting the exercise. Off leaves stationary clouds and hides the cherubs. The initial setting follows the visitor's reduced-motion preference; an explicit selection overrides it for the current page session.

Pixel cherubs carrying a recorder, harp, trumpet, and synthesizer take turns visiting every 16 seconds. Each swoops in from an edge, grows as it approaches, and flies upward out of view. They remain behind the controls and letter card, make no extra sounds, and are hidden with reduced motion enabled. The complete four-cherub cycle repeats every 64 seconds.

## Exercise rules

- One letter per beat, at 30–240 letters per minute (default 80).
- The Sound selector changes timbre while keeping pitch, tempo, alphabet order, and loops the same. Stop to change the sound. High partials above the browser audio sample rate's Nyquist limit are omitted to avoid aliasing.
- Choose 1–12 loops (default 1). Each loop has 27 beats: all 26 alphabet letters from the chosen starting letter, wrapping after Z, followed by that starting letter once more.
- Each new loop raises the root by one semitone and restarts on the chosen starting letter. For example, three loops from C4 use C4, C♯4, then D4 for 81 total beats. B4 advances to C5, so the pitch continues upward across octave boundaries.
- Loops follow consecutively at the selected tempo, with no extra rest or skipped beat between loops. The last letter of one loop and the first letter of the next are both sounded on their respective roots.
- Scale degrees repeat `1–2–3–4–5–4–3–2`, then return to 1. The last two beats switch to the fifth and root, making the final three notes `1–5–1`.
- Major semitone offsets: `0, 2, 4, 5, 7`. Natural minor: `0, 2, 3, 5, 7`.
- Root octave 2–5 (default C4). The octave applies to the root, and pitches cross octave boundaries as needed. Tuning is equal temperament with A4 = 440 Hz.
- Alphabet wrap does not reset the pitch. In C major starting on A, the last three pairs are Y/C4, Z/G4, A/C4. This root–fifth–root ending transposes with the selected root and octave in both major and minor scales.
- Settings are locked during playback. Stop cancels the remaining notes; Start again begins a fresh run. Hiding or leaving the page stops playback.

## Squarespace embed

After this folder is published through the repository's GitHub Pages deployment, put this HTML into a Squarespace Code Block:

```html
<!-- Alphabet vocal warm-up embed v1 -->
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/alphabet-vocal-warmup/"
  title="Alphabet vocal warm-up"
  allow="autoplay"
  style="width:100%;height:800px;border:0;">
</iframe>
```

The visitor must press Start to unlock browser audio. The iframe scrolls if the controls or expanded sequence details exceed its height.

## Local preview

Open `index.html` in a browser, or serve the repository with `python -m http.server 8000` and visit `/utilities/alphabet-vocal-warmup/` on that local server.
