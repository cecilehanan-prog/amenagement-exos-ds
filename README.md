# Mes exercices aménagés

Version téléphone de l'outil « ✋ Aménager un exercice ou une évaluation » de l'Atelier pédagogique,
pour les élèves (en autonomie) et les AESH. Pas de compte Claude à créer.

1. L'élève entre le **code de la classe**.
2. Il prend sa fiche en **photo**, choisit **pour qui** (Dys, TDA-H, TSA, HPI, Dyscalculie, Malvoyance, Allophone) et touche **Préparer**.
3. Il fait l'exercice au toucher, d'une main. Il peut l'**imprimer** (copie A4) ou le **garder** (fichier qui s'ouvre sans internet).

- `index.html`, `app.js`, `config.js` : l'appli (GitHub Pages, et aussi Vercel).
- `exo.js` : le fichier de l'atelier, recopié tel quel (mêmes règles d'aménagement, même lecteur, même copie A4).
- `api/amenager.js` : la fonction Vercel (formule Hobby, gratuite) qui garde la clé Claude cachée et vérifie le code de classe.
  Réglages dans Vercel : `ANTHROPIC_API_KEY`, `CODES_CLASSE` (codes séparés par des virgules).

Aucune photo n'est enregistrée : elles passent seulement par la fonction Vercel, le temps de la demande.
Le dernier exercice reste sur le téléphone de l'élève (stockage du navigateur).
