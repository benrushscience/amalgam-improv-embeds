# Character field guide mock-up

Local design expansion of the values and beliefs field guide. Open `index.html` through a static web server, for example:

```powershell
python -m http.server 8771 --bind 127.0.0.1 --directory design-explorations/character-field-guide
```

## Scope

- Preserves the original values, beliefs, and their scene examples, and expands these collections to 32 values and 40 beliefs.
- Includes 30 entries each for physicality, voice, behaviors, and wants, plus all 48 emotions from the Amalgam emotion wheel.
- Includes 240 entries and 720 scenario-and-line pairs in total across all seven collections.
- Groups visible/audible choices separately from internal motivations in the collection navigation.
- Retains a persistent desktop family index, direct entry URLs, browser history, and responsive layout.
- Connections are editorial suggestions across collections, not claims that a physical or vocal choice determines psychology.

## Reference and editorial decisions

The [Level 1 curriculum, Class 5: Characters Pt 1: External](https://docs.google.com/document/d/18ke7_B1boNC1uDyJZ-lyl4mpAjL3JWIUrBggzSo5d60/edit?tab=t.ea4ts8uvm54) informed the distinction between external and internal choices, the voice/physicality/behavior browsing families, and the advice to begin with one choice and develop through listening. Relevant passages in Classes 3 and 4 informed imaginary object consistency and emotional responsiveness. The new examples and descriptions are original mock-up copy, not reproduced curriculum exercises or validated psychological categories.

The Class 5 document discusses VAPAPO and VEPOP. This mock-up uses the seven collections requested by the user rather than presenting a new attributed version of either framework.

`conviction-entries.js` adds the user-selected Respect for authority and Sacredness / purity values and ten broader world beliefs. The belief statements are original character-friendly adaptations of dimensions discussed in [Clifton et al. (2019), Primal World Beliefs](https://cdn2.psychologytoday.com/assets/primalworldbeliefs_clifton2019.pdf), not quotations or validated questionnaire items. Opportunity & abundance and Patterns & connections are editorial browsing families. Each addition includes its own meaning, cue, related links, and three independent scenes.

The [Amalgam emotion wheel](https://www.amalgamimprov.com/emotion-wheel), reviewed October 9, 2026, is the source of truth for emotion names, definitions, family membership, and display order. Its eight families are Joy, Surprise, Anger, Fear, Sadness, Disgust, Connection, and Self-Conscious, with six emotions each. `emotion-wheel-reference.json` records that live reference. The guide's cues and scene examples are original editorial additions. Choices absent from the wheel were removed from the emotion collection; related links were updated to avoid stale references.

## Files and checks

`base-content.js` and `scene-prompts.js` preserve the existing library. `character-content.js` defines the collections, retains the first eight choices for physicality, voice, behaviors, and wants, and appends their expansions. `emotion-entries.js` contains the complete wheel-aligned emotion collection and its scenes. Retained emotions keep their existing IDs; new emotions start at `emotion-31`. IDs for removed emotions are retired. `character-guide.js` renders navigation and entries. `field-guide.css` retains existing styling; `character-guide.css` contains the expansion's layout changes.

Run `node design-explorations/character-field-guide/validate-content.cjs` from the repository root to check entry IDs, family mappings, related links, and all three scenes per entry.

The validator checks the emotion taxonomy against the saved reference. Add `--wheel-source "C:/path/to/downloaded-emotion-wheel.html"` to also compare that reference against a fresh copy of the embedded live wheel HTML.

The current interface uses static minimalist SVG line icons only in the main reading panel, text-only category selectors, light borders, and independently scrolling index and reading panels. Search and animation controls are omitted. `character-icons.js` owns the category illustrations. Browser review covered category switching, removed controls, and the updated layout. Screenshots are in `design-review-images`.

This folder is a standalone design study. It does not replace or publish `values-beliefs-fieldguide`.
