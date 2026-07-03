# Amalgam Improv Embeds

Public embeds and widget loaders for Amalgam Improv Squarespace pages.

Map and aggregator projects are published as folders with an `index.html` file so Squarespace can embed stable GitHub Pages URLs.

Event-feed projects are published as folders with an `index.html` file and should be embedded in Squarespace with iframes.

Utility projects are published as widgets with a `widget.js` loader. Squarespace should load those scripts from GitHub Pages so this repository stays the source of truth.

## Current Embeds

- `aggregator-resources/watch/`
- `aggregator-resources/read/`
- `aggregator-resources/listen/`
- `maps/improv-groups/map/`
- `maps/improv-groups/table/`
- `maps/improv-festival/map/`
- `maps/improv-festival/table/`
- `event-feeds/all-show-dates/`
- `event-feeds/big-honey-events/`
- `event-feeds/half-baked-dates/`
- `event-feeds/pop-culture-improv-dates/`
- `event-feeds/sci-prov-dates/`
- `event-feeds/story-prov-dates/`
- `event-feeds/workshops-and-jams-dates/`
- `utilities/jam-generator/widget.js`
- `utilities/multi-timer/widget.js`
- `utilities/suggestion-generator/widget.js`

## Squarespace Event Feed Iframes

Use event-feed pages in Squarespace Code Blocks with iframes.

```html
<iframe
  src="https://benrushscience.github.io/amalgam-improv-embeds/event-feeds/all-show-dates/"
  style="width:100%; height:700px; border:0;"
  title="All Show Dates">
</iframe>
```

## Squarespace Utility Widgets

Use these snippets in Squarespace Code Blocks after GitHub Pages is enabled for this repository.

```html
<script src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/jam-generator/widget.js"></script>
```

```html
<script src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/multi-timer/widget.js"></script>
```

```html
<script src="https://benrushscience.github.io/amalgam-improv-embeds/utilities/suggestion-generator/widget.js"></script>
```

## Publishing Workflow

1. Update the relevant `index.html`, utility HTML source, or `widget.js` file.
2. Review the local changes with `git status` and `git diff`.
3. Commit the intended files.
4. Push to GitHub.

These files are public browser code. Do not commit private API keys, Airtable tokens, or other credentials.
