/* Character icons v2: static, minimalist SVG line drawings.
   Rounded strokes share the Amalgam pink; adjacent headings name each category. */
(() => {
  'use strict';
  const drawings = {
    // Runner in motion.
    physicality:'<circle cx="39" cy="10" r="5"/><path d="m24 24 9-7 10 9 10 2M33 17l-7 19 13 7 4 13M26 36l-9 15H7M26 25l-10 5-8-5"/>',
    // A speaking profile with sound radiating from the mouth.
    voice:'<path d="M10 55V43C4 36 5 28 6 21 8 10 17 6 25 10c6 3 8 9 8 14l6 8h-7v5h-7m7 0v5c0 4-4 6-10 6v7M25 22h1M44 28q5 5 0 10M50 22q11 11 0 22M56 16q17 17 0 34"/>',
    // A woman speaking her recurring habit; the simple bubble preserves the requested line.
    behavior:'<path d="M7 35V22C7 7 31 7 31 22v13M11 22c7 0 10-4 11-7 1 5 4 7 6 7v7c0 12-17 12-17 0zM7 35l-3 7h10m17-7 3 7H24M14 39v6m10-6v6M2 61v-6c0-7 10-10 17-10s17 3 17 10v6M16 32q3 3 6 0"/><path d="M49 7h114a6 6 0 0 1 6 6v33a6 6 0 0 1-6 6H57L43 61V13a6 6 0 0 1 6-6z"/><text x="55" y="26" fill="currentColor" stroke="none" font-family="Arimo, sans-serif" font-size="11"><tspan x="55">I add hot sauce</tspan><tspan x="55" dy="16">to everything.</tspan></text>',
    // Comedy and tragedy masks with one falling tear.
    emotion:'<path d="M4 9q14 6 28 0v17c0 11-8 18-14 20C12 44 4 37 4 26zM9 21q3-4 6 0m6 0q3-4 6 0M11 29h14q-7 15-14 0zM35 22q12 4 25-1v17c0 11-7 18-14 21-6-3-11-8-13-14M39 33h3m9 0h3M39 47q7-9 14 0M55 37q-5 7 0 7t0-7"/>',
    // A trophy raised on a pedestal.
    want:'<path d="M18 8h28v14c0 11-6 17-14 17s-14-6-14-17zM18 13H8v7c0 8 5 12 13 12M46 13h10v7c0 8-5 12-13 12M32 39v9M23 48h18M17 49h30v10H17zM10 59h44"/>',
    value:'<path d="M32 54 11 33C-6 16 17-1 32 17 47-1 70 16 53 33z"/>',
    // Rounded hemispheres and a few open folds suggest a brain.
    belief:'<path d="M32 14c-2-10-15-9-18 0-9 0-12 10-7 17-7 9-1 21 9 20 4 10 16 7 16-2V14zm0 0c2-10 15-9 18 0 9 0 12 10 7 17 7 9 1 21-9 20-4 10-16 7-16-2M14 14v8q0 6 7 6M7 31q10-4 12 5M16 51v-8q0-5 7-5M50 14v8q0 6-7 6M57 31q-10-4-12 5M48 51v-8q0-5-7-5"/>'
  };
  window.characterIcon = type => `<svg class="attribute-icon attribute-icon-${type}" viewBox="0 0 ${type === 'behavior' ? 176 : 64} 64" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawings[type] || ''}</svg>`;
})();
