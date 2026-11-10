# Stabilité des tirages des exercices

## Le problème

Les liens partagés par les utilisateurs contiennent l'`uuid` de l'exercice, la
graine du tirage (`alea=…`) et les paramètres choisis (`s=`, `s2=`, `s3=`). Un
professeur distribue un sujet, garde le lien du corrigé, et s'attend à retrouver
les mêmes valeurs des mois plus tard.

Or les exercices tirent leurs valeurs dans un générateur pseudo-aléatoire
initialisé par la graine : la suite des tirages est entièrement déterminée par
l'**ordre** des appels (`randint`, `choice`, `shuffle`…). Déplacer un tirage,
en ajouter un avant les autres, ou modifier un utilitaire partagé qui en
consomme, décale toute la suite. Même graine, mais plus les mêmes nombres : les
corrigés déjà distribués deviennent faux.

Corriger une coquille, reformuler une consigne ou refactoriser sans toucher aux
tirages ne pose en revanche aucun problème.

Supprimer un coefficient unité explicite (`1x` devient `x`, `-1x` devient
`-x`) peut toutefois modifier l'empreinte numérique : l'extracteur ne lit plus
le chiffre `1`. Comparer les mêmes graines et paramètres avec la version
publiée, et vérifier que les énoncés et corrections restent identiques une
fois ces coefficients rendus implicites. Si cette seule simplification
explique l'écart, mettre à jour l'empreinte ciblée sans archivage.

### Sélections dans un catalogue évolutif

Un exercice qui tire d'abord des sous-exercices dans un catalogue (par exemple
une sélection d'automatismes) a une deuxième source de dérive : ajouter un
élément à ce catalogue peut changer celui choisi pour une même graine. La
graine seule ne suffit donc pas à rejouer durablement une sélection.

Pour une URL ou une activité qui doit rester reproductible, enregistrer, lors
du premier tirage, les références exactes des sous-exercices retenus dans un
paramètre sérialisé et les réutiliser au rechargement. La graine sert alors
uniquement aux données internes de ces sous-exercices. Un ancien lien qui ne
contient pas cette liste reste soumis au catalogue disponible au moment de son
rechargement ; si l'on ne peut pas lui ajouter les références, la seule solution
de compatibilité est de conserver une version historique du sélecteur ou du
catalogue.

Lorsqu'un sous-exercice est archivé, son fichier contenant `old` peut encore
correspondre au motif d'import d'un sélecteur. Exclure les fichiers archivés du
catalogue des sous-exercices, y compris quand celui-ci est construit à partir
du référentiel. Si cette exclusion change les tirages déjà enregistrés, traiter
la dérive selon les règles ci-dessous avant de mettre à jour les empreintes.

Pour archiver un sélecteur après une modification de son catalogue, figer aussi
la liste historique **et la version du module associée à chaque référence**.
Un simple `-old.ts` qui relit le catalogue courant reproduirait la dérive. Les
sélecteurs `1a-automatismes-old.ts` et `3a-automatismes-old.ts` utilisent des
catalogues figés dans `src/lib/automatismesCatalogues/` ; les sélecteurs courants
ont de nouveaux `uuid`. Le cache des classes chargées doit distinguer les
entrées des deux catalogues, même lorsqu'elles portent la même référence.

### Mélanges par `sort(() => Math.random() - 0.5)`

Ce tri n'est pas portable : le résultat dépend de l'algorithme du moteur
JavaScript (V8 d'un côté, Firefox et Safari de l'autre), donc une même graine
peut donner des valeurs différentes selon le navigateur. Pour les exercices déjà
publiés qui l'utilisaient, `sortRandomlyLikeV8` (`src/lib/outils/arrayOutils.ts`)
reproduit le tri historique de V8 pour les tableaux de moins de 64 éléments,
dans tous les navigateurs. À partir de 64 éléments, elle délègue au tri natif
et reste donc dépendante du moteur.

Le test unitaire `tests/unit/sortRandomlyLikeV8.test.ts` vérifie les tableaux de
0 à 63 éléments sur 100 graines à partir d'empreintes figées dans
`tests/unit/sortRandomlyLikeV8.fixtures.ts`, obtenues avec le tri natif de
Node 22 (V8 12.4). Elles couvrent le résultat, le nombre d'appels aléatoires et
la valeur aléatoire suivante. Ne pas les régénérer avec le moteur courant :
le tri natif de Node 26 (V8 14.6) diffère et ne constitue plus la référence
historique. Pour les tableaux de 64 à 70 éléments, le test vérifie seulement
la délégation au tri natif courant.

Ne pas modifier l'algorithme de `sortRandomlyLikeV8`, et utiliser `shuffle`
dans les nouveaux exercices.

## La règle

> Pour un `uuid` et une graine donnés, les valeurs numériques de l'énoncé ne
> changent jamais. Si une correction doit les changer, elle change aussi
> son `uuid`.

Le test `tests/e2e/tests/stability/stability.test.ts` fait respecter cette
règle. Il rejoue chaque exercice avec une graine fixe et plusieurs combinaisons
de paramètres, en extrait l'empreinte des nombres de l'énoncé, et la compare à
celle enregistrée dans
`tests/e2e/tests/stability/empreintes-exercices.json`.

## Date de modification importante

`dateDeModifImportante` (au format `jj/mm/aaaa`) indique la date d'une
modification importante d'un exercice déjà publié : nouvelle option, nouvelle
saisie, correction changée, archivage. Elle se crée ou se met à jour à la date
du jour à chaque fois qu'une telle modification est faite, même si les tirages
ne changent pas. `pnpm archive` et `pnpm archive:retro` la posent pour le
fichier de travail ; pour une modification sans archivage, l'écrire à la main.

## Ce qui est contrôlé

### Les combinaisons de paramètres

Une graine suffit : un tirage déplacé décale les valeurs quelle que soit la
graine. En revanche, une dérive cachée derrière `if (this.sup === 3)` ne se voit
qu'en changeant de paramètre — et les liens partagés portent ces paramètres.
L'effort porte donc sur eux plutôt que sur la variété des graines.

Les combinaisons font varier **un paramètre à la fois** à partir des valeurs par
défaut : `''` (défaut), puis `s=1`, `s=2`, `s=3`, puis `s2=1`, `s2=2`, puis
`s3=1`, `s3=2`, selon ce que l'exercice déclare dans ses `besoinFormulaire*`.
Une combinaison qui redonnerait les valeurs par défaut est écartée. En pratique
cela fait quatre tirages par exercice en moyenne.

Ce sont toujours les **premières** valeurs (1, 2, 3…) et jamais un
échantillonnage : ajouter un niveau à un formulaire ne retire donc jamais de la
couverture aux niveaux déjà protégés. Le produit cartésien n'est pas exploré,
et `sup4`/`sup5` ne sont pas contrôlés.

### Les empreintes

Deux empreintes sont calculées par combinaison
(`tests/e2e/helpers/empreinteExercice.ts`).

| Empreinte | Contenu                                            | Effet         |
| --------- | -------------------------------------------------- | ------------- |
| `nb`      | la suite des nombres affichés dans l'énoncé        | **bloquante** |
| `tx`      | le texte normalisé de l'énoncé et de la correction | informative   |

Le calcul se fait sur le texte affiché : les balises SVG et HTML sont
supprimées, donc les coordonnées de figures et les identifiants n'entrent pas
dans l'empreinte, mais les étiquettes des figures (contenu des balises `<text>`)
si. Les nombres sont normalisés (`3,50` et `3.5` donnent la même empreinte,
comme `12-4` et `12 - 4`), ce qui laisse passer un changement de formatage. Le
signe fait partie du nombre : passer de `-7` à `7` est une dérive.

Une correction de séparateurs de classes mal placés peut modifier l'empreinte
`nb` sans modifier les valeurs tirées : l'extracteur peut avoir lu plusieurs
nombres dans l'ancien affichage. De même, passer une virgule décimale en mode
math (`3,14` écrit hors `$…$` devient `$3{,}14$`) coupe le nombre en deux pour
l'extracteur (`3` et `14`), comme un nombre dont les milliers sont séparés par
une espace (`2 560` ou `2\,560`). Vérifier les valeurs pour une même graine et
les paramètres concernés avant de mettre à jour les empreintes ciblées. Une
correction uniquement typographique ne nécessite pas d'archivage.

Le passage d'étiquettes SVG `<text>` à des mesures rendues par KaTeX peut aussi
modifier l'empreinte : le HTML de KaTeX contient plusieurs représentations d'une
même valeur (MathML, annotation LaTeX et rendu visuel). Comparer les mesures
visibles et les réponses avec la version publiée, pour les mêmes graines et
paramètres, avant de mettre à jour uniquement les empreintes concernées.

Rétablir une introduction ou une figure omise lors de l'agrégation peut aussi
ajouter des nombres à l'empreinte sans modifier les tirages. Comparer les
réponses, les corrections et les données CAN avec la version publiée, pour
les mêmes graines, paramètres et sélections de questions. Si seule la
restitution du contexte manquant change, mettre à jour uniquement la référence
concernée ; un changement des valeurs tirées reste soumis à l'archivage.

Conditions du tirage : mode non interactif, trois questions, une graine dérivée
de l'`uuid`.

## Lancer le test

```bash
pnpm stability:check
```

Sur un sous-ensemble, pendant le développement :

```bash
STABILITY_FILTER='6e/6N1' pnpm stability:check
STABILITY_UUIDS='2359a e528e' pnpm stability:check
```

En CI et en local sur une modification en cours, `CHANGED_FILES` restreint le
contrôle aux exercices concernés. Si un fichier de `src/lib/`, `src/modules/` ou
un fichier partagé de `src/exercices/` a bougé, tout le catalogue est contrôlé :
un utilitaire ou un parent partagé qui change ses tirages peut décaler tous ses
descendants.

La commande commence par `pnpm makeJson` afin de construire et mettre à jour
les catalogues JSON dont le test a besoin. Elle est donc exécutable directement
sur un nouveau checkout après l'installation des dépendances.

Le catalogue complet représente environ 4 400 exercices et 12 000 combinaisons,
pour deux à trois minutes d'exécution ; en mode `CHANGED_FILES` sur quelques
fichiers, quelques secondes.

## Où le test tourne

- en CI, dans le job `testExosModifiedConsolidated`, sur les fichiers modifiés
  de la merge request ;
- en local, dans `tasks/exoModified.sh`, avec les autres tests d'exercices ;
- à la demande, sur tout le catalogue, avec `pnpm stability:check` ;
- au pre-commit (`.husky/pre-commit` → `tasks/stability-precommit.js`), en
  mise à jour seulement : voir ci-dessous.

### Enregistrement automatique des nouveaux exercices

Au moment du commit, le hook lit l'`uuid` de chaque fichier indexé de
`src/exercices/` et cherche ceux qui sont **absents** du registre : nouvel
exercice, ou version de travail qui a reçu un `uuid` neuf avec `pnpm archive`.
Il lance alors `pnpm stability:update` restreint à ces seuls `uuid`
(`STABILITY_UUIDS`), soit une dizaine de secondes, et ajoute le registre au
commit. Sans nouvel `uuid`, il ne fait rien et ne coûte rien.

Une empreinte déjà enregistrée n'est jamais réécrite par le hook : une dérive
sur un exercice existant reste détectée par `pnpm stability:check` et la CI.

Le hook bloque le commit si l'empreinte ne peut pas être calculée (exercice qui
plante, référence en doublon signalée par `pnpm makeJson`…), ou si le registre
avait déjà des modifications non indexées (il ne les ajoute pas à la place du
développeur). Contournement ponctuel : `SKIP_STABILITY=1 git commit …`.

## Que faire quand le test échoue

Le test signale que les valeurs numériques d'un exercice ont changé. Trois
issues, dans cet ordre de préférence.

### 1. La dérive n'était pas voulue

C'est le cas le plus fréquent : un refactoring a déplacé un tirage sans qu'on y
prenne garde. Remettre les appels au générateur dans leur ordre d'origine. Les
appels ajoutés doivent l'être **après** ceux qui existent déjà, jamais avant ni
entre eux.

### 2. La modification est mineure et assumée

Un exercice tout juste publié, sans lien partagé dans la nature, ou une
correction d'un bug qui rendait l'énoncé faux de toute façon. Régénérer les
empreintes et expliquer le choix dans le message de commit :

```bash
pnpm stability:update
```

### 3. La modification change l'exercice en profondeur

C'est la règle du dépôt : la version publiée est archivée avec son `uuid`, la
version corrigée prend un `uuid` neuf. Tous les enfants de l'exercice doivent subir l'archivage car leur empreinte sera obsolète aussi.

```bash
pnpm archive 6N1E
pnpm makeJson
pnpm stability:update
```

(Le hook de pre-commit fait le `pnpm stability:update` si on l'oublie : le
fichier de travail a un `uuid` neuf, absent du registre.)

Le code d'exercice suffit ; on peut aussi passer le chemin complet
(`pnpm archive src/exercices/6e/6N1E.ts`).

Le script :

- recopie la version de `HEAD` dans `6N1E-old.ts` (`-old2.ts`, `-old3.ts`… si
  une archive existe déjà), avec son `uuid` d'origine et sans référence dans les
  menus (`'fr-fr': []`, `'fr-ch': ['NR']`) : les anciens liens continuent
  d'afficher exactement le même énoncé, l'exercice n'apparaît plus dans le
  référentiel ;
- donne un `uuid` neuf au fichier de travail, qui garde ses références et sa
  place dans les menus, et met à jour `dateDeModifImportante`.
- **détecte les descendants** : il liste les fichiers de `src/exercices/` qui
  importent l'exercice (enfants qui l'étendent, petits-enfants, classes
  intermédiaires sans `uuid`, archives `-old` qui l'importent encore) et affiche
  la commande `pnpm archive <enfant>` pour chacun. Il ne les archive pas
  lui-même : l'archive d'un enfant importe toujours le parent vivant, donc elle
  dérive avec lui ; c'est `pnpm archive:retro` qui sait figer un parent.

Les nouveaux utilisateurs voient la version corrigée, les anciens liens ne
cassent pas.

Pour vérifier de visu que seule la dérive assumée sépare les deux versions :

```bash
pnpm review:archives
```

La commande liste les archives de moins d'un mois (la plus récente en haut). On
choisit au clavier (↑/↓ puis Entrée) et la vue prof s'ouvre avec la version
courante puis l'archive à la suite. Elle a besoin d'un `pnpm dev` en cours et
d'un `pnpm makeJson` déjà passé (sinon l'`uuid` de l'archive n'est pas résolu).

### 4. La dérive est déjà commitée : `pnpm archive:retro`

`pnpm archive` suppose que `HEAD` contient encore la version publiée et le
working tree la version modifiée. Quand la modification est **déjà commitée**
(voire déployée), cette hypothèse tombe : la version publiée est en arrière dans
l'historique et il n'y a jamais eu de `-old.ts`. C'est le cas typique d'une
dérive introduite par un **utilitaire ou un exercice parent** modifié sans
penser aux exercices qui en héritent.

```bash
pnpm archive:retro 2N40-1
pnpm archive:retro 2N40-1 --changed-file src/exercices/4e/4C35.ts
pnpm archive:retro 2N40-1 --good-rev 02c15f53a --date 06/09/2026
```

Le script :

- retrouve la **dernière révision sans dérive** (« bonne révision »), soit avec
  `--good-rev <sha>`, soit en rejouant l'empreinte commit par commit sur
  l'historique du fichier fautif (le fichier d'exercice par défaut, ou celui
  passé à `--changed-file`) ; le commit juste après donne la date de dérive
  (surchargeable avec `--date`) ;
- fige à cette révision le fichier d'exercice **et**, en `-old.ts` frères, les
  fichiers d'exercices dont il hérite qui ont dérivé depuis, imports réécrits
  vers les `-old` correspondants. L'archive de l'exercice garde l'`uuid` publié ;
  les dépendances figées reçoivent un `uuid` neuf (le fichier vivant garde le
  sien). Une dépendance partagée `src/lib`/`src/modules` qui a dérivé est
  signalée mais pas gelée automatiquement — le plus souvent la dérive n'affecte
  que le mode interactif et la vérification finale passe quand même ;
- donne un `uuid` neuf au fichier de travail et cale `dateDeModifImportante` sur
  la date de dérive ;
- déplace l'entrée d'empreinte de l'`uuid` publié vers le fichier `-old`, puis
  relance `pnpm makeJson` et `pnpm stability:check` sur cet `uuid` pour vérifier
  que l'archive reproduit bien l'empreinte enregistrée (`--no-verify` pour
  sauter cette étape).

**Limite irréductible** : les liens créés **entre le commit de dérive et
l'archivage** ont été distribués avec les valeurs dérivées sous l'ancien `uuid`,
qui pointe désormais vers l'archive (valeurs d'origine). L'archivage rétroactif
ne peut pas les rattraper ; le script affiche cette fenêtre.

Ensuite, comme pour `pnpm archive` : `pnpm stability:update` (enregistre la
version courante), `pnpm review:archives`, `pnpm check` (une archive figée à une
révision ancienne peut demander un ajustement d'annotation de type — c'est le
comportement au tirage qui est gelé, pas les types), puis relecture du diff.

Si un parent a été renommé depuis la bonne révision, vérifier aussi les imports
de l'archive : le script peut ne pas retrouver une dépendance dont l'ancien
chemin a disparu. Dans ce cas, figer manuellement ce parent à la bonne révision,
vider ses références, lui attribuer un uuid neuf et faire pointer l'archive vers
cette copie. Vérifier ensuite l'empreinte de l'uuid publié avec
`STABILITY_UUIDS='<uuid publié>' pnpm stability:check`.

## Les uuid remplacés et la purge des archives

Une archive `-old.ts` garde l'ancien `uuid` aussi longtemps qu'on la conserve.
Sur le long terme, les anciens liens n'ont plus besoin de la version exacte :
la table `src/json/uuidsRemplaces.json` associe chaque ancien `uuid` à celui de
la version courante, ce qui permet de supprimer les archives sans casser les
liens.

```json
{ "5c321": "9d1e4", "67316": "5c321", "ab123": null }
```

- **Priorité au fichier** : l'app (`uuidCourant`, `src/lib/uuidsRemplaces.ts`)
  ne consulte la table que pour un `uuid` qui n'a plus de fichier. Tant que
  l'archive existe, les liens, les copies Capytale/Moodle et les QR codes
  gardent exactement leurs valeurs. L'`uuid` lu dans une URL est remplacé par
  celui de la version courante au chargement : les liens régénérés ensuite
  portent le nouvel `uuid`.
- **Valeur `null`** : exercice supprimé pour de bon, sans remplaçant.
- **Remplacement volontaire en vue professeur** : le moteur signale les
  archives par « ancienne version » dans le titre. Le bouton « Nouvelle
  version », disponible aussi sur mobile, remplace uniquement
  l'exercice concerné dans la liste. `uuidNouvelleVersion()` suit la table
  même si le fichier archivé existe encore ; aucun bouton n'est proposé sans
  successeur disponible. La graine et les réglages de présentation sont
  conservés, mais la référence, les formulaires `sup` à `sup5` et le choix
  QCM sont réinitialisés pour utiliser ceux de la nouvelle version. Le store
  `exercicesParams` déclenche le rechargement et la synchronisation de l'URL.
- **Alimentation** : `pnpm archive` et `pnpm archive:retro` ajoutent
  `ancien → nouveau` (et aplatissent les chaînes). Pour un archivage fait avant
  l'existence de la table, `pnpm uuids:rebuild` retrouve les successeurs : par
  l'historique git (changement de la ligne `export const uuid` d'un même
  fichier, retours arrière compris), puis par le nom du fichier. Il n'écrase
  jamais une entrée. Dans un clone partiel (`git fetch --unshallow` pour le
  compléter), certains successeurs restent introuvables ; ces archives sont
  alors conservées.
- **Garde-fou** : `pnpm uuids:check` (lancé par `pnpm stability:check`) échoue si
  un `uuid` présent dans `origin/main` (ou `BASE_REF`) n'a plus de fichier et
  n'est pas dans la table, ou si la table vise un `uuid` qui n'est pas celui
  d'un exercice courant. Un retour arrière qui supprime des `-old` et rend leur
  ancien `uuid` au fichier de travail doit donc conserver l'`uuid` de transition
  dans la table. Dans le pipeline d'une MR, `BASE_REF` est le point de départ de
  la branche (`CI_MERGE_REQUEST_DIFF_BASE_SHA`) : les exercices ajoutés sur
  `main` depuis ne comptent pas comme disparus.
- **Purge** : `pnpm archive:purge` liste les archives ajoutées dans git il y a
  plus d'un an (`--jours N` ou `--avant AAAA-MM-JJ`), `--appliquer` les
  supprime. Une archive reste si son `uuid` n'a pas de successeur dans la table
  ou si un fichier conservé la référence ; une dépendance figée sans `uuid` est
  supprimée quand plus rien ne la référence. La purge retire aussi leurs
  empreintes. Enchaîner ensuite `pnpm makeJson`, `pnpm uuids:check` et
  `pnpm stability:check`. À faire une fois par an, en été.

Limite : après la purge, un vieux lien affiche la version courante avec sa
graine d'origine ; les valeurs peuvent changer et les paramètres `s`, `s2`, `s3`
peuvent ne plus avoir le même sens.

## Le fichier d'empreintes

`tests/e2e/tests/stability/empreintes-exercices.json` tient une ligne par
exercice, indexée par `uuid` :

```json
{
  "2359a": {
    "ex": "6e/6N1E.ts",
    "v": { "": "86ad1f3b:1c40a2e5", "s=2": "…:…", "s=3": "…:…" }
  }
}
```

La clé de `v` reprend les paramètres d'URL (`''` pour les valeurs par défaut) et
la valeur vaut `"<nb>:<tx>"`.

Il fait partie du dépôt, et c'est volontaire : une ligne qui change dans un diff
est le signal visible qu'un exercice ne rendra plus les mêmes valeurs. Une
relecture doit s'y arrêter. Le fichier tient une ligne par exercice pour qu'une
dérive apparaisse comme une seule ligne modifiée.

Une entrée absente fait échouer le contrôle : après l'ajout d'un exercice ou
d'une combinaison de paramètres, lancer `pnpm stability:update` et ajouter le
registre au commit. Une combinaison présente dans le registre mais que
l'exercice ne propose plus est également bloquante : les liens qui l'utilisaient
n'affichent plus la même chose.

## Exercices qui bouclent sur un réglage

Certains exercices contiennent une boucle de rejet non gardée : ils tirent
jusqu'à trouver une valeur acceptable, et pour certains réglages proposés à
l'utilisateur cette valeur n'existe pas. La génération ne s'arrête alors jamais.

Le test compte les appels à `Math.random` pendant chaque génération et
abandonne au-delà de `MAX_TIRAGES_PAR_GENERATION`
(`tests/e2e/helpers/empreinteExercice.ts`). La combinaison fautive fait échouer
le contrôle afin qu'un réglage qui fige le navigateur ne puisse pas être ignoré :

```
❌ Impossible de contrôler la combinaison de paramètres :
  - 3e/3G10-2.ts (d5f34) : s=8 : plus de 2000000 tirages aléatoires consommés
```

Ces signalements sont des **bugs d'exercices**, pas des faux positifs du test :
le réglage en cause est atteignable depuis le formulaire, et un utilisateur qui
le choisit fige son navigateur. Ils se corrigent à part, dans l'exercice.

## Limites

- Les entrées techniques du catalogue (`apps/`, `ressources/` et outils Svelte)
  sont explicitement exclues, ainsi que tous les sélecteurs `*-automatismes`
  (`1a-`, `2a-`, `3a-`, `6a-automatismes`, archives `-old` comprises) : leur
  catalogue évolue à chaque ajout d'automatisme, ce qui les faisait échouer sans
  qu'un tirage ait été déplacé. Un exercice ordinaire qui ne se charge pas dans
  l'environnement de test fait échouer le contrôle.
- Une seule graine par exercice : une dérive qui ne se manifesterait que pour
  certaines valeurs tirées peut passer inaperçue.
- Le garde-fou ne détecte que les boucles qui consomment de l'aléatoire. Une
  boucle infinie qui n'en tire pas figerait toujours la suite.
- Un paramètre à la fois : une dérive qui n'apparaît qu'avec un croisement
  précis (`s=2` **et** `s2=3`) n'est pas vue, pas plus que celles liées à
  `sup4`/`sup5`.
- Les coordonnées internes des figures ne sont pas dans l'empreinte, seules
  leurs étiquettes le sont.
- L'empreinte `tx` n'est pas bloquante : un changement de texte à valeurs
  constantes est signalé, jamais refusé.
