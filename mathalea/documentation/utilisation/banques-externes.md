# Banques d'exercices externes

MathALÉA permet d'ajouter ses propres banques d'exercices statiques, en plus de
celles fournies avec le site. Une fois ajoutée, la banque apparaît dans
« Ressources partenaires » et ses exercices se sélectionnent comme les autres.

Le point d'entrée est le bouton **« Ajouter une banque d'exercices »**, en
dernière position de la rubrique « Ressources partenaires » du menu latéral. Il
ouvre la fenêtre qui sert aussi à retirer une banque déjà installée.

## Deux provenances

| Provenance                                                          | Comment                   | Partage par lien                               |
| ------------------------------------------------------------------- | ------------------------- | ---------------------------------------------- |
| Archive `.zip`                                                      | Déposée depuis la machine | Non : la banque n'existe que sur ce navigateur |
| Dépôt de [forge.apps.education.fr](https://forge.apps.education.fr) | En collant l'URL du dépôt | Oui                                            |

Une archive est conservée dans le navigateur (IndexedDB) et rechargée
automatiquement aux visites suivantes ; un dépôt de forge est relu à chaque
démarrage, ce qui fait remonter les mises à jour de son auteur.

Le dépôt doit être **public**. MathALÉA lit ses fichiers par l'API GitLab, qui
autorise les requêtes venant d'un autre site ; aucun réglage n'est à faire côté
dépôt (ni GitLab Pages, ni configuration CORS). Les formes d'URL acceptées :

```
https://forge.apps.education.fr/mon-groupe/ma-banque
https://forge.apps.education.fr/mon-groupe/ma-banque.git
https://forge.apps.education.fr/mon-groupe/ma-banque/-/tree/une-autre-branche
https://forge.apps.education.fr/mon-groupe/ma-banque/-/tree/main/un-sous-dossier
```

MathALÉA lit en priorité une archive `dist.zip` à la racine du dépôt : quand le
build de la banque en produit une, toute la banque est récupérée en **un seul
téléchargement**, ce qui évite la rafale de requêtes vers l'API GitLab (et ses
réponses « trop de requêtes ») qu'entraîne la lecture fichier par fichier. À
défaut de `dist.zip`, MathALÉA cherche `manifest.json` à la racine du dépôt
puis, s'il ne l'y trouve pas, dans son sous-dossier `dist/` : un dépôt de
sources dont le `manifest.json` n'est publié que dans ce dossier (build généré
par une CI, par exemple) n'a donc besoin d'aucune URL particulière. La
détection est refaite à chaque démarrage : publier un `dist.zip` sur une banque
jusque-là lue fichier par fichier suffit à faire basculer ses lecteurs dessus.
Les deux dernières formes d'URL ne servent que pour lire une autre branche que
`main`, ou un sous-dossier autre que `dist/` (`dist.zip` est alors cherché dans
ce sous-dossier).

## Banque intégrée : FFJM

La banque **« Exercices de la FFJM »** est livrée avec le site : elle apparaît
dans « Ressources partenaires » pour tout le monde, sans rien installer, et ne
peut pas être retirée (la fenêtre « Vos banques d'exercices » la signale
« intégrée au site »). C'est une banque du même format que les autres, avec la
provenance particulière `builtin` : elle n'est ni enregistrée dans le
navigateur, ni ajoutée aux liens partagés par un paramètre `bq` (inutile,
puisque tout le monde l'a déjà).

Seul son `manifest.json` est versionné dans le dépôt
(`src/json/banques/ffjm.manifest.json`). Ses fichiers d'exercices (images,
sources Typst/LaTeX, préambules) sont servis par le **dossier statique du
serveur**, partagé entre les releases (cf. `tasks/deploy_site.sh` et
`tasks/rollback_site.js`, où `…/dist/static` est un lien symbolique vers
`REMOTE_STATIC_PATH`), exactement comme la « Bibliothèque » et les annales. Ils
ne sont donc ni dans le dépôt git, ni dans `public/`.

Chemin attendu : `static/ffjm/<chemin déclaré dans le manifest>`, soit en
production `https://coopmaths.fr/alea/static/ffjm/…` — par exemple
`https://coopmaths.fr/alea/static/ffjm/png/tirelire.png`, `…/typ/tirelire.typ`,
`…/tex/tirelire.tex`, `…/preambule.tex`. En développement, `vite` proxifie
`/alea/static` vers `https://coopmaths.fr` (`vite.config.ts`) : les fichiers
FFJM doivent donc être en ligne pour s'afficher en local. Leur mise à jour se
fait depuis le projet qui gère ce dossier statique, pas ici.

Pour récupérer le manifest de la dernière version publiée sur
[forge.apps.education.fr/coopmaths/ffjm](https://forge.apps.education.fr/coopmaths/ffjm) :

```
pnpm update:ffjm
```

Le script télécharge `dist/manifest.json` du dépôt et réécrit
`src/json/banques/ffjm.manifest.json` — rien d'autre. Ensuite : `pnpm check`
puis commit du manifest. Si des exercices ont été ajoutés ou renommés, penser à
mettre à jour en parallèle les fichiers sous `static/ffjm/`.

### Tester une modification de FFJM

Pour tester des fichiers encore présents uniquement sur votre machine,
construisez l'archive de la banque FFJM et importez-la avec **« Ajouter une
banque d'exercices » → « Ajouter une archive »**. Réimportez l'archive après
chaque modification. Pour tester une branche publiée, poussez les fichiers
construits (`dist.zip` ou `dist/`) sur une branche publique de la forge, puis
ajoutez l'URL `https://forge.apps.education.fr/coopmaths/ffjm/-/tree/ma-branche`.
Rechargez MathALÉA après chaque mise à jour de la branche : le dépôt est relu
au démarrage. Si `dist.zip` existe, il est lu avant `dist/` ; reconstruisez-le
aussi pour éviter de tester une ancienne version.

Le manifest de test doit garder l'identifiant `ffjm`. La dernière version
ajoutée pour cet identifiant prend alors la place de la banque intégrée dans
« Ressources partenaires » et pour les images, les sources et les préambules
des exercices. Son titre peut être différent. Le retrait de la version de test
redonne immédiatement accès à la version intégrée. Une archive locale ne peut
pas être partagée par lien ; utilisez une branche de la forge pour un test
partagé.

## Partager un lien

Quand une sélection contient des exercices venant d'un dépôt de forge, le lien
produit par MathALÉA porte un paramètre `bq` désignant ce dépôt : le
destinataire voit les exercices sans avoir à installer la banque, et sa propre
liste de banques n'est pas modifiée.

Les banques déposées en `.zip` ne peuvent pas suivre un lien — elles ne sont
présentes que sur la machine qui les a importées. Pour partager une banque,
publiez-la sur la forge.

## Format d'une banque

Une banque est un dossier (ou une archive) contenant un `manifest.json` à sa
racine, et les fichiers qu'il référence :

```
manifest.json
preambule.tex
preambule.typ
png/somme-de-fractions.png
png/somme-de-fractions_cor.png
typ/somme-de-fractions.typ
tex/somme-de-fractions.tex
```

### `manifest.json`

```json
{
  "schema": "mathalea-banque-v1",
  "id": "ma-banque",
  "titre": "Ma banque d'exercices",
  "auteur": "Prénom Nom",
  "licence": "CC BY-SA 4.0",
  "version": "1.0.0",
  "description": "Quelques mots sur la banque.",
  "preambule": {
    "tex": "preambule.tex",
    "typ": "preambule.typ"
  },
  "exercices": [
    {
      "id": "somme-de-fractions",
      "titre": "Somme de deux fractions",
      "categorie": "Nombres et calculs",
      "sousCategorie": "Fractions",
      "tags": ["fractions", "addition"],
      "etoiles": 2,
      "png": "png/somme-de-fractions.png",
      "pngCor": "png/somme-de-fractions_cor.png",
      "typ": "typ/somme-de-fractions.typ",
      "typCor": "typ/somme-de-fractions_cor.typ",
      "tex": "tex/somme-de-fractions.tex",
      "texCor": "tex/somme-de-fractions_cor.tex"
    }
  ]
}
```

Champs de la banque :

| Champ                                         | Obligatoire | Rôle                                                                                                                                                                                                                                          |
| --------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema`                                      | oui         | doit valoir `mathalea-banque-v1`                                                                                                                                                                                                              |
| `id`                                          | oui         | identifiant court (lettres, chiffres, `.`, `_`, `-`) ; il entre dans les uuid des exercices, donc dans les liens partagés                                                                                                                     |
| `titre`                                       | oui         | nom du nœud affiché dans « Ressources partenaires »                                                                                                                                                                                           |
| `auteur`, `licence`, `version`, `description` | non         | `auteur` figure aussi en attribution discrète au-dessus de chaque exercice de la banque (vues prof et élève), sauf pour la banque FFJM où seul le titre de la banque apparaît ; les quatre sont affichés dans la liste des banques installées |
| `preambule`                                   | non         | personnalisation du document généré, voir ci-dessous                                                                                                                                                                                          |
| `exercices`                                   | oui         | liste des exercices, non vide                                                                                                                                                                                                                 |

Champs d'un exercice :

| Champ                        | Obligatoire | Rôle                                                                                                             |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `id`                         | oui         | identifiant unique dans la banque ; figer sa valeur garde les liens partagés valides                             |
| `titre`                      | oui         | intitulé affiché dans le menu                                                                                    |
| `categorie`, `sousCategorie` | non         | deux niveaux de regroupement dans le menu ; sans eux l'exercice est placé directement sous le titre de la banque |
| `tags`                       | non         | étiquettes affichées sous le titre                                                                               |
| `etoiles`                    | non         | difficulté de 0 à 5, affichée en étoiles                                                                         |
| `png`, `pngCor`              | —           | images de l'énoncé et de la correction, affichées dans les vues HTML et A4                                       |
| `typ`, `typCor`              | —           | sources Typst, utilisées à la place des images dans la vue Typst (l'utilisateur peut alors modifier l'exercice)  |
| `tex`, `texCor`              | —           | sources LaTeX (fragments, sans `\documentclass`), reprises dans les exports LaTeX et PDF                         |

Un exercice doit fournir au moins l'un de `png`, `typ` ou `tex`. En pratique,
`png` est ce que voient les vues HTML : une banque sans image ne s'affichera que
dans les vues Typst ou LaTeX correspondantes.

Tous les chemins sont **relatifs à la racine de la banque**. Les chemins
absolus, les URLs et les remontées `..` sont refusés.

### Personnaliser le document généré (`preambule`)

Le champ optionnel `preambule` déclare, pour chaque format, un fichier inséré
dans le document généré quand un exercice de la banque en fait partie —
l'équivalent d'un `preambule.tex` que l'on joindrait à un envoi LaTeX :

- `preambule.tex` : code LaTeX inséré dans le préambule du document (avant
  `\begin{document}`) — pour déclarer des `\usepackage`, des macros, etc. dont
  les sources `tex`/`texCor` de la banque ont besoin ;
- `preambule.typ` : code Typst inséré en tête du document généré (après les
  paquets fixes de MathALÉA) — pour ses propres fonctions ou imports Typst.

Chaque fichier n'est ajouté qu'une seule fois, même si plusieurs exercices de
la banque figurent dans la fiche.

Ce code est inséré tel quel dans le document compilé : comme pour les sources
`tex`/`typ` des exercices eux-mêmes, MathALÉA fait confiance au contenu d'une
banque que vous avez choisi d'installer. N'installez que des banques dont vous
connaissez la provenance.

## Fabriquer une banque

Un modèle de banque (arborescence de sources, script de construction autonome
en bash, README détaillé) est maintenu hors de ce dépôt ; la page d'aide
[coopmaths.fr/www/aide/banque-exercices](https://coopmaths.fr/www/aide/banque-exercices)
— également accessible via l'icône d'aide en haut à gauche de la modale —
pointe vers ce modèle et détaille la marche à suivre.

Le principe général : une arborescence `sources/` de fichiers `.typ` et/ou
`.tex`, dont les dossiers donnent les catégories, avec un en-tête de
commentaires en tête de chaque fichier (`//` en Typst, `%` en LaTeX) pour le
titre, les étiquettes et les étoiles :

```typst
// titre: Somme de deux fractions
// tags: fractions, addition
// etoiles: 2
```

Un script de construction compile les png (CLI `typst`, ou `pdflatex` +
`pdftoppm` pour les sources LaTeX), copie les sources, écrit le `manifest.json`
et produit une archive `dist.zip` à la racine — c'est cette archive que
MathALÉA récupère en priorité pour un dépôt de forge.

## Où cela se branche dans le code

| Fichier                                                                                     | Rôle                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/types/banquesExternes.ts`                                                          | types du manifest et des provenances                                                                                                                                         |
| `src/lib/components/banquesExternes.ts`                                                     | validation du manifest, uuid `bq-…`, construction du référentiel                                                                                                             |
| `src/lib/stores/banquesExternesStore.ts`                                                    | chargement zip/forge (archive `dist.zip` en priorité, repli `dist/`), banques intégrées (`chargerBanquesIntegrees`), persistance, référentiel courant                        |
| `src/lib/stores/banquesExternesDb.ts`                                                       | archives zip en IndexedDB                                                                                                                                                    |
| `src/json/banques/ffjm.manifest.json`                                                       | manifest versionné de la banque FFJM intégrée (généré par `pnpm update:ffjm`)                                                                                                |
| `tasks/update-ffjm.js`                                                                      | `pnpm update:ffjm` : télécharge `dist/manifest.json` de la forge et réécrit `src/json/banques/ffjm.manifest.json` (les fichiers d'exercices restent sur le serveur statique) |
| `src/main.ts`                                                                               | chargement des banques (intégrées puis installées) avant le premier rendu                                                                                                    |
| `src/components/setup/start/presentationalComponents/sideMenu/BanquesExternesDialog.svelte` | interface d'ajout et de retrait, bouton d'aide                                                                                                                               |
