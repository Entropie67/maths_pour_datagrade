# Vitrine de l'association sur la page d'accueil

Tant qu'aucun exercice n'est sélectionné, l'espace central de la page d'accueil
(vue bureau, référentiel `fr-FR`) présente l'association CoopMaths : onglets
« Découvrir », « Actualités », « Tutos vidéo », « Ressources » et
« L'association ».

Le contenu n'est pas dans le bundle de MathALÉA : il est rédigé, construit et
publié par le projet `www` (site Astro déployé sur `coopmaths.fr/www`), qui
génère la même vitrine sous deux formes :

- `https://coopmaths.fr/www/vitrine/` : page complète du site ;
- `https://coopmaths.fr/www/vitrine/fragment/` : fragment HTML autonome
  (page Astro déclarée `partial`, donc sans `<html>`/`<head>`), récupéré par
  MathALÉA.

## Côté MathALÉA

- [`lib/components/vitrineAsso.ts`](../../../../src/lib/components/vitrineAsso.ts)
  récupère le fragment (`/www/vitrine/fragment/`) sur le site donné par
  `vitrineOrigin()` (voir plus bas),
  vérifie qu'il contient bien le conteneur `.vitrine-alea`, supprime tout
  `<script>` et force `target="_blank"` sur les liens (sauf `mailto:`). Une
  seule requête par chargement de page, résultat mémorisé ; `null` en cas
  d'échec.
- [`VitrineAsso.svelte`](../../../../src/components/setup/start/presentationalComponents/VitrineAsso.svelte)
  injecte le HTML (`{@html}`) et prévient son parent si le fragment est
  indisponible.
- [`Placeholder.svelte`](../../../../src/components/setup/start/presentationalComponents/Placeholder.svelte)
  affiche la vitrine si `globalOptions.beta` est vrai (`localhost` ou
  `?beta=1`), sinon — ou si le fragment n'a pas pu être chargé — l'accueil
  historique (`QuickLinks` + `Carousel`). Le marqueur `PHASE-BETA-VITRINE`
  signale le bloc à simplifier le jour où la vitrine est ouverte à tous.

## Sur quel site lire le fragment

[`lib/siteOrigin.ts`](../../../../src/lib/siteOrigin.ts) donne le site qui
sert ce qui n'est pas dans le bundle (le fragment, les scans d'annales de
`/alea/static/`) : le site courant sur nos noms (coopmaths, mathalea, leur
staging, l'adresse technique du conteneur), `https://coopmaths.fr` partout
ailleurs, par exemple sur une copie de MathALÉA hébergée par un autre site.
Le fragment n'existe que sur les noms coopmaths : `vitrineOrigin()` fait lire
à un nom mathalea son nom coopmaths jumeau (`staging.mathalea.fr` lit
`staging.coopmaths.fr`), qui envoie l'en-tête CORS pour `/www/`
(configuration nginx de [`deploy/`](../../../../deploy/README.md)). Les
adresses relatives du fragment (images, liens `/www/...`) sont complétées avec
cette origine.

En développement, [`vite.config.ts`](../../../../vite.config.ts) proxifie
`/www` vers `https://coopmaths.fr` ; pour travailler sur la vitrine elle-même,
lancer le serveur Astro de `www` et pointer le proxy dessus :

```bash
WWW_PROXY_TARGET=http://localhost:4321 pnpm dev
```

## Contraintes sur le fragment (côté `www`)

Le fragment est injecté par `innerHTML`, ce qui impose au composant
`VitrineAlea.astro` du projet `www` :

- aucun script (les onglets sont gérés en CSS pur : boutons radio + `:checked`) ;
- styles embarqués (`<style is:inline>`) et entièrement préfixés par
  `.vitrine-alea`, sans dépendre des classes Tailwind de la page hôte (elles
  seraient purgées du bundle) ;
- mode sombre par la classe `dark` d'un ancêtre (posée sur `#startComponent`
  côté MathALÉA, sur `<html>` côté www) ;
- mise en page adaptée à la largeur disponible avec des container queries
  (la largeur dépend du volet latéral, pas de l'écran) ;
- URLs absolues (`https://coopmaths.fr/www/…`).

Les actualités sont les derniers billets du blog de `www` ; les tutos, les
applications et les ressources sont listés dans `src/data/vitrineAlea.ts` de
`www`. Modifier la vitrine ne demande donc aucun déploiement de MathALÉA.
