/* Ma fiche de révision / Ma carte mentale : la photo du cours devient une fiche de révision (A4 portrait) ou une
   carte mentale (A4 paysage), avec EXACTEMENT la mise en page de l'éditeur de l'Atelier pédagogique (même code de
   dessin, recopié tel quel plus bas : couleurs, polices, versions Dys / TDA-H / HPI, marge de 12 mm).
   L'élève ne règle rien : il peut seulement déplacer les bulles de la carte (ou l'ordre des parties de la fiche)
   et demander une correction du contenu à Claude. */
(function(){
'use strict';
const W = 1414, H = 1000;
/* ---------- repris de l'Atelier (index.html) ---------- */
const PROFILES = {
  std:  {label:'Standard', mark:'●', pc:'#7a56b8', paper:'#fffdf7',
         desc:"Version de référence : contenu commun, style « carte mentale » classique."},
  dys:  {label:'Dys', mark:'▲', pc:'#c0392b', paper:'#fdf6e3', syll:true,
         desc:"Police Lexend plus grande, lettres et mots espacés, ni MAJUSCULES ni italique, syllabes colorées (syl|la|bes), fond crème, textes simplifiés (variantes Dys)."},
  tdah: {label:'TDA-H', mark:'■', pc:'#1f8a7a', paper:'#ffffff', numbered:true, check:true, focus:true, calm:true,
         desc:"Branches ou cases numérotées à lire dans l'ordre, consigne en haut, décor réduit. Touche une branche pour masquer les autres (mode focus)."},
  hpi:  {label:'HPI', mark:'★', pc:'#d4870b', paper:'#fffdf7',
         desc:"Contenu enrichi : éléments réservés à cette version (en pointillés orange), questions ouvertes, défis (variantes HPI)."}
};
const PKEYS = Object.keys(PROFILES);
const COLORS = ['#e63946','#f08c2e','#e9b824','#6a994e','#2a9d8f','#3a86c8','#457b9d','#8e5ea2','#d16ba5','#7a5c45','#555555'];
const TYPES = {texte:'Texte', cle:'À retenir', exemple:'Exemple', tableau:'Tableau', question:'Question / défi', attendu:'Je sais faire', image:'Image'};
const uid = () => Math.random().toString(36).slice(2,10);
const allP = (v=true) => ({std:v,dys:v,tdah:v,hpi:v});
const esc = s => String(s??'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const clone = o => JSON.parse(JSON.stringify(o));
const CSS_ATELIER = `.stage{width:1414px;height:1000px;background:var(--paper,#fffdf7);border-radius:14px;overflow:hidden;font-family:'Patrick Hand',cursive;position:relative;color:#222}
.stage svg.branches{position:absolute;left:0;top:0;pointer-events:none}
.stage .foot{position:absolute;left:58px;bottom:58px;font-size:17px;color:#444;font-family:system-ui,sans-serif}
.stage .mark{position:absolute;right:58px;bottom:58px;font-size:19px;color:#444;font-family:system-ui,sans-serif}
.stage .banner{position:absolute;left:58px;top:58px;background:#fff;border:2.5px solid #222;border-radius:12px;padding:7px 16px;font-size:23px;z-index:4;font-family:'Lexend',sans-serif}
.nw{white-space:nowrap}
.p-dys i,.p-tdah i{font-style:normal;font-weight:600}
.blank{display:inline-block;border-bottom:3px solid #222;height:1em;vertical-align:-2px;margin:0 2px}
.p-dys .syl-a{color:#c0392b}.p-dys .syl-b{color:#1f5fa8}
/* style 1 : « Mes cartes mentales » */
.stage .center{position:absolute;background:#fff;border:5px solid var(--c);padding:22px 34px;text-align:center;
  border-radius:58% 42% 55% 45% / 52% 58% 42% 48%;box-shadow:0 5px 0 rgba(0,0,0,.1);min-width:260px;max-width:420px;cursor:grab;z-index:3;touch-action:none}
.center .subj{font-size:21px;color:#333;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
.center .cemoji{font-size:50px;line-height:1.1}
.center .ctitle{font-family:'Bubblegum Sans','Patrick Hand',cursive;font-size:46px;line-height:1;color:var(--ci,var(--c));text-transform:uppercase}
.stage .card{position:absolute;min-width:200px;max-width:var(--cw,420px);background:#fff;border:3px solid var(--c);border-radius:16px;box-shadow:0 4px 0 rgba(0,0,0,.08);cursor:grab;z-index:2;transition:opacity .2s;touch-action:none}
.card .hd{background:var(--c);color:var(--ct,#fff);padding:6px 15px;font-size:26px;text-transform:uppercase;border-radius:12px 12px 0 0;display:flex;gap:8px;align-items:center;letter-spacing:.03em}
.card .hd .em{font-size:26px}
.card .num{background:#fff;color:var(--ci,var(--c));border-radius:50%;width:36px;height:36px;display:inline-grid;place-items:center;font-weight:700;flex:none}
.card .bd{padding:calc(9px*var(--kb,1)) 15px calc(11px*var(--kb,1));font-size:calc(26px*var(--k,1)*var(--kb,1));line-height:1.32;color:#111}
.item{margin:5px 0}
.item.cle{background:#fff2a8;border-radius:8px;padding:3px 8px;font-weight:700}
.item.exemple{color:#1a1a1a;font-style:italic}
.item.exemple::before{content:"Ex. : ";font-style:normal;font-weight:700;color:var(--ci,var(--c))}
.item.question{border:2.5px solid var(--c);border-radius:10px;padding:3px 8px}
.item.attendu{padding-left:1.4em;text-indent:-1.4em}
.item.attendu::before{content:"☐ ";font-weight:700;color:var(--ci,var(--c))}
.item.image{margin:8px 0;text-align:center}
.item.image img{display:block;margin:0 auto;max-width:100%;object-fit:contain;border-radius:8px;border:2px solid #d6d0c4;background:#fff}
.item.image figcaption{font-size:.82em;color:#222;font-weight:600;margin-top:4px;line-height:1.3}
.it .vign{max-width:100%;max-height:120px;border-radius:6px;border:1px solid #ccc;display:block;margin:4px 0}
.item.question::before{content:"? ";font-weight:700;color:var(--ci,var(--c))}
.stage .hl{background:var(--c);color:var(--ct,#fff);border-radius:4px;padding:0 3px;font-weight:700}
table.tb{border-collapse:collapse;margin:2px 0;color:inherit;font:inherit}
table.tb td{padding:2px 12px 2px 2px;border-bottom:1.5px solid #c9c1ae;vertical-align:top}
table.tb tr:last-child td{border-bottom:0}
table.tb td:first-child{color:#222}
.chk{border-top:2.5px solid var(--c);margin:0 12px;padding:6px 0 8px;font-size:calc(22px*var(--kb,1));color:#222}
.stage .card.drag,.stage .center.drag{cursor:grabbing;box-shadow:0 10px 24px rgba(0,0,0,.2)}
.stage.p-dys,.stage.p-tdah{font-family:'Lexend',sans-serif}
.p-dys .card .hd{text-transform:none;font-size:25px;font-weight:600;letter-spacing:.02em}
.p-dys .card .bd{font-size:calc(26px*var(--k,1)*var(--kb,1));line-height:1.6;letter-spacing:.04em;word-spacing:.14em}
.p-dys .center .ctitle,.p-tdah .center .ctitle{font-family:'Lexend',sans-serif;text-transform:none;font-weight:700;font-size:40px}
.p-dys .item.exemple,.p-tdah .item.exemple{font-style:normal}
.p-dys .hl{padding:1px 4px}
.p-tdah .card{border-width:4px}
.p-tdah .card .hd{text-transform:none;font-size:25px;font-weight:600}
.p-tdah .card .bd{font-size:calc(25px*var(--k,1)*var(--kb,1));line-height:1.5}
.stage.focus .card:not(.on){opacity:.15}
.p-hpi .card.extra{border-width:4px}
.stage.fiche{background:transparent;overflow:visible;border-radius:0;font-family:'Nunito',system-ui,sans-serif;display:flex;flex-direction:column;gap:24px}
.stage.fiche.p-dys,.stage.fiche.p-tdah{font-family:'Lexend',sans-serif}
#viewport .stage.fiche{box-shadow:none}
.fiche .pg{position:relative;width:794px;height:1123px;background:var(--paper);box-shadow:0 6px 24px rgba(0,0,0,.18);flex:none;overflow:hidden}
#printArea .fiche .pg,#thumbHost .fiche .pg,#printArea .stage .card,#printArea .stage .center{box-shadow:none}
.fiche .pgc{position:absolute;inset:68px 45px 78px;overflow:hidden;display:flex;flex-direction:column;gap:calc(14px*var(--k,1))}
.fiche .fh{display:flex;gap:14px;align-items:center;border-bottom:4px solid var(--c0);padding-bottom:10px}
.fiche .fe{font-size:calc(44px*var(--k,1));line-height:1}
.fiche .ft{font-family:'Bubblegum Sans','Nunito',sans-serif;font-size:calc(44px*var(--k,1));color:var(--ci0,var(--c0));line-height:1.05}
.fiche.p-dys .ft,.fiche.p-tdah .ft{font-family:'Lexend',sans-serif;font-weight:700;font-size:calc(38px*var(--k,1))}
.fiche .fs{font-size:calc(17px*var(--k,1));color:#333;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
.fiche .fban{border:2.5px solid #222;border-radius:10px;padding:7px 13px;font-size:calc(19px*var(--k,1));background:#fff}
.fiche .sec{border-left:6px solid var(--c);background:#fff;border-radius:0 12px 12px 0;padding:8px 14px 10px;cursor:pointer;break-inside:avoid}
.fiche .sec.extra{background:#fff6e6}
.fiche .sec.cadre{border:3.5px solid var(--c);border-radius:14px;background:var(--tint,#fff);padding:10px 16px 12px}
.fiche .sec.cadre h3{font-size:calc(24px*var(--k,1))}
.fiche .sec h3 small{font-size:.7em;font-weight:600}
.fiche .sec.reponses{transform:rotate(180deg)}
.fiche .cadre-test .item.question{background:#fff;margin:8px 0}.fiche .sec h3{margin:0 0 5px;font-size:calc(23px*var(--k,1));color:var(--ci,var(--c));display:flex;align-items:center;gap:8px}
.fiche .sec h3 .num{background:var(--c);color:var(--ct,#fff);border-radius:50%;width:30px;height:30px;display:inline-grid;place-items:center;font-size:16px;flex:none}
.fiche .sec h3 .ck{margin-left:auto;color:#222;font-size:calc(24px*var(--k,1))}
.fiche .sb{font-size:calc(20px*var(--k,1));line-height:1.45;color:#111}
.fiche.p-dys .sb{font-size:calc(21px*var(--k,1));line-height:1.7;letter-spacing:.04em;word-spacing:.14em}
.fiche.p-tdah .sb{line-height:1.6}
.fiche .item{margin:4px 0}
.fiche .hl{background:#fff2a8;color:#222;border-radius:4px;padding:0 3px;font-weight:700}
.fiche .item.cle{background:#fff2a8}
.fiche.p-dys .item.exemple,.fiche.p-tdah .item.exemple{font-style:normal}
.fiche .pnum{position:absolute;right:45px;top:45px;font:600 15px system-ui,sans-serif;color:#444}
.fiche .foot{left:45px;bottom:45px;font-size:15px}.fiche .mark{right:45px;bottom:45px;font-size:17px}
`;

function lumi(h){ const v = [1,3,5].map(i=>parseInt(String(h).slice(i,i+2),16)/255).map(x=>x<=.03928?x/12.92:((x+.055)/1.055)**2.4); return .2126*v[0]+.7152*v[1]+.0722*v[2]; }
const contraste = (a,b) => { const x = lumi(a), y = lumi(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
function teinte(h, a){ const v = [1,3,5].map(i=>parseInt(String(h).slice(i,i+2),16)); if (v.some(isNaN)) return '#fff'; return '#' + v.map(x=>Math.round(255 - (255-x)*a).toString(16).padStart(2,'0')).join(''); }
function encres(el, c, suffixe=''){
  if (!/^#[0-9a-f]{6}$/i.test(c||'')) return;
  el.style.setProperty('--ct'+suffixe, contraste(c,'#ffffff') >= contraste(c,'#1a1a1a') ? '#ffffff' : '#1a1a1a');
  let rgb = [1,3,5].map(i=>parseInt(c.slice(i,i+2),16)), ink = c;
  for (let n=0; n<12 && contraste(ink,'#fffdf7') < 4.8; n++){ rgb = rgb.map(x=>Math.round(x*.86)); ink = '#' + rgb.map(x=>x.toString(16).padStart(2,'0')).join(''); }
  el.style.setProperty('--ci'+suffixe, ink);
}

/* ---------- mise en forme du texte ---------- */
const WORD = "[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ'’\\-]+";
const SYL = new RegExp(WORD + "(?:\\|" + WORD + ")+", 'g');
/* Typographie française : la ponctuation ne commence jamais une ligne. Espace insécable avant ? ! : ; » % € ) / . , ' et après « ( */
function insecables(t){
  return String(t??'').replace(/[ \t]+(?=[?!:;»%€).,\/'’…])/g, '\u00A0').replace(/([«(])[ \t]+/g, '$1\u00A0');
}
function fmt(raw, p, opt={}){
  let s = esc(insecables(raw));
  s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*\w])\*(?![\s*])([^*\n]+?)\*(?![*\w])/g, '$1<i>$2</i>');      // *italique*
  s = s.replace(/\^([^\s^][^^\n]{0,15})\^/g, '<sup>$1</sup>');                       // m^2^
  s = s.replace(/~([^\s~][^~\n]{0,15})~/g, '<sub>$1</sub>');                           // H~2~O
  s = s.replace(/\[(.+?)\]([\u00A0]?[?!:;»%€).,\/'’…]*)/g, (m,x,q) => opt.trous   // un trou est un bloc : on le colle à la ponctuation qui le suit
      ? (q ? '<span class="nw">' : '') + `<span class="blank" style="min-width:${Math.max(1.4, x.replace(/\|/g,'').length*0.6).toFixed(1)}em"></span>` + q + (q ? '</span>' : '')
      : `<span class="hl">${x}</span>` + q);
  if (PROFILES[p].syll) s = s.replace(SYL, w => w.split('|').map((x,i)=>`<span class="syl-${i%2?'b':'a'}">${x}</span>`).join(''));
  s = s.replace(/\|/g,'').replace(/\n/g,'<br>');
  if (window.Maths) s = Maths.formules(s);
  return window.Pictos ? Pictos.remplacer(s) : s;
}
const textFor = (it,p) => (it.alt && it.alt[p] && String(it.alt[p]).trim()) ? it.alt[p] : (it.text ?? it.t ?? it.texte ?? '');
function renderItem(it, p, opt){
  const t = textFor(it,p);
  if (it.type === 'image'){
    if (!it.img) return '';
    const r = clamp(+it.ratio || 1.5, .3, 4), h = Math.round(Math.min(opt.carte ? 190 : 300, (opt.carte ? 300 : 640) / r));
    return `<figure class="item image"><img src="${esc(it.img)}" style="width:${Math.round(h*r)}px;height:${h}px" alt="${esc(t.replace(/[*\[\]|]/g,'') || 'Illustration')}">${t.trim()?`<figcaption>${fmt(t,p,opt)}</figcaption>`:''}</figure>`;
  }
  if (it.type === 'tableau'){
    const rows = t.split('\n').filter(r=>r.trim()).map(r => '<tr>' + r.split(';').map(c=>`<td>${fmt(c.trim(),p,opt)}</td>`).join('') + '</tr>').join('');
    return `<div class="item tableau"><table class="tb">${rows}</table></div>`;
  }
  return `<div class="item ${it.type}">${fmt(t,p,opt)}</div>`;
}


/* ---------- style 1 : construction de la carte ---------- */
function buildStage(c, p, opt){
  const P = PROFILES[p];
  const st = document.createElement('div');
  st.className = 'stage p-' + p; st.dataset.p = p; st._w = W; st._h = H;
  st.style.setProperty('--paper', P.paper);
  st.innerHTML = `<svg class="branches" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>`;
  if (P.numbered) st.insertAdjacentHTML('beforeend', `<div class="banner">Je lis <b>une branche à la fois</b>, dans l'ordre : 1 → 2 → 3…</div>`);
  const ce = document.createElement('div');
  ce.className = 'center'; ce.style.setProperty('--c', c.centerColor); encres(ce, c.centerColor);
  ce.innerHTML = (c.subject?`<div class="subj">${esc(c.subject)}</div>`:'') + (c.centerEmoji?`<div class="cemoji">${esc(c.centerEmoji)}</div>`:'') + `<div class="ctitle">${fmt(c.title,p)}</div>`;
  st.append(ce);
  c.branches.filter(b=>b.profiles[p]!==false).forEach((b,i)=>{
    const items = b.items.filter(it=>it.profiles[p]!==false).map(it=>renderItem(it,p,{...opt, carte:true})).join('');
    const card = document.createElement('div');
    card.className = 'card' + (p==='hpi' && PKEYS.filter(k=>b.profiles[k]!==false).length===1 ? ' extra':'');
    card.dataset.b = b.id; card.style.setProperty('--c', b.color); encres(card, b.color);
    card.innerHTML = `<div class="hd">${P.numbered?`<span class="num">${i+1}</span>`:''}${b.emoji?`<span class="em">${esc(b.emoji)}</span>`:''}<span>${fmt(b.title,p)}</span></div>`
      + (items?`<div class="bd">${items}</div>`:'') + (P.check?`<div class="chk">☐ J'ai compris</div>`:'');
    st.append(card);
  });
  const foot = [c.level, c.subject, c.author && ("d'après " + c.author)].filter(Boolean).map(esc).join(' · ');
  st.insertAdjacentHTML('beforeend', `<div class="foot">${foot}</div><div class="mark">${opt.showLabel?esc(P.label)+' ':''}${P.mark}</div>`);
  return st;
}
const MARGE = Math.ceil(W * 12 / 297);   // 12 mm de marge sur la feuille A4 : rien n'est imprimé plus près du bord
function place(el, x, y){
  const w = el.offsetWidth, h = el.offsetHeight, haut = el.closest('.p-tdah') ? 56 : 0;
  x = clamp(x, w/2+MARGE, W-w/2-MARGE); y = clamp(y, h/2+MARGE+haut, H-h/2-MARGE-30);
  el.style.left = (x-w/2)+'px'; el.style.top = (y-h/2)+'px'; el._x = x; el._y = y;
}
function layoutStage(st, c, p){
  // Aucune bulle ne doit en chevaucher une autre : si la place manque, le texte des bulles rétrécit (jusqu'à 60 %), les titres gardent leur taille.
  const cards = [...st.querySelectorAll('.card')], n = cards.length;
  const essais = []; [1, .92, .84, .76, .68, .6, .54, .48].forEach(kb=>[420, 540].forEach(cw=>essais.push([kb, cw])));
  for (let e = 0; e < essais.length; e++){
    const [kb, cw] = essais[e];
    st.style.setProperty('--kb', kb); st.style.setProperty('--cw', cw + 'px'); st._kb = kb;
    const cp = c.centerPos[p] || {x:W/2, y:H/2};
    place(st.querySelector('.center'), cp.x, cp.y); st.querySelector('.center')._libre = !c.centerPos[p];
    cards.forEach((card,i)=>{
      const b = c.branches.find(x=>x.id===card.dataset.b);
      let pos = b.pos[p];
      if (!pos){ const a = (-90 + 360*(i+0.5)/n) * Math.PI/180; pos = {x: W/2 + Math.cos(a)*(W/2-215), y: H/2 + Math.sin(a)*(H/2-170)}; }
      place(card, pos.x, pos.y);
      card._auto = !b.pos[p];
    });
    if (ecarter(st, cards) === 0 || (cards.every(x=>x._auto) && colonnes(st, cards)) || e === essais.length - 1) break;
  }
  drawBranches(st);
}
/* Chaque bulle prend la place libre la plus proche de sa place voulue (autour du centre, ou là où l'enseignante l'a mise),
   dans la marge de 12 mm. Une bulle déplacée à la main ne bouge pas, sauf si elle en chevauche une autre.
   Renvoie le chevauchement qui reste (0 = aucune bulle ne se touche). */
function ecarter(st, cards){
  const ce = st.querySelector('.center'), G = 16;
  const box = el => ({x:el._x, y:el._y, w:el.offsetWidth/2, h:el.offsetHeight/2});
  const inter = (a, b, g) => Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x-a.w, b.x-b.w) + g) * Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y-a.h, b.y-b.h) + g);
  const gene = (a, b) => inter(a, b, G);
  const fixes = [box(ce)], autos = [];
  cards.filter(c=>!c._auto).forEach(c=>{ const bx = box(c); if (fixes.some(f=>inter(bx, f, 4) > 0)) autos.push(c); else fixes.push(bx); });
  autos.push(...cards.filter(c=>c._auto).sort((a,b)=>b.offsetWidth*b.offsetHeight - a.offsetWidth*a.offsetHeight));
  const haut = st.classList.contains('p-tdah') ? 56 : 0;
  autos.forEach(c=>{
    const w = c.offsetWidth/2, h = c.offsetHeight/2, ix = c._x, iy = c._y;
    let best = null;
    for (let y = h+MARGE+haut; y <= H-h-MARGE-30; y += 12) for (let x = w+MARGE; x <= W-w-MARGE; x += 12){
      const a = {x, y, w, h}; let chev = 0; for (const f of fixes) chev += gene(a, f);
      const score = chev * 50 + Math.hypot(x-ix, y-iy);
      if (!best || score < best.s) best = {s:score, x, y};
    }
    if (best) place(c, best.x, best.y);
    fixes.push(box(c));
  });
  let reste = 0; const tout = [ce, ...cards].map(box);
  for (let i=0;i<tout.length;i++) for (let j=i+1;j<tout.length;j++) reste += inter(tout[i], tout[j], 4);
  return reste;
}
/* Rangement de secours, quand la place manque : les bulles en colonnes à droite et à gauche du centre
   (dans l'ordre des aiguilles d'une montre), avec au besoin une bulle au-dessus et une au-dessous du centre. */
function colonnes(st, cards){
  const ce = st.querySelector('.center'), haut = st.classList.contains('p-tdah') ? 56 : 0, G = 18;
  const top = MARGE + haut, bas = H - MARGE - 30, n = cards.length;
  const cx = ce._x, cw = ce.offsetWidth/2, ch = ce.offsetHeight/2; let cy = ce._y;
  const hs = cards.map(c=>c.offsetHeight), ws = cards.map(c=>c.offsetWidth), avant = [ce, ...cards].map(e=>[e._x, e._y]);
  const somme = l => l.reduce((t,i)=>t + hs[i], 0) + G*(l.length - 1);
  const plans = [];
  for (const milieu of [0, 1, 2]){            // 0 : colonnes seules ; 1 : une bulle au-dessus ; 2 : une au-dessus et une au-dessous
    if (n - milieu < 1) continue;
    const reste = n - milieu, nd = Math.ceil(reste/2);
    const idx = [...Array(n).keys()];
    const hautI = milieu >= 1 ? [idx.shift()] : [];
    const droite = idx.splice(0, nd), basI = milieu === 2 ? [idx.shift()] : [], gauche = idx.reverse();
    plans.push({hautI, droite, basI, gauche});
  }
  for (const pl of plans){
    if (somme(pl.droite) > bas - top || somme(pl.gauche) > bas - top) continue;
    const hH = pl.hautI.length ? hs[pl.hautI[0]] + G : 0, hB = pl.basI.length ? hs[pl.basI[0]] + G : 0;
    if (ce._libre){ const libre = (bas - top) - hH - hB - 2*ch; if (libre < 0) continue;
      const k = (pl.hautI.length ? 1 : 0) + (pl.basI.length ? 1 : 0) + 1, e = libre / (k + 1);
      cy = top + e + hH + (pl.hautI.length ? e : 0) + ch;
      place(ce, cx, cy); cy = ce._y; }
    if (pl.hautI.length && hs[pl.hautI[0]] > cy - ch - G - top) continue;
    if (pl.basI.length && hs[pl.basI[0]] > bas - (cy + ch + G)) continue;
    const pos = [];
    const pile = (l, cote) => { const libre = (bas - top) - somme(l), g = G + libre / (l.length + 1); let y = top + libre/(l.length+1);
      l.forEach(i=>{ const x = cote > 0 ? W - MARGE - ws[i]/2 : MARGE + ws[i]/2; pos[i] = [x, y + hs[i]/2]; y += hs[i] + g; }); };
    pile(pl.droite, 1); pile(pl.gauche, -1);
    if (pl.hautI.length) pos[pl.hautI[0]] = [cx, (top + cy - ch - G)/2];
    if (pl.basI.length) pos[pl.basI[0]] = [cx, (cy + ch + G + bas)/2];
    cards.forEach((c,i)=>place(c, pos[i][0], pos[i][1]));
    const bx = el => ({x:el._x, y:el._y, w:el.offsetWidth/2, h:el.offsetHeight/2});
    const tout = [ce, ...cards].map(bx); let chev = 0;
    for (let i=0;i<tout.length;i++) for (let j=i+1;j<tout.length;j++){ const a = tout[i], b = tout[j];
      chev += Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x-a.w, b.x-b.w) + 4) * Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y-a.h, b.y-b.h) + 4); }
    if (chev === 0) return true;
  }
  [ce, ...cards].forEach((e,i)=>place(e, avant[i][0], avant[i][1]));   // échec : on remet la disposition précédente
  return false;
}
function taper(x0,y0,x2,y2,w0,w1,bend){
  const dx=x2-x0, dy=y2-y0, x1=(x0+x2)/2 - dy*bend, y1=(y0+y2)/2 + dx*bend;
  const N=30, A1=[], B1=[];
  for(let k=0;k<=N;k++){
    const t=k/N, u=1-t, px=u*u*x0+2*u*t*x1+t*t*x2, py=u*u*y0+2*u*t*y1+t*t*y2;
    const tx=2*u*(x1-x0)+2*t*(x2-x1), ty=2*u*(y1-y0)+2*t*(y2-y1), tl=Math.hypot(tx,ty)||1;
    const w=(w0*(1-t)+w1*t)/2, ox=-ty/tl*w, oy=tx/tl*w;
    A1.push(`${(px+ox).toFixed(1)},${(py+oy).toFixed(1)}`); B1.push(`${(px-ox).toFixed(1)},${(py-oy).toFixed(1)}`);
  }
  return 'M'+A1.concat(B1.reverse()).join('L')+'Z';
}
function drawBranches(st){
  const ce = st.querySelector('.center'), svg = st.querySelector('svg'), calm = PROFILES[st.dataset.p].calm;
  let out = '';
  st.querySelectorAll('.card').forEach(card=>{
    const cx=card._x, cy=card._y, w=card.offsetWidth, h=card.offsetHeight, vx=ce._x-cx, vy=ce._y-cy;
    let ax, ay;
    if (Math.abs(vx)*h > Math.abs(vy)*w){ ax = cx + Math.sign(vx)*w/2; ay = cy; } else { ax = cx; ay = cy + Math.sign(vy)*h/2; }
    const bend = calm ? 0.06 : 0.16 * (cx < ce._x ? -1 : 1) * (cy < ce._y ? 1 : -1);
    out += `<path d="${taper(ce._x,ce._y,ax,ay, calm?20:34, calm?8:9, bend)}" fill="${card.style.getPropertyValue('--c')}" stroke="rgba(0,0,0,.22)" stroke-width="1.5"/>`;
  });
  svg.innerHTML = out;
}
/* une seule fonction de construction pour l'écran, les vignettes et le PDF */

/* ---------- fiche de révision : page(s) A4 portrait ---------- */
const PW = 794, PH = 1123;
function buildFiche(doc, p, opt, host){
  const P = PROFILES[p];
  const st = document.createElement('div');
  st.className = 'stage fiche p-' + p; st.dataset.p = p; st.style.setProperty('--k', doc.echelle || 1); st.style.setProperty('--paper', P.paper);
  st.style.setProperty('--c0', doc.centerColor || '#3a86c8'); encres(st, doc.centerColor || '#3a86c8', '0');
  host.append(st);
  const pages = [];
  const foot = [doc.level, doc.subject, doc.author && ("d'après " + doc.author)].filter(Boolean).map(esc).join(' · ');
  function page(){
    const pg = document.createElement('div'); pg.className = 'pg';
    pg.innerHTML = `<div class="pgc"></div><div class="foot">${foot}</div><div class="mark">${opt.showLabel?esc(P.label)+' ':''}${P.mark}</div>`;
    st.append(pg); pages.push(pg); return pg.querySelector('.pgc');
  }
  let cont = page();
  cont.insertAdjacentHTML('beforeend', `<header class="fh"><div class="fe">${esc(doc.centerEmoji||'')}</div><div><div class="ft">${fmt(doc.title,p)}</div>${doc.subject?`<div class="fs">${esc(doc.subject)}${doc.level?' · '+esc(doc.level):''}</div>`:''}</div></header>`
    + (P.numbered ? `<div class="fban">Je lis <b>une partie à la fois</b>, dans l'ordre. Je coche quand j'ai compris.</div>` : '') + (opt.trous ? `<div class="fban">Je complète les trous, puis je vérifie avec mon cours.</div>` : ''));
  const sections = doc.branches.filter(b=>b.profiles[p]!==false);
  // Un cadre n'est jamais coupé par la marge : s'il ne tient pas en bas de la page, il passe entière à la page suivante ;
  // s'il est plus grand qu'une page, il continue sur la suivante (« suite ») ; un seul élément trop grand est réduit.
  const deborde = () => cont.scrollHeight > cont.clientHeight + 1;
  const nbSec = () => cont.querySelectorAll(':scope > .sec').length;
  function faireSec(b, i, html, suite){
    const sec = document.createElement('section'); sec.className = 'sec' + (b.cadre==='reponses' || /^les réponses/i.test(b.title||'') ? ' reponses' : '') + (b.cadre && b.cadre!=='reponses' ? ' cadre cadre-' + b.cadre : p==='hpi' && PKEYS.filter(k=>b.profiles[k]!==false).length===1 ? ' extra' : '');
    sec.dataset.b = b.id; sec.style.setProperty('--c', b.color); encres(sec, b.color); if (b.cadre) sec.style.setProperty('--tint', teinte(b.color, .1));
    sec.innerHTML = `<h3>${P.numbered?`<span class="num">${i+1}</span>`:''}${b.emoji?`<span class="em">${esc(b.emoji)}</span>`:''}<span>${fmt(b.title,p)}${suite?' <small>(suite)</small>':''}</span>${P.check && !suite?'<span class="ck">☐</span>':''}</h3>${html?`<div class="sb">${html}</div>`:''}`;
    return sec;
  }
  function poser(sec, b, i){
    cont.append(sec);
    if (!deborde()) return;
    if (nbSec() > 1){ sec.remove(); cont = page(); cont.append(sec); if (!deborde()) return; }
    const sb = sec.querySelector('.sb'), kids = sb ? [...sb.children] : [];
    if (kids.length > 1){
      const partis = [];
      while (deborde() && kids.length - partis.length > 1){ const el = kids[kids.length - 1 - partis.length]; partis.unshift(el); el.remove(); }
      if (!deborde() && partis.length){
        const s2 = faireSec(b, i, '', true); const sb2 = document.createElement('div'); sb2.className = 'sb'; partis.forEach(el=>sb2.append(el)); s2.append(sb2);
        cont = page(); poser(s2, b, i); return;
      }
      partis.forEach(el=>sb.append(el));
    }
    let k = parseFloat(getComputedStyle(sec).getPropertyValue('--k')) || 1;
    while (deborde() && k > 0.5){ k = Math.round(k * 0.92 * 100) / 100; sec.style.setProperty('--k', k); sec.querySelectorAll('.item.image img').forEach(im=>{ im.style.height = Math.round(parseFloat(im.style.height) * 0.92) + 'px'; im.style.width = Math.round(parseFloat(im.style.width) * 0.92) + 'px'; }); }
  }
  sections.forEach((b,i)=>{
    const items = b.items.filter(it=>it.profiles[p]!==false).map(it=>renderItem(it,p,opt)).join('');
    poser(faireSec(b, i, items, false), b, i);
  });
  if (pages.length > 1) pages.forEach((pg,i)=>pg.insertAdjacentHTML('beforeend', `<div class="pnum">${i+1}/${pages.length}</div>`));
  st._w = PW; st._h = pages.length * PH + (pages.length - 1) * 24; st._pages = pages; st._portrait = true;
  st.style.width = PW + 'px'; st.style.height = st._h + 'px';
  return st;
}

/* ---------- fin du code repris de l'Atelier ---------- */

/* Version de l'Atelier qui convient aux profils choisis par l'élève (l'Atelier en a 4 pour les cartes et fiches). */
function versionDe(profils){
  const l = profils || [];
  if (l.some(k => ['dys', 'dyspra', 'dysphas', 'malvoy', 'allo'].includes(k))) return 'dys';
  if (l.some(k => ['tdah', 'tsa', 'dyscal', 'audit'].includes(k))) return 'tdah';
  if (l.includes('hpi')) return 'hpi';
  return 'std';
}

/* Brouillon de Claude → carte ou fiche de l'Atelier (même validation que depuisBrouillon de l'Atelier). */
function imageBrute(it){
  if (!it || it.type !== 'image') return {};
  const z = Array.isArray(it.zone) && it.zone.length === 4 && it.zone.every(n=>typeof n==='number') ? it.zone : null;
  if (z && +it.photo >= 1) return {_photo: +it.photo, _zone: z};
  if (typeof it.dessin === 'string' && /^\s*<svg[\s>]/i.test(it.dessin)) return {_svg: it.dessin.slice(0, 60000)};
  return {};
}
function depuisBrouillon(b, base){
  if (!b || typeof b !== 'object' || (b.type !== 'mcm' && b.type !== 'fiche')) throw new Error('brouillon');
  const ct = b.contenu || {};
  if (b.type === 'fiche' && !ct.branches) ct.branches = ct.sections;
  if (!Array.isArray(ct.branches) || !ct.branches.length) throw new Error('brouillon vide');
  return Object.assign({id:uid(), kind:b.type, created:Date.now(), echelle:1, title: String(b.titre||'Ma fiche').slice(0,200),
    centerEmoji: String(ct.emoji||''), centerColor: /^#[0-9a-f]{6}$/i.test(ct.couleur||'') ? ct.couleur : '#3a86c8', centerPos:{},
    branches: ct.branches.slice(0,12).map((br,i)=>({id:uid(), title:String(br.titre||'Partie').slice(0,80), emoji:String(br.emoji||''), color: /^#[0-9a-f]{6}$/i.test(br.couleur||'') ? br.couleur : COLORS[i%COLORS.length], pos:{}, profiles: allP(),
      ...(['attendus','mots','test','reponses'].includes(br.cadre) ? {cadre: br.cadre} : {}),
      items:(br.elements||[]).slice(0,20).map(it=>({id:uid(), type: TYPES[it.type] ? it.type : 'texte', text:String(it.texte||'').slice(0,1200), profiles: allP(), alt: {}, ...imageBrute(it)}))}))}, base || {});
}

/* Images : découpées dans la photo du cours (zone en %) ou dessinées par Claude (SVG), gardées dans la fiche (réduites). */
const chargerImage = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
async function versDataUrl(cv){
  const k = Math.min(1, 900 / Math.max(cv.width, cv.height)), c2 = document.createElement('canvas');
  c2.width = Math.round(cv.width * k); c2.height = Math.round(cv.height * k);
  const g = c2.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c2.width, c2.height); g.drawImage(cv, 0, 0, c2.width, c2.height);
  return {img: c2.toDataURL('image/jpeg', .8), ratio: Math.round(c2.width / c2.height * 1000) / 1000};
}
async function decouper(photo, zone){
  const u = URL.createObjectURL(photo);
  try {
    const im = await chargerImage(u), w = im.naturalWidth, h = im.naturalHeight;
    let [x0,y0,x1,y1] = zone.map(n=>clamp(n,0,100)/100); if (x1 < x0) [x0,x1] = [x1,x0]; if (y1 < y0) [y0,y1] = [y1,y0];
    const sx = Math.round(x0*w), sy = Math.round(y0*h), sw = Math.round((x1-x0)*w), sh = Math.round((y1-y0)*h);
    if (sw < 40 || sh < 40) return null;
    const cv = document.createElement('canvas'); cv.width = sw; cv.height = sh; cv.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
    return versDataUrl(cv);
  } finally { URL.revokeObjectURL(u); }
}
function svgPropre(src){
  const d = new DOMParser().parseFromString(src, 'image/svg+xml'), r = d.documentElement;
  if (!r || r.nodeName.toLowerCase() !== 'svg' || d.querySelector('parsererror')) return null;
  r.querySelectorAll('script,foreignObject,iframe,image,use,a,style').forEach(n=>n.remove());
  [r, ...r.querySelectorAll('*')].forEach(n=>[...n.attributes].forEach(a=>{ if (/^on/i.test(a.name) || /href$/i.test(a.name)) n.removeAttribute(a.name); }));
  r.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const vb = (r.getAttribute('viewBox')||'').split(/[\s,]+/).map(Number);
  const w = vb.length === 4 && vb[2] > 0 ? vb[2] : +r.getAttribute('width') || 600, h = vb.length === 4 && vb[3] > 0 ? vb[3] : +r.getAttribute('height') || 400;
  if (!r.getAttribute('viewBox')) r.setAttribute('viewBox', `0 0 ${w} ${h}`);
  r.setAttribute('width', w); r.setAttribute('height', h);
  return {xml: new XMLSerializer().serializeToString(r), w, h};
}
async function dessiner(src){
  const s = svgPropre(src); if (!s) return null;
  const u = URL.createObjectURL(new Blob([s.xml], {type:'image/svg+xml'}));
  try { const im = await chargerImage(u), k = Math.min(3, 1100 / Math.max(s.w, s.h)), cv = document.createElement('canvas');
    cv.width = Math.round(s.w*k); cv.height = Math.round(s.h*k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); return versDataUrl(cv); }
  finally { URL.revokeObjectURL(u); }
}
async function materialiser(doc, photos){
  for (const b of doc.branches) for (const it of b.items){
    if (it.type !== 'image' || it.img) continue;
    let r = null;
    try { r = it._svg ? await dessiner(it._svg) : (it._zone && photos[it._photo-1]) ? await decouper(photos[it._photo-1], it._zone) : null; } catch(e){ r = null; }
    delete it._svg; delete it._zone; delete it._photo;
    if (r){ it.img = r.img; it.ratio = r.ratio; }
  }
  doc.branches.forEach(b => { b.items = b.items.filter(it => it.type !== 'image' || it.img); });
}

/* Une seule fonction de construction pour l'écran et la copie A4 (comme construire() dans l'Atelier). */
function construire(doc, p, host, opts){
  if (doc.kind === 'fiche') return buildFiche(doc, p, Object.assign({}, opts), host);
  const st = buildStage(doc, p, Object.assign({}, opts));
  st.style.setProperty('--k', doc.echelle || 1);
  host.append(st); layoutStage(st, doc, p); return st;
}

/* Correction de Claude : on garde seulement les TEXTES ; couleurs, emojis, places, taille et cadres restent ceux d'avant. */
function pourClaude(doc){
  const o = clone(doc); ['_v', 'created'].forEach(k => delete o[k]);
  o.branches.forEach(b => b.items.forEach(it => { if (it.img) it.img = 'IMAGE'; delete it.alt; delete it.profiles; }));
  o.branches.forEach(b => { delete b.profiles; });
  return JSON.stringify(o);
}
function appliquerCorrection(doc, r){
  if (!r || !Array.isArray(r.branches)) throw new Error('correction');
  const anc = {}; doc.branches.forEach(b => { anc[b.id] = b; });
  const ancIt = {}; doc.branches.forEach(b => b.items.forEach(it => { ancIt[it.id] = it; }));
  const n = clone(doc);
  if (typeof r.title === 'string' && r.title.trim()) n.title = r.title.trim().slice(0, 200);
  let k = 0;
  n.branches = r.branches.slice(0, 12).filter(b => b && typeof b === 'object').map(b => {
    const a = anc[b.id];
    const nb = a ? {id: a.id, title: a.title, emoji: a.emoji, color: a.color, pos: clone(a.pos || {}), profiles: allP(), ...(a.cadre ? {cadre: a.cadre} : {})}
                 : {id: uid(), title: '', emoji: '', color: COLORS[(doc.branches.length + k++) % COLORS.length], pos: {}, profiles: allP()};
    if (typeof b.title === 'string' && b.title.trim()) nb.title = b.title.trim().slice(0, 80);
    nb.items = (Array.isArray(b.items) ? b.items : []).slice(0, 20).filter(it => it && typeof it === 'object').map(it => {
      const o = ancIt[it.id], type = o ? o.type : (TYPES[it.type] && it.type !== 'image' ? it.type : 'texte');
      const x = {id: o ? o.id : uid(), type, text: String(it.text == null ? (o ? o.text : '') : it.text).slice(0, 1200), profiles: allP(), alt: {}};
      if (type === 'image'){ if (!o || !o.img) return null; x.img = o.img; x.ratio = o.ratio; }
      return x;
    }).filter(Boolean);
    return nb;
  }).filter(b => b.title || b.items.length);
  if (!n.branches.length) throw new Error('correction vide');
  return n;
}

/* ---------- l'écran de l'élève ---------- */
const CSS_ECRAN = `
.rv-aide{max-width:720px;margin:10px auto 0;padding:0 16px;font-size:14px;color:var(--doux);text-align:center}
.rv-vue{position:relative;margin:10px auto 0;max-width:900px;overflow:hidden;touch-action:pan-y}
.rv-vue .stage{position:absolute;left:0;top:0;transform-origin:0 0;box-shadow:0 4px 16px rgba(0,0,0,.15)}
.rv-vue .stage.fiche{box-shadow:none}
.rv-vue .stage .card,.rv-vue .stage .center{touch-action:none}
.rv-vue .fiche .sec.rv-choisi{outline:5px solid #5b4fc4;outline-offset:3px}
.rv-deplacer{position:fixed;left:0;right:0;bottom:0;z-index:20;background:#fff;border-top:1.5px solid var(--bord);padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;justify-content:center;box-shadow:0 -4px 14px rgba(0,0,0,.08)}
.rv-deplacer .btn{flex:1;max-width:200px}
.rv-corriger{max-width:720px;margin:16px auto 30px;padding:0 16px}
.rv-corriger textarea{font-size:16px}
.rv-verifs li{margin:4px 0}
@media print{.rv-vue,.rv-deplacer,.rv-corriger,.rv-aide{display:none!important}}`;
function css(){
  if (document.getElementById('rv-css')) return;
  const s = document.createElement('style'); s.id = 'rv-css'; s.textContent = CSS_ATELIER + CSS_ECRAN; document.head.append(s);
}

/* ctx (donné par app.js) : app, esc, appeler, st, setMsg, sauver(doc, infos), copie(doc, quoi), imprimer(doc), nouvelle(), accueil(), codePerdu() */
function ecran(ctx, doc, infos){
  css();
  infos = infos || {};
  const p = doc._v || 'std', carte = doc.kind === 'mcm';
  const $ = s => ctx.app.querySelector(s);
  let choisi = null, stage = null;
  const verifs = (infos.verifs || []).filter(v => v && v.correction);
  ctx.app.innerHTML = `<div class="barre">
      <button class="btn" id="nouveau"><span aria-hidden="true">📷</span>Nouvelle</button>
      <button class="btn" id="imprimer"><span aria-hidden="true">🖨</span>Imprimer</button>
      <button class="btn" id="pdf"><span aria-hidden="true">📄</span>PDF</button>
      <button class="btn" id="photo"><span aria-hidden="true">🖼</span>Photo</button>
      <button class="btn" id="accueil"><span aria-hidden="true">🏠</span>Accueil</button>
    </div>
    ${infos.reserves || verifs.length ? `<details class="reserves"><summary>⚠️ À vérifier par l’adulte</summary>${infos.reserves ? `<p>${ctx.esc(infos.reserves)}</p>` : ''}${verifs.length ? `<p>Corrections ou ajouts faits par l’intelligence artificielle :</p><ul class="rv-verifs">${verifs.map(v => `<li>${v.cours ? `« ${ctx.esc(v.cours)} » → ` : 'Ajout : '}<b>${ctx.esc(v.correction)}</b>${v.pourquoi ? ' — ' + ctx.esc(v.pourquoi) : ''}</li>`).join('')}</ul>` : ''}</details>` : ''}
    <p class="rv-aide">${carte ? '✋ Fais glisser une bulle avec le doigt pour la mettre au bon endroit.' : '✋ Touche une partie, puis ▲ ou ▼ pour la monter ou la descendre.'}</p>
    <div class="rv-vue" id="vue"></div>
    ${carte ? `<button class="discret" id="ranger">↺ Remettre les bulles en place</button>` : ''}
    <div class="rv-corriger carte">
      <label for="demande" style="font-weight:600">✏️ Quelque chose à corriger ? Demande-le-moi</label>
      <p class="hint">Écris-le-moi : une erreur, un mot important qui manque, une phrase pas claire…</p>
      <textarea id="demande" rows="2" maxlength="600" placeholder="ex. Il manque la date de 1789"></textarea>
      <button class="btn pri large" id="corriger" style="margin-top:10px">Demander la correction</button>
      <div id="msg" class="msg" role="status"></div>
    </div>
    <div class="rv-deplacer" id="deplacer" hidden><button class="btn" id="monter">▲ Monter</button><button class="btn" id="descendre">▼ Descendre</button><button class="btn" id="fini">✓ Fini</button></div>`;
  const vue = $('#vue');
  function ajuster(){
    if (!stage) return;
    const w0 = stage._w || W, h0 = stage._h || H, s = vue.clientWidth / w0;
    stage._s = s; stage.style.transform = `scale(${s})`; vue.style.height = Math.ceil(h0 * s) + 'px';
  }
  function dessinerVue(){
    vue.innerHTML = '';
    stage = construire(doc, p, vue, {});
    if (!carte && choisi){ const el = stage.querySelector(`.sec[data-b="${choisi}"]`); if (el) el.classList.add('rv-choisi'); }
    ajuster();
  }
  const garder = () => ctx.sauver(doc, infos);
  dessinerVue();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { if (vue.isConnected) dessinerVue(); });
  const ro = new ResizeObserver(() => { if (!vue.isConnected) { ro.disconnect(); return; } ajuster(); }); ro.observe(vue);

  /* carte : glisser une bulle (même geste que dans l'éditeur de l'Atelier) */
  vue.addEventListener('pointerdown', e => {
    if (!carte || !stage) return;
    const el = e.target.closest('.card, .center'); if (!el) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    const s = stage._s, sx = e.clientX, sy = e.clientY, ox = el._x, oy = el._y; let bouge = false;
    const mv = ev => {
      if (!bouge && Math.hypot(ev.clientX-sx, ev.clientY-sy) < 6) return;
      bouge = true; el.classList.add('drag'); place(el, ox+(ev.clientX-sx)/s, oy+(ev.clientY-sy)/s); drawBranches(stage);
    };
    const up = () => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.classList.remove('drag');
      if (!bouge) return;
      if (el.classList.contains('center')) doc.centerPos[p] = {x:Math.round(el._x), y:Math.round(el._y)};
      else { const b = doc.branches.find(x => x.id === el.dataset.b); if (b) b.pos[p] = {x:Math.round(el._x), y:Math.round(el._y)}; }
      dessinerVue(); garder();   // les autres bulles s'écartent si besoin : aucune ne se chevauche
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  const rg = $('#ranger'); if (rg) rg.onclick = () => { doc.centerPos = {}; doc.branches.forEach(b => { b.pos = {}; }); dessinerVue(); garder(); };

  /* fiche : choisir une partie, puis la monter ou la descendre */
  const barre = $('#deplacer');
  vue.addEventListener('click', e => {
    if (carte) return;
    const sec = e.target.closest('.sec'); choisi = sec ? sec.dataset.b : null;
    barre.hidden = !choisi; dessinerVue();
  });
  const deplacer = d => { const i = doc.branches.findIndex(b => b.id === choisi), j = i + d; if (i < 0 || j < 0 || j >= doc.branches.length) return;
    [doc.branches[i], doc.branches[j]] = [doc.branches[j], doc.branches[i]]; dessinerVue(); garder();
    const el = stage.querySelector('.rv-choisi'); if (el) el.scrollIntoView({block: 'center', behavior: 'smooth'}); };
  $('#monter').onclick = () => deplacer(-1);
  $('#descendre').onclick = () => deplacer(1);
  $('#fini').onclick = () => { choisi = null; barre.hidden = true; dessinerVue(); };

  /* corriger avec Claude : seulement le contenu */
  $('#corriger').onclick = async () => {
    const demande = $('#demande').value.trim(); if (!demande){ ctx.setMsg('Écris ce qu’il faut corriger.', true); return; }
    const btn = $('#corriger'); btn.disabled = true; ctx.setMsg('Je corrige… (environ 30 secondes)');
    try {
      const j = await ctx.appeler({action: 'corriger', code: ctx.st.code, type: carte ? 'carte' : 'fiche', version: p, doc: pourClaude(doc), demande});
      const r = j.resultat;
      if (r.refus){ btn.disabled = false; ctx.setMsg(String(r.refus).slice(0, 200)); return; }
      const n = appliquerCorrection(doc, r);
      Object.keys(doc).forEach(k => delete doc[k]); Object.assign(doc, n);
      $('#demande').value = ''; btn.disabled = false; dessinerVue(); garder(); ctx.setMsg('C’est corrigé ✓');
    } catch(e){
      btn.disabled = false;
      if (e && e.code === 'code'){ ctx.codePerdu(); return; }
      ctx.setMsg((e && e.message) || 'La correction n’a pas marché. Réessaie.', true);
    }
  };
  $('#nouveau').onclick = () => ctx.nouvelle();
  $('#accueil').onclick = () => ctx.accueil();
  $('#imprimer').onclick = () => ctx.imprimer(doc);
  $('#pdf').onclick = () => ctx.copie(doc, 'pdf');
  $('#photo').onclick = () => ctx.copie(doc, 'photo');
  window.scrollTo(0, 0);
}

/* copie A4 : la carte en paysage, la fiche en pages portrait */
function copie(doc, host){
  css(); host.innerHTML = '';
  const st = construire(doc, doc._v || 'std', host, {});
  return doc.kind === 'fiche' ? [...st.querySelectorAll('.pg')] : [st];
}

window.Revision = {versionDe, depuisBrouillon, materialiser, construire, copie, ecran, appliquerCorrection, pourClaude};
})();
