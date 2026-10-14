/* =========================================================
   LISTE DES CAMPAGNES (page Jeu de rôle)
   ---------------------------------------------------------
   Une campagne = un bloc { ... }. Champs :
     nom     : nom affiché
     jeu     : "Vampire : la Mascarade", "Jabrainor", ...
     statut  : "encours" | "envie" | "termine" | "fanpage"
               ("envie" = campagne que je veux mener)
     role    : "st" (Storyteller) | "joueur"
     types   : étiquettes en plus, parmi
               "vampire", "ghoule", "hunter", "sabbat", "cthulhu", "one-shot"
     icone   : lien de l'image (facultatif)
     resume  : petite phrase (facultatif)
     lien    : page de la campagne (facultatif)
     jour    : jour de session, pour le planning (facultatif)

   La page range toute seule :
     - "En ce moment" : statut "encours"
     - "Je veux MJ"   : statut "envie"
     - "J'ai MJ"      : terminées, role "st"
     - "J'ai joué"    : terminées, role "joueur"
     - "Fan pages"    : statut "fanpage"
   ========================================================= */

const JDR = [
  /* ---------- en cours ---------- */
  {
    nom: "Izmir By Night",
    jeu: "Vampire : la Mascarade",
    statut: "encours", role: "st", types: ["vampire"],
    icone: "galerie/emotes/izmir/mariko-hehe.webp",
    lien: "https://izmir-vtm.neocities.org",
    jour: "Dimanche"
  },
  {
    nom: "Jabrainor",
    jeu: "Jabrainor",
    statut: "encours", role: "joueur",
    icone: "https://i.postimg.cc/SNMNg4LS/Illustration40.png",
    resume: "Un large désert de sel et une bande de quatre joyeux lurons. Il n'y a rien de mieux pour partir à l'aventure.",
    lien: "jeuderole/jabrainor/jabrainor2.html",
    jour: "Lundi"
  },

  /* ---------- je veux MJ ---------- */
  {
    nom: "Pest Control",
    jeu: "Vampire : la Mascarade",
    statut: "envie", role: "st", types: ["hunter"],
    lien: "jeuderole/VTM/shibuya/main.html"
  },
  {
    nom: "Leopold",
    jeu: "Vampire : la Mascarade",
    statut: "envie", role: "st", types: ["vampire"],
    resume: "Ce sera probablement pas avant turbo longtemps.",
    lien: "jeuderole/VTM/leopold/accueil.html"
  },
  {
    nom: "Mage : l'Ascension",
    jeu: "Mage : l'Ascension",
    statut: "envie", role: "st"
  },

  /* ---------- j'ai MJ (terminées) ---------- */
  {
    nom: "Amiens By Night",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "st", types: ["vampire"],
    icone: "https://i.postimg.cc/Y2PyyVqr/elle-(2).webp",
    resume: "Un trio dysfonctionnel qui essaye de rédiger une constitution sans s'entretuer.",
    lien: "jeuderole/VTM/AMIENS/index.html"
  },
  {
    nom: "Marseille By Night",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "st", types: ["ghoule"],
    icone: "https://files.catbox.moe/s2e6v3.png",
    lien: "jeuderole/VTM/marseille.html"
  },
  {
    nom: "Soul 4 Sale",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "st", types: ["vampire", "sabbat"],
    lien: "jeuderole/VTM/S4S.html"
  },
  {
    nom: "Moscow By Night",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "st", types: ["vampire", "sabbat"],
    icone: "https://files.catbox.moe/3wlwfj.png"
  },

  /* ---------- j'ai joué (terminées) ---------- */
  {
    nom: "FOL",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "joueur", types: ["vampire"],
    icone: "https://i.postimg.cc/m2Qbbc7r/sun.webp",
    lien: "jeuderole/VTM/FOL.html"
  },
  {
    nom: "San Francisco",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "joueur", types: ["vampire"],
    icone: "https://files.catbox.moe/dytutk.png"
  },
  {
    nom: "Philadelphia",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "joueur", types: ["vampire"]
  },
  {
    nom: "Country Roads",
    jeu: "Vampire : la Mascarade",
    statut: "termine", role: "joueur", types: ["vampire"]
  },
  {
    nom: "Monster of the Week",
    jeu: "Monster of the Week",
    statut: "termine", role: "joueur",
    icone: "https://i.postimg.cc/FFYN1Lrp/image-(2).webp",
    lien: "jeuderole/MOTW.html"
  },
  {
    nom: "Sigils & Shadow",
    jeu: "Sigils & Shadow",
    statut: "termine", role: "joueur",
    icone: "https://i.postimg.cc/fWfXVrkm/image-2026-05-05-143549328.png",
    resume: "Après avoir frôlé la mort deux fois, ils s'en sont plutôt bien sortis."
  },
  {
    nom: "L'Appel de Cthulhu",
    jeu: "L'Appel de Cthulhu",
    statut: "termine", role: "joueur", types: ["cthulhu"]
  },
  /* one-shots officiels de L'Appel de Cthulhu */
  {
    nom: "Le Phare défaillant",
    jeu: "L'Appel de Cthulhu",
    statut: "termine", role: "joueur", types: ["cthulhu", "one-shot"]
  },
  {
    nom: "Monsieur Corbitt",
    jeu: "L'Appel de Cthulhu",
    statut: "termine", role: "joueur", types: ["cthulhu", "one-shot"]
  },
  {
    nom: "La Nécropole",
    jeu: "L'Appel de Cthulhu",
    statut: "termine", role: "joueur", types: ["cthulhu", "one-shot"]
  },
  {
    nom: "Au milieu des arbres millénaires",
    jeu: "L'Appel de Cthulhu",
    statut: "termine", role: "joueur", types: ["cthulhu", "one-shot"],
    resume: "Engagés par un homme très riche pour retrouver sa fille kidnappée, jusque dans une forêt où l'on finit empalé sur les arbres."
  },
  {
    nom: "Mission Ork",
    jeu: "Wrath & Glory",
    statut: "termine", role: "joueur"
  },
  {
    nom: "Traîtres dans le monde ruche",
    jeu: "Wrath & Glory",
    statut: "termine", role: "joueur"
  },

  /* ---------- fan pages ---------- */
  {
    nom: "Liège By Night",
    jeu: "Vampire : la Mascarade",
    statut: "fanpage",
    icone: "https://i.postimg.cc/SQPtt5Nh/angel-(1).webp",
    lien: "jeuderole/VTM/LiegeByNight/page.html"
  }
];
