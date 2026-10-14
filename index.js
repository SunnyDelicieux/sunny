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
const B = 'https://sunnydelicieux.neocities.org/';
const tree = [
  { label: 'home', children: [
    { label: 'emote', href: B+'perso/gallery' },
    { label: 'maison', href: B+'house/couloir', children: [
      { label: 'painting',      href: B+'house/painting' },
      { label: 'salle de bain', href: B+'house/skin' },
      { label: 'chambre', children: [
        { label: 'pins',             href: B+'house/pins' },
        { label: "what's in my bag", href: B+'house/bag' },
      ]},
    ]},
    { label: 'other', children: [
      { label: 'shoes',       href: B+'perso/shoes' },
      { label: 'old drawing', href: B+'perso/olddrawing' },
    ]},
  ]},
  { label: 'jeu de role', children: [
    { label: 'vampire la mascarade', children: [
      { label: 'amiens by night',    href: B+'jeuderole/VTM/AMIENS/index' },
      { label: 'liege by night',     href: B+'jeuderole/VTM/LiegeByNight/page' },
      { label: 'marseille by day',   href: B+'jeuderole/VTM/marseille' },
      { label: 'fall of london',     href: B+'jeuderole/VTM/FOL' },
      { label: 'society st leopold', href: B+'jeuderole/VTM/leopold/accueil' },
      { label: 'soul4sale',          href: B+'jeuderole/VTM/S4S' },
    ]},
    { label: 'other games', children: [
      { label: 'monster of the week', href: B+'jeuderole/MOTW' },
      { label: 'jabrainor',           href: B+'jeuderole/jabrainor/jabrainor2' },
    ]},
  ]},
  { label: 'files', children: [
    { label: 'skyghoul', href: B+'jeuderole/asset/marseillefiles' },
  ]},
];

const sectionIcons = { 'home': '🏠', 'jeu de role': '🎲', 'files': '📁' };
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
    det.innerHTML = `<summary>${icon} ${section.label}</summary>`;
    det.appendChild(buildTree(section.children, false));
    feed.appendChild(det);
  }
}
