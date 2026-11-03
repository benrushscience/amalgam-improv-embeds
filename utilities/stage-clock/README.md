# Stage Clock

A buildless, silent red timer and stopwatch for performers, rehearsals, and stage managers. Interface headings use Oswald and body text uses Arimo, loaded from Google Fonts with system fallbacks. Clock faces use local browser resources. No account is needed.

## Use

Choose **Timer** (the default) to count down. Set hours, minutes, and seconds, then choose **Set time** and **Start timer**. Pause and resume preserve the remaining time. Restart resets the selected duration and keeps a running clock running; a paused clock stays paused. New time focuses the duration editor; submitting it stops the old countdown and prepares the new one. Durations range from one second to 99:59:59. At zero the clock stays at zero without sound or flashing.

Choose **Stopwatch** to count up from **00:00**, then select **Start stopwatch**. Pause and resume preserve elapsed time, including partial seconds. Restart returns to zero and keeps a running stopwatch running; a paused stopwatch stays paused. Hours appear automatically at one hour, and the stopwatch keeps counting beyond 99 hours. Duration inputs are hidden in Stopwatch mode; **Customize** opens the font selector.

The **Timer / Stopwatch** toggle is available in both normal and fullscreen controls. Switching modes stops and resets the clock, preserving the configured Timer duration. Selecting the already-active mode leaves the clock running unchanged.

Choose from five faces: digital segments, monospace, bold sans, condensed, and slab serif. The last four use system font stacks, so their exact appearance depends on the device.

Full screen shows a compact toolbar with customization collapsed. Starting or resuming hides all controls immediately. Move the pointer, tap, or tab to reveal the toolbar; choose **Customize** to edit the duration or font. Controls hide and customization collapses after 3.5 seconds without input, even when an input remains focused. Visible controls take their own space below the clock rather than covering it. Escape exits stage view. Space pauses/resumes, R restarts, and F toggles fullscreen when focus is outside the controls. Screen wake lock is requested while running where supported; device power policies can still turn off a display. Keep the browser open: reloading resets the clock to Timer mode.

## GitHub Pages and website embed

After these files are committed and published by the repository's Pages workflow, the URL is:

https://benrushscience.github.io/amalgam-improv-embeds/utilities/stage-clock/

For a website Code Block:

```html
<!-- Embed the large Stage Clock with Timer and Stopwatch modes. -->
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/stage-clock/"
  title="Stage timer and stopwatch"
  style="display:block;width:100%;height:850px;border:0;background:#000;"
  allow="fullscreen; screen-wake-lock"
  allowfullscreen>
</iframe>
<p><a href="https://benrushscience.github.io/amalgam-improv-embeds/utilities/stage-clock/" target="_blank" rel="noopener">Open the stage clock in a new tab</a></p>
```

Direct access is best for a dedicated monitor. If native fullscreen is unavailable, stage view fills its current page or iframe. Connect a larger screen and move the browser onto that display before entering fullscreen.

## Maintain

- `index.html`: accessible controls and page structure.
- `stage-clock.css`: responsive operator console and stage view.
- `stage-clock.js`: timestamp-based countdown and elapsed timing, locally drawn digital face, display fitting, and fullscreen controls.

For a local preview, run `python -m http.server 8765` from the repository and visit `http://localhost:8765/utilities/stage-clock/`.

