// Pointer-driven 3D tilt for the Pokémon details card.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function bind() {
    var card = document.getElementById('modal-card');
    if (!card || card.dataset.dhBound) return !!card;
    card.dataset.dhBound = '1';
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
    return true;
  }
  if (!bind()) document.addEventListener('DOMContentLoaded', bind);
  document.addEventListener('click', bind, true);
})();
