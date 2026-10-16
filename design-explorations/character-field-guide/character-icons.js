/* Character icons v3: static, minimalist SVG line drawings.
   Rounded strokes share the Amalgam pink; adjacent headings name each category. */
(() => {
  'use strict';
  const drawings = {
    // Both bent arms share the shoulder; the neck joins it to the head.
    physicality:'<circle cx="39" cy="10" r="5"/><path d="M36 14l-4 7-7 15M32 21l10 9 11-3M32 21l-12 3-7-7M25 36l13 8 4 12M25 36l-9 15H6"/>',
    // A speaking profile with sound radiating from the mouth.
    voice:'<path d="M10 55V43C4 36 5 28 6 21 8 10 17 6 25 10c6 3 8 9 8 14l6 8h-7v5h-7m7 0v5c0 4-4 6-10 6v7M25 22h1M42 28q5 5 0 10M47 22q11 11 0 22M52 16q17 17 0 34"/>',
    // A woman speaking her recurring habit; the simple bubble preserves the requested line.
    behavior:'<path d="M7 35V22C7 7 31 7 31 22v13M11 22c7 0 10-4 11-7 1 5 4 7 6 7v7c0 12-17 12-17 0zM7 35l-3 7h10m17-7 3 7H24M14 39v6m10-6v6M2 61v-6c0-7 10-10 17-10s17 3 17 10v6M16 32q3 3 6 0"/><path d="M49 7h114a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H57L43 61V13a6 6 0 0 1 6-6z"/><text x="55" y="26" fill="currentColor" stroke="none" font-family="Arimo, sans-serif" font-size="11"><tspan x="55">I add hot sauce</tspan><tspan x="55" dy="16">to everything.</tspan></text>',
    // Comedy and tragedy masks with one falling tear.
    emotion:'<path d="M4 9q14 6 28 0v17c0 11-8 18-14 20C12 44 4 37 4 26zM9 21q3-4 6 0m6 0q3-4 6 0M11 29h14q-7 15-14 0zM35 22q12 4 25-1v17c0 11-7 18-14 21-6-3-11-8-13-14M39 33h3m9 0h3M39 47q7-9 14 0M55 37q-5 7 0 7t0-7"/>',
    // A trophy raised on a pedestal.
    want:'<path d="M18 8h28v14c0 11-6 17-14 17s-14-6-14-17zM18 13H8v7c0 8 5 12 13 12M46 13h10v7c0 8-5 12-13 12M32 39v9M23 48h18M17 49h30v10H17zM10 59h44"/>',
    value:'<path d="M32 54 11 33C-6 16 17-1 32 17 47-1 70 16 53 33z"/>',
    // Lateral brain: rounded frontal lobe at left, cerebellum and brainstem at rear right.
    belief:'<path d="M8 38C3 35 3 28 7 24 5 18 10 12 16 13 18 7 25 6 30 9 35 5 42 7 45 11 53 10 59 16 58 22 63 27 60 36 55 39L44 41c-4 6-11 7-16 3-6 2-12 0-14-4-2 1-5 0-6-2zM43 42c7-4 15-1 15 5 0 6-8 9-14 6M38 46l1 11 7 3-3-8M16 13c-3 4-1 8 4 9M7 24c5-3 11-1 12 4M10 34c4-4 9-3 12 0M30 9c-4 5-4 10 0 13l-4 8M43 14c-7-2-10 3-8 8M55 23c-5-3-10-1-11 4M20 39c3-5 7-6 12-4l7-5c5-2 10 1 12 5M31 43c2-3 5-4 8-3M47 45l7 1m-8 3 7 1"/>'
  };
  window.characterIcon = type => `<svg class="attribute-icon attribute-icon-${type}" viewBox="0 0 ${type === 'behavior' ? 176 : 64} 64" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawings[type] || ''}</svg>`;
})();
