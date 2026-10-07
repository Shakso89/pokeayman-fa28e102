// Pointer-driven 3D tilt for the Pokémon details card.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function ensureElectric(card) {
    var border = card.querySelector('.dh-electric-border');
    if (!card.classList.contains('detail-card-legendary')) {
      if (border) border.remove();
      var defs = document.getElementById('dh-turbulent-displace');
      if (defs && defs.ownerSVGElement) defs.ownerSVGElement.remove();
      return;
    }
    if (!document.getElementById('dh-turbulent-displace')) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;';
      svg.innerHTML = '<defs><filter id="dh-turbulent-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="n1" seed="1"/>' +
        '<feOffset in="n1" dx="0" dy="0" result="o1"><animate attributeName="dy" values="700;0" dur="6s" repeatCount="indefinite" calcMode="linear"/></feOffset>' +
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="n2" seed="1"/>' +
        '<feOffset in="n2" dx="0" dy="0" result="o2"><animate attributeName="dy" values="0;-700" dur="6s" repeatCount="indefinite" calcMode="linear"/></feOffset>' +
        '<feComposite in="o1" in2="o2" result="p1"/>' +
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="n3" seed="2"/>' +
        '<feOffset in="n3" dx="0" dy="0" result="o3"><animate attributeName="dx" values="490;0" dur="6s" repeatCount="indefinite" calcMode="linear"/></feOffset>' +
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="n4" seed="2"/>' +
        '<feOffset in="n4" dx="0" dy="0" result="o4"><animate attributeName="dx" values="0;-490" dur="6s" repeatCount="indefinite" calcMode="linear"/></feOffset>' +
        '<feComposite in="o3" in2="o4" result="p2"/>' +
        '<feBlend in="p1" in2="p2" mode="color-dodge" result="cn"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="cn" scale="30" xChannelSelector="R" yChannelSelector="B"/>' +
        '</filter></defs>';
      document.body.appendChild(svg);
    }
    if (border) return;
    var wrap = document.createElement('div');
    wrap.className = 'dh-electric-border';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<div class="dh-electric-main"></div><div class="dh-electric-glow1"></div><div class="dh-electric-glow2"></div><div class="dh-electric-overlay"></div>';
    card.appendChild(wrap);
  }
  function bind() {
    var card = document.getElementById('modal-card');
    if (!card || card.dataset.dhBound) return !!card;
    card.dataset.dhBound = '1';
    ensureElectric(card);
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var max = card.classList.contains('detail-card-legendary') ? 14 : card.classList.contains('detail-card-rare') ? 11 : 6;
      card.classList.remove('dh-resting');
      card.style.setProperty('--ry', ((x - 0.5) * max * 2).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * max * 2).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.add('dh-resting');
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '50%'); card.style.setProperty('--my', '50%');
    });
    new MutationObserver(function () { ensureElectric(card); }).observe(card, { attributes: true, attributeFilter: ['class'] });
    return true;
  }
  if (!bind()) document.addEventListener('DOMContentLoaded', bind);
  document.addEventListener('click', bind, true);
})();
