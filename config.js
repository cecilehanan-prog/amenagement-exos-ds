/* Adresse de la fonction (hébergée gratuitement sur Vercel) qui garde la clé Claude cachée.
   Sur le site Vercel lui-même, l'adresse courte /api/amenager suffit. */
window.CONFIG = {
  fonction: location.hostname.endsWith('.vercel.app') ? '/api/amenager' : 'https://REMPLACER-PAR-L-ADRESSE-VERCEL/api/amenager'
};
