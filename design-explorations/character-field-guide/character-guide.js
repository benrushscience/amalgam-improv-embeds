/* Character field guide v1. Small renderers keep content, navigation, and static category artwork separate. */
(() => {
  'use strict';
  const {entries, families} = window.referenceContent;
  const collections = window.characterCollections;
  const findEntry = id => entries.find(entry => entry.id === id);
  const findFamily = entry => families.find(family => family.id === entry.family && family.type === entry.type);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const initialEntry = findEntry(new URLSearchParams(location.search).get('entry')) || findEntry('physicality-1');
  const state = {selected:initialEntry.id, type:initialEntry.type, open:new Set([initialEntry.family])};
  const list = document.querySelector('#index-list');
  const panel = document.querySelector('#entry-panel');
  // Connections are suggestions, including reciprocal links across collections.
  const related = entry => entries.filter(item => item.id !== entry.id && (
    entry.relatedIds?.includes(item.id) || item.relatedIds?.includes(entry.id) ||
    (entry.type === 'value' && item.type === 'belief' && item.relatedNames?.includes(entry.name)) ||
    (entry.type === 'belief' && item.type === 'value' && entry.relatedNames?.includes(item.name))
  ));
  // The index browses the selected collection and its families.
  function renderIndex() {
    const found = entries.filter(entry => entry.type === state.type);
    const collection = collections[state.type];
    const familyCount = families.filter(family => family.type === state.type).length;
    document.querySelector('#collection-title').textContent = `Index: ${collection.name}`;
    document.querySelector('#collection-description').textContent = collection.description;
    // The companion wheel belongs only to the Emotions collection.
    document.querySelector('#collection-resource').innerHTML = state.type === 'emotion'
      ? '<p class="collection-resource"><a href="https://www.amalgamimprov.com/emotion-wheel" target="_blank" rel="noopener noreferrer">Explore the emotion color wheel <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a></p>'
      : '';
    document.querySelector('#result-count').textContent = `${found.length} entries · ${familyCount} families`;
    document.querySelectorAll('[data-type]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === state.type)));
    const visibleFamilies = families.filter(family => found.some(entry => entry.family === family.id && entry.type === family.type));
    list.innerHTML = visibleFamilies.map(family => {
      const children = found.filter(entry => entry.family === family.id && entry.type === family.type);
      return `<details class="index-family" data-family="${family.id}" ${state.open.has(family.id) ? 'open' : ''}><summary><span class="family-dot" aria-hidden="true"></span><span>${escape(family.name)}</span><span class="family-count">${children.length}</span></summary><div class="family-entries">${children.map(entry => `<button class="entry-link" data-entry="${entry.id}" ${entry.id === state.selected ? 'aria-current="true"' : ''}><span>${escape(entry.name)}</span></button>`).join('')}</div></details>`;
    }).join('') || '<p class="empty">No choices found. Try “pace,” “trust,” or “connection.”</p>';
    updateExpandLabel();
  }
  function updateExpandLabel() {
    const panels = [...list.querySelectorAll('details')];
    const allOpen = panels.length > 0 && panels.every(item => item.open);
    document.querySelector('#expand-families').textContent = allOpen ? 'Collapse all' : 'Expand all';
  }

  // Each standalone example offers fresh circumstances and a playable character line.
  function scenePrompt(prompt, number) {
    return `<div class="scene-example"><span class="example-label">Scenario ${number}</span><p>${escape(prompt.setup)}</p><span class="example-label dialogue-label">Your character says</span><blockquote class="scene-line">“${escape(prompt.line)}”</blockquote></div>`;
  }

  // The reading panel updates immediately, without animated transitions.
  function renderEntry() {
    const entry = findEntry(state.selected);
    const family = findFamily(entry);
    const connections = related(entry);
    const scenes = window.characterScenePrompts[entry.id];
    const kindExplanation = collections[entry.type].question;
    panel.innerHTML = `
      <div class="entry-body"><div class="entry-heading"><p class="entry-kind">${entry.kind} <span aria-hidden="true">·</span> ${kindExplanation}</p><h2 id="entry-title" tabindex="-1" class="${entry.type === 'belief' ? 'belief-title' : ''}">${escape(entry.name)}</h2><div class="entry-symbol" aria-hidden="true">${window.characterIcon(entry.type)}</div></div>
      <section class="reading-section meaning-section" aria-labelledby="meaning-heading"><div class="section-heading"><h3 id="meaning-heading">What it means</h3></div><p class="entry-meaning">${escape(entry.meaning)}</p><p class="family-context"><span aria-hidden="true">↳</span>Family: ${escape(family.name)}</p>${entry.cue ? `<div class="choice-cue"><div><h4>Try this choice</h4><p>${escape(entry.cue)}</p></div></div>` : ''}</section>
      <section class="reading-section scene-section" aria-labelledby="scene-heading"><div class="section-heading"><h3 id="scene-heading">Example scenarios and lines</h3></div><p class="section-intro">Three separate scenes. Choose a situation to explore and make the line your own.</p><div class="scene-examples">${scenes.map((prompt,index) => scenePrompt(prompt,index + 1)).join('')}</div></section>
      <section class="reading-section connections" aria-labelledby="connections-heading"><div class="section-heading"><h3 id="connections-heading">Explore another layer</h3></div><p class="section-intro">Possible connections, not a character formula. Try one alongside this choice, or discover a different combination.</p><div class="connection-list">${connections.map((item,index) => `<button class="connection" data-related="${item.id}"><span class="connection-title">${escape(item.name)}<small>${collections[item.type].name}</small></span><span class="connection-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></section></div>`;
    document.title = `${entry.name} · Character Field Guide`;
  }

  // Selection keeps the desktop index in place; small screens move focus to the reading panel.
  function selectEntry(id, {updateUrl = true, focusReading = false} = {}) {
    const entry = findEntry(id);
    if (!entry) return;
    state.selected = id;
    state.type = entry.type;
    state.open.add(entry.family);
    const previousScroll = list.scrollTop;
    renderIndex();
    list.scrollTop = previousScroll;
    const active = list.querySelector(`[data-entry="${id}"]`);
    if (active) {
      const outer = list.getBoundingClientRect(), inner = active.getBoundingClientRect();
      if (inner.top < outer.top || inner.bottom > outer.bottom) list.scrollTop += inner.top - outer.top - 45;
    }
    renderEntry();
    // Every selection starts at the beginning of its independently scrolling article.
    document.querySelector('.reading-column').scrollTop = 0;
    if (updateUrl) { const url = new URL(location.href); url.searchParams.set('entry',id); history.pushState({entry:id},'',url); }
    document.querySelector('#announcement').textContent = `${entry.kind}: ${entry.name}`;
    if (focusReading || innerWidth <= 580) document.querySelector('#entry-title').focus({preventScroll:innerWidth > 580});
    else active?.focus({preventScroll:true});
  }

  // Native disclosure panels preserve keyboard interaction and straightforward browsing.
  list.addEventListener('toggle', event => {
    const disclosure = event.target;
    if (!disclosure.isConnected || !disclosure.dataset.family) return;
    if (disclosure.open) state.open.add(disclosure.dataset.family);
    else state.open.delete(disclosure.dataset.family);
    updateExpandLabel();
  }, true);
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.entry) selectEntry(button.dataset.entry);
    else if (button.dataset.related) {

      selectEntry(button.dataset.related,{focusReading:true});
    } else if (button.dataset.type) {
      state.type = button.dataset.type;
      // Each collection opens a representative entry so the whole view stays coherent.
      const remembered = entries.find(item => item.type === state.type && item.id === state.selected);
      selectEntry((remembered || entries.find(item => item.type === state.type)).id);
      button.focus({preventScroll:true});
    } else if (button.id === 'expand-families') {
      const disclosures = [...list.querySelectorAll('details')];
      const shouldOpen = !disclosures.every(item => item.open);
      disclosures.forEach(item => { item.open = shouldOpen; });
      updateExpandLabel();
    }
  });
  window.addEventListener('popstate', () => {

    selectEntry(new URLSearchParams(location.search).get('entry') || initialEntry.id,{updateUrl:false,focusReading:true});
  });

  renderIndex(); renderEntry();
  // Keep the initial selection visible within the independent index scroll area.
  const initialButton = list.querySelector('[aria-current="true"]');
  if (initialButton) list.scrollTop += initialButton.getBoundingClientRect().top - list.getBoundingClientRect().top - 65;
})();
