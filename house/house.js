/* ==========================================================
   Maison : script commun à toutes les pages de /house/
   1. Les zones cliquables (<map>) suivent la taille de l'image
   2. Le bouton retour revient à la pièce d'où on vient
   3. Les images avec data-audio lancent / coupent la musique
   4. Avertit dans la console (F12) des erreurs d'image map
   ========================================================== */

(function () {

  /* ---------- 1. Image maps qui se redimensionnent ----------
     Les coordonnées sont celles de l'image en taille réelle
     (celles données par image-map.net), on les met à l'échelle. */

  function resizeMaps() {
    document.querySelectorAll('img[usemap]').forEach(function (img) {
      if (!img.naturalWidth) return;

      var map = document.querySelector('map[name="' + img.useMap.slice(1) + '"]');
      if (!map) return;

      var scale = img.clientWidth / img.naturalWidth;

      map.querySelectorAll('area[coords]').forEach(function (area) {
        if (!area.dataset.coords) area.dataset.coords = area.coords;

        area.coords = area.dataset.coords
          .split(',')
          .map(function (n) { return Math.round(parseFloat(n) * scale); })
          .join(',');
      });
    });
  }

  /* ---------- 2. Bouton retour ----------
     Si on arrive d'une autre page de la maison, on y retourne
     (ex. aboutme ouvert depuis le couloir OU la salle de bain).
     Sinon, on suit le href du lien. */

  function setupReturn() {
    document.querySelectorAll('a.retour').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var ref = document.referrer;
        if (ref && ref.indexOf(location.origin + '/house/') === 0 && history.length > 1) {
          e.preventDefault();
          history.back();
        }
      });
    });
  }

  /* ---------- 3. Musique ----------
     <img data-audio="myAudio" ...> lance / coupe <audio id="myAudio">. */

  function setupAudio() {
    document.querySelectorAll('[data-audio]').forEach(function (el) {
      el.addEventListener('click', function () {
        var audio = document.getElementById(el.dataset.audio);
        if (!audio) return;
        if (audio.paused) audio.play().catch(function () {});
        else audio.pause();
      });
    });
  }

  /* ---------- 4. Vérifications ----------
     Ne change rien à la page : écrit juste les problèmes dans la console. */

  var COORDS_COUNT = { rect: 4, circle: 3 };

  function checkMaps() {
    document.querySelectorAll('area').forEach(function (area) {
      var name = '[maison] zone "' + (area.alt || area.title || '?') + '" : ';
      var shape = area.getAttribute('shape') || 'rect';
      var coords = (area.dataset.coords || area.getAttribute('coords') || '').split(',');

      if (area.hasAttribute('href') && !area.getAttribute('href')) {
        console.warn(name + 'href vide, ça recharge la page. Enlève le href tant que la page n\'existe pas.');
      }
      if (['rect', 'circle', 'poly', 'default'].indexOf(shape) === -1) {
        console.warn(name + 'shape="' + shape + '" invalide (rect, circle ou poly).');
      }
      if (COORDS_COUNT[shape] && coords.length !== COORDS_COUNT[shape]) {
        console.warn(name + shape + ' attend ' + COORDS_COUNT[shape] + ' nombres, il y en a ' + coords.length + '.');
      }
      if (shape === 'poly' && coords.length % 2) {
        console.warn(name + 'poly attend un nombre pair de coordonnées.');
      }
      if (!area.alt) {
        console.warn(name + 'il manque alt="...".');
      }
    });
  }

  /* ---------- Lancement ---------- */

  setupReturn();
  setupAudio();
  checkMaps();

  window.addEventListener('load', resizeMaps);
  window.addEventListener('resize', resizeMaps);
  document.querySelectorAll('img[usemap]').forEach(function (img) {
    if (img.complete) resizeMaps();
    else img.addEventListener('load', resizeMaps);
  });

})();
