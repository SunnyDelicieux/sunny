/* =========================================================
   GALERIE — explorateur façon Windows XP, intégré à la page
   Construit l'explorateur et la visionneuse à partir de la
   liste GALERIE (galerie-data.js).
   Rien à modifier ici pour ajouter des images ou des dossiers.
   ========================================================= */
(function () {
  var root = document.getElementById("bureau");
  if (!root || typeof GALERIE === "undefined") return;

  /* ---------- petits outils ---------- */
  /* Les "boutons" sont des <span role="button"> : xp.css restyle tous les
     <button> de la page, ce qui casserait le look de la galerie. */
  function activate(e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); }
  }
  function el(tag, attrs) {
    var isBtn = tag === "button";
    var node = document.createElement(isBtn ? "span" : tag);
    if (isBtn) {
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.addEventListener("keydown", activate);
    }
    for (var k in attrs || {}) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) node.append(arguments[i]);
    return node;
  }
  function plural(n, word) { return n + " " + word + (n > 1 ? "s" : ""); }

  /* dégradés partagés par les icônes de dossier (définis une seule fois) */
  root.insertAdjacentHTML("afterbegin",
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="xp-fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2c862"/><stop offset="1" stop-color="#d9a234"/></linearGradient>' +
    '<linearGradient id="xp-ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2bf"/><stop offset=".45" stop-color="#fbdb7c"/><stop offset="1" stop-color="#f0bf4a"/></linearGradient>' +
    '</defs></svg>');

  var ICON = {
    folder:
      '<svg viewBox="0 0 48 40" aria-hidden="true">' +
      '<path d="M3 7a3 3 0 0 1 3-3h11l4 4h21a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="url(#xp-fb)" stroke="#b9862a" stroke-width="1"/>' +
      '<path d="M2 15a2 2 0 0 1 2-2h40a2 2 0 0 1 2 2l-2 20a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="url(#xp-ff)" stroke="#c99a34" stroke-width="1"/></svg>',
    up:
      '<svg viewBox="0 0 24 20" aria-hidden="true"><path d="M2 5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#f6cf62" stroke="#b9862a"/>' +
      '<path d="M12 7l-4 4h2.5v4h3v-4H16z" fill="#2a8a2a" stroke="#fff" stroke-width=".6"/></svg>',
    sun:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#ffd83a" stroke="#f29a00"/>' +
      '<g stroke="#ffd83a" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>'
  };

  /* ---------- l'arborescence ---------- */
  var ROOT = { id: "", nom: "Galerie", dossiers: GALERIE };
  function childFolders(node) { return node.dossiers || []; }
  function nodeImages(node) { return node.images || []; }
  function countImages(node) {
    return nodeImages(node).length + childFolders(node).reduce(function (n, c) { return n + countImages(c); }, 0);
  }
  function coverOf(node) {
    if (node.couverture) return node.couverture;
    var imgs = nodeImages(node);
    if (imgs.length) return imgs[0].mini || imgs[0].src;
    var kids = childFolders(node);
    for (var i = 0; i < kids.length; i++) { var c = coverOf(kids[i]); if (c) return c; }
    return "";
  }

  /* ---------- état : #vtm/izmir/toreador dans l'adresse ---------- */
  var path = [];   // dossiers ouverts sous "Galerie"
  function current() { return path[path.length - 1] || ROOT; }
  function readHash() {
    var ids = decodeURIComponent(location.hash.replace(/^#/, "")).split("/").filter(Boolean);
    var list = GALERIE, found = [];
    for (var i = 0; i < ids.length; i++) {
      var n = list.filter(function (x) { return x.id === ids[i]; })[0];
      if (!n) break;
      found.push(n);
      list = childFolders(n);
    }
    path = found;
  }
  function go(newPath) {
    path = newPath;
    var hash = path.length ? "#" + path.map(function (n) { return n.id; }).join("/") : location.pathname + location.search;
    history.pushState(null, "", hash);
    render();
    if (win.getBoundingClientRect().top < 0) win.scrollIntoView({ block: "start" });
  }
  function up() { if (path.length) go(path.slice(0, -1)); }
  window.addEventListener("popstate", function () { readHash(); closeViewer(); render(); });

  /* =========================================================
     L'EXPLORATEUR
     ========================================================= */
  function decoControls() {
    return el("div", { class: "xp-controls", "aria-hidden": "true" },
      el("span", { class: "xp-ctl xp-min" }), el("span", { class: "xp-ctl xp-max" }), el("span", { class: "xp-ctl xp-close" }));
  }

  var wTitle = el("span", { class: "xp-title-text" });
  var titleBar = el("div", { class: "xp-titlebar" }, el("span", { class: "xp-title-icon", html: ICON.folder }), wTitle, decoControls());

  var backBtn = el("button", { class: "xp-tool", onclick: up },
    el("span", { class: "xp-round xp-round-back" }), el("span", { text: "Précédent" }));
  var upBtn = el("button", { class: "xp-tool", title: "Dossier parent", "aria-label": "Dossier parent", onclick: up },
    el("span", { class: "xp-tool-icon", html: ICON.up }));
  var addrText = el("span", { class: "xp-addr-text" });
  var toolbar = el("div", { class: "xp-toolbar" }, backBtn, upBtn, el("span", { class: "xp-sep" }),
    el("span", { class: "xp-addr-label", text: "Adresse" }),
    el("div", { class: "xp-addr-field" }, el("span", { class: "xp-addr-icon", html: ICON.folder }), addrText));

  var pane = el("aside", { class: "xp-taskpane" });
  var content = el("div", { class: "xp-content" });
  var statusLeft = el("span"), statusRight = el("span", { text: "Galerie de Sunny" });
  var statusbar = el("div", { class: "xp-statusbar" }, statusLeft, statusRight);

  var win = el("section", { class: "xp-window xp-explorer", "aria-label": "Galerie" },
    titleBar, el("div", { class: "xp-frame" }, toolbar, el("div", { class: "xp-body" }, pane, content), statusbar));
  root.append(win);

  /* volet de gauche */
  function panel(title, body) {
    return el("section", { class: "xp-panel" }, el("h3", { class: "xp-panel-title", text: title }), body);
  }
  function link(label, iconHtml, onClick, active) {
    return el("button", { class: "xp-link" + (active ? " is-active" : ""), onclick: onClick },
      el("span", { class: "xp-link-icon", html: iconHtml }), el("span", { text: label }));
  }
  function list(items) {
    var ul = el("ul", { class: "xp-panel-list" });
    items.forEach(function (it) { ul.append(el("li", null, it)); });
    return ul;
  }

  /* =========================================================
     AFFICHAGE
     ========================================================= */
  function render() {
    var node = current();
    var folders = childFolders(node), imgs = nodeImages(node);

    wTitle.textContent = node.nom;
    addrText.textContent = ["Galerie"].concat(path.map(function (n) { return n.nom; })).join(" \\ ");
    backBtn.classList.toggle("is-disabled", !path.length);
    upBtn.classList.toggle("is-disabled", !path.length);
    backBtn.setAttribute("aria-disabled", String(!path.length));
    upBtn.setAttribute("aria-disabled", String(!path.length));

    /* volet : dossiers principaux toujours accessibles + emplacement + détails */
    pane.innerHTML = "";
    pane.append(panel("Dossiers", list(GALERIE.map(function (n) {
      return link(n.nom, ICON.folder, function () { go([n]); }, path[0] === n);
    }))));
    if (path.length > 1) {
      pane.append(panel("Emplacement", list(path.slice(0, -1).map(function (n, i) {
        return link(n.nom, ICON.up, function () { go(path.slice(0, i + 1)); });
      }))));
    }
    pane.append(panel("Détails", el("div", { class: "xp-details" },
      el("b", { text: node.nom }),
      el("span", { text: [folders.length ? plural(folders.length, "dossier") : "", imgs.length ? plural(imgs.length, "image") : ""].filter(Boolean).join(", ") || "Dossier vide" }),
      path.length ? null : el("span", { text: plural(countImages(ROOT), "image") + " au total" }))));

    /* contenu */
    content.innerHTML = "";
    if (folders.length) {
      var grid = el("div", { class: "xp-grid xp-grid-folders" });
      folders.forEach(function (d) {
        var cover = coverOf(d);
        grid.append(el("button", { class: "xp-item xp-folder", onclick: function () { go(path.concat([d])); } },
          el("span", { class: "xp-folder-art" },
            el("span", { class: "xp-folder-svg", html: ICON.folder }),
            cover ? el("img", { src: cover, alt: "", loading: "lazy" }) : null),
          el("span", { class: "xp-item-label", text: d.nom }),
          el("span", { class: "xp-item-sub", text: plural(countImages(d), "image") })));
      });
      content.append(grid);
    }
    if (imgs.length) {
      var thumbs = el("div", { class: "xp-grid xp-grid-thumbs" });
      imgs.forEach(function (img, i) {
        var label = img.alt || decodeURIComponent(img.src.split("/").pop());
        thumbs.append(el("button", { class: "xp-item xp-thumb", title: img.desc || img.alt || "", onclick: function () { openViewer(imgs, i, this); } },
          el("span", { class: "xp-thumb-frame" }, el("img", { src: img.mini || img.src, alt: img.alt || "", loading: "lazy" })),
          el("span", { class: "xp-item-label", text: label })));
      });
      content.append(thumbs);
    }
    if (!folders.length && !imgs.length) content.append(el("p", { class: "xp-empty", text: "Ce dossier est vide." }));

    statusLeft.textContent = plural(folders.length + imgs.length, "objet");
  }

  /* =========================================================
     LA VISIONNEUSE
     ========================================================= */
  var vList = [], vIndex = 0, opener = null;
  var vTitle = el("span", { class: "xp-title-text" });
  var vImg = el("img", { alt: "" });
  var vCaption = el("span", { class: "xp-viewer-caption" });
  var vCount = el("span", { class: "xp-viewer-count" });
  var vPrev = el("button", { class: "xp-vbtn", "aria-label": "Image précédente", title: "Image précédente", onclick: function () { show(vIndex - 1); } }, el("span", { class: "xp-round xp-round-back" }));
  var vNext = el("button", { class: "xp-vbtn", "aria-label": "Image suivante", title: "Image suivante", onclick: function () { show(vIndex + 1); } }, el("span", { class: "xp-round xp-round-go" }));
  var vClose = el("button", { class: "xp-ctl xp-close", "aria-label": "Fermer", title: "Fermer", onclick: closeViewer });
  var vWin = el("div", { class: "xp-window xp-viewer-win", role: "dialog", "aria-modal": "true", "aria-label": "Aperçu des images" },
    el("div", { class: "xp-titlebar" }, el("span", { class: "xp-title-icon", html: ICON.sun }), vTitle, el("div", { class: "xp-controls" }, vClose)),
    el("div", { class: "xp-frame" },
      el("div", { class: "xp-viewer-stage" }, vImg),
      el("div", { class: "xp-viewer-bar" }, vPrev, vNext, el("span", { class: "xp-sep" }), vCaption, vCount)));
  var viewer = el("div", { class: "xp-viewer", hidden: true, onclick: function (e) { if (e.target === viewer) closeViewer(); } }, vWin);
  document.body.append(viewer);

  function show(i) {
    var n = vList.length;
    vIndex = (i + n) % n;
    var img = vList[vIndex];
    vImg.src = img.src;
    vImg.alt = img.alt || "";
    vTitle.textContent = (img.alt || decodeURIComponent(img.src.split("/").pop())) + " - Aperçu des images";
    vCaption.textContent = img.desc || img.alt || "";
    vCount.textContent = (vIndex + 1) + " sur " + n;
    vPrev.hidden = vNext.hidden = n < 2;
    [vIndex - 1, vIndex + 1].forEach(function (j) { var p = vList[(j + n) % n]; if (p) new Image().src = p.src; });
  }
  function openViewer(list, i, from) {
    vList = list; opener = from || null;
    viewer.hidden = false;
    document.documentElement.classList.add("xp-viewer-open");
    show(i);
    vClose.focus();
  }
  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.documentElement.classList.remove("xp-viewer-open");
    if (opener) opener.focus();
  }
  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowLeft") show(vIndex - 1);
    else if (e.key === "ArrowRight") show(vIndex + 1);
  });

  readHash();
  render();
})();
