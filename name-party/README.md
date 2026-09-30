# Name Party

A self-contained name-memory game by Amalgam Improv. Open `index.html` directly or embed the published GitHub Pages URL in Squarespace.

## Play

- Game Names: the game names every guest.
- Mixed Names: the player names about half the guests.
- Your Names: the player names every guest.
- Meet two guests and recall each once to unlock the third. Then earn each new introduction with four correct recalls across at least two different guests.
- Mistakes preserve introduction progress; three mistakes end the round.
- Returning guests are randomly chosen, excluding the immediately previous guest when alternatives exist.
- Appearances are randomized for each party and stay paired with their guest's name throughout the round.

## Squarespace embed

```html
<!-- Name Party embed v1 -->
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/name-party/"
  title="Name Party — Amalgam Improv name-memory game"
  style="width:100%;height:1050px;border:0;"
  loading="lazy">
</iframe>
```

The frame scrolls internally when the welcome page or game is taller than the available space. Adjust its height to suit the page. No external scripts, fonts, audio, or build step are required.

## Verification

With Node.js and Playwright installed, run:

```text
node name-party/checks/verify-encounters.cjs
node name-party/checks/verify-earned-introductions.cjs
node name-party/checks/verify-landing.cjs
```

The checks cover appearance stability, guest selection, earned introductions in all three naming modes, resets, and responsive landing-page behavior. Browser checks save local review screenshots beside the scripts; these generated files are excluded from Git.
