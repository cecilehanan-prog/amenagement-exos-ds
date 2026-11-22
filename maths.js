/* Maths et graphiques du Cours libre (étape 4). Comme les schémas, l'IA donne les NOMBRES, l'Atelier dessine et calcule.
   - formule   : une formule mise en valeur (Aire = L × l, {3/4}, √{16}, m^2^, H~2~O)
   - operation : opération posée (+, −, ×, division à potence), résultat calculé ici, ou cases vides à remplir
   - droite    : droite graduée (entiers, décimaux, fractions), points nommés
   - fraction  : fraction dessinée (disque, barre ou rectangle partagé)
   - graphique : barres, courbe, camembert, climatogramme
   Dans TOUS les textes de l'Atelier : {3/4} écrit une fraction, √{16} une racine. */
(function(){
const A = () => window.ACM, Sc = () => window.Schemas;
const S = v => String(v == null ? '' : v);
const r1 = v => Math.round(v * 10) / 10;
function num(v){
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const s = S(v).trim().replace(/\s| | /g, '').replace(',', '.');
  const f = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/); if (f) return +f[2] ? +f[1] / +f[2] : null;
  return s !== '' && isFinite(+s) ? +s : null;
}
function fr(v, dec){
  if (v == null || !isFinite(v)) return '';
  const r = Math.round(v * 1e6) / 1e6;
  return r.toLocaleString('fr-FR', {maximumFractionDigits: dec == null ? 6 : dec, minimumFractionDigits: dec || 0}).replace(/ /g, ' ');
}
const decs = s => { const m = S(s).split(/[.,]/)[1]; return m ? m.length : 0; };
const esc = s => A().esc(s);

/* ---------- fractions et racines dans les textes (appelé par fmt) ---------- */
function formules(html){
  return S(html)
    .replace(/√\{([^{}\n]{1,30})\}/g, '<span class="rac">√<span>$1</span></span>')
    .replace(/\{([^{}\/\n]{1,24})\/([^{}\/\n]{1,24})\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
}

/* ---------- catalogue ---------- */
const CATALOGUE = [
  {type: 'formule', nom: 'Formule', quand: "Une formule ou une règle de calcul à retenir, mise en valeur et centrée. Fractions : {3/4} ; racine : √{16} ; puissance : m^2^ ; indice : H~2~O.",
    champs: {texte: 'la formule', legende: 'facultatif : ce que signifient les lettres'},
    exemple: {type: 'formule', texte: 'Aire du rectangle = L × l', legende: 'L : longueur ; l : largeur'}},
  {type: 'operation', nom: 'Opération posée', quand: "Une addition, soustraction, multiplication (nombres entiers ou décimaux) ou une division à potence (nombres entiers) posée en colonnes. Le résultat est calculé par l'Atelier : ne le donne pas. \"resultat\": false laisse des cases vides à remplir.",
    champs: {operation: '"+", "-", "×" ou ":"', nombres: 'liste de 2 nombres (jusqu’à 4 pour une addition), en texte, ex. "12,5"', resultat: 'true (par défaut) ou false', titre: 'facultatif'},
    exemple: {type: 'operation', operation: '×', nombres: ['347', '26']}},
  {type: 'droite', nom: 'Droite graduée', quand: "Placer ou lire des nombres (entiers, décimaux, fractions) sur une droite graduée.",
    champs: {min: 'nombre', max: 'nombre', pas: 'écart entre deux graduations numérotées', sous: 'nombre de petites graduations entre deux numérotées (0 à 10)', denominateur: 'facultatif : numéroter en fractions de ce dénominateur', points: 'liste {"valeur","nom" (une lettre ou un mot),"cacher" (true : la valeur n’est pas écrite)}', titre: 'facultatif'},
    exemple: {type: 'droite', min: 0, max: 2, pas: 1, sous: 4, denominateur: 4, points: [{valeur: '3/4', nom: 'A'}, {valeur: '6/4', nom: 'B'}]}},
  {type: 'fraction', nom: 'Fraction dessinée', quand: "Montrer une fraction : une forme partagée en parts égales, certaines coloriées.",
    champs: {numerateur: 'entier', denominateur: 'entier (2 à 24)', forme: 'disque, barre ou rectangle', nombre: 'nombre de formes (si la fraction dépasse 1)', titre: 'facultatif'},
    exemple: {type: 'fraction', numerateur: 3, denominateur: 4, forme: 'disque'}},
  {type: 'graphique', nom: 'Graphique', quand: "Des données chiffrées : \"barres\" (comparer), \"courbe\" (évolution dans le temps), \"camembert\" (parts d’un tout, une seule série), \"climat\" (climatogramme : températures en courbe et précipitations en barres).",
    champs: {genre: 'barres, courbe, camembert ou climat', etiquettes: 'liste des étiquettes (années, mois, catégories)', series: 'liste {"nom","valeurs" (nombres, dans l’ordre des étiquettes),"couleur" (facultatif)}', unite: 'unité des valeurs (ex. "millions d’habitants")', temperatures: 'climat : 12 températures (°C)', precipitations: 'climat : 12 précipitations (mm)', titre: 'facultatif', source: 'facultatif'},
    exemple: {type: 'graphique', genre: 'courbe', titre: 'Population de la France', unite: 'millions d’habitants', etiquettes: ['1900', '1950', '2000', '2020'], series: [{nom: 'France', valeurs: [41, 42, 61, 67]}]}}
];

/* ---------- données propres ---------- */
function nettoyer(b, t){
  const o = {}; if (b.titre) o.titre = S(b.titre).slice(0, 120);
  if (t === 'formule'){ o.texte = S(b.texte).slice(0, 300); if (b.legende) o.legende = S(b.legende).slice(0, 300); }
  else if (t === 'operation'){
    const op = S(b.operation).trim(), m = {'+': '+', '-': '-', '−': '-', '×': '×', 'x': '×', '*': '×', ':': ':', '÷': ':', '/': ':'};
    o.operation = m[op] || '+';
    o.nombres = (Array.isArray(b.nombres) ? b.nombres : []).slice(0, o.operation === '+' ? 4 : 2).map(x => S(x).trim().replace(/\s| /g, '').replace('.', ',')).filter(x => num(x) != null);
    o.resultat = b.resultat !== false;
  }
  else if (t === 'droite'){
    o.min = num(b.min) ?? 0; o.max = num(b.max) ?? 10; o.pas = num(b.pas) || 1; o.sous = Math.max(0, Math.min(10, Math.round(+b.sous || 0)));
    if (+b.denominateur > 1) o.denominateur = Math.min(24, Math.round(+b.denominateur));
    o.points = (Array.isArray(b.points) ? b.points : []).slice(0, 10).map(p => { const x = {valeur: S(p && p.valeur), nom: S(p && p.nom).slice(0, 12)}; if (p && p.cacher) x.cacher = true; return x; }).filter(p => num(p.valeur) != null);
  }
  else if (t === 'fraction'){ o.numerateur = Math.max(0, Math.round(+b.numerateur || 0)); o.denominateur = Math.max(1, Math.min(24, Math.round(+b.denominateur || 1))); o.forme = ['disque', 'barre', 'rectangle'].includes(b.forme) ? b.forme : 'disque'; o.nombre = Math.max(Math.ceil(o.numerateur / o.denominateur) || 1, Math.min(6, Math.round(+b.nombre || 1))); }
  else if (t === 'graphique'){
    o.genre = ['barres', 'courbe', 'camembert', 'climat'].includes(b.genre) ? b.genre : 'barres';
    o.etiquettes = (Array.isArray(b.etiquettes) ? b.etiquettes : []).slice(0, 24).map(x => S(x).slice(0, 30));
    if (o.genre === 'climat'){
      if (!o.etiquettes.length) o.etiquettes = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      o.temperatures = (Array.isArray(b.temperatures) ? b.temperatures : []).slice(0, 24).map(num);
      o.precipitations = (Array.isArray(b.precipitations) ? b.precipitations : []).slice(0, 24).map(num);
    } else o.series = (Array.isArray(b.series) ? b.series : []).slice(0, 5).map(s => { const x = {nom: S(s && s.nom).slice(0, 40), valeurs: (Array.isArray(s && s.valeurs) ? s.valeurs : []).slice(0, 24).map(num)}; if (s && s.couleur != null && s.couleur !== '') x.couleur = s.couleur; return x; });
    if (b.unite) o.unite = S(b.unite).slice(0, 50); if (b.source) o.source = S(b.source).slice(0, 120);
  }
  return o;
}
function verifier(b, nom, pb){
  const t = b.type;
  if (t === 'formule' && !b.texte.trim()) pb.push(nom + ' : formule vide');
  if (t === 'operation'){
    const n = b.nombres.map(num);
    if (n.length < 2) pb.push(nom + ' : il faut au moins 2 nombres');
    else if (b.operation === '-' && n[0] < n[1]) pb.push(nom + ' : soustraction impossible en CM (le premier nombre est plus petit)');
    else if (b.operation === ':' && (n.some(x => x !== Math.round(x) || x < 0) || !n[1])) pb.push(nom + ' : la division posée ne prend que des nombres entiers, diviseur non nul');
    if (b.nombres.some(x => S(x).replace(/\D/g, '').length > 9)) pb.push(nom + ' : nombre trop long (9 chiffres au plus)');
  }
  if (t === 'droite'){ if (b.max <= b.min) pb.push(nom + ' : max doit être plus grand que min'); else if ((b.max - b.min) / b.pas > 20) pb.push(nom + ' : trop de graduations (20 au plus) : augmente le pas'); b.points.forEach(p => { const v = num(p.valeur); if (v < b.min || v > b.max) pb.push(`${nom} : le point ${p.nom || p.valeur} est hors de la droite`); }); }
  if (t === 'fraction' && b.numerateur > b.denominateur * 6) pb.push(nom + ' : fraction trop grande à dessiner');
  if (t === 'graphique'){
    const n = b.etiquettes.length;
    if (b.genre === 'climat'){ if (b.temperatures.length !== n || b.precipitations.length !== n || b.temperatures.some(v => v == null) || b.precipitations.some(v => v == null)) pb.push(nom + ' : il faut une température et une précipitation par mois'); }
    else {
      if (!b.series.length) pb.push(nom + ' : aucune série de valeurs');
      b.series.forEach(s => { if (s.valeurs.length !== n || s.valeurs.some(v => v == null)) pb.push(`${nom} : la série « ${s.nom} » doit avoir ${n} valeurs (une par étiquette)`); });
      if (b.genre === 'camembert' && (b.series.length !== 1 || b.series[0].valeurs.some(v => v < 0))) pb.push(nom + ' : un camembert a une seule série de valeurs positives');
    }
  }
}

/* ---------- opérations posées ---------- */
function grille(lignes, W, cache){
  // lignes : [{t: texte aligné à droite, fin: colonne de fin (sinon W), regle: [début, fin] trait sous la ligne, res: true si c'est un résultat}]
  return `<table class="op-g">${lignes.map(l => {
    const fin = l.fin == null ? W : l.fin, cel = Array(W).fill(''); const ch = [...S(l.t)]; ch.forEach((c, i) => { const j = fin - ch.length + i; if (j >= 0 && j < W) cel[j] = c; });
    return `<tr>${cel.map((c, j) => { const reg = l.regle && j >= l.regle[0] && j < l.regle[1]; const vide = l.res && cache; return `<td class="${[reg ? 'rg' : '', vide ? 'vd' : '', c === ',' ? 'vg' : ''].filter(Boolean).join(' ')}">${vide ? '' : esc(c)}</td>`; }).join('')}</tr>`;
  }).join('')}</table>`;
}
function poser(b){
  const op = b.operation, N = b.nombres, cache = !b.resultat;
  if (op === '+' || op === '-'){
    const d = Math.max(...N.map(decs)), ent = s => S(s).split(',')[0];
    const vals = N.map(num), r = op === '+' ? vals.reduce((a, c) => a + c, 0) : vals[0] - vals[1];
    const txt = v => fr(v, d).replace(/ /g, '');
    const L = N.map(x => txt(num(x))), R = txt(r), wi = Math.max(...[...L, R].map(x => ent(x).length)), W = wi + 1 + (d ? d + 1 : 0);
    const lignes = L.map((x, i) => ({t: i ? (op === '+' ? '+' : '−') + ' '.repeat(Math.max(0, W - 1 - x.length)) + x : x}));
    lignes[lignes.length - 1].regle = [0, W];
    lignes.push({t: R, res: true});
    return grille(lignes, W, cache);
  }
  if (op === '×'){
    const [a, b2] = N, da = decs(a), db = decs(b2), Ai = Math.round(num(a) * 10 ** da), Bi = Math.round(num(b2) * 10 ** db);
    const chB = String(Bi).split('').reverse(), P = chB.map((c, i) => String(Ai * +c) + '0'.repeat(i));
    const tot = Ai * Bi, dt = da + db; let R = String(tot); if (dt){ R = R.padStart(dt + 1, '0'); R = R.slice(0, -dt) + ',' + R.slice(-dt); R = R.replace(/,?0+$/, '') || '0'; }
    const W = Math.max(a.length, b2.length + 1, R.length, ...P.map(x => x.length + 1)) + 1;
    const lignes = [{t: a}, {t: '×' + ' '.repeat(Math.max(0, W - 1 - b2.length)) + b2, regle: [0, W]}];
    if (P.length > 1){ P.forEach((p, i) => lignes.push({t: (i ? '+' + ' '.repeat(Math.max(0, W - 1 - p.length)) : '') + p, res: true, regle: i === P.length - 1 ? [0, W] : null})); }
    lignes.push({t: R, res: true});
    return grille(lignes, W, cache);
  }
  // division à potence (entiers)
  const n = String(Math.round(num(N[0]))), D = Math.round(num(N[1]));
  const dig = n.split('').map(Number); let k = 0, cur = 0;
  while (k < dig.length){ cur = cur * 10 + dig[k]; if (cur >= D) break; k++; }
  if (k >= dig.length){ k = dig.length - 1; }
  const L = [{t: n}], W = n.length + 1;
  let pos = k, q = '';
  // colonne 0 : le signe − ; le chiffre j du dividende est en colonne j + 1 ; « fin » = colonne après le dernier chiffre
  while (true){
    const qq = Math.floor(cur / D), prod = qq * D, rest = cur - prod; q += qq;
    L.push({t: '−' + prod, fin: pos + 2, regle: [pos + 2 - String(prod).length, pos + 2], res: true});
    pos++;
    if (pos < dig.length){ cur = rest * 10 + dig[pos]; L.push({t: (rest ? String(rest) : '0') + dig[pos], fin: pos + 2, res: true}); }
    else { L.push({t: String(rest), fin: pos + 1, res: true}); break; }
  }
  const gauche = grille(L, W, cache);
  return `<div class="op-div">${gauche}<div class="op-pot"><div class="op-dv">${esc(String(D))}</div><div class="op-q">${cache ? '' : esc(String(+q))}</div></div></div>`;
}

/* ---------- rendu ---------- */
const titre = (b, fmt) => b.titre ? `<div class="org-t">${fmt(b.titre)}</div>` : '';
function rendre(b, p, opt, fmt){
  const t = b.type, D = o => esc(JSON.stringify(o));
  if (t === 'formule') return `${titre(b, fmt)}<div class="mx-f"><div class="mx-fx">${fmt(b.texte)}</div>${b.legende ? `<div class="mx-fl">${fmt(b.legende)}</div>` : ''}</div>`;
  if (t === 'operation') return `${titre(b, fmt)}<div class="mx-op">${poser(b)}</div>`;
  if (t === 'droite') return `${titre(b, fmt)}<div class="org mx-dg" data-g="${D(b)}"><svg class="org-svg" aria-hidden="true"></svg></div>`;
  if (t === 'graphique'){
    const c = (s, i) => Sc().coul(s.couleur, i);
    const leg = b.genre === 'climat' ? [['Températures (°C)', '#e63946', 'l'], ['Précipitations (mm)', '#3a86c8', 'b']] : b.genre === 'camembert' ? b.etiquettes.map((e, i) => [e + (b.series[0] && b.series[0].valeurs[i] != null ? ' : ' + fr(b.series[0].valeurs[i]) + (b.unite ? ' ' + b.unite : '') : ''), Sc().coul(null, i), 'b']) : b.series.length > 1 ? b.series.map((s, i) => [s.nom, c(s, i), b.genre === 'courbe' ? 'l' : 'b']) : [];
    return `${titre(b, fmt)}<div class="org mx-gr ${b.genre}" data-g="${D(b)}"><svg class="org-svg" aria-hidden="true"></svg></div>${leg.length ? `<div class="mx-lg">${leg.map(([n, col, f]) => `<span><i class="${f}" style="background:${col}"></i>${fmt(n)}</span>`).join('')}</div>` : ''}${b.source || (b.unite && b.genre !== 'camembert' && b.genre !== 'climat') ? `<div class="mx-src">${b.unite && b.genre !== 'camembert' && b.genre !== 'climat' ? 'Unité : ' + fmt(b.unite) + '. ' : ''}${b.source ? 'Source : ' + fmt(b.source) : ''}</div>` : ''}`;
  }
  if (t === 'fraction'){
    const n = b.denominateur, c = '#3a86c8', tt = Sc().teinte(c, .35);
    const un = (j) => {
      const plein = Math.max(0, Math.min(n, b.numerateur - j * n));
      if (b.forme === 'disque'){
        if (n === 1) return `<svg viewBox="0 0 100 100" class="mx-fr"><circle cx="50" cy="50" r="46" fill="${plein ? tt : '#fff'}" stroke="${c}" stroke-width="3"/></svg>`;
        let s = ''; for (let i = 0; i < n; i++){ const a0 = -Math.PI / 2 + 2 * Math.PI * i / n, a1 = a0 + 2 * Math.PI / n; s += `<path d="M50,50 L${r1(50 + 46 * Math.cos(a0))},${r1(50 + 46 * Math.sin(a0))} A46,46 0 ${n === 2 ? 0 : 0} 1 ${r1(50 + 46 * Math.cos(a1))},${r1(50 + 46 * Math.sin(a1))} Z" fill="${i < plein ? tt : '#fff'}" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>`; }
        return `<svg viewBox="0 0 100 100" class="mx-fr">${s}</svg>`;
      }
      const lig = b.forme === 'rectangle' && n > 3 && n % 2 === 0 ? 2 : 1, col = n / lig, w = b.forme === 'barre' ? 240 : 160, h = b.forme === 'barre' ? 40 : 100;
      let s = ''; for (let i = 0; i < n; i++){ const x = (i % col) * w / col, y = Math.floor(i / col) * h / lig; s += `<rect x="${r1(x + 2)}" y="${r1(y + 2)}" width="${r1(w / col)}" height="${r1(h / lig)}" fill="${i < plein ? tt : '#fff'}" stroke="${c}" stroke-width="2.5"/>`; }
      return `<svg viewBox="0 0 ${w + 4} ${h + 4}" class="mx-fr ${b.forme}">${s}</svg>`;
    };
    return `${titre(b, fmt)}<div class="mx-fd"><div class="mx-fds">${Array.from({length: b.nombre}, (_, j) => un(j)).join('')}</div><div class="mx-fn"><span class="frac"><span>${b.numerateur}</span><span>${b.denominateur}</span></span></div></div>`;
  }
  return '';
}

/* ---------- dessins selon la largeur réelle ---------- */
function graduations(lo, hi, n){
  const brut = (hi - lo) / (n || 5), p10 = Math.pow(10, Math.floor(Math.log10(brut || 1))), pas = [1, 2, 2.5, 5, 10].map(m => m * p10).find(s => s >= brut) || brut;
  const a = Math.floor(lo / pas) * pas, z = Math.ceil(hi / pas) * pas, T = []; for (let v = a; v <= z + pas / 1e6; v += pas) T.push(Math.round(v * 1e6) / 1e6); return T;
}
const txtS = (x, y, s, o) => { o = o || {}; return `<text x="${r1(x)}" y="${r1(y)}" font-size="${r1(o.fs)}" font-family="Nunito, Arial, sans-serif" fill="${o.c || '#222'}" text-anchor="${o.a || 'middle'}"${o.b ? ' font-weight="700"' : ''}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ''}>${esc(s)}</text>`; };

function dessinerDroite(z){
  const b = JSON.parse(z.dataset.g), k = parseFloat(getComputedStyle(z).getPropertyValue('--k')) || 1, W = z.clientWidth, fs = 15 * k, m = 26 * k, H = 92 * k, y = 50 * k;
  const X = v => m + (v - b.min) / (b.max - b.min) * (W - 2 * m - 12 * k);
  let s = `<path d="M${r1(m - 10 * k)},${r1(y)} H${r1(W - 4)}" stroke="#222" stroke-width="${2.5 * k}" fill="none"/><polygon points="${r1(W)},${r1(y)} ${r1(W - 12 * k)},${r1(y - 6 * k)} ${r1(W - 12 * k)},${r1(y + 6 * k)}" fill="#222"/>`;
  const nb = Math.round((b.max - b.min) / b.pas), etiq = v => b.denominateur ? (Math.abs(v * b.denominateur - Math.round(v * b.denominateur)) < 1e-6 ? (Math.round(v * b.denominateur) % b.denominateur === 0 ? String(Math.round(v)) : `${Math.round(v * b.denominateur)}/${b.denominateur}`) : fr(v)) : fr(v);
  for (let i = 0; i <= nb; i++){
    const v = b.min + i * b.pas, x = X(v);
    s += `<path d="M${r1(x)},${r1(y - 9 * k)} V${r1(y + 9 * k)}" stroke="#222" stroke-width="${2.2 * k}"/>` + txtS(x, y + 28 * k, etiq(v), {fs, b: true});
    if (i < nb) for (let j = 1; j < b.sous; j++){ const xs = X(v + j * b.pas / b.sous); s += `<path d="M${r1(xs)},${r1(y - 5 * k)} V${r1(y + 5 * k)}" stroke="#555" stroke-width="${1.4 * k}"/>`; }
  }
  b.points.forEach((p, i) => {
    const v = num(p.valeur), x = X(v), c = Sc().coul(null, i + 1);
    s += `<path d="M${r1(x)},${r1(y - 26 * k)} V${r1(y - 7 * k)}" stroke="${c}" stroke-width="${2.5 * k}"/><polygon points="${r1(x)},${r1(y - 3 * k)} ${r1(x - 5 * k)},${r1(y - 11 * k)} ${r1(x + 5 * k)},${r1(y - 11 * k)}" fill="${c}"/>`;
    s += txtS(x, y - 31 * k, p.nom || (p.cacher ? '?' : S(p.valeur)), {fs: fs * 1.05, b: true, c});
  });
  z.style.height = r1(H) + 'px';
  const svg = z.querySelector('.org-svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.innerHTML = s;
}

function dessinerGraphique(z){
  const b = JSON.parse(z.dataset.g), k = parseFloat(getComputedStyle(z).getPropertyValue('--k')) || 1, W = z.clientWidth, fs = 13 * k;
  const svg = z.querySelector('.org-svg'); let s = '';
  if (b.genre === 'camembert'){
    const H = Math.min(W * .55, 260 * k), R = H / 2 - 6, cx = W / 2, cy = H / 2, V = (b.series[0] || {valeurs: []}).valeurs.map(v => Math.max(0, v || 0)), tot = V.reduce((a, c) => a + c, 0) || 1;
    let a0 = -Math.PI / 2;
    V.forEach((v, i) => {
      const a1 = a0 + 2 * Math.PI * v / tot, c = Sc().coul(null, i), gr = a1 - a0 > Math.PI ? 1 : 0;
      s += V.filter(x => x > 0).length === 1 && v ? `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="${c}" stroke="#fff" stroke-width="2"/>` : `<path d="M${r1(cx)},${r1(cy)} L${r1(cx + R * Math.cos(a0))},${r1(cy + R * Math.sin(a0))} A${r1(R)},${r1(R)} 0 ${gr} 1 ${r1(cx + R * Math.cos(a1))},${r1(cy + R * Math.sin(a1))} Z" fill="${c}" stroke="#fff" stroke-width="2"/>`;
      const pc = v / tot; if (pc >= .06){ const am = (a0 + a1) / 2; s += txtS(cx + R * .62 * Math.cos(am), cy + R * .62 * Math.sin(am) + fs * .35, fr(pc * 100, 0) + ' %', {fs: fs * 1.1, b: true, c: '#fff'}); }
      a0 = a1;
    });
    z.style.height = r1(H) + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.innerHTML = s; return;
  }
  const n = b.etiquettes.length, H = Math.min(W * .58, 320 * k), gauche = 46 * k, droite = b.genre === 'climat' ? 46 * k : 14 * k, haut = (b.genre === 'climat' ? 30 : 14) * k, bas = 30 * k;
  const pw = W - gauche - droite, ph = H - haut - bas, bw = pw / Math.max(1, n);
  let lo, hi, lo2, hi2;
  if (b.genre === 'climat'){
    const tMax = Math.max(10, ...b.temperatures.map(v => v || 0), ...b.precipitations.map(v => (v || 0) / 2)), tMin = Math.min(0, ...b.temperatures.map(v => v || 0));
    hi = Math.ceil(tMax / 10) * 10; lo = Math.floor(tMin / 10) * 10; lo2 = lo * 2; hi2 = hi * 2;
  } else {
    const V = b.series.flatMap(x => x.valeurs).filter(v => v != null); const T0 = graduations(Math.min(0, ...V), Math.max(...V, 0) || 1, 5); lo = T0[0]; hi = T0[T0.length - 1];
  }
  // une courbe dont les étiquettes sont des années (nombres) est placée À L'ÉCHELLE du temps
  const an = b.genre === 'courbe' && n > 1 && b.etiquettes.every(e => /^-?\d{1,4}$/.test(e.trim())) ? b.etiquettes.map(Number) : null;
  const Y = v => haut + ph - (v - lo) / (hi - lo) * ph, X = an ? (i => gauche + bw * .5 + (an[i] - an[0]) / ((an[n - 1] - an[0]) || 1) * (pw - bw)) : (i => gauche + bw * (i + .5));
  const T = b.genre === 'climat' ? graduations(lo, hi, (hi - lo) / 10) : graduations(lo, hi, 5);
  T.forEach(v => { s += `<path d="M${r1(gauche)},${r1(Y(v))} H${r1(gauche + pw)}" stroke="${v === 0 ? '#555' : '#ddd'}" stroke-width="${v === 0 ? 1.6 : 1}"/>` + txtS(gauche - 6, Y(v) + fs * .35, fr(v), {fs, a: 'end', c: b.genre === 'climat' ? '#c1121f' : '#333'}); if (b.genre === 'climat' && v >= 0) s += txtS(gauche + pw + 6, Y(v) + fs * .35, fr(v * 2), {fs, a: 'start', c: '#1d5e96'}); });
  if (b.genre === 'climat'){ s += txtS(gauche, haut - 14 * k, '°C', {fs, a: 'middle', b: true, c: '#c1121f'}) + txtS(gauche + pw, haut - 14 * k, 'mm', {fs, a: 'middle', b: true, c: '#1d5e96'}); }
  const pas = Math.ceil(n / Math.max(1, Math.floor(pw / (fs * 3.2))));
  b.etiquettes.forEach((e, i) => { if (i % pas === 0) s += txtS(X(i), H - bas + fs * 1.5, e, {fs}); });
  s += `<path d="M${r1(gauche)},${r1(haut)} V${r1(haut + ph)}" stroke="#555" stroke-width="1.6"/>`;
  if (b.genre === 'barres' || b.genre === 'climat'){
    const S2 = b.genre === 'climat' ? [{valeurs: b.precipitations.map(v => (v || 0) / 2), couleur: '#3a86c8', brut: b.precipitations}] : b.series, m = S2.length, lb = bw * .72 / m;
    S2.forEach((se, j) => se.valeurs.forEach((v, i) => {
      if (v == null) return; const x = X(i) - bw * .36 + j * lb, y0 = Y(Math.max(lo, 0)), y1 = Y(v), c = se.couleur && /^#/.test(se.couleur) ? se.couleur : Sc().coul(se.couleur, j);
      s += `<rect x="${r1(x + 1)}" y="${r1(Math.min(y0, y1))}" width="${r1(lb - 2)}" height="${r1(Math.abs(y0 - y1))}" fill="${c}" rx="2"/>`;
      if (b.genre === 'barres' && n * m <= 16 && lb > fs * 1.6) s += txtS(x + lb / 2, Math.min(y0, y1) - 4, fr(v), {fs: fs * .9, b: true});
    }));
  }
  if (b.genre === 'courbe' || b.genre === 'climat'){
    const S2 = b.genre === 'climat' ? [{valeurs: b.temperatures, couleur: '#e63946'}] : b.series;
    S2.forEach((se, j) => {
      const c = se.couleur && /^#/.test(se.couleur) ? se.couleur : Sc().coul(se.couleur, j), P = se.valeurs.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean);
      s += `<path d="${P.map((q, i) => (i ? 'L' : 'M') + r1(q[0]) + ',' + r1(q[1])).join(' ')}" fill="none" stroke="${c}" stroke-width="${3 * k}" stroke-linejoin="round" stroke-linecap="round"/>`;
      P.forEach(q => { s += `<circle cx="${r1(q[0])}" cy="${r1(q[1])}" r="${r1(4 * k)}" fill="#fff" stroke="${c}" stroke-width="${2.2 * k}"/>`; });
      if (b.genre === 'courbe' && n <= 12 && b.series.length === 1) se.valeurs.forEach((v, i) => { if (v != null) s += txtS(X(i), Y(v) - 9 * k, fr(v), {fs: fs * .9, b: true}); });
    });
  }
  z.style.height = r1(H) + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.innerHTML = s;
}
function agencer(el){ el.querySelectorAll('.mx-dg').forEach(z => { if (z.clientWidth) dessinerDroite(z); }); el.querySelectorAll('.mx-gr').forEach(z => { if (z.clientWidth) dessinerGraphique(z); }); }

/* ---------- édition à la main ---------- */
function texteEdit(b){
  if (b.type === 'formule') return b.texte + (b.legende ? '\n' + b.legende : '');
  if (b.type === 'operation') return b.nombres.join(' ' + b.operation + ' ');
  return null;
}
function depuisTexte(b, v){
  if (b.type === 'formule'){ const [a, ...r] = v.split('\n'); b.texte = a || ''; const l = r.join(' ').trim(); if (l) b.legende = l; else delete b.legende; }
  if (b.type === 'operation'){ const m = v.match(/^\s*([\d\s,.]+?)\s*([+\-−×x*:÷/])\s*([\d\s,.]+?)(?:\s*\2\s*([\d\s,.]+?))*\s*$/); if (m){ const o = nettoyer({operation: m[2], nombres: v.split(/[+\-−×x*:÷/]/).map(x => x.trim())}, 'operation'); b.operation = o.operation; b.nombres = o.nombres; } }
}
function resume(b){
  if (b.type === 'droite') return `de ${fr(b.min)} à ${fr(b.max)}, ${b.points.length} point(s)`;
  if (b.type === 'fraction') return `${b.numerateur}/${b.denominateur} (${b.forme})`;
  if (b.type === 'graphique') return `${b.genre}, ${b.etiquettes.length} valeurs`;
  return '';
}
const AIDE_EDIT = {formule: '1re ligne : la formule ({3/4} = fraction, √{16} = racine) ; 2e ligne : la légende', operation: 'par exemple « 347 × 26 », « 125,4 + 38,75 », « 1 254 : 6 »'};

const CSS = `
.cours .mx-f{text-align:center;border:3px solid var(--c0);border-radius:14px;padding:10px 14px;background:#fff}
.cours .mx-fx{font-size:calc(26px*var(--k,1));font-weight:800;color:#111;line-height:1.5}
.cours .mx-fl{font-size:calc(17px*var(--k,1));color:#333;margin-top:2px}
.cours .mx-op{display:flex;justify-content:center}
.cours .op-g{border-collapse:collapse;font-family:"Courier New",ui-monospace,monospace;font-size:calc(26px*var(--k,1));font-weight:700;color:#111}
.cours .op-g td{width:1.05em;height:1.35em;text-align:center;padding:0;line-height:1.35em}
.cours .op-g td.vg{width:.5em}
.cours .op-g td.rg{border-bottom:3px solid #111}
.cours .op-g td.vd{border:1.5px dashed #9a9a9a;background:#fff}
.cours .op-div{display:flex;align-items:flex-start}
.cours .op-pot{border-left:3px solid #111;min-width:4em;margin-left:.3em;font-family:"Courier New",ui-monospace,monospace;font-size:calc(26px*var(--k,1));font-weight:700}
.cours .op-dv{border-bottom:3px solid #111;padding:0 .4em;line-height:1.35em}
.cours .op-q{padding:0 .4em;line-height:1.35em;min-height:1.35em;color:#1d5e96}
.cours .mx-lg{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:calc(15px*var(--k,1));margin-top:4px}
.cours .mx-lg span{display:inline-flex;align-items:center;gap:6px}
.cours .mx-lg i{display:inline-block;width:14px;height:14px;border-radius:3px}
.cours .mx-lg i.l{height:4px;border-radius:2px}
.cours .mx-src{font-size:calc(14px*var(--k,1));font-style:italic;color:#444;text-align:center;margin-top:2px}
.cours .mx-fd{display:flex;align-items:center;justify-content:center;gap:22px}
.cours .mx-fds{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.cours .mx-fr{width:calc(110px*var(--k,1));height:auto}
.cours .mx-fr.barre{width:calc(260px*var(--k,1))}
.cours .mx-fr.rectangle{width:calc(170px*var(--k,1))}
.cours .mx-fn{font-size:calc(34px*var(--k,1));font-weight:800;color:#1d5e96}
.cours .b-cols .mx-fr{width:calc(80px*var(--k,1))}
.cours .b-cols .mx-fr.rectangle{width:calc(130px*var(--k,1))}
.cours .b-cols .mx-fr.barre{width:calc(170px*var(--k,1))}`;
const CSS_TEXTE = `.frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;margin:0 .12em;font-size:.92em}
.frac>span:first-child{border-bottom:.09em solid currentColor;padding:0 .15em}
.frac>span:last-child{padding:0 .15em}
.rac{white-space:nowrap}.rac>span{border-top:.08em solid currentColor;padding:0 .1em;margin-left:.02em}`;
if (typeof document !== 'undefined' && document.head && !document.getElementById('maths-css')){ const st = document.createElement('style'); st.id = 'maths-css'; st.textContent = CSS_TEXTE; document.head.append(st); }

const mod = {CATALOGUE, nettoyer, verifier, rendre, agencer, texteEdit, depuisTexte, resume, AIDE_EDIT, CSS};
window.Maths = {formules, num, fr, poser: b => poser(b), mod};
if (window.Schemas && window.Schemas.etendre) window.Schemas.etendre(mod);
})();
