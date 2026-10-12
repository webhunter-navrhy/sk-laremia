(function () {
  document.documentElement.classList.add('js');

  // menu na mobile
  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  if (burger) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('otvorene');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('otvorene'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // výber kurzu → heslo v slovníku + predvyplnená prihláška
  var select = document.querySelector('.formular select[name=kurz]');
  var vybrane = document.querySelector('.vybrane');
  function nastavKurz(id) {
    if (!select || !id) return;
    select.value = id;
    var opt = select.options[select.selectedIndex];
    if (vybrane && opt && opt.value) { vybrane.hidden = false; vybrane.querySelector('strong').textContent = opt.textContent; }
  }
  document.querySelectorAll('.moznost').forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      document.querySelectorAll('.moznost').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var id = b.getAttribute('data-kurz');
      nastavKurz(id);
      document.querySelectorAll('.heslo.zvyraznene').forEach(function (h) { h.classList.remove('zvyraznene'); });
      var ciel = id === 'deti' ? document.getElementById('deti') : document.getElementById('k-' + id);
      if (ciel) { if (id !== 'deti') { ciel.classList.add('zvyraznene'); otvor(ciel, true); } ciel.scrollIntoView({ block: 'start' }); }
    });
  });
  document.querySelectorAll('a[data-kurz]').forEach(function (a) {
    a.addEventListener('click', function () { nastavKurz(a.getAttribute('data-kurz')); });
  });

  // slovník na mobile: heslá zbalené, otvorené len prvé
  var mobil = matchMedia('(max-width: 820px)');
  var hesla = document.querySelectorAll('.heslo[id^="k-"]');
  function otvor(h, ano) {
    h.classList.toggle('zbalene', !ano);
    var b = h.querySelector('.heslo-prepinac'); if (b) b.setAttribute('aria-expanded', ano ? 'true' : 'false');
  }
  function nastavHesla() { hesla.forEach(function (h, i) { otvor(h, !mobil.matches || i === 0); }); }
  nastavHesla();
  if (mobil.addEventListener) mobil.addEventListener('change', nastavHesla);
  hesla.forEach(function (h) {
    var b = h.querySelector('.heslo-prepinac');
    if (b) b.addEventListener('click', function () { if (mobil.matches) otvor(h, h.classList.contains('zbalene')); });
  });

  // jemné odkrytie
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('videt'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.heslo, .kroky li, .deti-fakty div, .moznosti li').forEach(function (el) { el.classList.add('odkryt'); io.observe(el); });
  }

  // prihláška – v návrhu nič neodosiela
  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('data-endpoint');
      var demo = f.getAttribute('data-demo') === '1';
      if (f.querySelector('.past input').value) { e.preventDefault(); return; }
      e.preventDefault();
      if (demo || !endpoint) { stav.textContent = 'Toto je ukážka: prihláška sa zatiaľ neodosiela. Na hotovom webe príde priamo na laremia@laremia.sk.'; return; }
      stav.textContent = 'Odosielam…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Ďakujeme, prihláška je odoslaná. Ozveme sa Vám.'; })
        .catch(function () { stav.textContent = 'Odoslanie sa nepodarilo. Napíšte nám prosím na laremia@laremia.sk.'; });
    });
  });
})();
