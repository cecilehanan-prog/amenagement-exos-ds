/* Fonction « amenager » : reçoit les photos d'une page d'exercices, les envoie à Claude avec la consigne
   de l'Atelier pédagogique (exo.js, la même que dans l'atelier), et renvoie l'exercice aménagé en JSON.
   Hébergée gratuitement sur Vercel (formule Hobby), à partir de ce dépôt GitHub.
   - La clé API Anthropic reste ici, cachée (variable d'environnement ANTHROPIC_API_KEY réglée dans Vercel).
   - Accès réservé aux codes de classe listés dans CODES_CLASSE (séparés par des virgules).
   - Aucune photo n'est enregistrée : elles ne passent qu'en mémoire, le temps de la demande. Rien n'est écrit dans les journaux. */
const Anthropic = require('@anthropic-ai/sdk');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

/* exo.js est le fichier de l'atelier, recopié tel quel dans le site : on en tire les consignes pour Claude.
   Il est livré avec la fonction (vercel.json → includeFiles) ; à défaut, elle le lit sur le site GitHub Pages. */
const EXO_URL = process.env.EXO_URL || 'https://cecilehanan-prog.github.io/amenagement-exos-ds/exo.js';
let exoP = null;
function chargerExo(){
  if (!exoP) exoP = (async () => {
    const local = [path.join(process.cwd(), 'exo.js'), path.join(__dirname, '..', 'exo.js')].find(f => fs.existsSync(f));
    const code = local ? fs.readFileSync(local, 'utf8') : await (await fetch(EXO_URL)).text();
    const bac = {window: {}};
    vm.runInNewContext(code, bac);
    if (!bac.window.Exo || typeof bac.window.Exo.consigne !== 'function') throw new Error('exo.js illisible');
    return bac.window.Exo;
  })().catch(e => { exoP = null; throw e; });
  return exoP;
}

const liste = v => String(v || '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
const ORIGINES = liste(process.env.ORIGINES || 'https://cecilehanan-prog.github.io');
const CODES = liste(process.env.CODES_CLASSE || process.env.CODE_CLASSE).map(s => s.toUpperCase());
const MODELE = process.env.MODELE || 'claude-opus-5-5';
const EFFORT = process.env.EFFORT || 'medium';
const LIMITE_HEURE = Number(process.env.LIMITE_HEURE) || 40;   // fiches par heure et par code de classe
const MAX_PHOTOS = 6;

let client = null;
const claude = () => client || (client = new Anthropic());

/* petit compteur en mémoire : freine un code de classe qui aurait fuité */
const compteur = new Map();
function trop(code){
  const h = Math.floor(Date.now() / 3600000), cle = code + '@' + h, n = (compteur.get(cle) || 0) + 1;
  compteur.set(cle, n);
  if (compteur.size > 500) for (const k of compteur.keys()) if (!k.endsWith('@' + h)) compteur.delete(k);
  return n > LIMITE_HEURE;
}
const codeOk = c => { c = String(c || '').trim().toUpperCase(); return c.length >= 3 && CODES.includes(c) ? c : ''; };
const txt = (v, n) => String(v == null ? '' : v).slice(0, n);

function lireJSON(t){
  t = String(t || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
}

async function demander(params){
  try {
    return await claude().beta.messages.stream(Object.assign({betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'}, params)).finalMessage();
  } catch (e) {
    // si le repli automatique n'est pas proposé sur ce compte, on refait la demande sans lui
    if (e && e.status === 400 && /fallback/i.test(String(e.message))) return await claude().messages.stream(params).finalMessage();
    throw e;
  }
}

module.exports = async (req, res) => {
  const origine = req.headers.origin || '';
  if (ORIGINES.includes(origine) || ORIGINES.includes('*')) { res.setHeader('Access-Control-Allow-Origin', origine); res.setHeader('Vary', 'Origin'); }
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'POST'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Max-Age', '3600'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).json({erreur: 'methode'});

  const b = req.body || {};
  if (!CODES.length) return res.status(500).json({erreur: 'pas_de_code', message: 'Aucun code de classe n’est réglé sur le serveur.'});
  const code = codeOk(b.code);
  if (!code) return res.status(403).json({erreur: 'code', message: 'Ce code de classe ne marche pas.'});
  if (b.action === 'verifier') return res.json({ok: true});
  if (b.action !== 'amenager') return res.status(400).json({erreur: 'action'});
  if (trop(code)) return res.status(429).json({erreur: 'limite', message: 'Beaucoup de fiches ont été faites avec ce code cette heure-ci. Réessaie un peu plus tard.'});

  let Exo;
  try { Exo = await chargerExo(); } catch (e) { console.error('exo.js: ' + e.message); return res.status(500).json({erreur: 'serveur', message: 'Le serveur démarre mal. Réessaie dans une minute.'}); }

  const photos = (Array.isArray(b.images) ? b.images : []).slice(0, MAX_PHOTOS)
    .filter(s => typeof s === 'string' && s.length < 7000000 && /^[A-Za-z0-9+/=]+$/.test(s));
  if (!photos.length) return res.status(400).json({erreur: 'photo', message: 'Ajoute au moins une photo.'});

  const fiche = b.forme === 'fiche';
  const profils = Exo.profilsPropres(b.profils);
  const langue = profils.includes('allo') ? Exo.langueOk(b.langue) : '';
  const classe = txt(b.classe, 40), matiere = txt(b.matiere, 60), consignes = txt(b.consignes, 500);
  const consigne = fiche
    ? Exo.consigneFiche({n: photos.length, texte: '', consignes, classe})
    : Exo.consigne({n: photos.length, texte: '', consignes, matiere, classe, depuisCours: false, profils, langue: langue ? Exo.LANGUES[langue] : ''});

  try {
    const rep = await demander({
      model: MODELE,
      max_tokens: 32000,
      output_config: {effort: EFFORT},
      system: 'Tu travailles pour une application scolaire. Réponds uniquement avec l’objet JSON demandé, sans aucun texte avant ou après.',
      messages: [{role: 'user', content: [
        ...photos.map(data => ({type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data}})),
        {type: 'text', text: consigne}
      ]}]
    });
    if (rep.stop_reason === 'refusal') return res.status(422).json({erreur: 'refus', message: 'Claude n’a pas pu traiter cette page.'});
    const texte = rep.content.filter(c => c.type === 'text').map(c => c.text).join('');
    const obj = lireJSON(texte);
    const ok = obj && (fiche ? Array.isArray(obj.blocs) && obj.blocs.length : Array.isArray(obj.questions) && obj.questions.length);
    console.log(JSON.stringify({code, photos: photos.length, fiche, profils, modele: rep.model, stop: rep.stop_reason, entree: rep.usage && rep.usage.input_tokens, sortie: rep.usage && rep.usage.output_tokens, ok: !!ok}));
    if (!ok) return res.status(502).json({erreur: 'illisible', message: 'La réponse n’était pas lisible. Réessaie.'});
    return res.json({ok: true, resultat: obj});
  } catch (e) {
    const s = e && e.status;
    console.error(JSON.stringify({code, erreur: s || 'reseau', type: e && e.error && e.error.error && e.error.error.type}));
    if (s === 429 || s === 529) return res.status(429).json({erreur: 'occupe', message: 'Claude est très demandé en ce moment. Réessaie dans une minute.'});
    if (/credit|billing|spend|limit/i.test(String(e && e.message))) return res.status(503).json({erreur: 'budget', message: 'Le budget du mois est atteint. Préviens l’enseignante.'});
    if (s === 400) return res.status(400).json({erreur: 'photo', message: 'Une photo n’a pas pu être lue. Reprends-la plus nette.'});
    if (s === 401 || s === 403) return res.status(500).json({erreur: 'cle', message: 'La clé du serveur ne marche pas. Préviens l’enseignante.'});
    return res.status(500).json({erreur: 'serveur', message: 'Ça n’a pas marché. Réessaie.'});
  }
};
