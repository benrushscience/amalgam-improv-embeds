# Tongue twister warm-up v7

`index.html` is the complete HTML, CSS, JavaScript, and 50-entry tongue-twister dictionary. It needs no build step, external JavaScript libraries, or microphone. Google Fonts loads the brand typography; local fallback fonts keep the warm-up usable without a network connection. Open it directly in a browser for a local preview.

## Using the warm-up

- Reading mode is the default. Choose any of 50 phrases or press **Surprise me**.
- Turn on **Interactive mode**, choose your settings, and press **Start Interactive** to follow a highlighted word, its underline, and the segmented beat bar. Each whole word takes one beat, regardless of syllable count.
- Tempo starts at **50 BPM** and adjusts live from 20–180 BPM using the slider or keyboard arrow keys.
- Total passes defaults to **1**, with stops at **1, 2, 3, 4, 5, ∞**. The count includes the first pass. This control also works live; lowering it below the current pass finishes the current phrase before stopping.
- **Single phrase loop** repeats the selected phrase. **Random combo loop** starts with the selected phrase and chooses another phrase for each subsequent pass. These are mutually exclusive choices. Select at least two passes, or ∞, to hear yourself work through a combo.
- Random phrases come from a shuffled deck, avoiding consecutive duplicates. The manually selected starting phrase can recur later in the deck.
- Each word, including the final word, gets a full beat. One silent reset beat separates passes. In random mode this beat previews the upcoming phrase.
- The optional synthesized metronome is off by default. There is no spoken voice. The metronome can be toggled during playback.
- Pause preserves the current beat position. Stop resets the current phrase. Phrase and loop-mode selection are locked while running or paused; tempo, total passes, and sound remain adjustable.
- Hiding the page pauses it. Returning requires Resume. Extended frame interruptions also pause playback rather than skipping words.
- Reduced-motion settings hide the moving playhead; word highlighting and beat progress remain.

## Squarespace embed

After publishing this folder through the repository’s GitHub Pages deployment, paste this into a Squarespace Code Block in HTML mode:

```html
<!-- Tongue twister warm-up embed v1 -->
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/tongue-twister-warmup/"
  title="Tongue twister vocal warm-up"
  allow="autoplay"
  style="display:block;width:100%;height:1100px;border:0;">
</iframe>
```

The iframe scrolls internally when a long phrase, mobile layout, or enlarged text exceeds its height. Adjust the height for the page layout. Visitors enable sound themselves; `allow="autoplay"` does not turn on the metronome automatically.

## Editing the dictionary

Find `tongueTwisters` in `index.html`. Each entry contains `text` and a short `focus` label describing the sounds to practice. Keep punctuation attached to the word it belongs to: whitespace defines the beats. The 50 entries mix familiar exercises with original alliterative phrases.

## Brand styling

Headings use **Oswald**. Paragraphs, the centered phrase, labels, and controls use **Arimo**, matching the repository’s site typography.

| Color | Hex | Use |
| --- | --- | --- |
| Burnt / red-orange | `#E55937` | Page background |
| Pale yellow | `#FFE974` | Buttons, settings cards, selector, loop options; active-word underline and unfilled beat track |
| Black | `#000000` | Text inside yellow boxes and buttons; progress-bar outline, beat dividers, playhead, focus outlines, checkbox and radio accents |
| Off-white | `#F7F6F3` | All text directly on the orange background |
| Deep pink | `#BD005B` | Main phrase panel, filled beat bar, tempo and repeat sliders |
| White | `#FFFFFF` | All text in the main phrase panel, including current and completed words |

Subtle borders use black at 30% opacity. All words keep the same font weight and spacing throughout playback, preserving their positions and line breaks. A yellow inset underline identifies the active word without changing its size. Disabled buttons keep pale-yellow backgrounds and black text, with dashed borders.
