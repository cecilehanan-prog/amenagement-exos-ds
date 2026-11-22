/* « Apprendre par cœur » : une poésie ou une leçon prise en photo, recopiée mot pour mot par Claude,
   puis apprise en 3 tours, avec la même méthode que la poésie du Garage de Loulou :
   1. j'écoute (le téléphone lit, vers par vers) ; 2. je récite avec de l'aide (les mots cachés apparaissent
   quand je les dis, on me souffle 3 mots si je bloque) ; 3. je récite tout seul (score en %).
   Sans micro : un adulte écoute et valide chaque vers avec 👍.
   Les photos ne servent qu'à recopier le texte ; le texte reste seulement sur ce téléphone. */
(function(){
'use strict';
let C = null;   // ce que app.js nous prête : app, appeler, versJpeg, enBase64, st, onglets…
const $ = s => document.querySelector(s);
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch(e){ return false; } };
const wait = ms => new Promise(r => setTimeout(r, ms));
const h = function(tag, attrs, ...kids){
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs){
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()){ if (kid == null || kid === false) continue; el.append(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid); }
  return el;
};

/* ---------- les textes gardés sur le téléphone ---------- */
const textes = () => { try { const t = JSON.parse(lsGet('am-textes') || '[]'); return Array.isArray(t) ? t : []; } catch(e){ return []; } };
const ranger = l => { l = l.slice(0, 20); while (!lsSet('am-textes', JSON.stringify(l)) && l.length > 1) l.pop(); };
const garderTexte = t => { const l = textes().filter(x => x.id !== t.id); l.unshift(t); ranger(l); };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

/* strophes = groupes de lignes séparés par une ligne vide */
function strophes(lignes){
  const s = []; let cur = [];
  lignes.forEach(l => { if (l.trim()) cur.push(l.trim()); else if (cur.length){ s.push(cur); cur = []; } });
  if (cur.length) s.push(cur);
  return s;
}
/* les lignes à apprendre (seulement les strophes choisies), avec une ligne vide entre deux strophes */
function aApprendre(t){
  const s = strophes(t.lignes), ch = Array.isArray(t.choix) && t.choix.length ? t.choix : s.map((_, i) => i);
  const out = [];
  s.forEach((st, i) => { if (!ch.includes(i)) return; if (out.length) out.push(''); out.push(...st); });
  return out;
}

/* ---------- voix (synthèse vocale du téléphone), comme dans le Garage : voix naturelle, pauses à la ponctuation ---------- */
let voix = null;
function choisirVoix(){
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('fr'));
  voix = vs.find(v => /google/i.test(v.name) && /fr-FR/i.test(v.lang.replace('_', '-'))) || vs.find(v => /fr-FR/i.test(v.lang.replace('_', '-'))) || vs[0] || null;
}
if ('speechSynthesis' in window){ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }
let jeton = 0;
const PAUSE_VIRGULE = 250, PAUSE_POINT = 1500;
function morceaux(t){
  const parts = t.match(/[^,;:.!?…]+[,;:.!?…]*/g) || [t];
  return parts.map(x => x.trim()).filter(x => /[\p{L}\p{N}]/u.test(x)).map(x => { const d = x.slice(-1); return {t: x, pause: /[.!?…]/.test(d) ? PAUSE_POINT : /[,;:]/.test(d) ? PAUSE_VIRGULE : 0}; });
}
function direUn(t, mon){
  return new Promise(ok => {
    if (mon !== jeton) return ok();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; if (voix) u.voice = voix; u.rate = .95;
    let fini = false; const fin = () => { if (!fini){ fini = true; ok(); } };
    u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); setTimeout(fin, 3000 + t.length * 150);
  });
}
function dire(t){
  if (!('speechSynthesis' in window) || !t) return Promise.resolve();
  const mon = ++jeton; speechSynthesis.cancel();
  return (async () => { await wait(60); for (const m of morceaux(t)){ if (mon !== jeton) return; await direUn(m.t, mon); if (mon !== jeton) return; if (m.pause) await wait(m.pause); } })();
}
function taire(){ jeton++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
let arreterMicro = () => {};
function toutArreter(){ taire(); try { arreterMicro(); } catch(e){} arreterMicro = () => {}; }

/* ---------- écran d'accueil du mode : photo + mes textes ---------- */
const A = {photos: []};
function ecran(msg){
  toutArreter();
  const app = C.app;
  const vign = A.photos.map((p, i) => `<div class="ph"><img src="${p.url}" alt="Photo ${i + 1}"><button data-del="${i}" aria-label="Retirer la photo ${i + 1}">✕</button></div>`).join('');
  const liste = textes();
  app.innerHTML = `<div class="ecran">
    ${C.boutonAccueil()}
    <h1>📜 Apprendre par cœur</h1>
    <p class="hint">Prends en photo ta poésie ou ta leçon : je la recopie, puis tu l’apprends en 3 tours (j’écoute, je récite avec de l’aide, je récite tout seul).</p>
    <div class="rang">
      <button class="btn pri" id="cam">📷 Prendre une photo</button>
      <button class="btn" id="pick">🖼 Choisir</button>
    </div>
    <input type="file" id="f-cam" accept="image/*" capture="environment" hidden>
    <input type="file" id="f-pick" accept="image/*" multiple hidden>
    ${vign ? `<div class="photos">${vign}</div>` : ''}
    <button class="btn pri large" id="go" style="margin-top:16px">✨ Préparer mon texte</button>
    <div id="msg" class="msg" role="status"></div>
    <button class="discret" id="taper">✍️ Taper le texte moi-même</button>
    ${liste.length ? `<h2>Mes textes</h2><div class="mes-textes">${liste.map(t => `<div class="mt"><button class="mt-ouvrir" data-id="${C.esc(t.id)}"><b>${C.esc(t.titre)}</b>${t.auteur ? `<span>${C.esc(t.auteur)}</span>` : ''}<small>${t.res ? `⭐ ${t.res.pct} % le ${new Date(t.res.date).toLocaleDateString('fr-FR')}` : 'Pas encore récité'}</small></button><button class="mt-suppr" data-suppr="${C.esc(t.id)}" aria-label="Supprimer ${C.esc(t.titre)}">🗑</button></div>`).join('')}</div>
      <p class="hint">Ces textes restent seulement sur ce téléphone.</p>` : ''}
  </div>`;
  C.brancherAccueil();
  if (msg) C.setMsg(msg, true);
  const ajouter = async files => {
    for (const f of files){
      if (A.photos.length >= 4){ C.setMsg('4 photos au maximum.', true); break; }
      try { const b = await C.versJpeg(f); A.photos.push({blob: b, url: URL.createObjectURL(b)}); } catch(e){ C.setMsg('Cette photo n’a pas pu être lue.', true); }
    }
    ecran();
  };
  $('#cam').onclick = () => $('#f-cam').click();
  $('#pick').onclick = () => $('#f-pick').click();
  $('#f-cam').onchange = e => ajouter([...e.target.files]);
  $('#f-pick').onchange = e => ajouter([...e.target.files]);
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const p = A.photos.splice(+b.dataset.del, 1)[0]; if (p) URL.revokeObjectURL(p.url); ecran(); });
  app.querySelectorAll('[data-id]').forEach(b => b.onclick = () => { const t = textes().find(x => x.id === b.dataset.id); if (t) apprendre(t); });
  app.querySelectorAll('[data-suppr]').forEach(b => b.onclick = () => {
    const t = textes().find(x => x.id === b.dataset.suppr); if (!t) return;
    const f = C.fenetre(`<p>Supprimer « ${C.esc(t.titre)} » de ce téléphone ?</p><div class="rang"><button class="btn pri" data-oui>Supprimer</button><button class="btn" data-fermer>Garder</button></div>`);
    f.querySelector('[data-oui]').onclick = () => { ranger(textes().filter(x => x.id !== t.id)); f.remove(); ecran(); };
  });
  $('#go').onclick = recopier;
  $('#taper').onclick = () => editeur({id: uid(), titre: '', auteur: '', genre: 'poesie', lignes: [], choix: []}, true);
}
function oublierPhotos(){ A.photos.forEach(p => URL.revokeObjectURL(p.url)); A.photos = []; }

/* ---------- Claude recopie le texte ---------- */
async function recopier(){
  if (!A.photos.length){ C.setMsg('Prends d’abord une photo du texte.', true); return; }
  const ctl = new AbortController();
  C.app.innerHTML = `<div class="ecran attente"><div class="rond" aria-hidden="true"></div><h1>Je recopie ton texte…</h1><p class="hint">Souvent moins d’une minute. Garde l’appli ouverte.</p><button class="btn" id="stop" style="margin-top:20px">Arrêter</button></div>`;
  $('#stop').onclick = () => ctl.abort();
  try {
    let images = await Promise.all(A.photos.map(p => C.enBase64(p.blob)));
    for (const [cote, q] of [[1300, .75], [1000, .7]]){
      if (images.reduce((n, x) => n + x.length, 0) < 3800000) break;
      for (const p of A.photos) p.blob = await C.versJpeg(p.blob, cote, q);
      images = await Promise.all(A.photos.map(p => C.enBase64(p.blob)));
    }
    const j = await C.appeler({action: 'transcrire', code: C.st.code, images}, ctl.signal);
    const r = j.resultat || {};
    const lignes = (r.lignes || []).map(l => String(l || '').trim());
    while (lignes.length && !lignes[lignes.length - 1]) lignes.pop();
    oublierPhotos();   // le texte est recopié : les photos ne servent plus
    editeur({id: uid(), titre: String(r.titre || 'Mon texte').slice(0, 120), auteur: String(r.auteur || '').slice(0, 80), genre: r.genre === 'lecon' ? 'lecon' : 'poesie', lignes, choix: [], doute: String(r.doute || '').slice(0, 300)}, true);
  } catch(e){
    if (e && e.code === 'code'){ C.codePerdu(); return; }
    ecran((e && e.message) || 'Ça n’a pas marché. Réessaie.');
  }
}

/* ---------- vérifier le texte et choisir ce qu'on apprend ---------- */
function editeur(t, nouveau){
  toutArreter();
  const app = C.app;
  app.innerHTML = `<div class="ecran">
    <h1>${nouveau ? '✅ Vérifie ton texte' : '✏️ Corriger le texte'}</h1>
    <p class="hint">Compare avec ton cahier. Si un mot est faux, corrige-le ici. Un vers (ou une phrase) par ligne, une ligne vide entre deux strophes.</p>
    ${t.doute ? `<p class="doute">⚠️ Mots difficiles à lire : ${C.esc(t.doute)}</p>` : ''}
    <label class="hint" for="t-titre">Titre</label><input type="text" id="t-titre" value="${C.esc(t.titre)}">
    <label class="hint" for="t-auteur">Auteur (facultatif)</label><input type="text" id="t-auteur" value="${C.esc(t.auteur)}">
    <label class="hint" for="t-texte">Le texte</label><textarea id="t-texte" rows="14" class="t-texte">${C.esc(t.lignes.join('\n'))}</textarea>
    <div id="parts"></div>
    <button class="btn pri large" id="ok" style="margin-top:16px">📜 J’apprends ce texte</button>
    <div id="msg" class="msg" role="status"></div>
    <button class="discret" id="annuler">${nouveau ? 'Annuler' : 'Retour'}</button>
  </div>`;
  let choix = Array.isArray(t.choix) ? t.choix.slice() : [];
  const parts = () => {
    const s = strophes($('#t-texte').value.split('\n'));
    if (choix.some(i => i >= s.length)) choix = choix.filter(i => i < s.length);
    $('#parts').innerHTML = s.length > 1 ? `<h2>Ce que j’apprends</h2><p class="hint">Décoche ce qui n’est pas à apprendre.</p>${s.map((st, i) => `<label class="part"><input type="checkbox" data-part="${i}" ${!choix.length || choix.includes(i) ? 'checked' : ''}><span><b>${t.genre === 'lecon' ? 'Paragraphe' : 'Strophe'} ${i + 1}</b> · ${C.esc(st[0])}…</span></label>`).join('')}` : '';
    $('#parts').querySelectorAll('[data-part]').forEach(c => c.onchange = () => {
      const coches = [...$('#parts').querySelectorAll('[data-part]')].filter(x => x.checked).map(x => +x.dataset.part);
      choix = coches.length === s.length ? [] : coches;
    });
  };
  parts();
  $('#t-texte').addEventListener('input', () => { clearTimeout(parts.t); parts.t = setTimeout(parts, 400); });
  $('#ok').onclick = () => {
    const lignes = $('#t-texte').value.split('\n').map(l => l.trim());
    while (lignes.length && !lignes[lignes.length - 1]) lignes.pop();
    if (lignes.filter(Boolean).length < 1){ C.setMsg('Le texte est vide.', true); return; }
    const coches = [...$('#parts').querySelectorAll('[data-part]')];
    if (coches.length && !coches.some(c => c.checked)){ C.setMsg('Coche au moins une partie à apprendre.', true); return; }
    const n = Object.assign({}, t, {titre: $('#t-titre').value.trim().slice(0, 120) || 'Mon texte', auteur: $('#t-auteur').value.trim().slice(0, 80), lignes, choix});
    delete n.doute;
    garderTexte(n); apprendre(n);
  };
  $('#annuler').onclick = () => nouveau ? ecran() : apprendre(t);
}

/* ---------- apprendre : la méthode du Garage de Loulou ---------- */
const norm = w => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const jetons = t => t.replace(/[’']/g, ' ').replace(/-/g, ' ').split(/\s+/).map(norm).filter(Boolean);
function lev(a, b){
  const d = Array.from({length: a.length + 1}, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const pareil = (a, b) => a === b || (b.length >= 4 && lev(a, b) <= 1) || (b.length >= 7 && lev(a, b) <= 2);

function apprendre(t){
  toutArreter();
  const lignes = aApprendre(t);
  let tour = 0;
  const de = t.auteur ? `, de ${t.auteur}` : '';
  /* disp = les mots affichés (« d’aimer »), mots = les sons reconnus (« d », « aimer ») */
  const disp = [], mots = [];
  lignes.forEach((l, li) => l.split(/\s+/).filter(Boolean).forEach(w => {
    const ts = jetons(w);
    if (!ts.length){ if (disp.length) disp[disp.length - 1].t += ' ' + w; return; }
    const di = disp.length; disp.push({t: w, ligne: li, toks: []});
    ts.forEach(n => { disp[di].toks.push(mots.length); mots.push({n, d: di}); });
  }));

  const app = C.app;
  const coquille = () => {
    toutArreter();
    app.innerHTML = '';
    const barre = h('div', {class: 'barre'},
      h('button', {class: 'btn', onclick: () => { toutArreter(); ecran(); }}, h('span', {'aria-hidden': 'true'}, '📚'), 'Mes textes'),
      h('button', {class: 'btn', onclick: () => { toutArreter(); editeur(t, false); }}, h('span', {'aria-hidden': 'true'}, '✏️'), 'Corriger'),
      h('button', {class: 'btn', onclick: () => { tour = 0; menu(); }}, h('span', {'aria-hidden': 'true'}, '🔁'), 'Du début'));
    const zone = h('div', {class: 'ecran par-coeur'});
    app.append(barre, zone);
    window.scrollTo(0, 0);
    return zone;
  };
  const bulle = txt => h('div', {class: 'bulle'}, h('span', {class: 'bulle-ico', 'aria-hidden': 'true'}, '🦉'), h('p', null, txt),
    h('button', {class: 'oreille', 'aria-label': 'Écouter', onclick: () => dire(txt)}, '🔊'));

  const menu = () => {
    const z = coquille();
    const txt = tour === 0 ? `Voici ton texte : ${t.titre}${de}. D’abord, écoute-le bien.` : tour === 1 ? 'À toi ! Récite ton texte. Si tu bloques, je te souffle les mots.' : 'Dernier tour : tu récites tout seul, sans aide. Tu es prêt ?';
    z.append(h('h2', {class: 'titre-pc'}, '📜 ' + t.titre), bulle(txt),
      h('div', {class: 'carte col'},
        h('div', {class: tour === 0 ? 'etape cur' : 'etape ok'}, tour > 0 ? '✅' : '1️⃣', ' J’écoute le texte'),
        h('div', {class: tour === 1 ? 'etape cur' : tour > 1 ? 'etape ok' : 'etape'}, tour > 1 ? '✅' : '2️⃣', ' Je récite, avec de l’aide'),
        h('div', {class: tour === 2 ? 'etape cur' : 'etape'}, '3️⃣', ' Je récite tout seul')),
      h('button', {class: 'btn pri large', onclick: () => tour === 0 ? ecouter() : reciter(tour === 1)}, tour === 0 ? '🎧 Écouter' : '🎤 Je récite'),
      tour > 0 ? h('button', {class: 'btn large', onclick: () => sansMicro(tour === 1)}, '🧑‍🏫 Je récite à un adulte') : null,
      tour > 0 ? h('button', {class: 'btn large', onclick: () => { tour = 0; menu(); }}, '🎧 Réécouter le texte') : null,
      tour === 0 ? h('button', {class: 'discret', onclick: () => { tour = 1; menu(); }}, 'Je connais déjà le texte : passer au tour 2') : null);
    dire(txt);
  };

  const ecouter = async () => {
    const z = coquille();
    const els = lignes.map(l => l ? h('div', {class: 'vers'}, l) : h('div', {class: 'strophe'}));
    let stop = false;
    const fini = h('button', {class: 'btn pri large', onclick: () => { taire(); stop = true; tour = Math.max(tour, 1); menu(); }}, 'J’ai bien écouté ➡️');
    z.append(h('h2', {class: 'titre-pc'}, '🎧 ' + t.titre), t.auteur ? h('div', {class: 'hint', style: 'text-align:center'}, t.auteur) : null, h('div', {class: 'carte poeme'}, els), fini);
    const mon = Symbol(); ecouter.cur = mon;
    await wait(300);
    await dire(`${t.titre}${de}.`);
    for (let i = 0; i < lignes.length; i++){
      if (stop || ecouter.cur !== mon || !z.isConnected) return;
      if (!lignes[i]){ await wait(500); continue; }
      els.forEach(e => e.classList.remove('lu')); els[i].classList.add('lu');
      els[i].scrollIntoView({block: 'center', behavior: 'smooth'});
      await dire(lignes[i]);
      await wait(250);
    }
    els.forEach(e => e.classList.remove('lu'));
  };

  const reciter = aide => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return sansMicro(aide);
    const z = coquille();
    const etat = mots.map(() => '');   // '' | 'ok' | 'aide' | 'saute'
    const spans = disp.map(w => h('span', {class: 'mot-cache'}, w.t));
    const lignesEl = lignes.map((l, li) => l ? h('div', {class: 'vers'}, spans.filter((_, i) => disp[i].ligne === li).flatMap(s => [s, ' '])) : h('div', {class: 'strophe'}));
    const statut = h('div', {class: 'micro'}, '🎤 J’écoute…');
    const peindre = p => spans.forEach((s, di) => {
      const e = disp[di].toks.map(i => etat[i]);
      const c = e.every(Boolean) ? (e.includes('aide') ? 'aide' : e.includes('saute') ? 'saute' : 'ok') : e.includes('aide') ? 'aide' : disp[di].toks.includes(p) ? 'next' : '';
      s.className = 'mot-cache' + (c ? ' ' + c : '');
    });
    let finals = [], session = '', p = 0, dernier = Date.now(), actif = true, pause = false, rec = null, aideEnCours = false;

    const aligner = () => {
      const entendu = jetons(finals.join(' ') + ' ' + session);
      let q = 0;
      const e = mots.map((_, i) => etat[i] === 'aide' ? 'aide' : '');
      for (const tok of entendu){
        for (let k = 0; k <= 2 && q + k < mots.length; k++){
          if (pareil(tok, mots[q + k].n)){
            for (let j = q; j < q + k; j++) if (!e[j]) e[j] = 'saute';
            if (e[q + k] !== 'aide') e[q + k] = 'ok';
            q = q + k + 1; break;
          }
        }
      }
      for (let i = 0; i < mots.length; i++) etat[i] = e[i];
      if (q > p){ p = q; dernier = Date.now(); }
      peindre(p);
      const cur = spans[mots[Math.min(p, mots.length - 1)].d];
      if (cur) cur.scrollIntoView({block: 'center', behavior: 'smooth'});
      if (p >= mots.length) fin();
    };
    const ecouterMicro = () => {
      if (!actif || pause) return;
      const r = rec = new SR(); r.lang = 'fr-FR'; r.continuous = true; r.interimResults = true;
      r.onresult = e => { if (r !== rec) return; let x = ''; for (let i = 0; i < e.results.length; i++) x += e.results[i][0].transcript + ' '; session = x; aligner(); };
      r.onend = () => { if (r !== rec) return; if (session) finals.push(session); session = ''; rec = null; if (actif && !pause) setTimeout(ecouterMicro, 150); };
      r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed'){ actif = false; statut.textContent = '🚫 Le micro est bloqué. Autorise le micro, ou récite à un adulte.'; } };
      try { r.start(); statut.textContent = '🎤 J’écoute…'; } catch(e){}
    };
    const souffler = async () => {
      if (aideEnCours || p >= mots.length) return;
      aideEnCours = true; pause = true;
      const old = rec; rec = null; if (session) finals.push(session); session = '';
      try { old && old.abort(); } catch(e){}
      statut.textContent = '🤫 Je te souffle…';
      /* on souffle les 3 mots suivants du même vers */
      const d0 = mots[p].d, li = disp[d0].ligne, ds = [];
      for (let d = d0; d < disp.length && ds.length < 3 && disp[d].ligne === li; d++) ds.push(d);
      ds.forEach(d => disp[d].toks.forEach(i => { if (i >= p) etat[i] = 'aide'; })); peindre(p);
      await dire(ds.map(d => disp[d].t).join(' '));
      /* il répète les mots soufflés, puis continue */
      dernier = Date.now(); pause = false; aideEnCours = false; statut.textContent = '🎤 J’écoute…'; ecouterMicro();
    };
    const veille = setInterval(() => {
      if (!actif) return clearInterval(veille);
      if (!z.isConnected){ stopTout(); return; }
      if (aide && !pause && Date.now() - dernier > 6000) souffler();
    }, 500);
    const stopTout = () => { actif = false; clearInterval(veille); const r = rec; rec = null; try { r && r.abort(); } catch(e){} };
    arreterMicro = stopTout;
    const fin = () => {
      if (!actif) return; stopTout();
      const ok = etat.filter(x => x === 'ok').length, aid = etat.filter(x => x === 'aide').length;
      mots.forEach((_, i) => { if (!etat[i]) etat[i] = 'saute'; }); peindre(-1);
      spans.forEach(s => s.classList.add('vu'));
      const pct = Math.round(ok / mots.length * 100);
      const msg = aide
        ? `Bravo ! Tu as dit ${ok} mots tout seul${aid ? `, et je t’ai aidé pour ${aid} mots` : ''}. Maintenant, essaie sans aide !`
        : pct >= 90 ? `Waouh ! Tu connais ton texte par cœur ! ${pct} pour cent des mots !` : `Bien joué ! Tu as trouvé ${pct} pour cent des mots. Les mots en rouge sont à revoir.`;
      dire(msg);
      statut.className = 'micro fini';
      statut.textContent = aide ? `✅ ${ok} mots tout seul · 🤫 ${aid} soufflés` : `⭐ ${pct} % des mots`;
      btns.innerHTML = '';
      if (aide) btns.append(h('button', {class: 'btn pri large', onclick: () => { tour = 2; menu(); }}, '➡️ Tour 3 : tout seul'),
        h('button', {class: 'btn large', onclick: () => reciter(true)}, '🔁 Encore avec de l’aide'));
      else {
        resultat(pct);
        btns.append(h('button', {class: 'btn pri large', onclick: () => bravo(pct, `${pct} % des mots récités tout seul`)}, '🏁 Terminer'),
          h('button', {class: 'btn large', onclick: () => reciter(false)}, '🔁 Recommencer'));
      }
    };
    const btns = h('div', {class: 'col'},
      aide ? h('button', {class: 'btn aide large', onclick: () => souffler()}, '🆘 Aide-moi') : null,
      h('button', {class: 'btn pri large', onclick: () => fin()}, '✅ J’ai fini'));
    z.append(h('h2', {class: 'titre-pc'}, aide ? '🎤 Je récite (avec aide)' : '🎤 Je récite tout seul'), statut,
      h('div', {class: 'carte poeme recit'}, lignesEl), btns);
    peindre(0);
    dire(aide ? 'Vas-y, je t’écoute ! Commence par le titre si tu veux.' : 'Vas-y, tout seul ! Je t’écoute.').then(() => { dernier = Date.now(); ecouterMicro(); });
  };

  /* Sans micro (ou micro refusé) : un adulte écoute et valide chaque vers */
  const sansMicro = aide => {
    const z = coquille();
    let ok = 0;
    const vrais = lignes.filter(Boolean);
    const txt = 'Récite à un adulte : il appuie sur le pouce à chaque vers bien dit.' + (aide ? ' Si tu bloques, touche 🆘 : je te lis le vers.' : '');
    z.append(h('h2', {class: 'titre-pc'}, '🧑‍🏫 Je récite à un adulte'), bulle(txt),
      h('div', {class: 'carte col'}, vrais.map(l => {
        const tx = h('span', {class: 'grow mot-cache'}, l);
        return h('div', {class: 'vers-m'}, tx,
          aide ? h('button', {class: 'oreille', 'aria-label': 'Souffler ce vers', onclick: () => { tx.classList.add('aide'); dire(l); }}, '🆘') : null,
          h('button', {class: 'oreille', 'aria-label': 'Vers bien dit', onclick: e => { if (!e.currentTarget.dataset.v){ ok++; e.currentTarget.dataset.v = 1; } tx.classList.add('ok'); }}, '👍'));
      })),
      h('button', {class: 'btn pri large', onclick: () => {
        if (aide){ tour = 2; menu(); return; }
        const pct = Math.round(ok / vrais.length * 100); resultat(pct);
        bravo(pct, `${ok} vers sur ${vrais.length}`);
      }}, aide ? '➡️ Tour 3 : tout seul' : '🏁 Terminer'));
    dire(txt);
  };

  const resultat = pct => { const l = textes(), x = l.find(y => y.id === t.id); t.res = {pct, date: Date.now()}; if (x){ x.res = t.res; ranger(l); } };
  const bravo = (pct, detail) => {
    const z = coquille();
    const msg = pct >= 90 ? 'Tu le connais par cœur. Bravo !' : pct >= 60 ? 'C’est bien parti ! Encore un ou deux essais et ce sera parfait.' : 'Continue : réécoute le texte, puis récite avec de l’aide.';
    z.append(h('div', {class: 'bravo'}, h('div', {class: 'bravo-ico', 'aria-hidden': 'true'}, pct >= 90 ? '🏆' : pct >= 60 ? '⭐' : '💪'),
      h('h2', null, pct >= 90 ? 'Par cœur !' : 'Bien joué !'), h('p', null, detail), h('p', null, msg)),
      h('button', {class: 'btn pri large', onclick: () => { tour = pct >= 90 ? 2 : 1; menu(); }}, '🔁 Réciter encore'),
      h('button', {class: 'btn large', onclick: () => { toutArreter(); ecran(); }}, '📚 Mes textes'),
      h('button', {class: 'btn large', onclick: () => { toutArreter(); C.accueil(); }}, '🏠 Accueil'));
    dire(msg);
  };

  menu();
}

window.Apprendre = {
  init(ctx){ C = ctx; },
  ecran,
  quitter(){ toutArreter(); oublierPhotos(); }
};
})();
