/* =========================================================
   PAGE JEU DE RÔLE
   Construit le planning et les fenêtres de campagnes à partir
   de la liste JDR (jdr-data.js). Rien à modifier ici.
   ========================================================= */
(function () {
  if (typeof JDR === "undefined") return;

  var ICON_GIF = "https://pixels.crd.co/assets/images/gallery24/42bb7bc9.gif?v=29416114";
  var JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  var STATUT = { encours: ["tag-encours", "en cours"], prep: ["tag-prep", "en préparation"], envie: ["tag-prep", "envie de mener"], termine: ["tag-termine", "terminé"], fanpage: ["tag-fanpage", "fan page"] };
  var ROLE = { st: ["tag-st", "Storyteller"], joueur: ["tag-joueur", "Joueuse"] };
  var TYPE = { vampire: "tag-vampire", ghoule: "tag-ghoule", hunter: "tag-hunter", sabbat: "tag-sabbat", cthulhu: "tag-cthulhu", "one-shot": "tag-oneshot" };
  var MAX_VISIBLES = 7;   /* au-delà, la liste de l'onglet défile */

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

  /* ---------- rangement ---------- */
  var rank = { encours: 0, prep: 1 };
  var groupes = [
    { id: "en-ce-moment", titre: "En ce moment", list: JDR.filter(function (c) { return c.statut === "encours" || c.statut === "prep"; })
                                                       .sort(function (a, b) { return rank[a.statut] - rank[b.statut]; }) },
    { id: "je-veux-mj", titre: "Je veux MJ", list: JDR.filter(function (c) { return c.statut === "envie"; }) },
    { id: "jai-mj", titre: "J'ai MJ", list: JDR.filter(function (c) { return c.statut === "termine" && c.role === "st"; }) },
    { id: "jai-joue", titre: "J'ai joué", list: JDR.filter(function (c) { return c.statut === "termine" && c.role === "joueur"; }) },
    { id: "fan-pages", titre: "Fan pages", list: JDR.filter(function (c) { return c.statut === "fanpage"; }) }
  ].filter(function (g) { return g.list.length; });

  /* ---------- les onglets ---------- */
  var tabs = [], panels = [];
  var tablist = el("div", { class: "jdr-tabs", role: "tablist", "aria-label": "Campagnes" });
  var stack = el("div", { class: "jdr-panels" });

  groupes.forEach(function (g, i) {
    var tab = el("button", { class: "jdr-tab", type: "button", role: "tab", id: "onglet-" + g.id,
                             "aria-controls": "panneau-" + g.id, "aria-selected": "false", tabindex: "-1" },
      el("span", { text: g.titre }), el("span", { class: "jdr-tab-count", text: String(g.list.length) }));
    tab.addEventListener("click", function () { select(i, true); });
    tablist.append(tab); tabs.push(tab);

    var panel = el("div", { class: "jdr-panel", role: "tabpanel", id: "panneau-" + g.id, "aria-labelledby": "onglet-" + g.id, hidden: "" });
    g.list.forEach(function (c) { panel.append(entry(c)); });
    stack.append(panel); panels.push(panel);
  });

  tablist.addEventListener("keydown", function (e) {
    var cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    var next = e.key === "ArrowRight" ? cur + 1 : e.key === "ArrowLeft" ? cur - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    next = (next + tabs.length) % tabs.length;
    select(next, true); tabs[next].focus();
  });

  function select(i, updateHash) {
    tabs.forEach(function (t, j) {
      var on = j === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle("is-active", on);
      panels[j].hidden = !on;
    });
    stack.scrollTop = 0;
    fitPanel(panels[i]);
    if (updateHash) history.replaceState(null, "", "#" + groupes[i].id);
  }

  /* limite la hauteur de l'onglet à MAX_VISIBLES fiches, le reste défile */
  function fitPanel(panel) {
    stack.style.maxHeight = "";
    var items = panel.querySelectorAll(".campaign-entry");
    if (items.length <= MAX_VISIBLES) return;
    var last = items[MAX_VISIBLES - 1];
    var top = stack.getBoundingClientRect().top - stack.scrollTop;
    var limit = last.getBoundingClientRect().bottom - top + 6;
    stack.style.maxHeight = Math.ceil(limit) + "px";
  }
  window.addEventListener("resize", function () {
    var open = panels.filter(function (p) { return !p.hidden; })[0];
    if (open) fitPanel(open);
  });

  /* ouvre l'onglet demandé par l'adresse : #jai-joue, ou #jdr-nom-de-campagne */
  function openFromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return false;
    for (var i = 0; i < groupes.length; i++) {
      if (groupes[i].id === h) { select(i, false); return true; }
      var hit = panels[i].querySelector("#" + CSS.escape(h));
      if (hit) {
        select(i, false);
        hit.classList.add("is-highlight");
        stack.scrollTop = hit.offsetTop - stack.offsetTop - 10;
        setTimeout(function () { hit.scrollIntoView({ block: "center" }); }, 0);
        setTimeout(function () { hit.classList.remove("is-highlight"); }, 2200);
        return true;
      }
    }
    return false;
  }

  var zone = document.getElementById("jdr-campagnes");
  if (zone && groupes.length) {
    zone.innerHTML = "";
    zone.append(el("div", { class: "jdr-onglets" }, tablist, stack));
    if (!openFromHash()) select(0, false);
    window.addEventListener("hashchange", openFromHash);
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
