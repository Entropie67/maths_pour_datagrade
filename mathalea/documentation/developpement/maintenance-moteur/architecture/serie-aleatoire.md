# Série aléatoire (générateur de lien)

« Série aléatoire » est une app native de MathALÉA : l'enseignant coche des
niveaux, des thèmes, des sous-thèmes ou des exercices précis dans toute
l'arborescence des exercices aléatoires, choisit combien d'exercices tirer au
sort et si la série doit être interactive. L'exercice n'affiche alors qu'un gros
bouton orange, qui ouvre dans un nouvel onglet une séance MathALÉA en vue élève
composée d'exercices tirés au sort.

| Fichier                                             | Rôle                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `src/exercices/serieAleatoire/SerieAleatoire.ts`    | L'exercice (uuid `6b74b`), qui assemble sélecteur et bouton        |
| `src/lib/serieAleatoire/selection.ts`               | Sélection, résolution en exercices, tirage et construction du lien |
| `src/lib/customElements/SerieAleatoireSelecteur.ts` | Le sélecteur affiché en vue enseignante                            |
| `src/lib/customElements/SerieAleatoireBouton.ts`    | Le bouton, qui tire la série au clic                               |

Comme « Questions de cours », l'app n'est référencée dans aucun référentiel
d'exercices : elle s'ouvre par `?uuid=6b74b` et figure dans la modale des
applications (`src/json/referentielAppsTierce.json`). Sa vignette,
`public/images/apps/app_serie_aleatoire.svg`, reprend le dé de MathALÉA
(`public/assets/svg/logo_mathalea.svg`) sur fond transparent, aux proportions
des vignettes voisines, pour que la carte garde sa couleur en thème clair comme
en thème sombre.

## Format de la sélection (`sup`)

La sélection est une liste d'entrées séparées par des `;`. Une entrée est :

- soit un **chemin** dans le référentiel (`6e`, `6e>6N1`, `6e>6N1>6N11`), qui
  vaut « tout ce nœud » — niveau, thème ou sous-thème ;
- soit l'**uuid** d'un exercice précis.

Un chemin d'un seul segment (un niveau) est distingué d'un uuid parce qu'il
existe à la racine du référentiel, là où un uuid n'existe pas
(`cheminDeLEntree()`).

Deux conséquences voulues :

- cocher un niveau entier tient en deux caractères dans l'URL partagée ;
- la sélection suit le référentiel : les exercices ajoutés plus tard sous un
  thème coché en font automatiquement partie.

Les entrées qui ne correspondent plus à rien (thème renommé, exercice retiré)
sont ignorées plutôt que de casser toute la série.

Le sélecteur n'affiche que les nœuds contenant au moins un exercice
(`enfantsVisibles()`) : le référentiel garde des rubriques vides, comme `200` en
Seconde, qui porte le même libellé « Automatismes » que `2A` et apparaissait donc
en doublon.

### Cocher et décocher

`ajouteALaSelection()` remplace les entrées contenues par celle du nœud coché,
pour que la sélection reste courte.

`retireDeLaSelection()` gère le cas inverse, plus subtil : décocher un thème
alors que c'est **son niveau** qui est coché. L'ancêtre est alors « éclaté » en
ses enfants, niveau par niveau jusqu'à la branche décochée, de sorte que tout ce
qu'il contenait reste sélectionné sauf elle. C'est ce qui rend l'état
`indeterminate` des cases parentes cohérent avec ce que le tirage utilisera.

## Les autres réglages

| Réglage | Contenu                                   | Formulaire du panneau  |
| ------- | ----------------------------------------- | ---------------------- |
| `sup`   | La sélection (voir ci-dessus)             | « Sélection » (texte)  |
| `sup2`  | Nombre d'exercices tirés au sort (1 à 30) | « Nombre d'exercices » |
| `sup3`  | Série interactive (`true`/`false`)        | « Série interactive »  |

Ces trois réglages sont modifiables **soit** dans le sélecteur, **soit** dans le
panneau latéral : le sélecteur émet l'événement DOM `settings` avec le même
`detail` que le panneau (voir
[Questions de cours](questions-de-cours.md#le-sélecteur) pour ce mécanisme).
`sup2` et `sup3` arrivent tantôt en nombre/booléen (panneau), tantôt en chaîne
(URL ou sélecteur) : `nombreDExercices()` et `serieInteractive()` normalisent.

## Le lien produit

`lienVersLaSerie()` construit une URL de séance MathALÉA :

```text
https://coopmaths.fr/alea/?uuid=<u1>&id=<ref1>&i=1&uuid=<u2>&id=<ref2>&i=1&v=eleve&es=12110011
```

L'analyse des URLs par `mathaleaUpdateExercicesParamsFromUrl()` est
**positionnelle** : les paramètres d'un exercice (`id`, `i`, …) doivent suivre
son `uuid`. `v=eleve` et `es` valent en revanche pour toute la séance. `i=1`
n'est ajouté que pour une série interactive. Aucun `alea` n'est transmis : chaque
élève reçoit donc des valeurs différentes pour les mêmes exercices.

`es` encode les réglages de la vue élève, un caractère par option dans l'ordre
`presMode | setInteractive | isSolutionAccessible | isInteractiveFree | oneShot
| twoColumns | isTitleDisplayed | isReferenceDisplayed`. Une seule option
s'écarte des valeurs par défaut de `globalOptions` : `presMode` vaut
`un_exo_par_page` (index 1 de `presModeId`), la série s'ouvre donc avec **un
exercice par page**. `setInteractive` reste à `2` (« au choix exercice par
exercice ») pour que le `i=1` posé sur chaque exercice reste décisif.

## Le tirage a lieu au clic

C'est la raison d'être de `SerieAleatoireBouton` : si le lien était figé à la
génération de l'énoncé, tous les élèves ouvrant le lien partagé par l'enseignant
recevraient la même série. Le bouton garde donc la sélection, et recalcule son
`href` sur `pointerdown` puis sur `click`, juste avant que le navigateur ne suive
l'ancre (`target="_blank"`, d'où le nouvel onglet).

`tirageDeLaSerie()` s'appuie sur `crypto.getRandomValues` et **non** sur
`shuffle()`, dont le `Math.random` est remplacé par le générateur à graine de
MathALÉA : le tirage doit précisément échapper à la graine de l'exercice. Comme
la graine ne change plus rien, l'exercice pose `pasDeVersionAleatoire = true` et
le bouton « Nouvel énoncé » disparaît.

Hors HTML (LaTeX, Typst, AMC), où il n'y a personne pour cliquer, l'exercice fige
un tirage et écrit le lien en toutes lettres.

## Voir aussi

- [Questions de cours](questions-de-cours.md) : l'autre app native, dont le
  sélecteur suit le même contrat (les styles communs sont dans
  `src/lib/customElements/stylesFormulaires.ts`)
- [JSON du menu des exercices](menu-exercices.md) : la structure de
  `referentiel2022FR.json` parcourue par le sélecteur
