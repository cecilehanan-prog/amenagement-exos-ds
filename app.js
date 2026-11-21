/* Mes exercices aménagés : l'outil « Aménager un exercice ou une évaluation » de l'Atelier pédagogique,
   en version téléphone pour les élèves et les AESH. Trois écrans : code de classe → photo et profil → exercice.
   Les photos restent sur le téléphone ; elles partent seulement vers la fonction (qui les passe à Claude) quand
   on touche « Préparer », et ne sont gardées nulle part. */
(function(){
'use strict';
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch(e){ return false; } };

/* ce dont exo.js a besoin de l'atelier */
const PROFILES = {
  std:  {label:'Standard', mark:'●', paper:'#fffdf7'},
  dys:  {label:'Dys', mark:'▲', paper:'#fdf6e3'},
  tdah: {label:'TDA-H', mark:'■', paper:'#ffffff'},
  hpi:  {label:'HPI', mark:'★', paper:'#fffdf7'}
};
const slug = s => String(s || 'exercice').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'exercice';
function offerFile(nom, contenu){
  const b = new Blob([contenu], {type: 'text/html'}), u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = nom; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
}
const rien = () => {};
window.ACM = {PROFILES, esc, slug, offerFile, uid: () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
  toast: t => setMsg(t), touch: rien, renderEditor: rien, renderStage: rien, scheduleRender: rien, historiser: rien, ask: rien};

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle'];
const st = {
  code: lsGet('am-code') || '',
  forme: lsGet('am-forme') === 'fiche' ? 'fiche' : 'questions',
  profils: (() => { try { return Exo.profilsPropres(JSON.parse(lsGet('am-profils') || '[]')); } catch(e){ return []; } })(),
  langue: Exo.langueOk(lsGet('am-langue') || ''),
  classe: lsGet('am-classe') || '',
  matiere: '', consignes: '',
  main: lsGet('am-main') === 'droite' ? 'droite' : 'gauche',
  photos: [], busy: false, ctl: null
};
const garder = () => { lsSet('am-forme', st.forme); lsSet('am-profils', JSON.stringify(st.profils)); lsSet('am-langue', st.langue); lsSet('am-classe', st.classe); lsSet('am-main', st.main); };
function setMsg(t, err){ const m = $('#msg'); if (m){ m.textContent = t || ''; m.classList.toggle('err', !!err); } }

/* ---------- appel à la fonction ---------- */
async function appeler(corps, signal){
  const url = (window.CONFIG && CONFIG.fonction) || '';
  if (!/^(https:\/\/|\/)/.test(url) || /REMPLACER/.test(url)) throw {message: 'L’appli n’est pas encore reliée à son serveur (adresse à mettre dans config.js).'};
  let r;
  try { r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corps), signal}); }
  catch(e){ if (e && e.name === 'AbortError') throw {message: 'Arrêté.'}; throw {message: 'Pas de connexion au serveur. Vérifie le réseau (wifi ou 4G).'}; }
  let j = null; try { j = await r.json(); } catch(e){}
  if (!r.ok || !j || !j.ok) throw {status: r.status, code: j && j.erreur, message: (j && j.message) || 'Ça n’a pas marché. Réessaie.'};
  return j;
}

/* ---------- écran 1 : code de classe ---------- */
function ecranCode(erreur){
  app.innerHTML = `<div class="ecran">
    <div class="logo" aria-hidden="true">✋</div>
    <h1 style="text-align:center">Mes exercices aménagés</h1>
    <p class="hint" style="text-align:center">Prends en photo ta fiche d’exercices : elle devient un exercice à faire au toucher.</p>
    <div class="carte">
      <label for="code" style="font-weight:600">Code de la classe</label>
      <p class="hint">Ton professeur ou ton AESH te le donne.</p>
      <input type="text" id="code" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(st.code)}" placeholder="ex. ROSE-5B">
      <button class="btn pri large" id="entrer" style="margin-top:12px">Entrer</button>
      <div id="msg" class="msg ${erreur ? 'err' : ''}" role="status">${esc(erreur || '')}</div>
    </div>
    ${dernier() ? `<button class="discret" id="reprendre">Reprendre mon dernier exercice</button>` : ''}
  </div>`;
  const go = async () => {
    const c = $('#code').value.trim().toUpperCase(); if (!c){ setMsg('Écris le code de la classe.', true); return; }
    $('#entrer').disabled = true; setMsg('Je vérifie…');
    try { await appeler({action: 'verifier', code: c}); st.code = c; lsSet('am-code', c); ecranPrep(); }
    catch(e){ $('#entrer').disabled = false; setMsg(e.message, true); }
  };
  $('#entrer').onclick = go;
  $('#code').onkeydown = e => { if (e.key === 'Enter') go(); };
  const rp = $('#reprendre'); if (rp) rp.onclick = () => { const d = dernier(); if (d) ecranJeu(d.doc, d.reserves); };
}

/* ---------- écran 2 : photo + pour qui ---------- */
function ecranPrep(msg){
  Exo.cssProfs();
  const vign = st.photos.map((p, i) => `<div class="ph"><img src="${p.url}" alt="Photo ${i + 1}"><button data-del="${i}" aria-label="Retirer la photo ${i + 1}">✕</button></div>`).join('');
  app.innerHTML = `<div class="ecran">
    <h1>✋ Aménager ma fiche</h1>
    <p class="hint">Une photo par page, bien à plat, avec de la lumière. Pas de nom d’élève sur la photo.</p>
    <div class="rang">
      <button class="btn pri" id="cam">📷 Prendre une photo</button>
      <button class="btn" id="pick">🖼 Choisir</button>
    </div>
    <input type="file" id="f-cam" accept="image/*" capture="environment" hidden>
    <input type="file" id="f-pick" accept="image/*" multiple hidden>
    ${vign ? `<div class="photos">${vign}</div>` : ''}

    <h2>Comment ?</h2>
    <div class="choix2" role="group" aria-label="Comment l’adapter ?">
      <button class="btn" data-forme="questions" aria-pressed="${st.forme !== 'fiche'}">Une question à la fois<small>choix à toucher, relier, trous…</small></button>
      <button class="btn" data-forme="fiche" aria-pressed="${st.forme === 'fiche'}">Fiche telle quelle<small>la même fiche, à remplir</small></button>
    </div>

    <h2>Pour qui ?</h2>
    ${Exo.boutonsProfils(st.profils, 'data-prof')}
    ${st.profils.includes('allo') ? `<label for="langue" class="hint">Langue de l’élève (pour la traduction)</label>${Exo.choixLangue(st.langue, 'id="langue"')}` : ''}
    <p class="hint">Aucun bouton : exercice d’une main, sans autre aide. On peut en allumer plusieurs.</p>

    <h2><label for="classe">Classe</label></h2>
    <select id="classe"><option value="">Choisir…</option>${CLASSES.map(c => `<option${c === st.classe ? ' selected' : ''}>${c}</option>`).join('')}</select>

    <details style="margin-top:14px"><summary class="hint" style="cursor:pointer">Préciser (facultatif)</summary>
      <label for="matiere" class="hint">Matière</label>
      <input type="text" id="matiere" value="${esc(st.matiere)}" placeholder="ex. Mathématiques">
      <label for="consignes" class="hint">Consignes pour Claude</label>
      <textarea id="consignes" rows="2" placeholder="ex. seulement l’exercice 3">${esc(st.consignes)}</textarea>
      <p class="hint">Je réponds avec la main :</p>
      <div class="choix2"><button class="btn" data-main="gauche" aria-pressed="${st.main === 'gauche'}">✋ Gauche</button><button class="btn" data-main="droite" aria-pressed="${st.main === 'droite'}">Droite 🤚</button></div>
    </details>

    <button class="btn pri large" id="go" style="margin-top:20px">✨ Préparer mon exercice</button>
    <div id="msg" class="msg" role="status"></div>
    <button class="discret" id="sortir">Changer de code de classe</button>
  </div>`;
  if (msg) setMsg(msg, true);
  const ajouter = async files => {
    for (const f of files){
      if (st.photos.length >= 6){ setMsg('6 photos au maximum.', true); break; }
      try { const b = await versJpeg(f); st.photos.push({blob: b, url: URL.createObjectURL(b)}); } catch(e){ setMsg('Cette photo n’a pas pu être lue.', true); }
    }
    ecranPrep();
  };
  $('#cam').onclick = () => $('#f-cam').click();
  $('#pick').onclick = () => $('#f-pick').click();
  $('#f-cam').onchange = e => ajouter([...e.target.files]);
  $('#f-pick').onchange = e => ajouter([...e.target.files]);
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const p = st.photos.splice(+b.dataset.del, 1)[0]; if (p) URL.revokeObjectURL(p.url); ecranPrep(); });
  app.querySelectorAll('[data-forme]').forEach(b => b.onclick = () => { st.forme = b.dataset.forme; garder(); ecranPrep(); });
  app.querySelectorAll('[data-main]').forEach(b => b.onclick = () => { lireChamps(); st.main = b.dataset.main; garder(); ecranPrep(); app.querySelector('details').open = true; });
  app.querySelectorAll('[data-prof]').forEach(b => b.onclick = () => { lireChamps(); const k = b.dataset.prof, i = st.profils.indexOf(k); if (i >= 0) st.profils.splice(i, 1); else st.profils.push(k); garder(); ecranPrep(); });
  const lg = $('#langue'); if (lg) lg.onchange = () => { st.langue = Exo.langueOk(lg.value); garder(); };
  $('#classe').onchange = () => { st.classe = $('#classe').value; garder(); };
  $('#go').onclick = preparer;
  $('#sortir').onclick = () => { st.code = ''; lsSet('am-code', null); ecranCode(); };
}
function lireChamps(){ const m = $('#matiere'), c = $('#consignes'); if (m) st.matiere = m.value.trim(); if (c) st.consignes = c.value.trim(); }

/* photo → JPEG de 1600 px au plus (plus léger à envoyer, et suffisant pour lire la page) */
function versJpeg(f, cote, qualite){
  return new Promise((ok, ko) => {
    const u = URL.createObjectURL(f), im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); const k = Math.min(1, (cote || 1600) / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
      cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
      const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(im, 0, 0, cv.width, cv.height);
      cv.toBlob(b => b ? ok(b) : ko(new Error('jpeg')), 'image/jpeg', qualite || .85); };
    im.onerror = () => { URL.revokeObjectURL(u); ko(new Error('image')); };
    im.src = u;
  });
}
const enBase64 = b => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ko; r.readAsDataURL(b); });

/* ---------- attente puis exercice ---------- */
async function preparer(){
  lireChamps();
  if (!st.photos.length){ setMsg('Prends d’abord une photo de la fiche.', true); return; }
  if (st.profils.includes('allo') && !st.langue){ setMsg('Choisis la langue de l’élève.', true); return; }
  st.ctl = new AbortController();
  const etapes = ['Claude lit la fiche…', 'Claude prépare les questions…', 'Claude vérifie chaque numéro…', 'Presque fini…'];
  app.innerHTML = `<div class="ecran attente"><div class="rond" aria-hidden="true"></div><h1 id="etape">${etapes[0]}</h1><p class="hint">Souvent entre 30 secondes et 2 minutes. Garde l’appli ouverte.</p><button class="btn" id="stop" style="margin-top:20px">Arrêter</button></div>`;
  let n = 0; const t = setInterval(() => { n = Math.min(n + 1, etapes.length - 1); const e = $('#etape'); if (e) e.textContent = etapes[n]; }, 25000);
  $('#stop').onclick = () => st.ctl.abort();
  try {
    let images = await Promise.all(st.photos.map(p => enBase64(p.blob)));
    // le serveur accepte environ 4 Mo par envoi : si c'est trop lourd, on réduit les photos
    for (const [cote, q] of [[1300, .75], [1000, .7]]){
      if (images.reduce((n, x) => n + x.length, 0) < 3800000) break;
      for (const p of st.photos) p.blob = await versJpeg(p.blob, cote, q);
      images = await Promise.all(st.photos.map(p => enBase64(p.blob)));
    }
    const j = await appeler({action: 'amenager', code: st.code, forme: st.forme, profils: st.profils, langue: st.langue, classe: st.classe, matiere: st.matiere, consignes: st.consignes, images}, st.ctl.signal);
    const rep = j.resultat;
    const base = {subject: st.matiere, level: st.classe, theme: Exo.themeDe(st.classe), author: '', dossier: '', profils: st.profils.slice(), langue: st.profils.includes('allo') ? st.langue : ''};
    const doc = st.forme === 'fiche'
      ? Exo.depuisIAFiche(rep, Object.assign({title: String(rep.titre || 'Fiche à remplir').slice(0, 200)}, base))
      : Exo.depuisIA(rep, Object.assign({title: String(rep.titre || 'Exercice adapté').slice(0, 200)}, base));
    doc.adapt.main = st.main;
    await Exo.decouper(doc, st.photos.map(p => p.blob));   // les figures de la page sont découpées ici, sur le téléphone
    clearInterval(t);
    st.photos.forEach(p => URL.revokeObjectURL(p.url)); st.photos = []; st.consignes = '';
    const reserves = String(rep.reserves || '').slice(0, 600);
    ecranJeu(doc, reserves);
  } catch(e){
    clearInterval(t);
    if (e && e.code === 'code'){ st.code = ''; lsSet('am-code', null); ecranCode('Ce code de classe ne marche plus. Demande le nouveau code.'); return; }
    ecranPrep((e && e.message) || 'Ça n’a pas marché. Réessaie.');
  }
}

/* le dernier exercice reste sur le téléphone (pas ailleurs), pour le reprendre plus tard */
const dernier = () => { try { return JSON.parse(lsGet('am-dernier') || 'null'); } catch(e){ return null; } };
function sauver(doc, reserves){ if (!lsSet('am-dernier', JSON.stringify({doc, reserves}))) { const d = JSON.parse(JSON.stringify(doc)); (d.questions || []).forEach(q => { delete q.illus; }); (d.blocs || []).forEach(b => { delete b.img; }); lsSet('am-dernier', JSON.stringify({doc: d, reserves})); } }

function ecranJeu(doc, reserves){
  if (!document.getElementById('xq-css')){ const s = document.createElement('style'); s.id = 'xq-css'; s.textContent = Exo.CSS_LECTEUR; document.head.append(s); }
  sauver(doc, reserves);
  app.innerHTML = `<div class="barre">
      <button class="btn" id="nouveau">📷 Nouvelle</button>
      <button class="btn" id="imprimer">🖨 Imprimer</button>
      <button class="btn" id="telecharger" title="Télécharger l’exercice : il s’ouvre même sans internet">⬇ Garder</button>
    </div>
    ${reserves ? `<details class="reserves"><summary>⚠️ À vérifier par l’adulte</summary><p>${esc(reserves)}</p></details>` : ''}
    <div class="titre-exo">${esc(doc.title)}</div>
    <div id="jeu"><div class="xq"></div></div>`;
  const reps = JSON.parse(JSON.stringify(doc.reponses || {}));
  let t0 = null;
  const save = r => { doc.reponses = r; doc.reponduLe = Date.now(); clearTimeout(t0); t0 = setTimeout(() => sauver(doc, reserves), 500); };
  Exo.jouer(app.querySelector('#jeu .xq'), doc, reps, save, {imprimer: () => imprimer(doc), libelleImprimer: '🖨 Imprimer ma copie'});
  $('#nouveau').onclick = () => { if (st.code) ecranPrep(); else ecranCode(); window.scrollTo(0, 0); };
  $('#imprimer').onclick = () => imprimer(doc);
  $('#telecharger').onclick = () => Exo.exporter(doc);
  window.scrollTo(0, 0);
}

/* copie A4 : la même que dans l'atelier, avec les réponses de l'élève (sans correction) */
function imprimer(doc){
  const host = $('#copie'); host.innerHTML = '';
  const p = (doc.profils || []).includes('dys') ? 'dys' : (doc.profils || []).includes('tdah') ? 'tdah' : 'std';
  try { Exo.construire(doc, p, {copie: 'eleve'}, host); }
  catch(e){ window.print(); return; }
  setTimeout(() => window.print(), 300);
}

/* départ */
if (st.code) ecranPrep(); else ecranCode();
})();
