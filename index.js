// === Popup drag ===
(function() {
  const popup = document.getElementById('virusPopupWrap');
  const bar = document.getElementById('virusPopupBar');
  if (!popup || !bar) return;
  let isDragging = false, startX, startY, origX, origY;
  bar.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = popup.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    popup.style.transition = 'none';
    document.body.style.userSelect = 'none';
    popup.style.right = 'auto';
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    popup.style.left = (origX + e.clientX - startX) + 'px';
    popup.style.top = (origY + e.clientY - startY) + 'px';
  });
  window.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });
})();

// === Header loader ===
fetch('/header-template.html')
  .then(response => response.text())
  .then(data => {
    const header = document.getElementById('header-placeholder');
    header.innerHTML = data;
    header.querySelectorAll('.dropdown').forEach(function(dd) {
      var menu = dd.querySelector('.dropdown-menu');
      if (!menu) return;
      dd.addEventListener('mouseenter', function() { menu.style.display = 'block'; });
      dd.addEventListener('mouseleave', function() { menu.style.display = 'none'; });
    });
  });

// === Fish animation ===
document.querySelectorAll('.fish').forEach((fish, index) => {
  let x = Math.random() * (fish.parentElement.offsetWidth - 100);
  let y = Math.random() * (fish.parentElement.offsetHeight - 100);
  let dx = (Math.random() - 0.5) * 1;
  let dy = (Math.random() - 0.5) * 1;

  function setDirection() {
    if (index === 1) {
      fish.style.transform = `scaleX(${dx < 0 ? 1 : -1})`;
    } else {
      fish.style.transform = `scaleX(${dx > 0 ? 1 : -1})`;
    }
  }
  setDirection();

  function update() {
    x += dx;
    y += dy;
    if (x <= 0 || x >= fish.parentElement.offsetWidth - 100) { dx = -dx; setDirection(); }
    if (y <= 0 || y >= fish.parentElement.offsetHeight - 100) dy = -dy;
    fish.style.left = x + 'px';
    fish.style.top = y + 'px';
    requestAnimationFrame(update);
  }
  update();
});

// === Sitemap builder ===
// Plan du site : liens vers les pages du site (chemins depuis la racine).
const tree = [
  { label: 'home', children: [
    { label: 'emote',   href: '/perso/gallery.html' },
    { label: 'galerie', href: '/image.html' },
    { label: 'maison', href: '/house/couloir.html', children: [
      { label: 'painting',      href: '/house/painting.html' },
      { label: 'salle de bain', href: '/house/skin.html' },
      { label: 'chambre', href: '/house/chambre.html', children: [
        { label: 'pins',             href: '/house/pins.html' },
        { label: "what's in my bag", href: '/house/bag.html' },
      ]},
    ]},
    { label: 'other', children: [
      { label: 'shoes',       href: '/perso/shoes.html' },
      { label: 'old drawing', href: '/perso/olddrawing.html' },
    ]},
  ]},
  { label: 'jeu de role', href: '/jeuderole.html', children: [
    { label: 'vampire la mascarade', children: [
      { label: 'izmir by night', href: 'https://izmir.sunnydelicieux.com' },
      { label: 'amiens by night', href: '/jeuderole/VTM/AMIENS/index.html', children: [
        { label: 'galerie',      href: '/jeuderole/VTM/AMIENS/gallery.html' },
        { label: 'lore',         href: '/jeuderole/VTM/AMIENS/lore.html' },
        { label: 'constitution', href: '/jeuderole/VTM/AMIENS/constitution.html' },
      ]},
      { label: 'pest control', href: '/jeuderole/VTM/shibuya/main.html' },
      { label: 'society st leopold', href: '/jeuderole/VTM/leopold/accueil.html' },
      { label: 'liege by night',   href: '/jeuderole/VTM/LiegeByNight/page.html' },
      { label: 'marseille by day', href: '/jeuderole/VTM/marseille.html' },
      { label: 'fall of london',   href: '/jeuderole/VTM/FOL.html' },
      { label: 'soul4sale',        href: '/jeuderole/VTM/S4S.html' },
    ]},
    { label: 'other games', children: [
      { label: 'jabrainor', href: '/jeuderole/jabrainor/jabrainor2.html', children: [
        { label: 'galerie', href: '/jeuderole/jabrainor/jabrainor-galerie.html' },
        { label: 'journal', href: '/jeuderole/jabrainor/jabrainor-journal.html' },
        { label: 'carte',   href: '/jeuderole/jabrainor/jabrainor-carte.html' },
      ]},
      { label: 'phandelver',          href: '/jeuderole/mine.html' },
      { label: 'monster of the week', href: '/jeuderole/MOTW.html' },
    ]},
  ]},
];

const sectionIcons = { 'home': '🏠', 'jeu de role': '🎲' };
const folderIcon = '📂';
const leafIcon = '▸';

function buildTree(nodes, nested) {
  const ul = document.createElement('ul');
  ul.className = 'sitemap-tree' + (nested ? ' nested' : '');
  for (const n of nodes) {
    const li = document.createElement('li');
    if (n.dead) {
      li.innerHTML = `<span class="dead-link">${n.label} (dead link)</span>`;
    } else if (n.children) {
      const det = document.createElement('details');
      det.className = 'sitemap-subfolder';
      det.open = true;
      const sum = document.createElement('summary');
      sum.innerHTML = n.href
        ? `${folderIcon} <a href="${n.href}">${n.label}</a>`
        : `${folderIcon} ${n.label}`;
      det.appendChild(sum);
      det.appendChild(buildTree(n.children, true));
      li.appendChild(det);
    } else {
      li.innerHTML = `${leafIcon} <a href="${n.href}">${n.label}</a>`;
    }
    ul.appendChild(li);
  }
  return ul;
}

const feed = document.getElementById('sitemap-feed');
if (feed) {
  for (const section of tree) {
    const det = document.createElement('details');
    det.className = 'sitemap-folder';
    det.open = true;
    const icon = sectionIcons[section.label] || '📁';
    det.innerHTML = section.href
      ? `<summary>${icon} <a href="${section.href}">${section.label}</a></summary>`
      : `<summary>${icon} ${section.label}</summary>`;
    det.appendChild(buildTree(section.children, false));
    feed.appendChild(det);
  }
}

// === Updates (la liste est dans updates-data.js) ===
const updatesFeed = document.getElementById('updates-feed');
if (updatesFeed && typeof UPDATES !== 'undefined' && UPDATES.length) {
  const newest = UPDATES[0].date;
  updatesFeed.innerHTML = '';
  UPDATES.forEach(function (u) {
    const row = document.createElement('li');
    row.className = 'upd-row' + (u.date && u.date === newest ? ' is-new' : '');
    const date = document.createElement('span');
    date.className = 'upd-date';
    date.textContent = u.date || '★';
    const text = document.createElement(u.lien ? 'a' : 'span');
    text.className = 'upd-text';
    text.textContent = u.texte;
    if (u.lien) text.href = u.lien;
    row.append(date, text);
    if (u.date && u.date === newest) {
      const badge = document.createElement('span');
      badge.className = 'upd-new';
      badge.textContent = 'NEW';
      row.append(badge);
    }
    updatesFeed.append(row);
  });
}
