# Suggestion Generator

`suggestion-generator.html` is the self-contained generator hosted by GitHub Pages. It includes category filters, New Word, Copy, Undo, and the N / C / U keyboard shortcuts when the widget has focus.

## Source synced from GitHub

The local source was synced from `origin/main` at commit `15649315a7906a5a0705b4b3589d312059d59184` on November 6, 2026. This includes the pretzels wildcard and the Emotion Wheel / Character Field Guide inspiration links. The source file is preserved exactly as retrieved.

## Embed on Squarespace

1. Open `squarespace-embed.html` and copy its full contents.
2. Add a Code Block to the Squarespace page, select HTML, and turn Display Source off.
3. Paste the snippet, save, and check the published page on desktop and mobile. Give the block enough vertical space for the iframe and direct link.

The iframe uses the published application URL:

https://benrushscience.github.io/amalgam-improv-embeds/utilities/suggestion-generator/suggestion-generator.html

It isolates the generator's styles from the Squarespace theme. `allow="clipboard-write"` delegates clipboard permission where supported; visitors must click Copy, and browser permissions can still affect clipboard access. The iframe is 650 pixels tall and retains browser scrolling for longer suggestions or narrow screens. Adjust `height:650px` if desired.

Squarespace requires a plan supporting iframe code. See [Squarespace's Code Block instructions](https://support.squarespace.com/hc/en-us/articles/206543167-Add-custom-code-to-a-page-with-code-blocks).

Use the iframe snippet rather than the older `widget.js` loader, which currently contains an unresolved `$escapedHtml` placeholder. This embed loads the HTML source directly.

## Preview and future updates

Open `suggestion-generator.html` locally to preview the generator. Copy works best from a secure HTTPS page or localhost.

The snippet points at the existing GitHub Pages source, so using it does not require publishing these new documentation files. Future generator edits must be committed and pushed to GitHub, and the Pages deployment must finish before they appear in the embed. Local commits alone do not update the live page.
