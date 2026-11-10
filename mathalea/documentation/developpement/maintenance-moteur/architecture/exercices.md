# Architecture des exercices

MathALÉA génère des exercices capables de produire plusieurs sorties : HTML interactif ou non interactif, LaTeX, exports et rapports de test.

## Emplacement

Les exercices non statiques sont principalement dans `src/exercices/`. Les helpers transverses sont dans :

- `src/lib/` pour les fonctions et composants utilitaires ;
- `src/modules/` pour des classes et modules partagés ;
- `src/components/` pour l'interface Svelte ;
- `src/lib/interactif/` pour les formats interactifs.

## Cycle de génération

Un exercice construit une version dans `nouvelleVersion()`. Cette méthode prépare généralement :

- les données aléatoires ;
- `listeQuestions` et `listeCorrections` ;
- les informations d'interactivité dans `autoCorrection` via `handleAnswers()` ou via les helpers QCM ;
- les métadonnées de l'exercice : titre, nombre de questions, paramètres, références.

La génération doit rester déterministe pour une graine donnée et éviter les doublons avec les mécanismes existants comme `questionJamaisPosee()`.

### Sélections d'automatismes asynchrones

`src/exercices/_automatismesCan.ts` charge les classes sélectionnées à la
demande. Chaque instance possède une révision de génération : seule la dernière
révision peut appliquer ses questions, corrections et paramètres, puis émettre
`updateAsyncEx`. Une nouvelle génération depuis le cache invalide aussi les
chargements précédents, tout en restant synchrone et sans émettre cet événement.
`destroy()` invalide les résultats encore en attente. Les imports obsolètes
peuvent alimenter le cache partagé, mais ne modifient plus l'instance.

`generationStatus` passe de `loading` à `ready` après la construction des
questions, ou à `error` si le chargement courant échoue. L'événement
`updateAsyncEx` porte l'instance dans `detail.exercise` afin que la vue professeur
ne rafraîchisse que l'exercice concerné. La vue publie ensuite son propre état
de rendu, après l'initialisation interactive ; voir le
[test des erreurs console](../../../tests/erreurs-console-e2e.md#5-profils-et-interactions-avec-la-page).

Les scénarios de résolution dans le désordre, de cache, d'erreur et de destruction
sont couverts par `tests/unit/automatismesGeneration.test.ts`.

## Sorties HTML et LaTeX

Les exercices doivent tenir compte du contexte de rendu. Le HTML peut accepter des composants interactifs ou des éléments de formulaire ; le LaTeX doit rester imprimable et lisible.

Quand une question possède un rendu interactif, prévoir une alternative non interactive : texte, QCM équivalent, correction détaillée ou figure statique.

`deuxColonnesResp()` (`src/lib/format/miseEnPage.ts`) utilise la classe
`.cols-responsive`, définie dans `src/app.css`, sans ajouter de bloc `<style>`
aux énoncés. Sans `eleId` (ou avec une chaîne vide), les colonnes ne portent
pas d'identifiant ; fournir un `eleId` distinct pour chaque énoncé et chaque
correction lorsqu'un callback doit les retrouver.

`MetaExerciceCan` transmet son `numeroExercice` à la génération des
sous-exercices. Pour les identifiants propres à une mise en page, utiliser aussi
`indexQuestionHote ?? i` comme rang : plusieurs sous-exercices sont générés
localement au rang zéro dans une même composition.

## Classes d'exercices

Les exercices classiques héritent de la classe commune `Exercice` définie dans `src/exercices/Exercice.ts`. Des helpers spécialisés existent pour des besoins récurrents, par exemple les QCM dans `src/lib/interactif/qcm.ts` et `src/lib/interactif/qcmBuilder.ts`. Avant de créer une nouvelle classe, vérifier les modèles et usages existants dans `src/exercices/` et `src/lib/`.

## Interactivité et correction

### Introduction et questions affichées séparément

`Exercice.introduction` contient le contexte commun placé entre la consigne
et les questions ; il reste distinct de `listeQuestions`. La vue élève
classique (`ExerciceMathaleaVueEleve.svelte`) affiche ces deux propriétés avant
la liste.

`composeQuestionContext()` (`src/lib/components/questionContext.ts`) compose
les parties non vides dans l'ordre consigne, introduction, puis énoncé éventuel,
avec un saut de ligne entre elles.

La vue `QuestionParPage.svelte` affiche ce contexte pour chaque question :
`splitExercisesIntoQuestions()` (`src/lib/components/exercisesUtils.ts`)
prépare une entrée de `consignes` par question. `QuestionContext.svelte` affiche
uniquement le contexte de la page active, au-dessus de l'énoncé. Les exercices
de type `html` suivent une autre voie et sont confiés à `Exercice.svelte`.

Le contexte est monté une seule fois dans le DOM. Lors du passage entre deux
questions du même exercice partageant exactement le même contexte, la figure
dynamique éventuelle conserve son instance et son état. Un changement de
contexte ou d'exercice détruit l'ancien bloc et monte le nouveau : les custom
elements exécutent leurs callbacks de déconnexion et de connexion. Revenir à
un contexte quitté le reconstruit ; son brouillon dynamique est réinitialisé.
Cela évite de dupliquer les identifiants d'une introduction dans les pages
masquées.

Le bouton « Recommencer » régénère uniquement la question ciblée : énoncé,
correction, réponse, consigne, introduction et consigne de correction sont
actualisés ensemble. Le contexte des autres questions reste celui de leur
tirage initial ; il ne faut donc pas remplacer l'introduction globale de
l'exercice par celle du tirage temporaire.

`MetaExerciceCan.ts` réhéberge une question par sous-exercice. Il ajoute le
contexte du sous-exercice une seule fois après la construction de l'énoncé,
y compris pour les simples, classiques, custom elements et QCM. La version
QCM d'un exercice simple applique également cette composition avant sa sortie
anticipée. Les identifiants des composants du contexte et les index des
figures apiGeom sont réindexés vers la question hôte. Les énoncés CAN
(`canEnonce` et `listeCanEnonces`) restent un contenu distinct, rédigé par le
sous-exercice pour les tableaux CAN.

Les tests `tests/unit/metaQuestionContext.test.ts` et
`tests/unit/components/questionParPageContext.test.ts` couvrent la transmission
et la régénération du contexte ;
`tests/unit/components/questionContext.test.ts` vérifie la conservation et la
destruction de l'instance dynamique.

L'interactivité moderne passe par `handleAnswers()` dans
`src/lib/interactif/gestionInteractif.ts`. Les formats et le pipeline sont
décrits dans [système d'interactivité](../interactivite/systeme-interactivite.md).

## Paramètres d'URL

`mathaleaUpdateExercicesParamsFromUrl()` (`src/lib/mathalea.ts`) lit l'URL.
Chaque `uuid=` (ou `id=` sans `uuid` qui précède) ouvre un nouvel exercice ;
les paramètres qui suivent s'y rapportent jusqu'au suivant.

| Paramètre | Portée | Rôle |
| --- | --- | --- |
| `uuid` | exercice | identifiant permanent de l'exercice |
| `id` | exercice | référence choisie dans le référentiel ; avec `uuid`, elle est conservée si elle correspond à cet UUID |
| `n` | exercice | nombre de questions |
| `s`, `s2` … `s5` | exercice | valeurs des formulaires de paramètres (`sup` … `sup5`) |
| `alea` | exercice | graine du tirage aléatoire |
| `i` | exercice | interactivité (`0` ou `1`) |
| `cd` | exercice | correction détaillée (`0` ou `1`) |
| `qcm` | exercice | version QCM (`0` ou `1`) |
| `calc` | exercice | calculatrices autorisées en vue élève : `0` aucune (valeur par défaut, absent de l'URL), `1` calculette, `2` calculatrice collège, `3` calculatrice lycée, `9` toutes |
| `coef` | exercice | coefficient du barème |
| `cols` | exercice | nombre de colonnes |
| `d` | exercice | durée par question en diaporama |
| `v` | global | vue (`eleve`, `diaporama`, `latex`, `typst`, `can`…) |
| `es` | global | réglages de la vue élève (voir ci-dessous) |
| `title` | global | titre de la vue élève |
| `z` | global | zoom |
| `dGlobal`, `dCorr`, `shuffle`, `select`, `order` | global | réglages du diaporama |
| `recorder` | global | plateforme hôte (`capytale`, `moodle`, `anki`…) |
| `iframe` | global | identifiant d'intégration, conservé dans les URL régénérées |
| `beta` | global | ouvre les vues encore en test (`quizzconf`, `omr`…) |
| `triche` | global, `localhost` | affiche les réponses attendues dans la console |
| `cor` | global, `localhost` | affiche l'énoncé et la correction de tous les exercices (relecture) |

La valeur de `alea` et des `s…` fait partie des liens partagés : voir
[Stabilité des tirages](../../../tests/stabilite-exercices.md).

## Synchronisation de l'URL

Les composants qui modifient le store `exercicesParams` doivent appeler `exercicesParams.update()`, sans réécrire eux-mêmes l'URL. `App.svelte` centralise cette synchronisation via son abonnement au store. Les appels explicites à `mathaleaUpdateUrlFromExercicesParams()` restent réservés aux tableaux de paramètres qui ne sont pas le store global.

### Le paramètre `es` (réglages de la vue élève)

Le store `globalOptions` (`src/lib/stores/globalOptions.ts`) contient les réglages de la vue élève classique (présentation, interactivité, corrections). Plutôt qu'un paramètre d'URL par réglage, ces booléens/énumérations sont compressés dans une seule chaîne `es` : un caractère par réglage, dans un ordre fixe.

- Construction : `buildEsParams()` dans `src/lib/components/urls.ts`. Chaque réglage est ajouté à la chaîne dans l'ordre `presMode|setInteractive|isSolutionAccessible|isInteractiveFree|oneShot|twoColumns|isTitleDisplayed|isReferenceDisplayed|isCorrectionOnlyOnError` ; un dixième caractère facultatif, `calculatricesForcees`, n'est ajouté que s'il impose une calculatrice (voir ci-dessous), et un onzième, `isCheckPerQuestion`, n'est ajouté que s'il est activé (le dixième vaut alors `-` si aucune calculatrice n'est forcée).
- Décodage : la fonction `mathaleaUpdateExercicesParamsFromUrl()` dans `src/lib/mathalea.ts` lit `es` et affecte chaque caractère (`es.charAt(i)`) au réglage correspondant.
- Rétrocompatibilité : le décodage teste `es.length` (6, 7, 8, 9, 10 ou 11 caractères actuellement) et choisit la branche qui correspond, pour que les anciennes URLs partagées (avec moins de réglages) restent valides. Chaque nouvelle branche reprend le décodage complet des caractères précédents avant d'ajouter le nouveau.

Pour ajouter un nouveau réglage `es` :

1. Ajouter le champ à `InterfaceGlobalOptions` dans `src/lib/types.ts` et sa valeur par défaut dans `src/lib/stores/globalOptions.ts`.
2. Ajouter un caractère à la fin de la chaîne dans `buildEsParams()`.
3. Ajouter une nouvelle branche `es.length === N` (N = longueur actuelle + 1) dans `mathaleaUpdateExercicesParamsFromUrl()`, sans modifier les branches existantes, et inclure le nouveau champ dans l'objet retourné par la fonction.
4. Ajouter le toggle correspondant dans la section concernée de `src/components/setup/configEleve/sections/` (`ReglagesPresentation`, `ReglagesInteractivite`, `ReglagesCalculatrices`, `ReglagesCorrection`, `ReglagesAffichage`, `ReglagesDonnees` ou `ReglagesCan`), en suivant le pattern `ButtonToggleAlt` existant. Ces sections sont partagées par la page de configuration du lien élève (`ConfigEleve.svelte`) et par la modale de réglages de la séance Capytale (`ModalCapytalSettings.svelte`) : le nouveau réglage apparaît donc aux deux endroits. Si Capytale impose sa valeur (comme la présentation « une page par exercice » ou `isInteractiveFree`), le masquer avec `{#if mode === 'lien'}` (prop `mode: 'lien' | 'capytale'`, voir `sections/types.ts`).

### Calculatrices autorisées (vue élève)

La liste déroulante « Calculatrices disponibles » du panneau `Settings` (vue prof uniquement, prop `isCalculatriceProposee`) écrit `calc` (`0`, `1`, `2`, `3` ou `9`, voir `src/lib/calculatrices.ts`) dans `InterfaceParams` ; elle vaut « Aucune calculatrice » par défaut. `Eleve.svelte` affiche alors, à côté du zoom, uniquement les boutons des calculatrices autorisées, dans l'ordre calculette, NumWorks collège, NumWorks lycée et le widget `TbiCalculatorWidget` (store `eleveCalculatrices`, indépendant de `tbiState`). La disponibilité suit l'exercice affiché : exercice courant en `un_exo_par_page`, exercice de la question courante en `une_question_par_page`, et dès qu'un exercice l'autorise quand plusieurs sont affichés ensemble. Hors d'un exercice autorisé, le widget est masqué sans être démonté, pour retrouver son état au retour. Les exercices statiques (sans panneau `Settings`) ne portent pas ce réglage.

La page de configuration du lien élève (`ConfigEleve.svelte`) et la modale de la séance Capytale (section `ReglagesCalculatrices.svelte`) propose en plus un réglage global, `globalOptions.calculatricesForcees`, qui passe outre les `calc` individuels : `-` (valeur par défaut) les laisse tels quels, `0`, `1`, `2`, `3` ou `9` s'appliquent à tous les exercices (`0` retire donc toute calculatrice, même là où un exercice en autorise). Il est porté par le dixième caractère de `es` ; `codesCalculatricesEffectifs()` (`src/lib/calculatrices.ts`) fait la substitution dans `Eleve.svelte`.

### Accès aux corrections et `localStorage`

`isSolutionAccessible` (caractère 2 de `es`) est sérialisé en clair : un élève
peut réactiver l'accès aux corrections en éditant l'URL d'un lien partagé sans
correction (voire en retirant `v=eleve` pour passer en vue prof). Plusieurs
garde-fous côté navigateur limitent l'intérêt de la manipulation.

- **Corrections déjà consultées.** Quand l'élève affiche une correction,
  `ExerciceMathaleaVueEleve.svelte` écrit `localStorage["<id>|<graine>"] =
  "true"`. `generateFreshSeed()` évite ces graines lors d'un « Nouvel énoncé »,
  et les bascules d'interactivité rebattent une graine si l'élève retombe
  dessus.
- **Énoncés servis sans correction.** `src/lib/stores/correctionGuard.ts`
  mémorise chaque `(<id>, <graine>)` affiché à l'élève quand
  `isSolutionAccessible` est faux (clé préfixée `mathalea-sans-correction:`,
  pour ne pas entrer en collision avec la clé précédente). La mémorisation se
  fait dans `updateInterfaceParamsAndReLoadExerciseIfNeed()` de la vue élève
  (donc aussi après un « Nouvel énoncé »). Si l'élève revient ensuite sur l'un
  de ces énoncés avec la correction potentiellement accessible, le `onMount`
  rebat une nouvelle graine (via `pickSeedNotServedWithoutCorrection()`) : il
  ne peut plus obtenir la correction exacte de la copie qu'il a rendue. Ce
  garde-fou est appliqué **dans les deux vues** :
  - `ExerciceMathaleaVueEleve.svelte` : URL `es` bricolée pour réactiver
    `isSolutionAccessible` (`generateFreshSeed()` évite aussi ces graines) ;
  - `ExerciceMathaleaVueProf.svelte` : URL sans `v=eleve`, qui bascule sur la
    vue prof où la correction est toujours affichable.

  Le rebattage ne touche que les `(<id>, <graine>)` réellement servis sans
  correction dans ce navigateur : une graine fraîche d'auteur n'est jamais
  concernée.

- **Retour aux réglages.** Le bouton maison (`BtnRetourReglages` dans
  le pied de page de `Eleve.svelte`, petit et estompé pour éviter les clics par erreur) ramène à la vue prof ; il est masqué quand
  `isSolutionAccessible` est faux, sinon il offrirait un accès en un clic.

Ces mécanismes sont désactivés pour `presMode` `recto`/`verso` (feuilles
imprimables, corrigé volontaire). Les vues `une_question_par_page`
(`QuestionParPage.svelte`) et `cartes` ne sont pas couvertes. Aucun de ces
garde-fous n'est un verrou : un autre navigateur, un autre profil ou un
effacement du `localStorage` les contourne. Un verrou réel demanderait une
signature du lien côté serveur.

## Tests

Les tests et rapports sont décrits dans
[tests et CI](../../../tests/README.md). Avant commit, la commande de référence
pour les tests unitaires est :

```sh
pnpm prebuild-unit-tests
```

Pour les changements TypeScript ou Svelte, lancer aussi :

```sh
pnpm check
```

### Vérification question par question (`isCheckPerQuestion`)

Dans la vue élève, un exercice interactif est normalement vérifié d'un seul coup (bouton « Vérifier » unique, `exerciceInteractif()` dans `src/lib/interactif/gestionInteractif.ts`). Avec `isCheckPerQuestion` (11ᵉ caractère facultatif de `es`, toggle « Vérifier question par question » dans `ConfigEleve.svelte` et dans la modale de réglages Capytale), `ExerciceMathaleaVueEleve.svelte` ajoute un bouton « Vérifier » sous chaque question (`Question.svelte`) :

- la question est corrigée par `verifQuestionExercice()`, la même fonction que celle utilisée par `exerciceInteractif()` ; ses champs sont verrouillés et sa correction (si `isSolutionAccessible`) s'affiche aussitôt. Le bouton est placé à la suite du contenu de la question, donc sur la ligne du champ de réponse quand il y a la place ;
- le score de l'exercice n'est calculé, affiché (sous l'exercice et dans l'onglet de la vue « un exercice par page ») et transmis à Moodle ou Capytale (`resultsByExercice`) que lorsque toutes les questions sont vérifiées : la vérification de la dernière question a donc le même effet que « Tout vérifier ». Avant cela, une question n'affiche que son smiley, son feedback et sa correction, et un « Score : x / y » seulement si elle peut rapporter plus d'un point ;
- le bouton `#buttonScoreEx{i}` est conservé, sous le libellé « Tout vérifier » : il vérifie les questions restantes, et reste le point d'entrée des composants externes (relecture Capytale, FlowMath, Labyrinthe, Juniper Green) ;
- la vérification ne s'applique que si l'exercice est interactif, a plusieurs questions et autant d'entrées dans `autoCorrection` que dans `listeQuestions` ; sinon le bouton unique est conservé ;
- le bloc bouton/score d'une question porte la classe `katex-ignore` (`ignoredClasses` dans `src/lib/latex/Katex.ts`) : sans elle, l'auto-render KaTeX remplace les nœuds texte vides qui servent d'ancres aux blocs `{#if}` de Svelte et vide le bloc. À appliquer à toute zone d'interface Svelte ajoutée dans le contenu d'un exercice.

Le mode « une question par page » (`QuestionParPage.svelte`) vérifie déjà chaque question séparément et n'est pas concerné.

Hors interactivité, la même option permet de dévoiler les corrections progressivement
avec un bouton « Correction pas à pas » dans la barre d’actions de chaque exercice.
Chaque clic dévoile la correction suivante dans `Question.svelte` ; un triangle
discret permet ensuite de replier ou rouvrir chaque correction dévoilée. Les
corrections suivantes n’occupent aucune place avant leur dévoilement. Le bouton
est désactivé une fois la dernière correction dévoilée. Elle reste accessible
lorsque l'interactivité est désactivée. Les corrections doivent être autorisées
(`isSolutionAccessible`) et le bouton de correction autorisé par l'hôte ; les modes
recto et verso conservent leur affichage habituel.

`progressiveCorrection.ts`, à côté du composant, associe les items de l'unique liste
ordonnée de premier niveau de l'énoncé à ceux de la correction lorsque classe,
type, premier numéro et nombre d'items correspondent (par exemple TSA5-41).
Chaque sous-question reçoit alors son volet ; les listes imbriquées restent
intactes. Les explications communes sont reprises dans chaque volet et la
conclusion dans le dernier. Sans correspondance certaine, un volet porte sur
la question entière. « Voir la correction » dans la barre d'outils affiche toujours
la correction complète. Consulter un volet mémorise la graine comme une correction
consultée, afin de renouveler l'énoncé lors du passage en interactif.

L’énoncé est injecté par une action Svelte dans un conteneur dédié : KaTeX
réécrit ses nœuds sans affecter les bornes d’un bloc `{@html}`. Les bascules
entre correction complète et progressive remplacent ainsi tout le contenu,
sans conserver de corrections dupliquées ni leur espace dans la page.

Ce découpage concerne uniquement l'affichage HTML en vue élève : les exercices,
leurs tirages et les sorties LaTeX/Typst ne sont pas modifiés.
