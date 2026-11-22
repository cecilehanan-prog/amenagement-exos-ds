/* Pictogrammes de l'Atelier (étape 3) : de petits dessins en couleur, utilisables dans N'IMPORTE QUEL texte
   (cartes, fiches, cours, schémas, tableaux) en écrivant :nom: — par exemple « La pluie :pluie: tombe ».
   Dessins simples (grille 24 × 24), couleurs écrites en dur pour que le PDF les garde. */
(function(){
const B = '#3a86c8', R = '#e63946', V = '#2a9d8f', O = '#f08c2e', J = '#f4c430', Vi = '#8e5ea2', G = '#6b6b6b', N = '#333', VE = '#6a994e', M = '#8d6e4f', C = '#9ad0f5';
const t = (c, w) => `fill="none" stroke="${c}" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round"`;
const P = {
  // météo, nature
  soleil: [`<circle cx="12" cy="12" r="5" fill="${J}"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" ${t(O)}/>`, 'soleil'],
  nuage: [`<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z" fill="#dfe6ee" stroke="${G}" stroke-width="1.6"/>`, 'nuage'],
  pluie: [`<path d="M7 14h10a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 6.5 7 3.5 3.5 0 0 0 7 14z" fill="#dfe6ee" stroke="${G}" stroke-width="1.5"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" ${t(B)}/>`, 'pluie'],
  neige: [`<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2" ${t(B)}/>`, 'neige'],
  eclair: [`<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="${J}" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/>`, 'éclair'],
  vent: [`<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7" ${t(B)}/>`, 'vent'],
  eau: [`<path d="M12 2.5C9 7 6 10.5 6 14.5a6 6 0 0 0 12 0C18 10.5 15 7 12 2.5z" fill="${C}" stroke="${B}" stroke-width="1.6"/><path d="M9.5 15a2.8 2.8 0 0 0 2.5 2.7" ${t('#fff', 1.6)}/>`, 'eau'],
  feu: [`<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="${O}" stroke="${R}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 21a3 3 0 0 1-3-3c0-2 2-3 3-5 1 2 3 3 3 5a3 3 0 0 1-3 3z" fill="${J}"/>`, 'feu'],
  thermometre: [`<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" fill="#fff" stroke="${G}" stroke-width="1.6"/><circle cx="12" cy="17" r="2.4" fill="${R}"/><path d="M12 15V8" ${t(R, 2.2)}/>`, 'thermomètre'],
  arbre: [`<rect x="10.8" y="14" width="2.4" height="8" rx="1" fill="${M}"/><circle cx="12" cy="9.5" r="7" fill="${VE}"/><circle cx="9" cy="8" r="2" fill="#8fbf6a"/>`, 'arbre'],
  fleur: [`<path d="M12 13v9M12 18c-2-2-4-2-5-1M12 17c2-2 4-2 5-1" ${t(VE)}/><g fill="${Vi}"><circle cx="12" cy="5" r="2.6"/><circle cx="15.6" cy="8" r="2.6"/><circle cx="12" cy="11" r="2.6"/><circle cx="8.4" cy="8" r="2.6"/></g><circle cx="12" cy="8" r="2" fill="${J}"/>`, 'fleur'],
  feuille: [`<path d="M5 19C4 10 10 4 20 4c0 10-6 16-15 15z" fill="${VE}"/><path d="M5 19L15 9" ${t('#d9ecc9', 1.6)}/>`, 'feuille'],
  graine: [`<path d="M3 20h18" ${t(M)}/><ellipse cx="12" cy="17" rx="3" ry="2" fill="${M}"/><path d="M12 15V9" ${t(VE)}/><path d="M12 10c-3 0-5-2-5-4 3 0 5 1 5 4zM12 9c0-3 2-5 5-5 0 3-2 5-5 5z" fill="${VE}"/>`, 'graine'],
  montagne: [`<path d="M2 20L9 7l4 6 2-3 7 10z" fill="#9aa5b1" stroke="${G}" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 7l-2 3.6 2-1 2 1.4z" fill="#fff"/>`, 'montagne'],
  mer: [`<path d="M2 9c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0M2 19c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0" ${t(B)}/>`, 'mer'],
  terre: [`<circle cx="12" cy="12" r="9.5" fill="${C}" stroke="${B}" stroke-width="1.5"/><path d="M6 6.5c2 1 2 3 4 3s1 3 3 3-1 4 1 6M14 3c0 2 2 3 4 3s2 3 3 4" fill="none" stroke="${VE}" stroke-width="2.4" stroke-linecap="round"/>`, 'Terre'],
  lune: [`<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z" fill="${J}" stroke="${O}" stroke-width="1.3"/>`, 'lune'],
  etoile: [`<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${J}" stroke="${O}" stroke-width="1.3" stroke-linejoin="round"/>`, 'étoile'],
  // lieux
  maison: [`<path d="M3 11l9-7 9 7" ${t(R, 2.2)}/><path d="M5 10v10h14V10" fill="#fde8d0" stroke="${M}" stroke-width="1.6"/><rect x="10" y="14" width="4" height="6" fill="${M}"/>`, 'maison'],
  ville: [`<path d="M2 21h20" ${t(G)}/><rect x="3" y="10" width="6" height="11" fill="#c9d6e3" stroke="${G}" stroke-width="1.3"/><rect x="9" y="4" width="7" height="17" fill="#a9bccf" stroke="${G}" stroke-width="1.3"/><rect x="16" y="12" width="5" height="9" fill="#c9d6e3" stroke="${G}" stroke-width="1.3"/><path d="M11 7h3M11 10h3M11 13h3M11 16h3M5 13h2M5 16h2M18 15h1" ${t('#fff', 1.4)}/>`, 'ville'],
  usine: [`<path d="M2 21V11l5 3v-3l5 3v-3l5 3V4h4v17z" fill="#c9c1ae" stroke="${G}" stroke-width="1.4" stroke-linejoin="round"/><path d="M18 4c0-2 2-2 3-2" ${t(G, 1.4)}/><path d="M5 17h2M10 17h2M15 17h2" ${t(N, 1.8)}/>`, 'usine'],
  ecole: [`<path d="M2 21h20" ${t(G)}/><path d="M4 21V10h16v11" fill="#fde8d0" stroke="${M}" stroke-width="1.5"/><path d="M3 10l9-6 9 6" ${t(R, 2)}/><rect x="10" y="15" width="4" height="6" fill="${M}"/><circle cx="12" cy="10.5" r="1.8" fill="#fff" stroke="${G}"/>`, 'école'],
  chateau: [`<path d="M3 21V8h3v2h2V8h3v2h2V8h3v2h2V8h3v13z" fill="#c9c1ae" stroke="${G}" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 21v-5a2 2 0 0 1 4 0v5" fill="${M}"/><path d="M12 8V3l3 1-3 1" fill="${R}" stroke="${R}" stroke-width="1"/>`, 'château'],
  eglise: [`<path d="M12 2v5M10 4h4" ${t(N, 1.6)}/><path d="M7 21V11l5-4 5 4v10z" fill="#ede6d6" stroke="${G}" stroke-width="1.4"/><path d="M3 21v-6l4-3M21 21v-6l-4-3" ${t(G, 1.4)}/><path d="M10.5 21v-4a1.5 1.5 0 0 1 3 0v4" fill="${M}"/>`, 'église'],
  champ: [`<path d="M2 21h20" ${t(M)}/><path d="M6 21V9M12 21V7M18 21V9" ${t('#c8a13a', 1.6)}/><path d="M6 9c-2-1-2-4 0-5 2 1 2 4 0 5zM12 7c-2-1-2-4 0-5 2 1 2 4 0 5zM18 9c-2-1-2-4 0-5 2 1 2 4 0 5z" fill="${J}" stroke="#c8a13a" stroke-width="1"/>`, 'champ'],
  carte: [`<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="#f3ead2" stroke="${M}" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" ${t(M, 1.2)}/><path d="M17.5 9.5a1.5 1.5 0 1 1 0 .1zM17.5 11l0 2" ${t(R, 1.8)}/>`, 'carte'],
  drapeau: [`<path d="M5 22V3" ${t(N, 2)}/><path d="M5 4h6v9H5z" fill="${B}"/><path d="M11 4h5v9h-5z" fill="#fff" stroke="#ccc" stroke-width=".6"/><path d="M16 4h4v9h-4z" fill="${R}"/>`, 'drapeau'],
  // transports
  voiture: [`<path d="M3 16v-3l2-5h14l2 5v3z" fill="${R}" stroke="#a5232e" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.5 8.5l-1 4h13l-1-4z" fill="${C}"/><circle cx="7" cy="17" r="2.2" fill="${N}"/><circle cx="17" cy="17" r="2.2" fill="${N}"/>`, 'voiture'],
  train: [`<rect x="5" y="3" width="14" height="15" rx="3" fill="${B}" stroke="#235a8a" stroke-width="1.3"/><rect x="7.5" y="6" width="9" height="5" rx="1" fill="${C}"/><circle cx="8.5" cy="14.5" r="1.3" fill="#fff"/><circle cx="15.5" cy="14.5" r="1.3" fill="#fff"/><path d="M7 18l-2 3M17 18l2 3" ${t(N)}/>`, 'train'],
  bateau: [`<path d="M3 15h18l-3 5H6z" fill="${R}" stroke="#a5232e" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 3v12" ${t(N, 1.6)}/><path d="M12 4l6 9h-6z" fill="#fff" stroke="${G}" stroke-width="1.2"/><path d="M11 6l-5 7h5z" fill="${J}" stroke="${G}" stroke-width="1.2"/>`, 'bateau'],
  avion: [`<path d="M21 4c-1-1-3 0-4 1l-3.5 3.5L5 6 3.5 7.5l7 4L7 15H4.5L3 16.5l4 1.5 1.5 4L10 20.5V18l3.5-3.5 4 7 1.5-1.5-2.5-8.5L20 8c1-1 2-3 1-4z" fill="#dfe6ee" stroke="${B}" stroke-width="1.3" stroke-linejoin="round"/>`, 'avion'],
  velo: [`<circle cx="6" cy="16" r="4" ${t(N, 1.6)}/><circle cx="18" cy="16" r="4" ${t(N, 1.6)}/><path d="M6 16l4-7h6l2 7M10 9l3 7h-7M9 6h3M15 6h2l-1 3" ${t(R, 1.8)}/>`, 'vélo'],
  // personnes
  personne: [`<circle cx="12" cy="7" r="4" fill="${O}"/><path d="M4 21a8 8 0 0 1 16 0z" fill="${B}"/>`, 'personne'],
  groupe: [`<circle cx="7" cy="8" r="3" fill="${O}"/><circle cx="17" cy="8" r="3" fill="${O}"/><path d="M1.5 19a5.5 5.5 0 0 1 11 0zM11.5 19a5.5 5.5 0 0 1 11 0z" fill="${V}"/><circle cx="12" cy="10" r="3.4" fill="#f6a65a"/><path d="M5.5 22a6.5 6.5 0 0 1 13 0z" fill="${B}"/>`, 'groupe'],
  roi: [`<path d="M3 18L2 7l5 4 5-7 5 7 5-4-1 11z" fill="${J}" stroke="${O}" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 21h16" ${t(O, 2.4)}/><circle cx="12" cy="13" r="1.5" fill="${R}"/>`, 'roi'],
  soldat: [`<path d="M12 2l1.5 3h-3z" fill="${G}"/><path d="M5 20L18 7M16 5l3 3" ${t(G, 2.4)}/><path d="M4 14l6 6" ${t(M, 2.4)}/>`, 'combat'],
  main: [`<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11V4a1.5 1.5 0 0 1 3 0v7V5.5a1.5 1.5 0 0 1 3 0V13l1-2a1.5 1.5 0 0 1 2.6 1.5L18 18a6 6 0 0 1-5.5 4H12a5 5 0 0 1-5-5v-3.5a1.5 1.5 0 0 1 1-1.5" fill="#f6c9a0" stroke="${M}" stroke-width="1.3" stroke-linejoin="round"/>`, 'main'],
  oeil: [`<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="#fff" stroke="${N}" stroke-width="1.6"/><circle cx="12" cy="12" r="3.6" fill="${B}"/><circle cx="12" cy="12" r="1.6" fill="${N}"/>`, 'œil'],
  oreille: [`<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5 2" fill="#f6c9a0" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/><path d="M10 9a2 2 0 0 1 4 0c0 1.5-2 2-2 3.5" ${t(M, 1.4)}/>`, 'oreille'],
  cerveau: [`<path d="M12 4a3 3 0 0 0-5.5 1.5A3.5 3.5 0 0 0 4 10a3.5 3.5 0 0 0 1 6 3.5 3.5 0 0 0 7 2z" fill="#f4b6c2" stroke="${R}" stroke-width="1.3"/><path d="M12 4a3 3 0 0 1 5.5 1.5A3.5 3.5 0 0 1 20 10a3.5 3.5 0 0 1-1 6 3.5 3.5 0 0 1-7 2z" fill="#f4b6c2" stroke="${R}" stroke-width="1.3"/><path d="M12 4v14" ${t(R, 1.2)}/>`, 'cerveau'],
  coeur: [`<path d="M12 21C5 16 2.5 12.5 2.5 8.5A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9.5 2.5C21.5 12.5 19 16 12 21z" fill="${R}"/>`, 'cœur'],
  // animaux
  poisson: [`<path d="M2.5 12c3-4.5 9-6 13-3l5-3v12l-5-3c-4 3-10 1.5-13-3z" fill="${O}" stroke="#b8621a" stroke-width="1.2" stroke-linejoin="round"/><circle cx="7" cy="11" r="1.1" fill="${N}"/>`, 'poisson'],
  oiseau: [`<path d="M3 13c2 5 8 7 13 4l5 1-3-3c1-3 0-7-4-8-3 0-5 2-5 5-2-1-4-1-6 1z" fill="${B}" stroke="#235a8a" stroke-width="1.2" stroke-linejoin="round"/><circle cx="15" cy="8.5" r="1" fill="#fff"/><path d="M18.5 9l3-.5-2.5 2" fill="${O}"/>`, 'oiseau'],
  insecte: [`<ellipse cx="12" cy="14" rx="4" ry="6" fill="${R}"/><path d="M12 8v12" ${t(N, 1.3)}/><circle cx="12" cy="6.5" r="2.5" fill="${N}"/><path d="M10.5 4.5L8.5 2M13.5 4.5l2-2.5M8 12H4M8 15.5l-3.5 1.5M16 12h4M16 15.5l3.5 1.5" ${t(N, 1.4)}/><circle cx="10.3" cy="12" r="1" fill="${N}"/><circle cx="13.7" cy="16" r="1" fill="${N}"/>`, 'insecte'],
  animal: [`<ellipse cx="12" cy="15" rx="5" ry="4.5" fill="${M}"/><circle cx="6" cy="9" r="2.3" fill="${M}"/><circle cx="10" cy="5.5" r="2.3" fill="${M}"/><circle cx="14" cy="5.5" r="2.3" fill="${M}"/><circle cx="18" cy="9" r="2.3" fill="${M}"/>`, 'animal'],
  // école, savoir
  livre: [`<path d="M2.5 5c3-1.5 6.5-1.5 9.5 1v14c-3-2.5-6.5-2.5-9.5-1z" fill="#fff" stroke="${B}" stroke-width="1.5" stroke-linejoin="round"/><path d="M21.5 5c-3-1.5-6.5-1.5-9.5 1v14c3-2.5 6.5-2.5 9.5-1z" fill="${C}" stroke="${B}" stroke-width="1.5" stroke-linejoin="round"/>`, 'livre'],
  crayon: [`<path d="M4 20l1-5L16 4l4 4L9 19z" fill="${J}" stroke="${O}" stroke-width="1.3" stroke-linejoin="round"/><path d="M4 20l1-5 4 4z" fill="#f6c9a0"/><path d="M4 20l.5-2 1.5 1.5z" fill="${N}"/><path d="M14 6l4 4" ${t(O, 1.3)}/>`, 'crayon'],
  cahier: [`<rect x="5" y="3" width="15" height="18" rx="1.5" fill="#fff" stroke="${V}" stroke-width="1.5"/><path d="M8 3v18" ${t(R, 1.3)}/><path d="M10.5 8h7M10.5 11.5h7M10.5 15h5" ${t(B, 1.2)}/>`, 'cahier'],
  horloge: [`<circle cx="12" cy="12" r="9.5" fill="#fff" stroke="${N}" stroke-width="1.8"/><path d="M12 6.5V12l4 2.5" ${t(R, 2)}/>`, 'horloge'],
  calendrier: [`<rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="${G}" stroke-width="1.5"/><path d="M3 5h18v5H3z" fill="${R}"/><path d="M8 3v4M16 3v4" ${t(N, 1.8)}/><path d="M7 14h2M11 14h2M15 14h2M7 17.5h2M11 17.5h2" ${t(G, 1.8)}/>`, 'calendrier'],
  loupe: [`<circle cx="10" cy="10" r="6.5" fill="${C}" stroke="${N}" stroke-width="2"/><path d="M15 15l6 6" ${t(M, 3)}/>`, 'chercher'],
  idee: [`<path d="M9 17v-2c-2-1.3-3.5-3.3-3.5-6a6.5 6.5 0 0 1 13 0c0 2.7-1.5 4.7-3.5 6v2z" fill="${J}" stroke="${O}" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.5 20h5M10.5 22.5h3" ${t(G, 1.8)}/>`, 'idée'],
  calcul: [`<rect x="4" y="2.5" width="16" height="19" rx="2" fill="#e8ecf1" stroke="${G}" stroke-width="1.4"/><rect x="6.5" y="5" width="11" height="4" rx="1" fill="#cfe8d6"/><g fill="${G}"><circle cx="8.5" cy="12.5" r="1.2"/><circle cx="12" cy="12.5" r="1.2"/><circle cx="8.5" cy="16" r="1.2"/><circle cx="12" cy="16" r="1.2"/><circle cx="8.5" cy="19" r="1.1"/><circle cx="12" cy="19" r="1.1"/></g><rect x="14.3" y="11.3" width="2.6" height="8.8" rx="1" fill="${O}"/>`, 'calcul'],
  regle: [`<path d="M2 16L16 2l6 6L8 22z" fill="${J}" stroke="${O}" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 12l2 2M9 9l2 2M12 6l2 2M7.5 10.5l1 1M10.5 7.5l1 1" ${t(O, 1.3)}/>`, 'règle'],
  musique: [`<path d="M9 18V5l11-2v13" ${t(N, 1.8)}/><circle cx="6.5" cy="18" r="2.8" fill="${Vi}"/><circle cx="17.5" cy="16" r="2.8" fill="${Vi}"/>`, 'musique'],
  sport: [`<circle cx="12" cy="12" r="9.5" fill="#fff" stroke="${N}" stroke-width="1.5"/><path d="M12 7.5l4.3 3.1-1.6 5H9.3l-1.6-5z" fill="${N}"/><path d="M12 7.5V2.5M16.3 10.6l4.7-1.5M14.7 15.6l2.9 4M9.3 15.6l-2.9 4M7.7 10.6L3 9.1" ${t(N, 1.3)}/>`, 'sport'],
  ordinateur: [`<rect x="3" y="4" width="18" height="12" rx="1.5" fill="${C}" stroke="${G}" stroke-width="1.6"/><path d="M8 20h8M12 16v4" ${t(G, 1.8)}/>`, 'ordinateur'],
  argent: [`<circle cx="12" cy="12" r="9" fill="${J}" stroke="${O}" stroke-width="1.6"/><path d="M15 8.5a4 4 0 1 0 0 7M7.5 11h6M7.5 13.5h6" ${t('#a86a0a', 1.7)}/>`, 'argent'],
  outil: [`<path d="M14.5 3.5a4.5 4.5 0 0 0-4.2 6L3.5 16.3a2 2 0 0 0 2.8 2.8l6.8-6.8a4.5 4.5 0 0 0 6-4.2l-2.6 2.6-2.6-.6-.6-2.6z" fill="#b7c2cc" stroke="${G}" stroke-width="1.4" stroke-linejoin="round"/>`, 'outil'],
  balance: [`<path d="M12 3v17M6 21h12M4 7h16" ${t(G, 1.8)}/><path d="M4 7l-2.5 6h5zM20 7l-2.5 6h5z" fill="none" stroke="${G}" stroke-width="1.3"/><path d="M1.5 13a2.5 2 0 0 0 5 0zM17.5 13a2.5 2 0 0 0 5 0z" fill="${J}"/>`, 'justice'],
  // signes
  oui: [`<circle cx="12" cy="12" r="10" fill="${VE}"/><path d="M7 12.5l3.2 3.2L17 9" ${t('#fff', 2.6)}/>`, 'oui'],
  non: [`<circle cx="12" cy="12" r="10" fill="${R}"/><path d="M8 8l8 8M16 8l-8 8" ${t('#fff', 2.6)}/>`, 'non'],
  attention: [`<path d="M12 2.5L22 20.5H2z" fill="${J}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9v5.5" ${t(N, 2.4)}/><circle cx="12" cy="17.5" r="1.3" fill="${N}"/>`, 'attention'],
  question: [`<circle cx="12" cy="12" r="10" fill="${Vi}"/><path d="M9 9.3a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.9v.5" ${t('#fff', 2.3)}/><circle cx="12" cy="17.6" r="1.3" fill="#fff"/>`, 'question'],
  info: [`<circle cx="12" cy="12" r="10" fill="${B}"/><path d="M12 11v6.5" ${t('#fff', 2.5)}/><circle cx="12" cy="7.3" r="1.4" fill="#fff"/>`, 'information'],
  interdit: [`<circle cx="12" cy="12" r="9.5" fill="#fff" stroke="${R}" stroke-width="2.6"/><path d="M5.5 18.5l13-13" ${t(R, 2.6)}/>`, 'interdit'],
  fleche: [`<path d="M3 12h15M13 6l6 6-6 6" ${t(N, 2.6)}/>`, 'flèche'],
  haut: [`<path d="M12 21V5M6 11l6-6 6 6" ${t(VE, 2.6)}/>`, 'monte'],
  bas: [`<path d="M12 3v16M6 13l6 6 6-6" ${t(R, 2.6)}/>`, 'descend'],
  cible: [`<circle cx="12" cy="12" r="9.5" fill="#fff" stroke="${R}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="#fff" stroke="${R}" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="${R}"/>`, 'objectif'],
  cle: [`<circle cx="7.5" cy="12" r="4.5" fill="none" stroke="${O}" stroke-width="2.4"/><path d="M12 12h9.5M18 12v3.5M15.5 12v2.5" ${t(O, 2.4)}/>`, 'clé'],
  recycler: [`<path d="M8 6.5l2.6-4.5 3 5M12.5 4.5l1.1 2.5-2.7.2M19 13l2.5 4.4-5.5.1M18.3 17.5l-2.3.1.8 2.4M7 19H2l2.8-4.9M3.2 16.5l1.6-2.4 1.6 2.3" ${t(VE, 2)}/>`, 'recycler']
};
const NOMS = Object.keys(P);
function svg(nom, taille){ const p = P[nom]; if (!p) return ''; return `<svg viewBox="0 0 24 24" width="${taille || '1.15em'}" height="${taille || '1.15em'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${p[0]}</svg>`; }
/* remplace :nom: par le pictogramme (après tout le reste du formatage) */
function remplacer(html){
  return String(html).replace(/:([a-z]{2,12}):/g, (m, n) => P[n] ? `<span class="pic" role="img" aria-label="${P[n][1]}">${svg(n)}</span>` : m);
}
const LISTE = NOMS.join(', ');
const CSS = `.pic{display:inline-block;vertical-align:-.2em;line-height:0;margin:0 .06em}.pic svg{display:inline-block}`;
function css(){ if (!document.getElementById('pictos-css')){ const s = document.createElement('style'); s.id = 'pictos-css'; s.textContent = CSS; document.head.append(s); } }
if (typeof document !== 'undefined' && document.head) css();
window.Pictos = {P, NOMS, LISTE, svg, remplacer, nom: n => P[n] ? P[n][1] : ''};
})();
