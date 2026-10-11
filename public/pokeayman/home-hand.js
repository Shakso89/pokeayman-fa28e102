/* Iframe-native adaptation of the supplied CardHandGallery. */
window.mountPokemonHand = function (root, track, items) {
  root.classList.add('pokemon-hand');
  root.setAttribute('aria-label', 'Featured Pokémon');
  root.removeAttribute('aria-roledescription');
  track.className = 'pokemon-hand-stage';
  track.removeAttribute('tabindex');
  track.removeAttribute('aria-live');
  track.replaceChildren();
  const caption = document.createElement('div');
  caption.className = 'pokemon-hand-caption';
  caption.setAttribute('aria-live', 'polite');
  root.querySelector('.pokemon-hand-caption')?.remove();
  root.append(caption);
  let active = 0, hovered = -1, drag = null, ignoreClick = false;
  const cards = items.map((item, index) => {
    const slot = document.createElement('div');
    slot.className = 'pokemon-hand-slot';
    const lift = document.createElement('div');
    lift.className = 'pokemon-hand-lift';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pokemon-hand-card';
    button.setAttribute('aria-label', item.title);
    const top = document.createElement('span');
    top.className = 'pokemon-hand-number';
    top.textContent = `#${String(item.id).padStart(3, '0')}`;
    const art = document.createElement('span');
    art.className = 'pokemon-hand-art';
    const image = document.createElement('img');
    image.src = window.pokeaymanHomeArtwork?.[item.id] || item.src;
    image.alt = '';
    image.draggable = false;
    image.loading = index === 0 ? 'eager' : 'lazy';
    art.append(image);
    const name = document.createElement('span');
    name.className = 'pokemon-hand-name';
    name.textContent = item.title;
    const label = document.createElement('small');
    label.textContent = 'POKÉAYMAN';
    button.append(top, art, name, label);
    lift.append(button); slot.append(lift); track.append(slot);
    const select = () => { active = index; hovered = -1; update(); };
    button.addEventListener('click', () => {
      if (ignoreClick) { ignoreClick = false; return; }
      select();
    });
    slot.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch' && index !== active) { hovered = index; update(); } });
    slot.addEventListener('pointerleave', () => { if (hovered === index) { hovered = -1; update(); } });
    button.addEventListener('focus', () => { if (index !== active) { hovered = index; update(); } });
    button.addEventListener('blur', () => { hovered = -1; update(); });
    button.addEventListener('pointerdown', e => {
      ignoreClick = false;
      if (e.pointerType !== 'mouse' || e.button !== 0 || index === active) return;
      drag = { index, y: e.clientY, time: performance.now() };
      button.setPointerCapture(e.pointerId);
    });
    button.addEventListener('pointermove', e => {
      if (!drag || drag.index !== index) return;
      const offset = Math.min(0, e.clientY - drag.y);
      if (Math.abs(offset) > 6) { ignoreClick = true; button.style.transform = `translateY(${offset}px)`; }
    });
    button.addEventListener('pointerup', e => {
      if (!drag || drag.index !== index) return;
      const offset = e.clientY - drag.y;
      const speed = offset / Math.max(1, performance.now() - drag.time) * 1000;
      if (offset < -track.clientHeight * .25 || speed < -600) select();
      button.style.removeProperty('transform'); drag = null;
    });
    button.addEventListener('pointercancel', () => { button.style.removeProperty('transform'); drag = null; });
    return { slot, lift, button };
  });
  function update() {
    const width = Math.min(210, track.clientWidth * .45);
    const height = width * 1.4;
    const resting = cards.map((_, i) => i).filter(i => i !== active);
    const maxOffset = (resting.length - 1) / 2;
    const spacing = maxOffset > 0 ? Math.min(width * .52, Math.max(0, (track.clientWidth / 2 - width * .62) / maxOffset)) : 0;
    track.style.setProperty('--hand-card-width', `${width}px`);
    track.style.setProperty('--hand-stage-height', `${height * 1.78}px`);
    cards.forEach(({ slot, lift, button }, index) => {
      const selected = index === active;
      const handIndex = resting.indexOf(index);
      const offset = handIndex - (resting.length - 1) / 2;
      const rotate = selected ? 0 : offset * Math.min(9, 46 / Math.max(1, resting.length - 1));
      const y = selected ? -height * .62 : Math.abs(rotate) * 1.9;
      const x = selected ? 0 : offset * spacing;
      const over = !selected && hovered === index;
      slot.style.transform = `translateX(-50%) translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${selected ? 1 : .72})`;
      slot.style.zIndex = selected ? '100' : over ? '60' : String(10 + handIndex);
      lift.style.transform = over ? `translateY(${-height * .34 / .72}px) rotate(${-rotate * .45}deg) scale(1.08)` : '';
      button.setAttribute('aria-pressed', String(selected));
    });
    caption.replaceChildren();
    const count = document.createElement('small');
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    const title = document.createElement('strong'); title.textContent = items[active].title;
    const number = document.createElement('span'); number.textContent = items[active].subtitle;
    caption.append(count, title, number);
  }
  const onKey = e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); active = (active + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    hovered = -1; update(); cards[active].button.focus();
  };
  track.addEventListener('keydown', onKey);
  const observer = new ResizeObserver(update); observer.observe(track);
  update();
  return () => { observer.disconnect(); track.removeEventListener('keydown', onKey); caption.remove(); };
};