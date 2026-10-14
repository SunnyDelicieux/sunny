/* =========================================================
   PAGE JEU DE RÔLE
   Construit le planning et les fenêtres de campagnes à partir
   de la liste JDR (jdr-data.js). Rien à modifier ici.
   ========================================================= */
(function () {
  if (typeof JDR === "undefined") return;

  var ICON_GIF = "https://pixels.crd.co/assets/images/gallery24/42bb7bc9.gif?v=29416114";
  var JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  var STATUT = { encours: ["tag-encours", "en cours"], prep: ["tag-prep", "en préparation"], termine: ["tag-termine", "terminé"], fanpage: ["tag-fanpage", "fan page"] };
  var ROLE = { st: ["tag-st", "Storyteller"], joueur: ["tag-joueur", "Joueuse"] };
  var TYPE = { vampire: "tag-vampire", ghoule: "tag-ghoule", hunter: "tag-hunter", sabbat: "tag-sabbat" };

  function el(tag, attrs) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) n.append(arguments[i]);
    return n;
  }
  function tag(cls, label) { return el("span", { class: "tag " + cls, text: label }); }
  function slug(s) { return "jdr-" + s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /* ---------- une fiche de campagne ---------- */
  function entry(c) {
    var tags = el("span", { class: "tag-row" }, tag.apply(null, STATUT[c.statut] || STATUT.termine));
    if (c.role && ROLE[c.role]) tags.append(tag.apply(null, ROLE[c.role]));
    if (c.jeu && c.jeu !== c.nom) tags.append(tag("tag-jeu", c.jeu));
    (c.types || []).forEach(function (t) { if (TYPE[t]) tags.append(tag(TYPE[t], t)); });
    if (c.jour) tags.append(tag("tag-jour", c.jour));

    var content = el("div", { class: "campaign-content" },
      c.resume ? el("span", { class: "campaign-blurb", text: c.resume }) : el("span", { class: "campaign-blurb" }),
      c.lien ? el("a", { href: c.lien, class: "campaign-link", text: "→ voir" }) : null);

    var icon = c.icone
      ? el("img", { class: "campaign-icon", src: c.icone, alt: "", loading: "lazy" })
      : el("span", { class: "campaign-icon campaign-icon-vide", "aria-hidden": "true" });

    return el("div", { class: "campaign-entry", id: slug(c.nom) },
      el("div", { class: "campaign-header" }, icon,
        el("div", { class: "campaign-header-text" },
          el("span", { class: "campaign-name", text: c.nom }), tags, content)));
  }

  /* ---------- une fenêtre ---------- */
  function windowBlock(title, list) {
    var body = el("div", { class: "window-body" });
    list.forEach(function (c) { body.append(entry(c)); });
    var controls = el("div", { class: "title-bar-controls" });
    ["Minimize", "Maximize", "Close"].forEach(function (l) { controls.append(el("button", { "aria-label": l })); });
    return el("div", { class: "window" },
      el("div", { class: "title-bar" },
        el("div", { class: "title-bar-text" }, el("img", { src: ICON_GIF, alt: "" }), document.createTextNode(title + " (" + list.length + ")")),
        controls),
      body);
  }

  /* ---------- rangement ---------- */
  var rank = { encours: 0, prep: 1 };
  var groupes = [
    ["En ce moment", JDR.filter(function (c) { return c.statut === "encours" || c.statut === "prep"; })
                        .sort(function (a, b) { return rank[a.statut] - rank[b.statut]; })],
    ["Je mène", JDR.filter(function (c) { return c.statut === "termine" && c.role === "st"; })],
    ["Je joue", JDR.filter(function (c) { return c.statut === "termine" && c.role === "joueur"; })],
    ["Fan pages", JDR.filter(function (c) { return c.statut === "fanpage"; })]
  ];

  var zone = document.getElementById("jdr-campagnes");
  if (zone) {
    zone.innerHTML = "";
    groupes.forEach(function (g) { if (g[1].length) zone.append(windowBlock(g[0], g[1])); });
  }

  /* ---------- planning (rempli d'après le champ "jour") ---------- */
  var planning = document.getElementById("jdr-planning");
  if (planning) {
    var head = el("tr"), row = el("tr");
    JOURS.forEach(function (j) {
      head.append(el("th", { text: j }));
      var ce = JDR.filter(function (c) { return c.jour === j && (c.statut === "encours" || c.statut === "prep"); });
      var td = el("td");
      if (!ce.length) td.textContent = "—";
      ce.forEach(function (c, i) {
        if (i) td.append(el("br"));
        td.append(el("a", { href: "#" + slug(c.nom), class: "planning-link", text: c.nom }));
      });
      if (ce.length) td.setAttribute("data-filled", "");
      row.append(td);
    });
    planning.innerHTML = "";
    planning.append(el("thead", null, head), el("tbody", null, row));
  }
})();
