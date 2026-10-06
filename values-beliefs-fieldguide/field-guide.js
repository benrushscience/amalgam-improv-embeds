/* Character field guide v1. Small renderers keep content, navigation, and motion separate. */
(() => {
  'use strict';
  const {entries, families} = window.referenceContent;
  const findEntry = id => entries.find(entry => entry.id === id);
  const findFamily = entry => families.find(family => family.id === entry.family && family.type === entry.type);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const initialEntry = findEntry(new URLSearchParams(location.search).get('entry')) || findEntry('v26');
  const state = {selected:initialEntry.id, type:initialEntry.type, query:'', open:new Set([initialEntry.family]), paused:false};
  const list = document.querySelector('#index-list');
  const panel = document.querySelector('#entry-panel');
  const search = document.querySelector('#search');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const related = entry => entry.type === 'value'
    ? entries.filter(item => item.type === 'belief' && item.relatedNames.includes(entry.name))
    : entries.filter(item => item.type === 'value' && entry.relatedNames.includes(item.name));
  const searchable = entry => `${entry.name} ${entry.meaning} ${entry.kind} ${findFamily(entry).name}`.toLowerCase();

  // Vector rings echo the supplied concentric spacing; alternating groups breathe at different rates.
  function circleAnimation() {
    const rings = radii => radii.map(radius => `<circle cx="100" cy="100" r="${radius}"/>`).join('');
    return `<svg class="mind-rings" viewBox="0 0 200 200" fill="none" aria-hidden="true" focusable="false">
      <g class="rings-expand" stroke="currentColor" stroke-width="4">${rings([12,32,52,72])}</g>
      <g class="rings-contract" stroke="currentColor" stroke-width="3" opacity=".7">${rings([22,42,62,82])}</g>
      <g class="rings-orbit" stroke="currentColor" stroke-width="1.5"><circle cx="100" cy="100" r="92" stroke-dasharray="36 12 4 12"/><circle cx="192" cy="100" r="4" fill="currentColor" stroke="white" stroke-width="2"/></g>
    </svg>`;
  }

  // A search covers both collections; selecting a result sets the corresponding collection tab.
  function renderIndex() {
    const query = state.query.trim().toLowerCase();
    const found = entries.filter(entry => query ? searchable(entry).includes(query) : entry.type === state.type);
    document.querySelector('#result-count').textContent = query ? `${found.length} matching entries` : `30 ${state.type}s · ${state.type === 'value' ? 10 : 6} ${state.type === 'value' ? 'families' : 'topics'}`;
    document.querySelectorAll('[data-type]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === state.type)));
    const visibleFamilies = families.filter(family => found.some(entry => entry.family === family.id && entry.type === family.type));
    list.innerHTML = visibleFamilies.map(family => {
      const children = found.filter(entry => entry.family === family.id && entry.type === family.type);
      return `<details class="index-family" data-family="${family.id}" ${query || state.open.has(family.id) ? 'open' : ''}><summary><span class="family-dot" aria-hidden="true"></span><span>${escape(family.name)}</span><span class="family-count">${children.length}</span></summary><div class="family-entries">${children.map(entry => `<button class="entry-link" data-entry="${entry.id}" ${entry.id === state.selected ? 'aria-current="true"' : ''}><span>${escape(entry.name)}${query ? `<small>${entry.kind}</small>` : ''}</span></button>`).join('')}</div></details>`;
    }).join('') || '<p class="empty">No convictions found. Try “trust,” “family,” or “fairness.”</p>';
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

  // The paper surface reveals only on selection; typing in search never interrupts reading.
  function renderEntry(animate = false) {
    const entry = findEntry(state.selected);
    const family = findFamily(entry);
    const connections = related(entry);
    const scenes = window.characterScenePrompts[entry.id];
    const kindExplanation = entry.type === 'value' ? 'What matters to them' : entry.kind === 'Worldview' ? 'What they take to be true' : 'What they believe ought to happen';
    panel.innerHTML = `
      <div class="entry-body"><div class="entry-heading"><p class="entry-kind">${entry.kind} <span aria-hidden="true">·</span> ${kindExplanation}</p><h2 id="entry-title" tabindex="-1" class="${entry.type === 'belief' ? 'belief-title' : ''}">${escape(entry.name)}</h2><div class="entry-symbol" aria-hidden="true">${circleAnimation()}</div></div>
      <section class="reading-section meaning-section" aria-labelledby="meaning-heading"><div class="section-heading"><h3 id="meaning-heading">What it means</h3></div><p class="entry-meaning">${escape(entry.meaning)}</p><p class="family-context"><span aria-hidden="true">↳</span>Family: ${escape(family.name)}</p></section>
      <section class="reading-section scene-section" aria-labelledby="scene-heading"><div class="section-heading"><h3 id="scene-heading">Example scenarios and lines</h3></div><p class="section-intro">Three separate scenes. Choose a situation to explore and make the line your own.</p><div class="scene-examples">${scenes.map((prompt,index) => scenePrompt(prompt,index + 1)).join('')}</div></section>
      <section class="reading-section connections" aria-labelledby="connections-heading"><div class="section-heading"><h3 id="connections-heading">${entry.type === 'value' ? 'Related beliefs' : 'Related values'}</h3></div><p class="section-intro">${entry.type === 'value' ? 'Different beliefs can express the same value. Follow a connection to explore another perspective.' : 'This belief could express several values. Follow a connection to explore what might matter to the character.'}</p><div class="connection-list">${connections.map((item,index) => `<button class="connection" data-related="${item.id}"><span class="connection-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="connection-title">${escape(item.name)}<small>${item.kind}</small></span><span class="connection-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></section></div>`;
    panel.classList.remove('revealing');
    if (animate) { void panel.offsetWidth; panel.classList.add('revealing'); }
    document.title = `${entry.name} · A Field Guide to Beliefs and Values`;
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
    renderEntry(true);
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
      state.query = ''; search.value = '';
      selectEntry(button.dataset.related,{focusReading:true});
    } else if (button.dataset.type) {
      state.type = button.dataset.type; state.query = ''; search.value = '';
      // Changing the browsing collection does not discard the entry being read.
      renderIndex();
    } else if (button.id === 'expand-families') {
      const disclosures = [...list.querySelectorAll('details')];
      const shouldOpen = !disclosures.every(item => item.open);
      disclosures.forEach(item => { item.open = shouldOpen; });
      updateExpandLabel();
    } else if (button.id === 'motion-control') {
      state.paused = !state.paused;
      updateMotion();
    }
  });
  search.addEventListener('input', () => { state.query = search.value; renderIndex(); });
  window.addEventListener('popstate', () => {
    state.query = ''; search.value = '';
    selectEntry(new URLSearchParams(location.search).get('entry') || initialEntry.id,{updateUrl:false,focusReading:true});
  });

  // A reduced-motion system setting always takes precedence over decorative animation.
  function updateMotion() {
    const paused = state.paused || reducedMotion.matches;
    document.body.classList.toggle('motion-paused',paused);
    const button = document.querySelector('#motion-control');
    button.setAttribute('aria-pressed',String(paused));
    button.disabled = reducedMotion.matches;
    document.querySelector('#motion-label').textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  }
  reducedMotion.addEventListener('change',updateMotion);
  renderIndex(); renderEntry(); updateMotion();
  // Keep the initial selection visible within the independent index scroll area.
  const initialButton = list.querySelector('[aria-current="true"]');
  if (initialButton) list.scrollTop += initialButton.getBoundingClientRect().top - list.getBoundingClientRect().top - 65;
})();
