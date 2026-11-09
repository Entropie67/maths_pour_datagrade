# Vue Typst

La vue Typst (`v=typst` dans l'URL) génère une fiche d'exercices au format [Typst](https://typst.app/docs/), compilée directement dans le navigateur. Elle est accessible depuis les boutons d'export de la page d'accueil.

## Interfaces

Trois modes d'affichage, mémorisés dans `localStorage` (`mathaleaTypstView`) :

- **Code** : l'éditeur (CodeMirror) seul ;
- **Côte à côte** : le code à gauche, l'aperçu à droite ;
- **Aperçu** : le document compilé seul.

Le code est éditable : chaque modification recompile le document (débounce de 500 ms) et met à jour l'aperçu, en conservant le dernier rendu valide en cas d'échec.

En tête du panneau « Réglages du document », `shared/ExportViewLinks.svelte`
affiche des liens vers les trois autres exports Typst —
[Flash-cards](flashcards.md), **J’ai… qui a… ?** et
[Diaporama PDF](diaporama-pdf.md) — qui reprennent les exercices en place
(`$globalOptions.v`), sans repasser par la page d'accueil. Le même composant
équipe les quatre vues, chacune montrant les trois autres.

## Éditeur de code

L'éditeur est CodeMirror 6, configuré par `editor/typstEditorSetup.ts` (`typstEditorExtensions()`) : numéros de lignes, coloration syntaxique Typst, repliage, curseurs multiples, recherche, et thème clair ou sombre suivant celui de l'application (compartiment reconfiguré par `setEditorTheme`, appelé depuis un `$effect` sur le store `darkMode`).

- **Coloration syntaxique** : `editor/typstLanguage.ts` définit un `StreamLanguage` Typst (tokeniseur ligne à ligne, pas un analyseur complet) couvrant commentaires, balisage (titres, listes, gras, italique, littéral), mode code après `#` et formules `$…$`. Les noms de jetons émis sont des noms de tags standard, colorés tels quels par `oneDark` (sombre) et `defaultHighlightStyle` (clair). Le `languageData` fournit les jetons de commentaire, ce qui active « commenter / décommenter » (Ctrl/Cmd + /).
- **Raccourcis** : ceux de `defaultKeymap`, `searchKeymap`, `historyKeymap` et `foldKeymap`, plus quelques ajouts (Ctrl/Cmd + Entrée pour compiler sans attendre le débounce, Ctrl/Cmd + Maj + D pour dupliquer une ligne, Ctrl/Cmd + L pour sélectionner la ligne, Ctrl/Cmd + Alt + ↑/↓ pour ajouter un curseur). Pas de Ctrl/Cmd + S : Safari ouvre sa boîte d'enregistrement de page avant même que l'événement clavier n'atteigne la page, `preventDefault()` ne peut donc rien y changer. Le bouton « Raccourcis » de la barre d'outils (modes Code et Côte à côte) en affiche la liste, avec la touche de modification adaptée à la plateforme.
- **Interface en français** : `editor/editorPhrases.ts` traduit les chaînes de CodeMirror via `EditorState.phrases` (panneau de recherche de Ctrl/Cmd + F, boîte « Aller à la ligne » de Alt + G, annonces pour lecteurs d'écran).
- **Sélection** : `app.css` redéfinit globalement `::selection` avec une couleur de texte noire, illisible sur le fond sombre de l'éditeur. `drawSelection()` dessine le fond de sélection et un correctif de thème (`Prec.highest`) rétablit `color: inherit` sur le texte sélectionné.
- **Repliage** : il n'y a pas d'arbre syntaxique exploitable, le `foldService` se fonde donc sur l'indentation — ce qui correspond à la structure du code généré (exercices, corrections et listes de questions sont des blocs indentés).

## Réponses mises en évidence (orange et gras)

`miseEnEvidence()` produit `{\color{#F15929}\boldsymbol{…}}`. Le convertisseur
`latexToTypst.ts` restitue la couleur, le gras et un léger contour qui épaissit
également les opérateurs, parenthèses et radicaux (sans variante grasse dans
certaines polices de maths).

`typstHighlights.ts` factorise ce style lors de l’assemblage de la fiche et
des exercices autonomes : `$evidence(x = 2)$` remplace les longs appels
à `text(fill: …, stroke: …)`. La fonction `evidence` est définie une seule
fois dans le préambule, uniquement quand le contenu l’utilise. L’orange
`#F15929` est sa couleur par défaut ; les autres couleurs restent explicites,
par exemple `$evidence(couleur: #rgb("#216D9A"), x)$`. Cette fonction
utilise uniquement Typst et conserve le même rendu.

## Copier et télécharger un code Typst propre

Dans les modes **Code** et **Côte à côte**, **Copier le code Typst propre**
copie toute la fiche avec son préambule. **Télécharger le .typ** utilise le
même code ; si des images externes sont nécessaires, le téléchargement
fournit une archive ZIP contenant le `.typ` et ses images.

`buildExportCode` nettoie le texte actuel de l’éditeur avec
`cleanTypstExport` (`typstExport.ts`), sans reconstruire la fiche depuis les
exercices. Les retouches libres du préambule, des énoncés, des corrections et
des blocs de rendu sont donc conservées, ainsi que tous les sujets, quel que
soit celui montré dans l’aperçu.

Le nettoyage retire la définition et les appels des repères invisibles
`mathalea-anchor`, ainsi que les commentaires réservés `// mathalea:…`.
Les chaînes, exemples de code brut et commentaires personnels sont protégés.
Les variables de mise en page et les fonctions nécessaires au rendu restent
dans le préambule : ce sont des réglages Typst ordinaires, utilisables et
modifiables dans un autre éditeur. Elles ne sont pas remplacées par des
valeurs littérales pour respecter les expressions personnalisées et leurs
dépendances.

`buildTypstDocument(..., { exportMode: true })` reste disponible pour les
exports reconstruits depuis les données des exercices : il émet directement
des valeurs littérales de colonnes et d’espacements, sans repères de palette.

## Réglages numériques de mise en page

`normalizeTypstLayoutOptions` valide la taille du texte, l'interligne et les
espacements entre mots, exercices et questions. Un champ numérique vide ou
invalide reprend sa valeur par défaut : `null`, `undefined`, les valeurs non
finies et négatives ne doivent pas être interpolées dans le code Typst
(`nullem`, `undefinedpt`…). Les espacements nuls sont conservés ; la taille du
texte doit être strictement positive.

Cette normalisation s'applique aux préférences et liens restaurés, à la
validation des réglages dans `Typst.svelte`, ainsi qu'aux deux générateurs
`buildTypstDocument` et `buildStandaloneExerciseCode`, pour protéger aussi les
exports autonomes.

## Colonnes des questions rédigées

En mode automatique, une liste dont une question ou une correction comporte
plusieurs paragraphes (`<br><br>` ou paragraphes HTML successifs) utilise une
seule colonne. Cela évite les mesures répétées de `taskize` sur de longues
démonstrations, qui peuvent provoquer un plantage du compilateur du navigateur
avec une fiche volumineuse. Les énoncés et les corrections sont traités
indépendamment. Un nombre de colonnes choisi explicitement reste prioritaire.
Les listes courtes conservent le calcul automatique des colonnes.

## Erreurs de compilation

`typstDiagnostics.ts` transforme les lignes brutes renvoyées par le compilateur (format « unix » : `main.typ:ligne:colonne[-ligne:colonne]: sévérité: message`, positions comptées à partir de 1) en `TypstDiagnostic` : position, sévérité, message traduit en français et piste de résolution. La table de règles (`RULES`) va du plus spécifique au plus général ; un message non couvert reste affiché en anglais, jugé plus utile qu'une approximation, et le message d'origine reste consultable dans le panneau. Un même message répété sur une même ligne n'est affiché qu'une fois, et un diagnostic venant d'un paquet importé est signalé comme tel (sa ligne ne correspond à rien dans l'éditeur).

Côté interface (`Typst.svelte`) :

- le panneau de diagnostics est sous les deux volets, donc visible aussi en mode « Code » ; il se replie, et se rouvre dès qu'une nouvelle erreur apparaît ;
- chaque diagnostic est cliquable (« ligne N ») et amène le curseur sur la position concernée (`revealPosition`), en basculant en « Côte à côte » si on était en « Aperçu » ;
- les lignes fautives sont surlignées dans l'éditeur et marquées d'une pastille dans une marge dédiée (`setEditorMarkers`) ; pendant la frappe, les marqueurs suivent les décalages de lignes jusqu'à la compilation suivante ;
- quand la compilation échoue, un bouton **« Revenir à la dernière version qui compilait »** rétablit le dernier code ayant produit un document (`lastGoodCode`, mémorisé à chaque compilation réussie). L'opération passe par l'historique de CodeMirror : elle est annulable par Ctrl/Cmd + Z.

## Double-clic sur l'aperçu : aller au code

Un double-clic sur l'aperçu (`jumpToSourceFromClick` dans `Typst.svelte`) bascule en « Côte à côte » (si on était en « Aperçu ») et amène le curseur sur l'exercice ou la correction affiché au point cliqué :

1. le clic est converti en coordonnées SVG (mêmes unités que les repères de la palette de mise en page, voir `computeOverlayWidgets`) ;
2. la page cliquée est retrouvée dans `previewPages`, puis le dernier repère `exo`/`corr` (parmi ceux publiés par `buildTypstDocument`, voir la section « Palette de mise en page ») rencontré avant le point cliqué dans l'ordre de lecture (page, colonne, ordonnée — `locateSectionAnchor` dans `overlaySections.ts`) détermine l'exercice ; au-dessus du premier exercice (en-tête), c'est le premier exercice qui suit ;
3. `findExerciseSourceLine` cherche la ligne où le contenu est réellement éditable. Pour un énoncé, c'est le titre `// ----- Exercice N -----` de sa définition (`#let exN = exo.with(...)`) : le repère `#mathalea-anchor("exo", N)` ne précède que l'appel `#exN()` de la section « Énoncés », où il n'y a rien à modifier. À défaut de définition (mode fusionné, où le contenu suit le repère) — et toujours pour une correction, qui n'a pas de définition séparée — la ligne visée est celle du repère `#mathalea-anchor("exo"|"corr", N)` ;
4. `revealPosition` (dans `editor/typstEditorSetup.ts`) y place le curseur, en dépliant d'abord tout bloc replié qui la contiendrait (`foldedRanges`/`unfoldEffect`).

Un double-clic sur un contrôle de la palette de mise en page (bouton, champ) est ignoré : elle a déjà son propre comportement.

## Palette de mise en page

Le bouton « Mise en page » de la barre d'outils affiche des contrôles par-dessus l'aperçu (`TypstLayoutOverlay.svelte`) :

- dans la marge de page (la plus proche de la colonne concernée), à hauteur de chaque liste de questions (environnement `tasks`) : nombre de colonnes (1 à 4) et espacement vertical (pas de 0,25 em) — l'énoncé (`exN`) et sa correction (`exN-corr`) se règlent indépendamment. Une troisième ligne règle les colonnes des **propositions de QCM** de l'exercice (`exN-qcm`, `exN-corr-qcm`), affichée seulement s'il en contient un ; à l'inverse, un exercice à question unique avec QCM n'affiche que cette ligne, faute de liste de questions à régler — voir [Colonnes des QCM](#colonnes-des-qcm) ;
- le sélecteur « Aperçu » de la barre d'outils (à partir de deux sujets) choisit le sujet **montré et compilé** — voir [Un seul sujet dans l'aperçu](#un-seul-sujet-dans-laperçu) ;
- dans la marge droite, au début de chaque exercice : insertion/modification d'un texte, d'un titre de section (`#section[...]`, helper émis dans le préambule) ou d'un **exercice à énoncé libre** (voir [Exercice à énoncé libre](#exercice-à-énoncé-libre) plus bas) **avant** cet exercice, nombre de questions (`nbQuestions`), **duplication** et suppression de l'exercice (l'une comme l'autre mettent à jour `exercicesParams` et le barème de la page de garde). La copie se place juste après l'original, avec les mêmes paramètres (graine comprise, donc le même énoncé) et les mêmes réglages de palette : `shiftCarryOverForInsert` renumérote les réglages des exercices suivants et recopie ceux de l'original sur la copie. Quand le nombre de questions change, les questions déjà affichées sont figées (`frozenInputs`, vidé par « Nouvelles données ») : la régénération ne rebrasse pas leurs valeurs, seules les questions ajoutées sont nouvelles ;
- entre les exercices : insertion/modification d'un texte ou d'un titre de section, et deux boutons de saut de page et de saut de colonne (ce dernier seulement en document multicolonne) — une fois insérés, ils deviennent des badges bien visibles, retirables d'un clic (le saut de page ferme et rouvre le bloc `en-colonnes`, `#pagebreak` étant interdit dans un conteneur) ;
- au début de chaque correction (repère `corr`) : même bouton d'insertion/modification de texte ou de titre de section qu'entre les exercices, ainsi que les boutons de saut de page et de saut de colonne (ce dernier seulement en document multicolonne) — ces insertions vivent dans leur propre espace (`insertionsCorrection`, marqueur `// mathalea:insertion-corr`), indépendant de celui entre les exercices ;
- à gauche du titre de la fiche : édition du titre, du sous-titre et de la ligne d'en-tête (ces champs ne sont plus dans la fenêtre Réglages ; la valeur est reportée dans les réglages persistés) — absente si l'habillage en-tête est `Aucun`, faute de bloc à éditer ;
- en haut de la page de garde (quand un modèle est choisi) : édition de l'intitulé, de la session, de la matière, de la durée, de la mention de bas de page et des consignes — même mécanisme que le titre de la fiche, voir [Page de garde](#page-de-garde) ;
- sur le pied de la première page (si affiché) : édition de son texte — voir [En-tête et pied de page](#en-tête-et-pied-de-page) ;
- à côté de l'étiquette « Sujet A/B... » de l'en-tête (fiche à plusieurs versions) : icône masquant/affichant cette étiquette (`hideVersionLabel`) — voir [En-tête et pied de page](#en-tête-et-pied-de-page).

**Seuls les contrôles de l'exercice survolé sont affichés**, pour que les
barres de plusieurs exercices (voisins, ou côte à côte en document
multicolonne) ne se superposent jamais :

- au mouvement du pointeur sur l'aperçu (et au toucher), `Typst.svelte`
  détermine la section survolée — énoncé `exo-N` ou correction `corr-N` —
  avec `locateSectionAnchor` (`overlaySections.ts`) : dernier repère
  `exo`/`version-exo`/`corr` rencontré avant le pointeur dans l'ordre de
  lecture (page, puis colonne, puis ordonnée). Le haut d'une page appartient
  donc à l'exercice commencé sur la précédente, et le haut d'une colonne à
  celui commencé en bas de la colonne précédente. Tant que le pointeur est sur
  une barre ou un panneau de la palette, la section courante est conservée
  (une barre peut déborder sur la section voisine) ;
- chaque contrôle porte les sections auxquelles il se rattache
  (`OverlayWidget.sections`, calculé par `anchorSections`) : barre et liste de
  questions de l'exercice, barre et liste de questions de sa correction,
  figures (rattachées à la section qui les contient), barre entre deux
  exercices (rattachée aux deux, ainsi qu'aux autres membres de leurs groupes
  côte à côte : le repère après une grille se trouve sous le membre de gauche,
  et doit rester accessible depuis celui de droite). Les contrôles communs à la fiche (en-tête,
  page de garde, pied de page, QR-code, ligne « Course aux nombres », barre
  « Ajouter un exercice » après le dernier exercice) n'en ont pas et restent
  toujours affichés, à demi transparents ;
- ceux de la section survolée sont pleinement opaques (`.typst-pill-current`)
  ; les autres sont invisibles et transparents aux clics
  (`.typst-pill-idle`), mais restent dans le DOM : la navigation au clavier
  les fait réapparaître (`:focus-within`), un panneau ouvert
  (`.typst-pill-force-visible`) garde sa barre affichée, et la visite guidée
  les rend visibles quand elle les cible (`tour.css`).

Fonctionnement :

1. `buildTypstDocument` émet des repères invisibles `#mathalea-anchor(kind, num)` (métadonnées Typst portant la position `here().position()` en pt) devant chaque `#tasks` (`kind: "tasks"`, ou `"tasks-corr"` dans une correction), devant chaque exercice (`kind: "exo"`), devant chaque correction (`kind: "corr"`), aux points d'insertion entre les exercices (`kind: "gap"`, `num: 0` avant le premier exercice), devant le bloc de titre (`kind: "header"`, absent si l'habillage est `Aucun`), devant la page de garde (`kind: "cover"`, absente sans modèle choisi), dans le pied de page (`kind: "footer"`, seulement sur la première page physique — voir « En-tête et pied de page ») et, sur l'étiquette de version de la ligne d'en-tête (`kind: "version-label"`, fiche à plusieurs versions), dans la cellule de la grille quand elle est visible, ou hors du flux dans le bloc de titre quand elle est masquée. Ils n'ont aucun impact sur la mise en page (vérifié au pixel près).
2. Après chaque compilation, `typstCompiler.ts` interroge le document (`world.query({ selector: '<mathalea-anchor>' })`, même monde de compilation que le rendu SVG) et renvoie les repères (`TypstAnchor`).
3. `Typst.svelte` convertit ces positions en pourcentages du conteneur de l'aperçu (via la géométrie des pages renvoyée par `separatePages`) et place les contrôles.

Les contrôles font des **éditions ciblées du code** dans CodeMirror (pas de régénération) : les boutons modifient les lignes `#let exN-colonnes`/`#let exN-gutter`, les insertions ajoutent une ligne marquée `// mathalea:insertion` après le repère de gap. Elles sont donc annulables (Ctrl+Z) et présentes dans le `.typ` exporté. Exception : l'icône de l'étiquette de version régénère tout le code (`toggleVersionLabel` → `applyDocumentOptions`), la présence de l'étiquette dans la grille (voir « En-tête et pied de page ») étant structurelle plutôt qu'une simple valeur de variable. Ces éditions ne marquent **pas** le code comme « modifié à la main » (`isEdited`) : puisqu'elles survivent à la régénération via le carry-over, elles ne déclenchent pas l'avertissement d'écrasement — seule la frappe directe dans l'éditeur le fait. Avec plusieurs sujets, chacun porte ses repères et ses marqueurs de relecture. `subjectEditorCode` masque les autres sujets (banques et rendus) sans déplacer les positions dans CodeMirror ; `harvestCarryOver` relit séparément leurs ajustements dans `versions`, afin de préserver les insertions et les surcharges de chaque sujet.

Le zoom et l'alignement d'une figure du sujet A valent par défaut pour les
autres sujets. Les figures sont numérotées à la suite, sujet après sujet ;
quand un sujet B, C… a autant de figures que le sujet A (mêmes exercices), sa
k-ième figure reprend les variables de la k-ième figure du sujet A
(`#let fig-5-zoom = fig-1-zoom`, voir `sharedFigureNumber`) : régler une figure
du sujet A modifie donc tous les sujets. Régler une figure depuis un sujet B,
C… remplace ce renvoi par une valeur propre (`#let fig-5-zoom = 0.8`) : le
réglage ne vaut que pour ce sujet. Sur une fiche à plusieurs sujets,
`harvestCarryOver` relit toutes les valeurs, même celles par défaut : à la
régénération, une figure qui a une valeur la garde, les autres reprennent le
renvoi. Si le nombre de figures diffère (tirage au hasard),
chaque sujet garde ses propres réglages.

À la régénération (réglages, « Nouvelles données »), `harvestCarryOver` relit ces ajustements dans le code courant et les réémet (paramètre `carryOver` de `buildTypstDocument`) : ils survivent à la régénération, contrairement aux autres modifications manuelles. Les sauts de page ou de colonne sont normalisés à un exemplaire par repère (`stabilizeStructuralInsertions`, espaces `exo` et `corr`) et, entre les exercices, supprimés après le dernier, où ils n'ont aucun contenu suivant à déplacer ; cela répare aussi les anciens `typstParam` qui en contiennent des copies. « Réinitialiser les réglages du document » efface tout le carry-over.

## Ajouter un exercice depuis l'aperçu

Le dernier repère de la palette (après le dernier exercice, ou seul repère
d'une fiche vide) porte un bouton **« Ajouter un exercice »** qui ouvre une
modale de navigation dans les référentiels
([`addExercise/TypstAddExerciseModal.svelte`](../../../../src/components/setup/typst/addExercise/TypstAddExerciseModal.svelte)) :

- même parcours que la vue mobile (rubrique > niveau > thèmes > sous-thèmes),
  à partir des rubriques déclarées pour la vue `typst` dans
  [`src/json/mobileMenu.json`](../../../../src/json/mobileMenu.json) (voir
  [Vue mobile — rubriques](../architecture/vue-mobile.md#rubriques-affichées--srcjsonmobilemenujson)) :
  Collège, Lycée général, Lycée professionnel, **Course aux nombres** et
  **Ressources complémentaires** (annales d'examens et ressources partenaires,
  banques d'exercices ajoutées comprises) — ces deux dernières ne sont pas
  proposées sur téléphone ;
- au bout d'un thème, chaque exercice est affiché **en aperçu HTML**
  ([`addExercise/TypstExercisePreview.svelte`](../../../../src/components/setup/typst/addExercise/TypstExercisePreview.svelte)),
  avec une roue dentée qui ouvre le panneau `Settings` de la vue prof et un
  bouton « Ajouter ». Les aperçus sont chargés paresseusement
  (`IntersectionObserver`) : un thème de cinquante exercices ne charge que les
  modules visibles ;
- l'exercice prévisualisé vit dans la carte, hors de `exercicesParams` : les
  réglages faits à la roue dentée sont portés par les paramètres transmis à
  l'ajout. Après un ajout, la carte tire une nouvelle graine (recliquer
  n'ajoute donc pas deux fois le même énoncé) et un badge rappelle combien de
  fois la ressource est déjà dans la fiche ;
- un exercice statique (annale, banque externe) n'a rien à régler : sa roue
  dentée est masquée, comme dans la barre d'exercice de la palette.

On peut naviguer, ajouter plusieurs exercices, puis fermer la modale
(« Valider », croix, Échap ou clic sur le fond).

Côté `Typst.svelte`, `addExerciseToSheet` ajoute les paramètres à
`exercicesParams` (donc à l'URL), charge l'exercice avec le même
`buildExercise` que le chargement de la fiche
([`lib/components/exercisesUtils.ts`](../../../../src/lib/components/exercisesUtils.ts)),
relit les sources `.typ`/images statiques puis régénère le code. Les réglages
de la palette ne sont pas décalés : l'ajout se fait après le dernier exercice,
aucun numéro existant ne change (une insertion de texte présente au dernier
repère se retrouve donc avant le nouvel exercice). Contrairement aux autres
actions qui régénèrent le code, ouvrir la modale ne demande pas confirmation
même si le code a été modifié à la main (`isEdited`) : comme `deleteExercise`,
ajouter un exercice est déjà un geste délibéré, et bloquer la modale derrière
l'avertissement générique interdirait tout ajout tant que le code a été
retouché à la main.

## Exercice à énoncé libre

Le choix « Exercice » du panneau d'insertion (voir « Palette de mise en
page » plus haut) insère, à un point quelconque de la fiche (pas seulement à
la fin, contrairement à la modale ci-dessus), un exercice numéroté normalement
dont l'énoncé est entièrement écrit par le professeur dans le panneau — utile
pour une question qui n'existe dans aucun référentiel (rédaction libre,
retranscription d'un énoncé papier...).

- « vaisseau » : `src/exercices/apps/EnonceLibre.ts` est un exercice
  générique minimal (un texte de départ « Énoncé à écrire. », correction
  vide), sans `refs` (donc absent de la recherche et des référentiels) —
  seul son `uuid` compte, recopié dans `FREE_EXERCISE_UUID`
  (`Typst.svelte`). Il n'a rien de spécifique au professeur : n'importe quel
  exercice aurait pu servir de vaisseau, celui-ci est choisi pour son
  contenu neutre (pas de `ref` affichée, pas de QR-code) ;
- `insertFreeExercise(gapNum, texte)` (`Typst.svelte`) ajoute ses paramètres
  (`{ uuid: FREE_EXERCISE_UUID }`) à `exercicesParams` à la position
  `gapNum + 1`, comme `duplicateExercise` (même `shiftCarryOverForInsert`,
  avec `original: -1` : aucun exercice existant dont copier les réglages,
  contrairement à une duplication) ;
- `texte` est aussitôt posé comme surcharge de code
  (`carryOver.codeOverrides[gapNum + 1]`) avant la régénération : l'énoncé
  affiché est donc directement celui écrit dans le panneau, jamais le texte
  de départ du vaisseau. Le professeur peut le modifier ensuite comme
  n'importe quel exercice (icône crayon, « Éditer le code Typst de cet
  exercice ») ;
- cette modale d'édition masque son bouton « Restaurer le code d'origine »
  quand l'exercice édité est un vaisseau (`exercises[num - 1]?.uuid ===
FREE_EXERCISE_UUID`) : l'énoncé « généré » auquel il reviendrait n'est que
  le texte de départ du vaisseau, jamais utile à retrouver ;
- l'exercice reste un exercice génératif normal (pas `typeExercice:
'statique'`) : « Nouvelles données » et « Réglages de l'exercice » restent
  visibles (ils ne regénèrent que le contenu invisible sous la surcharge,
  sans effet sur l'énoncé affiché) plutôt que masqués comme pour un exercice
  statique, ce qui aurait aussi masqué le crayon d'édition indispensable ici
  (`nonEditableStaticExercises` se fonde sur l'absence de fichier `.typ` du
  référentiel, que ce vaisseau n'a pas) ;
- sur une fiche à plusieurs sujets, `texte` est posé comme surcharge dans
  **chaque** sujet : il ne dépend d'aucune graine.

## Déplacer un exercice avec ses figures

Les zooms et alignements des figures suivent l'exercice déplacé, y compris
les figures de sa correction. `swapExerciseFigures` (`buildTypstDocument.ts`)
recalcule les blocs de numéros de figures de chaque exercice à partir des
contenus des sujets, puis renumérote `figureZoom`, `figureAlign` et les
références `fig-N` des surcharges de code. Les sujets supplémentaires sont
traités indépendamment : leurs tirages peuvent produire des nombres de
figures différents, et leurs surcharges utilisent des numéros locaux.
`swapCarryOver` (`typstCarryOver.ts`) échange ensuite les réglages indexés
par exercice en conservant les réglages des figures renumérotés.

## Modifications de code et plusieurs sujets

Une surcharge de code (crayon de la palette) remplace tout l'énoncé ou toute
la correction d'un exercice, **nombres compris**, et ne vaut que pour le sujet
où elle a été saisie (`carryOver.versions[n]`) : la recopier telle quelle dans
un autre sujet lui donnerait les valeurs du premier. Pour qu'un professeur
n'ait pas à refaire ses retouches dans chaque sujet, elles sont reportées sous
forme de **différence** (`src/components/setup/typst/codePatch.ts`) :

- `createCodePatch(avant, après)` découpe les deux textes en mots, nombres,
  blancs et symboles, les compare (algorithme de Myers) et retient chaque
  passage modifié avec quelques mots de contexte de part et d'autre ;
- `applyCodePatch(cible, patch)` rejoue ces remplacements sur le code d'un
  autre sujet. Dans le **contexte**, un nombre correspond à n'importe quel
  nombre (les valeurs tirées diffèrent d'un sujet à l'autre) ; le passage
  **remplacé** doit en revanche figurer à l'identique. Le contexte est
  raccourci au besoin, et le report échoue (`null`) si le passage est
  introuvable ou désigne plusieurs endroits : jamais d'approximation qui
  recopierait les nombres d'un autre sujet.

Deux points d'entrée dans `Typst.svelte` :

- la modale d'édition propose, à partir de deux sujets, la case « Reporter la
  modification sur les autres sujets » (cochée par défaut,
  `codeEditApplyToAll`). `propagateExerciseCode` calcule la différence entre
  le code précédent du sujet affiché (surcharge, sinon code généré) et le
  brouillon, puis la rejoue sur le code actuel de chaque autre sujet, qui
  garde ainsi ses propres retouches. « Restaurer le code d'origine » retire la
  surcharge de tous les sujets ;
- l'ajout de sujets (`applyDocumentOptions`, nombre de versions supérieur à
  celui du code affiché) : `propagateOverridesToNewVersions` rejoue sur chaque
  nouveau sujet la différence entre le code généré du Sujet A et sa surcharge.

Une surcharge identique au code généré n'est pas enregistrée. Les sujets où le
report a échoué sont signalés par une alerte : le professeur les modifie à
part.

## Lignes de réponse (« Lignes pour écrire »)

Bouton (icône liste, `bx-detail`) de la barre d'outils de chaque exercice (à côté de « Éditer le code Typst ») : ajoute des lignes pour que l'élève y écrive, réglées **par exercice** — soit après le corps entier de l'exercice, soit après chaque question de cet exercice (y compris la dernière). Le popover règle le rendu (`Pointillés`, `Points`, `Trait`, `Vide`), le nombre de lignes (0 par défaut : rien ne s'affiche tant qu'il n'est pas incrémenté) et l'espacement (2 em par défaut, pas de 0,5) ; « Retirer » efface le réglage. Ne s'applique jamais à la correction.

Réglage **du document** (Réglages du document, sous les cases à cocher) : « Lignes de réponse par exercice » (`TypstDocumentOptions.answerLines`, 0 par défaut) en ajoute d'office à **chaque** exercice de la fiche ; l'emplacement (`answerLinesPosition`) et le trait (`answerLinesStyle`) se règlent juste en dessous, affichés seulement quand le nombre est non nul. Le réglage d'un exercice fait dans la palette l'emporte sur ce défaut (`carryOver.writingLines?.[k + 1] ?? …` dans `computeGeneratedExercises`). Le modèle de page de garde « récitation » met ce nombre à 2 à sa sélection.

Ces trois champs régénèrent le code **en oubliant les réglages par exercice** (`regenerateDocument({ dropWritingLines: true })`, `applyAnswerLines`/`applyAnswerLinesStyle` dans `Typst.svelte`) : le réglage global écrit des appels `#mathalea-lignes` dans le code, que `harvestCarryOver` relit en réglages par exercice — prioritaires. Sans cet oubli, un changement du réglage global serait écrasé par le code qu'il venait lui-même de produire, et resterait sans effet visible.

Comme la fusion d'exercices (`onToggleMergeBefore`), le réglage change la structure du document (les appels s'intercalent après chaque question en mode « Après chaque question ») : il régénère donc tout le code plutôt que de l'éditer ponctuellement. Porté par `TypstCarryOver.writingLines` (`Record<number, WritingLinesSetting>` — `{ position, count, spacing, style }` —, clé = numéro d'exercice 1-based), il survit à la régénération comme les autres réglages de la palette. Chaque appel généré `#mathalea-lignes(n, gutter: ...em, style: "...")` est tagué d'un marqueur `// mathalea:lignes-fin(N)` ou `// mathalea:lignes-apres(N)`, relu par `harvestCarryOver` (comme `// mathalea:insertion` pour les insertions de texte) ; `shiftCarryOver`/`swapCarryOver` décalent ces réglages à la suppression/au déplacement d'un exercice, comme `tasksLayout`/`codeOverrides`. Le helper Typst réutilisable `#mathalea-lignes(n, gutter: ..., style: ...)` (`MATHALEA_WRITING_LINES_HELPER` dans `buildTypstDocument.ts`) n'est déclaré dans le préambule que s'il est effectivement utilisé, et ne produit aucun rendu (ni espace) tant que `n` vaut 0.

Les trois traits (`WRITING_LINES_STYLES`) reprennent ceux du `answer-line-style` du paquet taskize ; le quatrième rendu, `vide`, réserve le même espace sans dessiner de trait. Le helper produit ces rendus plutôt que le paquet : l'option `answer-lines` de taskize ne s'applique qu'aux questions d'un `#tasks`, alors que le réglage couvre aussi la fin d'exercice et les exercices à question unique, qui n'ont pas de liste.

- `pointilles` : filet pointillé gris (rendu d'origine, donc valeur retenue quand un code émis avant ce réglage ne porte pas de `style:` — le groupe est facultatif dans le motif de `harvestCarryOver`) ;
- `points` : points de conduite (`repeat(gap: 2pt)[.]`, même espacement que les champs « Nom : ..... » de la page de garde) ;
- `plein` : filet continu.
- `vide` : espace sans trait, dont la hauteur dépend du nombre de lignes et de leur espacement.

Une surcharge de code (icône crayon, voir plus haut) remplace tout l'énoncé
généré par `exerciseBody`, y compris l'appel `#mathalea-lignes` qu'il y avait
posé : sans précaution, régler des lignes sur un exercice déjà surchargé (ou
l'inverse) les ferait disparaître dès la régénération suivante, sans retour
visible pour le professeur. `buildVersionContent` réémet donc l'appel après
la surcharge (`appendEndOfExerciseLines(…, { force: true })` sur
`GeneratedExercise.writingLines`, calculé par `computeGeneratedExercises`
avant que la surcharge ne remplace l'énoncé) — hors des repères
`mathalea:override(...)`/`-end`, pour que `harvestCarryOver` continue à lire
l'un sans le confondre avec l'autre. Faute de liste de questions sous une
surcharge, « après chaque question » y retombe toujours en fin d'exercice
(comme pour un exercice à question unique, voir plus bas).

Deux points de mise en page vont avec l'emplacement « après chaque question » :

- un exercice **sans liste `tasks`** (question unique, énoncé d'un seul bloc) n'a nulle part où intercaler les lignes : elles sont alors posées à la fin de son corps (paramètre `force` d'`appendEndOfExerciseLines`), sans quoi un réglage valable pour toute la fiche laisserait ces exercices-là sans place pour répondre. Le marqueur émis reste `lignes-apres(N)`, pour que la palette relise l'emplacement choisi ;
- la liste de questions est déclarée **à une colonne** par défaut (`perQuestionLinesTasksPrefixes`) : sur quatre colonnes, les lignes se réduisent à des tronçons de un ou deux centimètres. Comme pour les QCM à figures, ce défaut n'est pas un choix du professeur — `harvestCarryOver` applique la même règle pour ne pas le figer dans le carry-over —, et un nombre de colonnes choisi dans la palette l'emporte.

Les lignes restent dessinées par ce helper plutôt que par le `answer-lines` de taskize : outre que l'option du paquet ne couvre pas la fin d'exercice ni les exercices sans liste, la version publiée (0.2.10) n'offre ni `answer-line-style` ni `answer-line-above`/`below` — les deux rendus sont sinon identiques au pixel près (comparés à la compilation).

## Styles des questions (réglage du document)

Section « Styles » des Réglages du document, sous les cases à cocher de mise en page (au-dessus de « Style des exercices », qui règle le badge — voir [Styles d'exercice](#styles-dexercice-badges-exercise-bank)) : trois réglages qui portent sur les listes de questions (environnement `tasks`) de **tous** les exercices, comme « Lignes de réponse par exercice » ci-dessus — un réglage fait sur un exercice précis (depuis la palette de mise en page de l'aperçu ou la modale de réglages de l'exercice, voir plus bas) l'emporte toujours sur ce défaut.

- **Colonnes des questions** (`TypstDocumentOptions.questionsColumns`, `auto` par défaut) : nombre de colonnes par défaut des listes de questions (`auto` laisse `taskize` choisir jusqu'à 4 colonnes uniformes, voir `#tasks-setup`) ;
- **Espacement entre les questions** (`TypstDocumentOptions.questionsGutter`, 1,2 em par défaut, pas de 0,25) : espacement vertical par défaut entre les questions ;
- **Numérotation des questions** (`TypstDocumentOptions.questionNumberingStyle`, `1)` par défaut) : motif de numérotation (`aucun`, `1.`, `1)`, `a.`, `a)`) passé en `label:` à chaque `#tasks(...)`, sauf pour un exercice dont le contenu porte ses propres repères (`a)`, `b)`...), toujours découpé et numéroté selon ce qu'il contient — voir [Numérotation des questions](#numérotation-des-questions).

`buildTypstDocument` déclare ces défauts en tête de document (`#let colonnes-questions = ...`, `#let interligne-questions = ...em`, `#let numerotation-questions = ...`), et chaque `#let exN-colonnes`/`-gutter`/`-numerotation` y renvoie tant qu'aucun réglage propre à cet exercice n'existe — un changement de ces réglages met donc à jour tous les exercices non réglés individuellement en une seule régénération. `harvestCarryOver` reconnaît l'absence de réglage propre à l'exercice en comparant la valeur lue au **nom** de la variable partagée (`colonnes-questions`/`interligne-questions`/`numerotation-questions`), pas à sa valeur résolue : un changement de défaut ne fige donc jamais par erreur l'ancienne valeur dans le carry-over de chaque exercice.

### Réglage par exercice

Les trois styles ci-dessus sont aussi réglables **par exercice**, à deux endroits qui partagent les mêmes variables Typst (`#let exN-colonnes`/`-gutter`/`-numerotation`, `TypstCarryOver.tasksLayout[prefix].{columns,gutter,numbering}`) et restent donc synchronisés :

- la palette de mise en page de l'aperçu (pastille à côté de la liste de questions, colonnes/espacement seulement — voir [Palette de mise en page](#palette-de-mise-en-page)) ;
- la modale de réglages de l'exercice (icône ⚙, à côté du nombre de questions et de la graine) : `Settings.svelte` reçoit une prop optionnelle `typstStyle` (colonnes, espacement, options et valeur de numérotation, callbacks), fournie uniquement par `Typst.svelte` (les autres vues qui partagent ce composant — HTML, A4, OMR, AMC, TBI — ne la passent pas, la section « Mise en page des questions » ne s'y affiche donc jamais) et seulement quand l'exercice a une liste de questions à régler (`tasksLayoutValues[exN] != null`).

Les callbacks de `typstStyle` (`onAdjustColumns`, `onAdjustGutter`, `onSetNumbering`) éditent directement le code Typst dans CodeMirror, exactement comme les boutons de la palette (`adjustColumns`/`adjustGutter`/`setNumberingStyle` dans `Typst.svelte`) — ils ne passent pas par `dispatchNewSettings`/`applyExerciceSettings` (mécanisme générique des vues HTML/PDF, qui écrit sur l'objet `exercice` et le store `exercicesParams`, sans rapport avec la mise en page Typst).

`refreshTasksLayout` (`Typst.svelte`) résout la référence à la variable partagée vers sa valeur courante avant de l'exposer à l'UI (palette et modale) : un exercice non réglé affiche ainsi le nombre de colonnes ou l'espacement **effectif** (celui du document), pas le nom de la variable ni une valeur `auto`/`1.2em` figée qui ignorerait un défaut du document différent.

Le style de numérotation par exercice utilise le même mécanisme que colonnes/espacement (`#let exN-numerotation = ...`), avec une subtilité : la mise en gras (`TypstDocumentOptions.boldQuestionNumbers`, réglage global, pas par exercice) enrobe le motif dans `(..n) => strong(numbering(motif, ..n))` (voir `boldableLabel`) ; `numbering()` échoue si son premier argument vaut `none`. Quand le motif est un littéral connu d'avance en JS (mode export, ou repères `a)`/`b)` détectés dans le contenu), ce cas est déjà écarté avant l'appel. Mais référencer `exN-numerotation` (pour que l'édition ciblée du code fonctionne, palette ou modale) délègue la valeur réelle à la compilation Typst, où elle peut valoir `none` sans que `boldableLabel` le sache : le label émis est alors une garde `if exN-numerotation == none { none } else { (..n) => strong(numbering(exN-numerotation, ..n)) }` plutôt qu'un appel direct.

Les listes HTML `ol.alpha` situées à l'intérieur d'une question ou de sa correction sont converties par `htmlToTypst` en `#tasks(columns: 1, label: "a)")[+ …]` (sous-questions `a)`, `b)`), et non en `enum` brut : le numéro d'un `enum` est aligné par le haut de sa cellule, donc « décollé » de la ligne de base quand la première ligne contient une formule haute (matrice, fraction), alors que `tasks` (voir [Numérotation des questions](#numérotation-des-questions)) le pose sur cette ligne. `columns: 1` garde une sous-question par ligne, comme en HTML et en LaTeX, quel que soit le `columns: "auto-fit"` de `#tasks-setup`. Dans un item, `<br>`, `<div>` et `<p>` deviennent `\ ` et jamais un retour à la ligne source : le texte sortirait de l'item et `tasks`, qui ne garde que ses items, le perdrait sans erreur. Leurs repères suivent aussi `boldQuestionNumbers` : ils sont en gras (`label-weight: "bold"`) quand l'option est cochée, sans modifier le texte des items.

## En-tête et pied de page

Le pied de page conserve le texte de gauche et la pagination centrale ; le rappel du titre en bas à droite est supprimé pour tous les habillages.

Réglages des Réglages du document, indépendants l'un de l'autre :

- **Étiquette de version masquable** (`TypstDocumentOptions.hideVersionLabel`,
  décochée par défaut) : sur une fiche à plusieurs versions (`nbVersions >
1`), l'étiquette « Sujet A/B... » de la ligne d'en-tête se masque/affiche
  par une icône sur l'aperçu (`version-label` dans `TypstLayoutOverlay.svelte`
  — voir « Palette de mise en page » plus bas), pour distribuer des sujets
  mélangés sans que les élèves n'y lisent leur version. Masquée, l'étiquette
  est retirée de la grille (`headerBlock` dans `buildTypstDocument.ts`) : si
  `entete` est vide, la ligne entière disparaît et libère sa hauteur. Son
  repère est placé hors du flux dans le bloc de titre pour conserver l'icône
  qui permet de la réafficher.
  Le réglage vaut pour tous les sujets de la fiche (un seul bouton) et
  s'applique aussi aux exports (PDF, .typ) : ce n'est pas un simple masquage
  visuel de l'aperçu.
  Avec l'habillage « aucun » (pas de bloc de titre) et une page de garde,
  l'étiquette s'affiche sur la page de garde (argument `version:` des modèles
  `mathalea-couverture*`, `coverVersionLabel` dans `buildTypstDocument.ts`) ;
  le même bouton la masque et la réaffiche.
- **Habillage en-tête** (`TypstDocumentOptions.headerStyle`) : `Épuré`,
  `Cartouche`, `Cadre` ou **`Aucun`** — ce dernier n'émet aucun bloc de titre
  (`headerBlock` renvoie `[]`), la fiche commence alors directement par le
  premier exercice. Les variables `titre`/`sous-titre`/`entete` restent
  déclarées (le pied de page peut toujours y renvoyer), mais le repère
  `#mathalea-anchor("header", 0)`, lui, n'est **pas** émis dans ce cas : sans
  bloc de titre affiché, il n'y a rien à éditer à cet endroit sur l'aperçu.
  Choisir un modèle de [page de garde](#page-de-garde) bascule automatiquement
  cet habillage sur `Aucun` (la page de garde porte déjà le titre ; un second
  bloc en page 2 ferait doublon) — un choix explicite plus tard dans le
  sélecteur reste possible et n'est pas écrasé ensuite.
- **Pied de page** (`TypstDocumentOptions.showFooter`/`footerText`) : une
  case à cocher dans le volet (`footer: none,` côté Typst quand décochée) ;
  le texte, lui, se modifie **directement sur l'aperçu** (icône sur le pied
  de la première page), comme le titre et la page de garde. Le texte est
  déclaré en variable (`#let pied-page = "..."`) et référencé par les trois
  habillages, qui n'en diffèrent donc plus que par la mise en forme (ligne,
  couleur) — avant ce réglage, chaque habillage imprimait un texte différent
  en dur (« MathALÉA — coopmaths.fr », « MathALÉA · coopmaths.fr », « CC
  BY-SA · MathALÉA »).
  - Le pied de page se répète sur **chaque** page (`#set page(footer:
context [...])`), à la différence du titre ou de la page de garde qui
    n'apparaissent qu'une fois : un seul point d'édition suffit, donc le
    repère `#mathalea-anchor("footer", 0)` n'est émis que sur la première
    page **physique**, via `#if here().page() == 1 [...]`. `here().page()`
    (numéro de page physique) est utilisé plutôt que `counter(page).get()` :
    ce dernier est remis à 1 par `#counter(page).update(1)` au début de
    chaque sujet suivant (plusieurs versions, voir « Page de garde » plus
    bas) — l'icône réapparaîtrait alors en tête de chaque sujet plutôt
    qu'une seule fois sur toute la fiche.

## Page de garde

Réglage `TypstDocumentOptions.coverPage` (section « Page de garde » des
Réglages du document), sur le modèle des modèles d'épreuve de la vue PDF
(`ExamTemplateEngine`, [`latex/LatexConfig.ts`](../../../../src/components/setup/latex/LatexConfig.ts)).
Six modèles : **Aucune** (défaut), **Évaluation**, **Évaluation (bandeau
compact)**, **Brevet des collèges**, **BAC** et **Course aux nombres**.

L'intitulé, la session, la matière, la durée, la mention en bas de page
(« Tournez la page S.V.P. ») et les consignes se modifient **directement sur
l'aperçu** (bouton `bx-edit` en haut de la page de garde), sur le modèle du
titre/sous-titre/en-tête de la fiche (voir « Palette de mise en page »
ci-dessous) ; le barème, lui, reste dans les Réglages du document (exercice
par exercice, avec son total).

Comme `titre`/`sous-titre`/`entete`, les textes sont déclarés en variables en
tête de document puis référencés par l'appel — une édition depuis l'aperçu
modifie ainsi la ligne `#let couverture-titre = "..."` (édition ciblée du
code, sans régénération) plutôt que l'argument nommé :

```typst
#let couverture-titre = "Brevet des collèges"
#let couverture-session = "Juin 2026"
#let couverture-matiere = "MATHÉMATIQUES"
#let couverture-duree = "2 heures"
#let couverture-consignes = ("L’usage de la calculatrice est autorisé.",)
#let couverture-note-fin = "Tournez la page S.V.P."
…
#mathalea-couverture(
  titre: couverture-titre,
  session: couverture-session,
  matiere: couverture-matiere,
  duree: couverture-duree,
  consignes: couverture-consignes,
  bareme: (6, 4, 4, 2.5, 3.5),
  note-fin: couverture-note-fin,
)
```

- Trois aides seulement, déclarées uniquement quand un modèle est choisi :
  `#mathalea-couverture` (Évaluation, Brevet, BAC),
  `#mathalea-couverture-can`, `#mathalea-couverture-recitation`, plus
  `#mathalea-champ` (« Nom : ...... ») commune aux deux premières et
  `#mathalea-points-courts` (« 4 », « 2,5 ») aux modèles à barème. Ce qui distingue les trois premiers modèles n'est pas
  réglable — c'est ce qui _fait_ le modèle — et tient en trois arguments
  (`COVER_TEMPLATE_LAYOUT`) : `identite` (champs Nom/Prénom/Classe/Date) et
  `colonne-note` (colonne vide où porter la note) pour l'évaluation,
  `hasNoteFin` (affiche la mention de bas de page — son texte, lui, reste
  réglable, voir plus haut) pour le Brevet et le BAC.
  `couverture-session`/`couverture-matiere`/`couverture-note-fin` sont
  toujours déclarées, y compris quand le modèle actif ne les référence pas
  (une variable Typst non lue ne produit ni erreur ni avertissement) : la
  palette garde ainsi les mêmes variables quel que soit le modèle, et
  masque simplement les champs sans objet (Session/Matière/mention pour
  « can », mention pour « Évaluation »).
- Le barème est proposé à un point par question, comme la vue PDF
  (`buildExamExercices` de [`lib/LatexGroup.ts`](../../../../src/lib/LatexGroup.ts)) ;
  chaque ligne a sa croix de suppression (comme `TexSettingsPane`) et
  « Reprendre les exercices de la fiche » le réaligne, en gardant les points
  déjà saisis. Ajouter, dupliquer ou supprimer un exercice met le barème à
  jour tout seul (`insertCoverBaremeRow`/`removeCoverBaremeRowFor`), **à
  condition qu'il suive encore la fiche un pour un** : un barème que le
  professeur a lui-même raccourci (exercices groupés, lignes retirées) n'est
  pas retouché, c'est le bouton qui le réaligne. De même, changer le nombre de
  questions d'un exercice depuis la palette (`-1 q +`) reporte la différence
  sur ses points — mais seulement tant qu'ils valent encore le nombre de
  questions, c'est-à-dire tant qu'ils n'ont pas été réglés à la main.
  Lors d'un ajout ou d'une duplication, la liste des questions peut être encore
  vide avant sa première génération : le barème proposé utilise alors
  `nbQuestions`, au lieu de retomber prématurément sur un point.
- Changer de modèle **remplace les textes qui n'ont pas été personnalisés**
  (`isDefaultCoverText`, étendu à `noteFin`) et conserve les autres : passer
  du Brevet à la Course aux nombres ne garde pas « Durée : 2 heures » ni
  « calculatrice autorisée », qui la contrediraient, mais un intitulé réécrit
  à la main survit. Choisir un modèle bascule aussi l'**habillage en-tête sur
  `Aucun`** (voir « En-tête et pied de page » plus haut) : la page de garde
  porte déjà le titre, un second bloc en page 2 ferait doublon.
- Avec plusieurs versions (Sujet A, B…), la page de garde ouvre **chaque**
  sujet (mêmes variables partagées). Le repère d'édition
  (`#mathalea-anchor("cover", 0)`) est émis sur chaque sujet, comme celui
  de l'en-tête : ces réglages communs sont accessibles depuis tous les sujets.
- Fiche entièrement composée d'exercices « can » (identifiant contenant
  `can`) : la détection automatique de `canMode` (voir « Mode « Course aux
  nombres » (tableau) » ci-dessous) sélectionne aussi le format **A5**, la
  page de garde **Course aux nombres** et l'habillage en-tête **Aucun**, sauf
  si un lien partagé fixe déjà l'un de ces réglages individuellement.

### Modèle « Évaluation (bandeau compact) »

Sa clef interne est restée `recitation`, son nom d'origine, que portent les
liens déjà partagés (`typstParam`) et les fiches enregistrées.

Contrairement aux autres modèles, ce bandeau n'est **pas une page** : c'est
un bandeau compact en tête de la première page, que les exercices suivent
aussitôt (`#mathalea-couverture-recitation` ne termine pas par `pagebreak()`),
pour les tests courts où une page de garde pleine gâcherait une feuille. Il
tient en trois bandes :

1. matière et établissement à gauche, **intitulé au centre**, durée et date à
   droite, soulignés d'un filet de la couleur des badges ;
2. deux colonnes, de largeurs inégales : à gauche « Nom » puis « Prénom »
   (une ligne chacun, trait de 6 cm au plus — jamais plus large que la
   colonne), « Signature d’un responsable légal » en dessous — sans trait et
   suivie d'un blanc, la signature se pose dans l'espace libre ; à droite la
   grille des points ;
3. les consignes en **pleine largeur**, une par ligne (dans la colonne des
   champs, elles se coupaient en fin de ligne), avec la case de la note à
   leur droite — dans le blanc laissé sous la grille — quand leur longueur
   naturelle (mesurée) lui laisse la place ; sinon la note reprend sa place
   sous la grille, alignée sur son bord droit.

La grille prend la largeur qu'il lui faut et la colonne des champs occupe le
reste. Passé **60 % de la largeur utile** (mesuré dans le code Typst : au-delà
de quatre ou cinq exercices), elle n'écraserait plus qu'un filet de place pour
écrire : elle prend alors **sa propre ligne**, sous les champs, qui se
réorganisent pour occuper toute la largeur — « Nom » et « Prénom » côte à côte
sur une ligne, puis la signature à gauche et la case de la note à droite (dont
la hauteur donne la place où signer).
Et si elle dépasse encore cette largeur (une dizaine d'exercices ou plus), elle
est **réduite pour y tenir** (`scale` du rapport mesuré, comme `mathalea-fit`
le fait des figures) : sans cela Typst comprime les colonnes jusqu'à faire
chevaucher leurs textes. La case de la note, elle, n'est jamais réduite : dans
cette disposition elle est passée à côté de la signature, au-dessus de la
grille. Quand la signature est masquée, la grille et la note partagent plutôt
la même ligne si leurs largeurs naturelles y tiennent. Sinon, la note passe à
droite des consignes si celles-ci lui laissent la place ; elle ne reste seule
au-dessus de la grille que si aucun de ces deux ensembles ne tient.

Trois cases à cocher des Réglages du document, propres à ce modèle :

| Réglage                                      | Défaut | Effet                                                                                                                     |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Afficher la grille des points (`showBareme`) | oui    | grille `Exercice / Points / Obtenus` par exercice, total compris ; sinon seul le total est rappelé (`Total : ..... / 16`) |
| Champ de signature (`showSignature`)         | oui    | intitulé modifiable « Signature d’un responsable légal » sous le prénom, suivi d'un blanc où signer                       |
| Case pour la note (`showNote`)               | oui    | case haute où porter la note à la main ; décochable, la case Total de la ligne « obtenus » en tenant déjà lieu            |

Les trois consignes proposées par défaut emploient l'infinitif : « Justifier »,
« Écrire » et « Ne pas utiliser ».

Le barème est toujours passé à l'aide, même grille masquée : c'est lui qui
donne le total. Ces booléens sont émis avec un repli explicite
(`showBareme === true`, `showSignature !== false`, `showNote !== false`) : une
fiche partagée avant leur ajout ne les porte pas, et un `undefined` dans le
code déclencherait « Variable ou fonction inconnue ».

Trois champs de texte lui sont propres : `couverture-etablissement` (déclaré
comme les autres textes, masqué dans la palette pour les autres modèles), la
signature (`couverture-signature`, modifiable avec le petit crayon de la page
de garde) et la **session, qui y tient la date** — réglée par un **sélecteur de date**
([`CoverDateField.svelte`](../../../../src/components/setup/typst/CoverDateField.svelte))
présent aux deux endroits : dans les Réglages du document avec les autres
réglages du modèle, et dans la palette de l'aperçu sous le libellé « Date ».
Le champ est un `<input type="text">` en `jj.mm.aa` — un `<input type="date">`
visible afficherait la date dans le format du système (`mm/dd/yyyy` sur un
navigateur en anglais), et le plugin `@tailwindcss/forms` lui retire son icône
de calendrier (`appearance: none`). Le calendrier natif reste donc ouvert par
un bouton, qui appelle `showPicker()` sur un `<input type="date">` gardé à
côté, invisible mais rendu (condition de `showPicker`). Sélectionner le modèle date la fiche du jour
au format `jj.mm.aa` (voir
[`coverDate.ts`](../../../../src/components/setup/typst/coverDate.ts), qui fait
la conversion avec la valeur ISO du sélecteur). La mention de bas de page n'a
pas d'objet ici et reste masquée.

Sélectionner ce modèle règle aussi les **lignes de réponse à 2 par exercice**
(voir juste ci-dessous).

### Lignes de réponse (réglage global)

`TypstDocumentOptions.answerLines` ajoute d'office ce nombre de lignes en
pointillés à la fin de **chaque** exercice (0 par défaut, 2 à la sélection du
modèle « Évaluation (bandeau compact) ») : c'est le pendant global du réglage par exercice de la
palette (`TypstCarryOver.writingLines`, voir « Palette de mise en page »), qui
garde la priorité là où il est posé. Changer le réglage global efface les
réglages par exercice relus dans le code (`regenerateDocument({
dropWritingLines: true })`), sans quoi ils masqueraient la nouvelle valeur.

La page de garde « Course aux nombres » reprend `\pageDeGardeCan` de la sortie
LaTeX ([`lib/latex/preambuleTex.ts`](../../../../src/lib/latex/preambuleTex.ts))
— identité, case « Score : ... / n », consignes cochées, titre du sujet — sans
les logos des académies ni de l'APMEP, remplacés par le **dé de MathALÉA**. La
durée et le nombre de questions produisent leurs deux premières consignes (le
décompte suit la fiche, énoncés du tableau compris) ; les suivantes sont
libres.

Le dé est embarqué dans le document comme les figures mathalea2d
(`#let mathalea-logo = image(bytes("<svg…>"), format: "svg", width: 3.4cm)`),
qui reste donc autonome. `mathaleaLogo.ts` en porte une version allégée de
`public/assets/svg/logo_mathalea.svg` : métadonnées d'Inkscape et décimales
superflues retirées (14,7 ko → 8,1 ko, rendu identique), attributs entre
apostrophes pour s'inscrire tel quel dans le littéral Typst sans échappement.

Les petites capitales ne sont pas employées ici : la police Libertinus Serif
embarquée dans le compilateur WASM n'a pas de table `smcp`, `#smallcaps` y est
sans effet (vérifié).

## Mode « Course aux nombres » (tableau)

Case à cocher des Réglages du document (`TypstDocumentOptions.canMode`) : pendant Typst du style `Can` de la sortie LaTeX (`lib/Latex.ts`). Toutes les questions de tous les exercices sont rassemblées dans **un seul tableau** (numéro, énoncé, réponse à compléter, colonne « Jury »), et les corrections sont numérotées à la suite, dans le même ordre que les lignes du tableau.

- **Détection automatique** (`Typst.svelte`, au chargement) : si la fiche ne
  contient que des exercices « can » (identifiant contenant `can`, ex.
  `can6M4-07`), `canMode` est coché par défaut, le format passe en **A5**
  (feuille de passation plus petite), la [page de garde](#page-de-garde)
  bascule sur le modèle **Course aux nombres** et l'habillage en-tête sur
  **Aucun** (même raison que le choix manuel d'un modèle de page de garde :
  elle porte déjà le titre du sujet). Chacun de ces quatre réglages n'est
  appliqué que s'il n'a pas déjà été fixé par un lien partagé
  (`canModeSetFromUrl`/`pageFormatSetFromUrl`/`coverTemplateSetFromUrl`/
  `headerStyleSetFromUrl`) : rouvrir une fiche déjà réglée autrement ne
  l'écrase pas.
- Le tableau est produit par le helper Typst `#can-tableau(enonces, reponses, jury: true, entetes: ..., fond: ..., hauteur-ligne: ..., taille: 1em, reponse: 28)` (`MATHALEA_CAN_TABLE_HELPER` dans `buildTypstDocument.ts`), déclaré dans le préambule seulement quand il sert, comme les autres aides. `enonces` et `reponses` sont deux listes de contenus de même longueur ; les proportions des colonnes et l'en-tête répété en haut de chaque page reprennent le `longtblr` de l'environnement `TableauCan` (`lib/latex/preambuleTex.ts`). Les arguments nommés restent modifiables dans l'éditeur : retirer la colonne « Jury » avec `jury: false`, ou resserrer les lignes avec `hauteur-ligne` (8 pt par défaut, l'espace ajouté au-dessus et au-dessous du contenu de chaque cellule).
- **Largeur de la colonne « Réponse »** : `reponse` (28 % du tableau par défaut, prise sur la colonne « Énoncé » — « # » et « Jury » gardent la leur) laisse plus de place aux énoncés quand on la réduit. Dans l'éditeur, l'appel passe `reponse: can-reponse` et la valeur vit dans `#let can-reponse = 28` (préambule, après les réglages), que la pastille `can-table` de la palette (chevrons ‹ 28 % ›, pas de 2, entre 10 et 60) réécrit sans régénération. `harvestCarryOver` la relit (`TypstCarryOver.canAnswerWidth`, absente tant qu'elle vaut `CAN_ANSWER_WIDTH_DEFAULT`) ; en mode export, la valeur est littérale et omise quand elle est celle par défaut.
- `taille` (`set text(size: …)` appliqué à tout le tableau) reste à `1em` en A4 ; `buildCanVersionContent` le passe à `0.85em` en **A5**. Les figures de la colonne « Énoncé » sont plafonnées en points absolus (`CAN_FIGURE_MAX_WIDTH_PT`, voir ci-dessous) et ne suivent donc pas la police : à sa taille pleine, le texte de la feuille de passation A5 paraît surdimensionné à côté d'elles. Rabaisser la seule police rétablit le rapport texte/figure de l'A4 sans réduire les repères ni les courbes de lecture graphique, déjà petits.
- **Questions liées** : deux questions consécutives peuvent partager un même énoncé — une courbe lue deux fois, par exemple. L'exercice le déclare avec `canNumeroLie` (le numéro que la question se donne) et `canLiee` (les numéros auxquels elle est liée), relevés par `MetaExerciceCan` dans `listeCanNumerosLies`/`listeCanLiees` et transmis par `TypstExerciseInput.canLinkNumbers`/`canLinkedTo`. `computeCanEnonceRowspans` en déduit, pour chaque question, le nombre de lignes que couvre sa cellule d'énoncé : la première du groupe porte une `table.cell(rowspan: n, …)`, les suivantes reçoivent `none` à la place de leur énoncé (le helper n'ouvre alors pas de cellule) et ne gardent que leur réponse à compléter — équivalent du `\SetCell[r=n]` de la sortie LaTeX (`lib/Latex.ts`). Le repère `can-row` d'une question liée part dans sa cellule « Réponse », et la modale d'édition de cette ligne ne propose que la réponse (`getGeneratedCanRowCode().sharesPreviousEnonce`). Seules des questions **contiguës** sont regroupées : une cellule fusionnée ne peut pas couvrir des lignes séparées.
- Les figures de la colonne « Énoncé » sont plafonnées à `CAN_FIGURE_MAX_WIDTH_PT` (120 pt) : dessinées pour la pleine largeur du navigateur, elles rempliraient sinon toute la cellule et doubleraient le volume de la feuille de passation. Même ordre de grandeur que `TABLE_CELL_FIGURE_MAX_WIDTH_PT`, le plafond des figures des autres tableaux. Le zoom de chaque figure reste réglable depuis la palette de mise en page.
- Aucune ligne ne se coupe entre deux pages (`table.cell(breakable: false)`, comportement du `longtblr` de la version LaTeX) : une figure serait sinon séparée de son numéro.
- Les réponses à compléter viennent de `listeCanReponsesACompleter` (exposée par `TypstExerciseInput.canAnswers`), les énoncés de `listeCanEnonces` à défaut de `listeQuestions` (`canQuestions`) — même repli qu'en LaTeX. `buildInputs` (`Typst.svelte`) les renseigne comme les autres contenus, et `frozenInputs` les fige avec les questions quand le nombre de questions change.
- La consigne et l'introduction des exercices ne sont pas reprises (comme en LaTeX) : le tableau ne montre que les énoncés.
- Le paquet `exercise-bank` n'est pas importé (il n'y a plus de titre d'exercice à habiller) : les réglages « Fusionner les exercices », « Style des exercices », « Afficher la référence » et « QR-code » sont désactivés dans ce mode.
- Les corrections sont dans un environnement `tasks` unique pour toute la fiche (une seule liste, numérotée comme les lignes du tableau) : elles se répartissent donc sur plusieurs colonnes, indispensable avec la [correction minimale](#correction-minimale) où chaque réponse tient en quelques caractères. Ses variables de mise en page portent le préfixe `ex0-corr` — le numéro 0, qu'aucun exercice ne porte, la distingue des listes de questions tout en restant reconnu par la palette, par `harvestCarryOver` et par `shiftCarryOver`/`swapCarryOver` (qui ne renumérotent que les exercices, à partir de 1).
- Palette de mise en page : le repère `exo` de chaque exercice est émis **dans sa première cellule** (une métadonnée n'occupe aucune place, le contenu n'est pas décalé), la barre de l'exercice reste donc disponible ; seuls les repères `gap` qui encadrent le tableau existent (0 et le dernier), car entre deux lignes d'un même tableau une insertion ou un saut de page n'aurait pas de sens. `TypstLayoutOverlay` reçoit `canMode` et masque en conséquence les boutons sans effet (insertion avant l'exercice, édition du code de l'exercice, lignes pour écrire). Les insertions héritées de gaps intermédiaires (passage par le mode fiche) sont réémises après le tableau plutôt que perdues.

## Export « J’ai… qui a… ? »

La passerelle **J’ai… qui a… ?** ouvre une quatrième vue Typst complète, avec
aperçu, code éditable, réglages et téléchargements `.typ`/PDF. Toutes les
questions des exercices de la fiche sont aplaties dans leur ordre d’affichage.
Le recto de la carte `i` porte la réponse minimale à la question `i` et l’énoncé
de la question `i + 1`. La dernière carte revient à la première question afin
de fermer la chaîne. Le verso commun utilise l’image
`public/assets/i-have-who-has/versoGKiA.jpg`, ajustée sans recadrage à
l’intérieur de chaque carte. Ses colonnes sont imprimées en miroir, comme dans
la vue Flash-cards, pour l’impression recto-verso avec retournement sur les
bords longs. La vue charge l’image dans le système de fichiers virtuel du
compilateur ; le téléchargement Typst est donc une archive ZIP contenant le
`.typ` et le JPG nécessaire à sa compilation hors de MathALÉA.

Le préambule déclare le helper `txt` utilisé par le convertisseur pour les
textes des formules (`\\text{ cm}`, par exemple), dans la police du texte.
En cas d’échec de compilation sans aperçu disponible, la vue affiche les
diagnostics et un état vide ; l’indicateur d’attente ne reste actif que pendant
la compilation.

Le recto ajoute systématiquement un point après la réponse minimale orange et
un point d’interrogation après la question. Une ponctuation déjà présente n’est
pas doublée.

Chaque tirage reçoit un identifiant de série déterministe de deux lettres (une
majuscule puis une minuscule), calculé à partir des graines et du contenu des
exercices. Au verso, le titre est aligné à gauche et la série à droite sur une
même ligne, dans l’espace entre « Qui a… ? » et le logo Coopmaths. Sa position
est calculée d’après le ratio réel des cartes et celui de l’image : elle suit
donc cette zone blanche lorsque le nombre de lignes ou de colonnes change, sans
être recouverte par le logo. Le libellé complet « titre — Série Aa » figure
aussi sur chacun des deux disques-cache,
sous la consigne de découpe et au-dessus de l’encoche semi-elliptique, afin que
le trou central ne le masque pas. Le libellé « J’ai » ou « Qui a ? », en grand,
occupe le milieu du rayon supérieur. L’identifiant reste stable lors d’un
changement de mise en page ou de titre, mais change avec « Nouvelles données ».

Les deux lignes « J’ai » et « Qui a » sont alignées à gauche dans leur moitié
de carte. Leur position ne dépend donc pas de la longueur de la réponse ou de
la question. Le code de la carte est placé dans le coin supérieur droit ; la
pastille de zoom occupe le coin inférieur droit afin de ne pas le masquer.

Les lettres majuscules placées au début d’un énoncé comme index de série
(`A = …`, `B = …`) sont retirées des cartes. Elles permettraient sinon de
deviner le maillon suivant sans résoudre la question. Une lettre employée dans
le corps de l’énoncé ou de l’expression reste inchangée.

Un signe égal placé à la fin de la dernière formule (`…=$`) est également
retiré avant l’ajout du point d’interrogation. Dans les exercices de calcul, ce
signe matérialise normalement le blanc que l’élève doit compléter ; il serait
inadapté dans la formulation orale « Qui a … ? ». Les égalités complètes, par
exemple `$x=2$`, ne sont pas modifiées. L’espace précédant le point
d’interrogation est insécable afin que celui-ci ne se retrouve jamais seul au
début d’une ligne.

Les réponses passent par le même `minimalCorrection` que le mode de correction
minimale du [TBI](tbi.md). Les questions dépourvues de correction associée sont
ignorées. Avant l’export, leurs valeurs minimales normalisées sont comparées :
si deux réponses sont identiques, la fiche est retirée automatiquement (au
maximum 100 essais), car ce doublon créerait un court-circuit dans la chaîne.
Le tirage retenu remplace celui de l’aperçu et de l’URL. Si aucune série valide
n’est trouvée, l’export est interrompu avec un message invitant à modifier les
réglages ou les exercices. Le document est généré par
`src/components/setup/typst/buildIHaveWhoHasDocument.ts`, avec les polices, le
format de page et l’orientation de la fiche courante ; il place par défaut deux
cartes par ligne et quatre lignes par page, avec des traits de découpe. Cette
vue utilise l’orientation paysage par défaut afin d’agrandir les roues et leurs
disques-cache, disposés côte à côte sur chaque feuille.

Chaque recto publie un repère pour une pastille `− / +` dans l’aperçu. Elle
ajuste ensemble la taille du « J’ai » et du « Qui a » de cette seule carte. La
valeur `#let carte-N-taille` est modifiée directement dans le code puis relue
par `harvestIHaveWhoHasCarryOver`, de sorte que le réglage survive à une
régénération du document, comme dans la vue Flash-cards.

Chaque carte reçoit également un code aléatoire unique composé d’une lettre et
d’un chiffre (`code-carte-N`). Après les planches de cartes, le document ajoute
une planche d’assemblage A4 paysage contenant deux grands polygones à autant de
côtés qu’il y a de cartes. Le premier est le cache supérieur : il porte « J’ai…
Qui a… ? », le titre, la série, une flèche indiquant une rotation dans le sens
des aiguilles d’une montre et une fenêtre étroite à découper. Le second est le
polygone solution placé derrière. Les deux pièces ont le même axe et un repère
commun au centre ; une encoche semi-elliptique dans le cache permet de saisir et
de tourner le polygone arrière. La flèche, courte et à rayon constant, est
accompagnée de la seule mention « Sens de rotation ». La hauteur de la fenêtre
est calculée d’après le nombre de côtés pour ne découvrir qu’un code à la fois.
Les polygones sont orientés de sorte que la fenêtre soit centrée sur la
médiatrice d’un côté. L’encoche est, elle aussi, calculée sur un côté — le plus
bas — et suit son inclinaison. La consigne « Découper la fenêtre et l’encoche en
pointillés. » est imprimée sous le cache, hors de la pièce : elle disparaît donc
une fois le montage découpé.

Sur le polygone solution, les codes suivent l’ordre du cycle des cartes. Ils
sont disposés dans le sens trigonométrique : en tournant physiquement la pièce
dans le sens horaire indiqué, chaque cran amène dans la fenêtre le code de la
carte suivante. Chaque code suit son rayon et apparaît horizontalement dans la
fenêtre située à droite. Les codes sont relus par
`harvestIHaveWhoHasCarryOver` afin de rester
stables lorsque l’enseignant ajuste la mise en page ou le zoom. L’action
« Nouvelles données » les exclut volontairement de ce report et rebrasse tous
les repères : une nouvelle série ne conserve donc pas l’ordre des codes de la
précédente.

## Correction minimale

`TypstExerciseInput.shortAnswers` transporte les réponses explicites de
`listeReponsesCourtes` et les déclarations d'absence (`null`). Elles sont
résolues par `getShortAnswer`, puis passées en second argument à
`minimalCorrection` : une réponse non vide est prioritaire, `null` conserve
le corrigé complet, `undefined` déclenche l’extraction orange. Ces réponses
restent associées aux questions figées lors d'un changement de leur nombre.
Le même contrat sert aux autres vues et exports ; voir le
[guide auteur](../../auteurs-exercices/rediger-un-exercice.md#réponse-courte-et-correction-minimale).

Case à cocher des Réglages du document (`TypstDocumentOptions.minimalCorrections`, désactivée quand la correction n'est pas affichée) : quand une correction met sa réponse en évidence en orange, seule cette réponse est imprimée — le raisonnement disparaît. Une correction sans mise en évidence, ou dont la mise en évidence utilise une autre couleur (choisie justement pour ne pas désigner la réponse, voir `lib/outils/ecritures.ts`), est conservée telle quelle.

`minimalCorrection` (`components/setup/typst/minimalCorrection.ts`) reconnaît les **deux** façons de mettre une réponse en évidence :

- `miseEnEvidence()` — dans une formule, produit `{\color{#F15929}\boldsymbol{…}}`. Repérée par `occurrencesMiseEnEvidence`, qui tient compte des accolades imbriquées ;
- `texteEnCouleurEtGras()` — hors formule, produit en HTML un `<span>` orange et gras ; c'est ce qu'emploient les exercices à QCM pour désigner la bonne réponse. Repérée par un balayage des spans qui compte les imbrications. Les repères de sous-question de `numAlpha` (`a)`, `b)`…), orange et gras eux aussi, sont exclus : ils ne désignent aucune réponse.

`reponsesMisesEnEvidence` renvoie les réponses trouvées dans leur ordre d'apparition, dédoublonnées ; le tableau des réponses du diaporama s'en sert aussi (voir [Vue Diaporama](diaporama.md#tableau-des-réponses)). `minimalCorrection` les réémet telles quelles (donc toujours en orange) séparées par un cadratin `&emsp;`. Le réglage s'applique au seul endroit où les corrections passent dans le code généré : `computeGeneratedExercises` (fiche normale, fusionnée, code autonome de la modale d'édition) et `buildCanVersionContent` (tableau « Course aux nombres »). Dans les deux cas les corrections sont dans un environnement `tasks` en `auto-fit` : une fois réduites à leur réponse, elles se répartissent d'elles-mêmes sur plusieurs colonnes, réglables depuis la palette de l'aperçu.

## Titres, points et exemples corrigés

Avec [exercise-bank 0.7.0](https://typst.app/universe/package/exercise-bank/),
la case « Afficher le titre des exercices » des réglages du document ajoute
l'intitulé MathALÉA après « Exercice N » (`showExerciseTitles`, `title:`).
Elle est décochée par défaut. Un groupe fusionné a un titre vide par défaut ;
un titre personnalisé reste conservé. Après séparation, chaque exercice
retrouve son titre par défaut. Les titres conservent la mise en forme du style
de badge.

Chaque titre est déclaré dans le préambule (`#let exo-N-titre = [...]`) et
`exo.with` y renvoie (`title: exo-N-titre`). Quand la case est cochée, le
bouton « Titre » (`bx-heading`) de la barre d'outils de l'exercice ouvre un
champ prérempli avec le titre : la validation (Entrée ou « Valider ») modifie
seulement cette ligne (`setExerciseTitle`, pas de régénération), un champ vide
retire le titre de cet exercice (`none`), « Titre par défaut » rétablit le
titre MathALÉA (ou le titre vide par défaut pour un groupe fusionné). Un titre
modifié porte le marqueur `// mathalea:titre-perso`,
relu par `harvestCarryOver` (`TypstCarryOver.exerciseTitles`) : il survit à la
régénération et suit l'exercice à la suppression, à la duplication et au
déplacement. Il est saisi en texte simple (littéral `"..."`, sans formule).

Dans les réglages d'un exercice, « Exemple corrigé (correction sous l'énoncé) »
active `worked: true` : la correction reste visible sous l'énoncé même sur une
fiche élève, et n'est pas répétée dans la section finale « Corrections ».
Le réglage (`TypstCarryOver.workedExamples`, marqueurs `mathalea:worked`)
survit à la régénération, au partage par URL et aux déplacements ; une copie
hérite du réglage. Il est commun aux sujets A, B… et s'applique à tout un
groupe fusionné si l'un de ses membres est un exemple corrigé.

La case « Afficher les points des exercices » (`showExercisePoints`) écrit
« …… / 5 pts » au bout de la ligne de titre de chaque exercice, ou sous le
titre à gauche selon « Position des points » (`exercisePointsPosition`)
(`points: exo-N-points`, `exo-setup(points-position: "right" | "below",
points-format: "score")`) ; les corrections ne répètent pas les points. Les points viennent du
barème de la page de garde (`coverPage.bareme`), seule source des points, tant
qu'il compte autant de lignes que d'exercices ; sinon un point par question
(`exercisePoints`). Ils sont déclarés dans le préambule (`#let exo-N-points`,
puis `#let exo-points-total`), un groupe fusionné vaut la somme de ses membres.
Le bouton « Points » (`bx-medal`) de la barre d'outils de l'exercice modifie
le barème (`setExercisePoints`) et régénère la fiche : page de garde, points
des exercices et note restent d'accord. Pour un groupe fusionné, le champ
propose et modifie le total du groupe : les points sont répartis entre ses
membres proportionnellement à leur barème précédent (à parts égales si le
total précédent était nul). Les autres exercices gardent leurs points.
Sans page de garde, la ligne d'en-tête
se termine par « Note : …… / 8 » (`MATHALEA_SCORE_CELL`), avant l'étiquette de
version ; une page de garde a déjà sa case de note. L'habillage d'en-tête
« aucun » n'affiche pas de note globale.

Ces trois réglages sont désactivés dans les modes de fusion globale et
« Course aux nombres », qui n'utilisent pas de bloc `exo` par exercice.

## Styles d'exercice (badges exercise-bank)

Le réglage « Style des exercices » expose les **douze** styles de badge du paquet `exercise-bank` (`BADGE_STYLES`, `buildTypstDocument.ts`), rangés en deux groupes (`<optgroup>` de la liste, même ordre que la constante) :

- **Titre pleine largeur (position figée)** — `border-accent`, `underline`, `rounded-box`, `header-card` (`FULL_WIDTH_BADGE_STYLES`) : le titre occupe déjà une ligne entière, rien à déplacer ;
- **Badge (position réglable)** — `margin`, `box`, `pill`, `tag`, `circled`, `filled-circle`, `rect`, `filled-rect` : le titre est un badge, que « Position du titre » place en marge ou au-dessus de l'énoncé. Le groupe ne dit donc pas où le badge se trouve — c'est le réglage qui en décide.

Les styles pleine largeur écrivent le titre, son filet et l'énoncé à la suite dans un même bloc sécable : contrairement aux badges (`sticky-block`), rien n'empêche le titre de rester seul en bas de page. `buildVersionContent` pose donc `#mathalea-needspace()` (`MATHALEA_NEEDSPACE_HELPER`) avant chaque `#exN()` et chaque `#exo-solution-box(` : s'il reste moins de 5 em sous la position courante, un `colbreak(weak: true)` renvoie l'exercice à la colonne ou à la page suivante ; sinon rien n'est produit. Le calcul lit `page.margin` et prend en compte `flipped` (en paysage, `page.height` reste la hauteur du format non retourné). Un bloc insécable vide suivi d'un `v` négatif ferait le même travail, mais il empêche la fusion de l'espace au-dessus de l'exercice avec celui qui le précède, et l'écart entre exercices augmente.

`hasSideLabel(style)` porte cette distinction côté document, `badgeStyleHasSideLabel` côté interface. Les libellés français sont dans `BADGE_STYLE_LABELS` (`Typst.svelte`) et ne mentionnent plus « (marge) » : la position est désormais un réglage à part.

Pour les styles à colonne de badge, `MARGIN_BADGE_WIDTH` fixe une largeur compacte par style (`margin-position`) et annule le débordement dans la marge de la page (`label-extra: 0pt`) : sans cela le paquet dimensionne la colonne sur « Correction 100 » et étrangle le contenu. La colonne est étroite pour les énoncés et élargie juste avant les corrections, dont le libellé est plus long. Les badges au seul numéro (`circled`, `filled-circle`, `rect`, `filled-rect`) partagent la même largeur de 1,4 cm.

Les corrections portent le même titre que les énoncés, « Exercice N » (`solution-label: "Exercice"` dans `exo-setup`) : elles sont déjà regroupées sous « Corrections » et le numéro renvoie à l'énoncé. Ce libellé se règle donc côté MathALÉA, sans toucher au paquet.

Pour le style `underline`, le paquet fige l'espace entre le titre, son filet et le corps (`v(-0.3em)` et `v(0.5em)` dans `style-underline`) et aucun réglage n'agit dessus : l'espacement entre paragraphes (`par.spacing`) s'y ajoute deux fois et éloigne le filet du titre. `buildTypstDocument` importe alors `exo-solution-box` sous le nom `exo-solution-box-pkg` (`EXERCISE_BANK_IMPORT_UNDERLINE`) et le redéfinit (`MATHALEA_SOLUTION_UNDERLINE_HELPER`) : `par.spacing` est resserré le temps de l'appel (filet à environ 0,2 em du titre), rétabli pour le corps de la correction, et un `v` négatif ramène le blanc sous le filet à environ la moitié de celui qui sépare deux corrections (`solution-above: 1.8em`). Les autres styles gardent l'import et l'appel d'origine. Seules les corrections de la section « Corrections » sont concernées : l'impression directe via `display: "sol"` (corrigé seul) appelle le `exo-solution-box` du paquet et garde l'espacement d'origine.

Le réglage « Position du titre » (`TypstDocumentOptions.badgePosition`, `badge-position` du paquet depuis 0.6.2) choisit entre la colonne de badge (`margin`, défaut) et une ligne d'en-tête au-dessus d'un énoncé pleine largeur (`above`). En `above` il n'y a plus de colonne à dimensionner : `marginBadgeWidth()` renvoie `undefined`, donc ni `margin-position` ni `label-extra` ne sont émis, et la marge horizontale de page repasse à 10 mm. C'est la position à prendre en colonnes, où la colonne du badge coûte une bonne part de la largeur, et avec les énoncés numérotés, dont le retrait s'ajoute à celui du badge.

`badgePosition(options)` neutralise le réglage pour un style pleine largeur (retour `margin`) : la valeur reste mémorisée si l'on repasse à un style à titre latéral, mais aucun `badge-position` n'est émis pendant ce temps. L'interface désactive alors la liste et l'explique en infobulle.

`margin` (titre dans une colonne latérale) est resté hors de la liste tant que sa colonne était figée à 3,35 cm : sur une fiche en deux colonnes, l'énoncé n'était pas plus large que son titre. Depuis **exercise-bank 0.6.4**, cette colonne se replie d'elle-même sous `margin-fold-below` (par défaut trois fois sa largeur, soit 10 cm — franchi dès deux colonnes en A4) : le titre passe sur une ligne d'en-tête et l'énoncé prend toute la largeur. Rien à régler côté MathALÉA, le repli est automatique.

## QR-code vers l'exercice

Case « QR-code vers chaque exercice » (`TypstDocumentOptions.showQrCode`) : ajoute au coin de chaque exercice **non fusionné** un QR-code vers l'exercice seul (URL `exercise.url`). Le QR-code est passé en paramètre `qr:` de `exo.with(...)` (`buildVersionContent`) ; `exercise-bank` le place lui-même (`qr-position: "tasks"`, la liste de questions s'écoule autour).

`qrCodeToTypstImage` (`buildTypstDocument.ts`) rend le QR-code **côté MathALÉA** en SVG (`qrcode` npm) plutôt que de laisser `exercise-bank` déléguer l'URL brute à `tiaoma` : ce dernier ne reçoit qu'une couleur de trait, sans option de fond, et produit un QR-code transparent (illisible sur fond coloré). L'image est enveloppée dans `link(url)[…]` pour que le QR-code du PDF soit un **lien cliquable** vers l'exercice — `tiaoma` ne pose pas de lien. `exercise-bank` accepte aussi bien une URL (`str`) que du contenu Typst déjà mis en forme, il prend donc l'image telle quelle.

En mode fusionné (global ou local) il n'y a pas de bloc `exo.with(...)` par exercice où accrocher le QR-code : la case est sans effet. Le mode « Course aux nombres » n'importe pas `exercise-bank` du tout (voir plus haut).

## QR-code vers la fiche

Case « QR-code vers la fiche (vue élève, 1 exercice par page) » (`TypstDocumentOptions.showQrCodeFiche`) : ajoute à droite du bloc de titre de chaque sujet un QR-code vers cette version de la sélection d'exercices en vue élève, avec les mêmes graines que celles imprimées — un élève qui scanne le QR-code retrouve exactement les exercices de sa photocopie. Réglages encodés dans `es` : un exercice par page, non interactif par défaut mais l'élève peut activer l'interactivité (`isInteractiveFree`). Indépendant de « QR-code vers chaque exercice », qui cible un exercice à la fois et reste désactivé en mode fusionné/Course aux nombres.

`ficheUrl` (`buildTypstDocument.ts`) construit ce lien en réutilisant les paramètres déjà calculés dans l'URL individuelle de chaque exercice (`exercise.url`, la même URL que celle du QR-code par exercice — voir `exerciceUrl` dans `Typst.svelte`) : elle y puise uuid, graine et réglages par exercice sans les recalculer, ne retire que `v`/`es` (propres à un exercice seul) pour les remplacer par les réglages de fiche. Les exercices non imprimables (avertissement, ou sans URL) en sont exclus ; si aucun exercice n'a d'URL, aucun QR-code n'est ajouté.

`ficheQrCodeLines` place le QR-code avec `#exo-corner(...)` (exercise-bank ≥ 0.8.0), juste avant le bloc de titre de chaque sujet. `exo-corner` le pose au bord droit, à cet endroit du flux, sans y prendre de place, et publie la zone qu'il occupe. Le bloc de titre (enveloppé dans `#exo-corner-fit[...]` par `headerBlock`), les titres d'exercices et leurs filets s'arrêtent avant cette zone ; l'énoncé du premier exercice la contourne (texte d'introduction et grille de questions rangés à sa gauche, autre bloc repoussé dessous). Rien ne passe donc sous le QR-code, quel que soit l'habillage d'en-tête, y compris « Aucun ». Avec une page de garde pleine page, le QR-code se trouve ainsi sur la première page d'exercices. En mode fusionné ou « Course aux nombres », seuls `exo-corner` et `exo-corner-fit` sont importés (`EXERCISE_BANK_CORNER_IMPORT`).

Le source généré importe `tiaoma` et déclare une adresse par sujet : `#let qr-code-global-url = "..."` pour Sujet A, puis `#let qr-code-global-url-1 = "..."`, etc. Le QR-code est généré à la compilation par Typst. Une personne qui édite la fiche peut donc remplacer directement l’URL de chaque version sans modifier une image SVG encodée.

Un repère `qr-code`, indexé par sujet, est émis au centre de chaque code : la palette de l'aperçu y affiche un crayon qui édite la variable de la version affichée, par une modification ciblée et annulable du source Typst.

La page de garde « Course aux nombres » termine par un saut de page. Lorsque cette présentation est active, elle reçoit donc le QR-code comme paramètre et le place avant ce saut : l'ajouter dans le bloc d'en-tête commun l'aurait placé sur la deuxième page, où le garde de première page l'aurait masqué.

## Raccourcissement de l'URL du QR-code de fiche via edurl.fr

Dans le popover d'édition du QR-code de fiche (widget `qr-code`, `TypstLayoutOverlay.svelte`), le champ de saisie manuelle de l'URL est accompagné d'un bouton « Raccourcir via edurl.fr », qui appelle l'API Shlink de `raccourcisseur.apps.education.fr` pour remplacer l'URL longue par une URL courte plus lisible sur un document imprimé. Limité à ce QR-code global : le QR-code par exercice (« QR-code vers l'exercice » ci-dessus) n'a pas de champ d'URL éditable et n'est donc pas concerné.

La saisie manuelle de l'URL reste possible à tout moment, indépendamment de ce bouton : les deux voies remplissent le même champ (`qrCodeDraft`), et c'est toujours l'utilisateur qui valide (Entrée ou « Enregistrer ») pour l'écrire dans le source Typst — le clic sur « Raccourcir » ne l'applique jamais tout seul.

### Toujours la vraie URL longue, jamais un raccourci de raccourci

Le bouton ne repart jamais de ce qu'il y a dans le champ (qui peut déjà être une URL courte issue d'un raccourcissement précédent, ou collée à la main) : il redemande systématiquement l'URL longue d'origine via `onGetFicheLongUrl` (prop de `TypstLayoutOverlay.svelte`, implémentée dans `Typst.svelte` par `ficheUrlForVersion`), qui rappelle `buildAllVersionInputs()` puis la même fonction `ficheUrl` (`buildTypstDocument.ts`, désormais exportée) que celle qui calcule l'URL longue à la génération du document. Sans ce recalcul à la volée, la vraie URL longue serait perdue dès le premier raccourcissement : une fois écrite, `#let qr-code-global-url(-N) = "..."` dans le source ne contient plus que l'URL courte, et `qrCodeUrlValues` (lu depuis le code) ne reflète alors plus que celle-ci.

### Jeton d'accès

edurl.fr exige un jeton personnel (portail.apps.education.fr → Mon profil → Jeton d'accès). Il est géré par `src/lib/edurl/token.ts`, commun à tout MathALÉA (lien élève, quizz, diaporama, sélections), et se règle aussi dans « Mes sauvegardes » (voir [Jeton edurl.fr et liens raccourcis](mes-sauvegardes.md#jeton-edurlfr-et-liens-raccourcis)). Il est stocké dans une clé localStorage dédiée, `mathalea-edurl-token`, séparée du blob de préférences (`STORAGE_KEY`) que gère par ailleurs `Typst.svelte` : ce n'est pas un réglage de mise en page, il ne doit donc pas être remis à zéro par « Réinitialiser les réglages ».

Le popover gère tout le cycle de vie du jeton lui-même :

- premier clic sur « Raccourcir » sans jeton enregistré (ou après un rejet, voir plus bas) : un champ `type="password"` apparaît à la place du bouton ; l'enregistrer relance immédiatement le raccourcissement ;
- une fois un jeton présent, un lien « Oublier le jeton » reste visible à côté du bouton, pour le retirer et en ressaisir un autre à tout moment, sans attendre une erreur.

Ce jeton est propre à MathALÉA (partagé par toutes ses vues) : il n'est pas partagé avec celui du widget autonome `poc-widget-edurl` (voir plus bas), les deux vivant de toute façon sur des origines différentes et ne pouvant pas se partager de localStorage.

### Titre du raccourci

Le raccourci créé sur edurl.fr reçoit un titre composé `mathalea-<date>-<hhmmss>-<titre de la fiche>` (par exemple `mathalea-20260920-143512-Fiche d'exercices`), bâti par `edurlLinkTitle()` à partir de l'heure locale du poste et de `ficheTitle` (prop reflétant `documentOptions.title`, donc le titre éventuellement personnalisé par l'utilisateur, pas la valeur par défaut « Fiche d'exercices » figée).

### Réseau : appel direct, pas d'iframe

Contrairement au widget `poc-widget-edurl` (projet GitLab séparé, pensé pour être embarqué en iframe sur plusieurs sites via `postMessage`, afin d'isoler complètement le jeton du site hôte), l'intégration MathALÉA fait un appel `fetch` direct (`shortenUrl`, `src/lib/edurl/api.ts`) vers l'API REST du raccourcisseur (`POST https://raccourcisseur.apps.education.fr/api/shortUrls`, en-tête `x-auth-token`), qui accepte les requêtes de tout site : ni iframe cachée, ni écoute `postMessage`, ni relais n8n. Le détail de l'API (champs obligatoires de la création, `customSlug`, liste, modification) est dans [Jeton edurl.fr et liens raccourcis](mes-sauvegardes.md#jeton-edurlfr-et-liens-raccourcis).

Un jeton rejeté (`401`) est effacé du localStorage et le champ de saisie du jeton réapparaît avec un message d'erreur, sur le même principe que `poc-widget-edurl`.

### Fichiers touchés

| Fichier                     | Rôle dans cette fonctionnalité                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildTypstDocument.ts`     | `ficheUrl` exportée (était privée) pour être réutilisée hors génération du document                                                                         |
| `Typst.svelte`              | `ficheUrlForVersion(version)` : recalcule l'URL longue à la volée ; props `ficheTitle` et `onGetFicheLongUrl` passées à `TypstLayoutOverlay`                |
| `TypstLayoutOverlay.svelte` | UI du popover (bouton, spinner, formulaire de jeton, « Oublier le jeton », message d'erreur) ; jeton, appel au relais et titre viennent de `src/lib/edurl/` |

## Impression recto-verso (démarrage sur page impaire)

Case à cocher « Impression recto-verso » des Réglages du document (`TypstDocumentOptions.oddPageStarts`, **active par défaut**) : chaque partie qui commence sur une nouvelle page — le bloc « Corrections » et chaque sujet d'une fiche à plusieurs versions — commence sur une page impaire, Typst insérant au besoin une page blanche. En impression recto-verso en série, une partie ne commence ainsi jamais au dos de la précédente ; le partage énoncé/corrigé en deux PDF (`downloadPdfSeparate`) en profite de la même façon, chaque sujet y restant sur un recto.

Un seul point de passage, `sectionPageBreak(options)` (`buildTypstDocument.ts`), appelé aux quatre endroits qui ouvrent une partie : les corrections des trois modes de fiche (« Course aux nombres », fusionné, banque) et le saut entre deux sujets. Il rend `#pagebreak(weak: true)` quand le réglage est décoché, et sinon :

```typ
#{ set page(header: none, footer: none); pagebreak(to: "odd", weak: true) }
```

Le `set page` est **scopé au bloc de code** : la page blanche éventuellement insérée par `to: "odd"` naît dans ce bloc et sort donc sans en-tête ni pied de page (sinon elle afficherait une pagination incongrue, « 4/3 »), tandis que la page courante et celle de la partie qui suit, hors du bloc, gardent les leurs.

À savoir :

- `to: "odd"` regarde le **compteur de pages**, que chaque sujet remet à 1 juste après le saut. Comme le premier sujet démarre à la page physique 1 et que chaque sujet suivant démarre sur une page impaire, la parité du compteur reste celle des pages physiques — la parité ne dérive donc pas de sujet en sujet ;
- une variante « manuelle » (`context if calc.odd(here().page())` puis saut) a été écartée : le repère d'introspection est résolu de l'autre côté du saut de page faible, la parité lue n'est pas celle attendue ;
- les pages de garde (`#mathalea-couverture-*`) gardent leur `pagebreak()` simple : la fiche suit volontairement au dos de sa couverture.

## Plusieurs sujets sur une page

Pour les sujets courts, deux réglages du document placent plusieurs sujets sur
une même page, à découper :

- « Plusieurs sujets sur une page » (`chainSubjects`, à partir de deux sujets) :
  les sujets A, B… se suivent ;
- « Exemplaires par page » (`copiesPerPage`, 1 à 4) : chaque sujet est répété.

Les sujets d'une même page s'en partagent la hauteur à parts égales, séparées
par un trait pointillé. Un sujet qui ne tient pas dans sa part commence une
nouvelle page ; un exemplaire qui ne tient pas est omis. Les corrections sont
regroupées après tous les sujets. Possible sans page de garde ou avec le
bandeau compact (`recitation`), qui se répète en tête de chaque part ; les
autres modèles occupent une page entière.

Mise en œuvre (`buildTypstDocument.ts`) : chaque sujet devient une variable de
contenu (`#let mathalea-sujet-N = [...]`, les exemplaires `-copie` sans
repères de la palette) et `MATHALEA_CHAIN_HELPER` (`#mathalea-enchainement`)
mesure leur hauteur dans le corps de page (`pageBodySize`) pour former les
groupes. Les hauteurs sont mesurées, pas lues sur la position courante : la
mise en page converge en une passe. Le document n'a alors pas de repère de
sujet (`// mathalea:sujet(N)`) : l'aperçu montre la fiche entière, et le
sélecteur « Aperçu » des sujets est masqué.

Les réglages ne sont proposés que si deux sujets tiennent sur une page. Les
repères `subject-start`/`subject-end` (début et fin des énoncés de chaque
sujet) donnent leur hauteur à l'aperçu (`subjectsPerPage` dans
`Typst.svelte`), le plus haut décidant. Quand les sujets sont enchaînés, la
palette ne garde que les repères du premier sujet (`paletteAnchors`, bornés
par `subject-start`/`subject-end` et `subject-corr`) : ses réglages sont
communs aux sujets.

Limite connue : le zoom d'une figure (`fig-N-zoom`) est propre à chaque sujet ;
réduire les figures du sujet A ne réduit pas celles du sujet B, qui peut alors
ne plus tenir dans sa part.

## Persistance dans l'URL

Toutes les modifications de la fiche sont sauvegardées dans l'URL (paramètre `typstParam`, JSON encodé en base64) pour pouvoir la recharger à l'identique ou la partager :

- `options` : les réglages du document (`TypstDocumentOptions` — format, orientation, polices, titre/sous-titre/en-tête, nombre de versions, page de garde…). Une fiche partagée avant l'arrivée d'un réglage, ou pointant un modèle de page de garde qui n'existe plus, retombe sur les valeurs par défaut (`sanitizeCoverPage`) ; `options.versionSeeds` (graines épinglées par sujet, voir [Graines par sujet et « Nouvelles données »](#graines-par-sujet-et--nouvelles-données-)) est validé au chargement et remis à `undefined` s'il est mal formé ;
- `carryOver` : les réglages de la palette de mise en page (`harvestCarryOver` — colonnes/espacement des questions par exercice, textes et sections insérés, sauts de page et de colonne, fusions, zoom/alignement des figures).

La liste des exercices, leurs graines et leurs réglages restent portés par les paramètres habituels de l'URL (`exercicesParams`), mis à jour par le store du même nom : suppression, déplacement, changement de graine ou de nombre de questions y sont déjà reflétés.

`persistToUrl` (dans `Typst.svelte`) est appelée après chaque modification (réglage du document ou édition de la palette, via le `updateListener` de CodeMirror). Elle écrit dans `typstParamStore` (source de vérité), redéclenche l'écrivain d'URL de l'app (`mathaleaUpdateUrlFromExercicesParams`, sinon sa prochaine écriture débouncée réécrirait l'URL sans `typstParam`) puis pose immédiatement le paramètre avec `history.replaceState`. Au chargement, `parsed.carryOver` est réinjecté dans la première génération du code (`buildCode` part de `urlCarryOver` tant que l'éditeur n'existe pas). `typstParam` est aussi le canal par lequel le diaporama transmet son nombre de vues (`goToTypstWithSeries`).

### Longueur de l'URL et fichier de redirection

`typstParam` n'a pas de taille bornée (le code saisi à la main dans la palette, les textes insérés…) alors que les serveurs refusent les URL trop longues (HTTP 414/431, souvent au-delà de 8 000 caractères) : la page ne se rechargerait plus. `typstUrlParam.ts` fixe donc le transport selon la taille (`TYPST_URL_BUDGET`, 6 000 caractères pour l'URL complète) :

- **cas courant** : `?typstParam=<base64>` ;
- **trop volumineux** : la barre d'adresse ne garde que `?typstParam=local` ; la valeur complète est mise de côté dans le `sessionStorage` de l'onglet (le rechargement fonctionne). Dans un autre onglet ou navigateur, la référence est ignorée : la fiche s'ouvre avec les réglages par défaut au lieu de planter ;
- **lien à partager** (`buildShareUrl`, aussi inscrit en commentaire dans le `.typ`) : la valeur complète passe dans le **fragment** `#typstParam=<base64>` quand l'URL dépasserait le budget. Un fragment n'est jamais envoyé au serveur, il n'est donc pas limité.

`Typst.svelte` garde la valeur complète (`fullTypstParam`) ; seul `typstParamStore` (donc l'URL de la barre d'adresse) reçoit la forme compatible avec le budget (`typstParamForAddressBar`). Au chargement, `readTypstParam` accepte les trois formes et le fragment est retiré de l'URL.

Le bouton en haut de la vue (icône lien externe) télécharge `<titre>_mathalea.html`, une page HTML qui redirige (`<meta http-equiv="refresh">`, sans JavaScript) vers `buildShareUrl` : un lien durable à déposer sur un ENT ou dans un dossier, sans limite de longueur.

## Visite guidée

`src/lib/onboarding/typstTour.ts` (driver.js) présente la vue : modes d'affichage, aperçu, palette de mise en page, ajout d'un exercice (démontré par de vrais clics dans la modale), réglages du document — dont les liens vers les trois autres exports —, versions et export. Elle se déclenche au premier passage (hors mobile, hors `localhost`, hors lien partagé) et se relance depuis le bouton « Aide ».

Deux précautions, sans lesquelles driver.js reste bloqué à attendre une cible introuvable (`waitForElement`) :

- `ensureTourReadyState()` remet la vue dans l'état ciblé par la visite (mode Aperçu, panneau de réglages ouvert, palette de mise en page affichée) et le restaure à la fin ;
- les étapes dont la cible n'existe pas sur toutes les fiches sont **retirées de la liste** au démarrage : la pastille colonnes/espacement (`findTasksWidget`, absente d'une fiche « Course aux nombres » sans correction, puisque ses questions sont dans un tableau), le saut de page et l'ajout d'exercice. Le compteur d'étapes s'ajuste donc à la fiche.

## Fichiers

| Fichier                                                               | Rôle                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/components/setup/typst/Typst.svelte`                             | La vue : barre d'outils, éditeur, aperçu, exports                                    |
| `src/lib/onboarding/typstTour.ts`                                     | Visite guidée de la vue (driver.js)                                                  |
| `src/components/setup/typst/TypstLayoutOverlay.svelte`                | Palette de mise en page dessinée par-dessus l'aperçu                                 |
| `src/components/setup/typst/overlaySections.ts`                       | Section (exercice/correction) survolée et sections de chaque contrôle de la palette  |
| `src/components/setup/typst/addExercise/TypstAddExerciseModal.svelte` | Modale « Ajouter un exercice » (navigation dans les référentiels)                    |
| `src/components/setup/typst/addExercise/TypstExercisePreview.svelte`  | Aperçu d'un exercice dans cette modale (réglages et ajout)                           |
| `src/components/setup/typst/buildTypstDocument.ts`                    | Génère le code Typst complet (en-tête, exercices, corrections)                       |
| `src/components/setup/typst/latexToTypst.ts`                          | Convertit le HTML des exercices et les formules LaTeX en Typst                       |
| `src/components/setup/typst/minimalCorrection.ts`                     | Réduit une correction à ses réponses mises en évidence en orange                     |
| `src/components/setup/typst/mathaleaLogo.ts`                          | Dé de MathALÉA (SVG allégé) embarqué par la page de garde « Course aux nombres »     |
| `src/components/setup/typst/typstPackages.ts`                         | Versions des paquets `@preview` (source unique) et construction des lignes `#import` |
| `src/components/setup/typst/typstCompiler.ts`                         | Compilation dans le navigateur via typst.ts (WASM)                                   |
| `src/components/setup/typst/typstDiagnostics.ts`                      | Lecture et traduction en français des diagnostics du compilateur                     |
| `src/components/setup/typst/editor/typstEditorSetup.ts`               | Extensions CodeMirror de l'éditeur (thèmes, raccourcis, marqueurs d'erreur)          |
| `src/components/setup/typst/editor/typstLanguage.ts`                  | Coloration syntaxique Typst (`StreamLanguage`)                                       |
| `src/components/setup/typst/editor/editorPhrases.ts`                  | Traduction française de l'interface de CodeMirror                                    |

## Versions des paquets Typst

Toutes les versions des paquets `@preview` importés par les documents générés (`exercise-bank`, `taskize`, `vartable`, `cetz`, `cetz-plot`, `ctz-euclide`, `breather`) sont déclarées **au seul endroit** `src/components/setup/typst/typstPackages.ts`, dans la table `TYPST_PACKAGE_VERSIONS`. Mettre à jour un paquet consiste donc à changer un numéro dans cette table.

Les constantes d'import (`EXERCISE_BANK_IMPORT`, `TASKIZE_IMPORT`, `VARTABLE_IMPORT`, `CETZ_IMPORT`, `CETZ_PLOT_CHART_IMPORT`, `CTZ_EUCLIDE_IMPORT`, `BREATHER_IMPORT`) sont construites à partir de cette table par `typstImport(nom, importés)` ; `typstPackageSpec(nom)` renvoie le spécificateur `@preview/nom:version` seul. Les tests qui vérifient le préambule utilisent `typstPackageSpec` plutôt qu'un numéro écrit en dur : aucune version n'est à retoucher ailleurs après une mise à jour.

## Pipeline de génération

1. Les exercices sont chargés avec `buildExercisesList` (graines `alea`, contenu HTML avec formules KaTeX en `$...$`), en régénérant chaque exercice avec `context.isHtml = true` et `context.isTypst = true` (le rendu HTML est réutilisé, pas le rendu LaTeX). Voir [Variantes d'exercices — branches de rendu](../../auteurs-exercices/complements/variantes-exercices.md#branches-de-rendu) pour ce que cela implique côté code d'exercice (branches `context.isHtml` qui posent un composant interactif non convertible).
2. `buildTypstDocument` assemble le document : réglages éditables en tête de fichier (`#let colonnes`, `#let corrige`, `#let couleur`), en-tête de fiche, un bloc par exercice, section corrections dans un `#if corrige [...]`.
3. `htmlToTypst` convertit chaque contenu : balises simples (`<br>`, `<b>`, `<i>`, `<sup>`, listes...) vers le balisage Typst, échappement des caractères spéciaux, et formules LaTeX converties par [tex2typst](https://github.com/qwinsi/tex2typst).

`texteEnCarte()` traite `context.isTypst` avant sa branche HTML et émet un
marqueur `<mathalea-typst>` contenant une boîte Typst native. Les cartes
conservent ainsi leur fond bleu ou orange, leur bordure et leurs dimensions au
lieu d'être aplaties comme un `<span>` HTML ordinaire.

Particularités de la conversion des formules (`latexMathToTypst`) :

- blanc à compléter (`\ldots` seul, comme dans `remplisLesBlancs`) rendu par une boîte de 5 em de pointillés de conduite (`#box(width: 5em, repeat(gap: 2pt)[.])`, constante `ANSWER_BLANK`) pour que l'élève puisse écrire dedans, y compris une fraction ; les vraies ellipses de suites (bordées de virgules) sont épargnées. `mathaleaFormatExercice` ayant déjà remplacé les `\ldots` des énoncés par `....` (quatre points) avant la conversion, ce motif est reconnu au même titre que `\ldots` ;
- virgule décimale française rendue sans espace (`3,5` → `3","5`) ;
- `\num`/`\numprint` dépliés en conservant les espaces fines (`\,`) ;
- espaces LaTeX explicites (`\thinspace`, `\medspace`, `\thickspace`) normalisées vers les espaces mathématiques Typst ;
- espaces insécables HTML (`&nbsp;`, entités numériques ou caractère U+00A0, notamment issus de `sp()`) converties en `~` LaTeX puis en `space.nobreak` Typst dans les formules ; à l'intérieur de `\text{…}`, elles restent des caractères littéraux ;
- les espaces sources qui bordent une chaîne de texte (`#txt("…")`, `" "`) sont supprimées : contrairement à LaTeX, Typst rend en mode maths l'espace qui précède ou suit une chaîne, elle s'ajouterait donc à celle contenue dans le `\text{…}` (`5\text{ cm}`) ou à l'espace insécable qui précède (`5~\text{cm}`) et afficherait une double espace ;
- la mise en évidence `{\color{...}\boldsymbol{...}}` de `miseEnEvidence` est convertie en `#text(fill: rgb("..."))` ; `\boldsymbol` devient `bold(...)` (gras **italique**, comme en LaTeX) et non `upright(bold(...))`, qui redresserait les variables des réponses en orange ;
- les crochets mathématiques sont convertis en glyphes `bracket.l`/`bracket.r`, y compris autour d'un contenu uniquement en minuscules (`[x]`, `K[x]`) et lorsqu'un crochet isolé est mis en évidence ; les bornes intérieures des réunions, intersections et différences d'intervalles en notation française sont reconnues avant cette conversion afin de ne pas être confondues avec la paire ambiguë `[union]`, `[inter]` ou `[without]` produite par `tex2typst` ; ces transformations de structure, ainsi que l'équilibrage des parenthèses, ignorent les chaînes Typst afin de conserver littéralement les délimiteurs de `\text{…}` ;
- en cas d'échec de conversion, la formule est insérée verbatim entre guillemets.

Certains énoncés « Course aux nombres » sont écrits en LaTeX **mode texte**
(hors `$...$`) plutôt qu'en HTML : `htmlToTypst` y traduit aussi `\quad`,
`\qquad`, `\medskip`, `\underline`, `\newline`, `\hspace{…}`,
`\texttt{…}` (`#raw`), `\fbox{…}`/`\framebox{…}` (cadre), `\parbox{L}{…}`
(boîte) et supprime `\setlength{…}{…}`, sans équivalent Typst. `\dots{}` et
`\ldots` hors formule deviennent des pointillés de réponse. La largeur de
`\parbox` n'est pas reprise : les exercices l'expriment en fraction de
`\linewidth`, mesure prise sur la page A4 de la sortie LaTeX, alors que la
boîte atterrit souvent dans une cellule bien plus étroite (tableau « Course
aux nombres »), où la largeur littérale couperait les lignes de l'algorithme
encadré ; une boîte Typst sans largeur prend celle de son contenu et ne se
replie que s'il déborde.
Les arguments sont lus à accolades équilibrées (`replaceLatexCommand`), donc
les boîtes imbriquées le sont aussi ; `\linewidth` et ses synonymes deviennent
un pourcentage (`0.5\linewidth` → `50%`).

Les macros ProfCollege de la sortie LaTeX (`\Lg[cm]{5}`, `\Capa[cL]{5}`,
`\Prix[0]{12}`) sont écrites par les `canEnonce`/`canReponseACompleter` sans
tester
`context.isHtml` : elles arrivent donc dans la conversion Typst, en mode
mathématique comme en mode texte. `remplaceMacrosProfCollege` les rend en
valeur suivie de son unité. `\Capa` utilise L par défaut ; `\Prix` formate le
nombre avec les décimales de son argument optionnel, deux par défaut.
L'argument entre accolades est vide
derrière des pointillés à compléter (`$\ldots$ \Lg[mm]{}`), seule l'unité est
alors rendue. Sans cela, `$\Lg[mm]{24}$` deviendrait la variable Typst
inconnue `Lg`, donc une erreur de compilation.

#### Ligne de base des formules en ligne

Une formule en ligne ne doit jamais être coupée entre deux lignes : c'est
`box` qui l'en empêche, mais il aligne le **bas** de son contenu sur la ligne
de base — une fraction (toutes sont en display, voir `#show math.frac` du
préambule), une parenthèse haute ou un indice se retrouveraient entièrement
au-dessus du texte qui les entoure.

`MATHALEA_INLINE_FORMULA_RULE` (préambule, partagé par la fiche, les
flash-cards et le diaporama) rend donc à la boîte la profondeur de la formule,
que Typst n'expose pas : mesurée à côté d'une boîte plus haute qu'elle (dont
la ligne de base est le bas, justement parce que `box` aligne par le bas), la
formule ne dépasse que par le bas, et la hauteur de la ligne obtenue vaut
celle du témoin plus la profondeur cherchée. Une formule qui contient déjà des
retours à la ligne (`\begin{aligned}`) est alignée sur sa **première** ligne,
mesurée à part.

C'est une règle d'affichage et non un enrobage émis par le convertisseur
(`latexSegmentToTypst` produit `$…$` nu) : l'énoncé garde ainsi un
`math.equation` dans l'arbre de contenu, seule forme que `is-inline-content`
(paquet taskize) reconnaît comme étant en ligne — sans quoi le numéro de la
question serait aligné en haut de l'énoncé au lieu de partager sa première
ligne (voir [Numérotation des questions](#numérotation-des-questions)).

### Numérotation des questions

Les questions d'un exercice (et les propositions d'un QCM) sont mises en
colonnes par le paquet [`taskize`](https://typst.app/universe/package/taskize)
(`#tasks(...)`). Le paquet aligne le numéro sur la **première ligne** de
l'énoncé tant que celui-ci tient entièrement en ligne ; sinon il place le
numéro et l'énoncé dans deux cellules alignées par le **haut**. Comme toutes
les fractions sont rendues en display (`#show math.frac: it => math.display(it)`),
la première ligne d'un énoncé à fraction est plus haute que la normale : sa
ligne de base descend, et le numéro semble « décollé » vers le haut. Le cas
est fréquent (QCM : un texte, puis le bloc des propositions ; énoncé suivi
d'une figure ou d'un tableau).

`MATHALEA_TASKS_HELPER` (`latexToTypst.ts`) corrige ce décalage en
redéfinissant `tasks` par-dessus celle du paquet, importée sous le nom
`taskize-tasks` (l'import et le helper vont donc toujours ensemble, dans les
quatre vues Typst). Le code généré, lui, ne change pas : les listes de
questions s'écrivent toujours `#tasks(columns: exN-colonnes, label: ..., …)`,
le motif de `label` reprenant le style de numérotation choisi dans les
Réglages du document (`1)` par défaut — voir [Styles des
questions](#styles-des-questions-réglage-du-document)).

- L'enrobage numérote lui-même chaque liste : chaque question est décalée du
  retrait de son étiquette (`pad`), et le numéro, posé en tête de la première
  ligne dans une boîte de largeur nulle, est ramené dans la marge ainsi
  libérée (`move`) — il partage la ligne du texte, donc sa ligne de base,
  quelle que soit la hauteur de celle-ci. Le paquet ne s'occupe alors plus
  que des colonnes (`label: none`).
- Pour une liste dont toutes les questions sont en ligne, le retrait est celui
  que le paquet aurait appliqué (largeur du numéro + écart, puis écart) : le
  rendu est le même. Ces listes ne sont pas passées au paquet, car son chemin
  « en ligne » met le numéro dans le paragraphe, à côté de la formule. Or le
  `#show math.equation` du préambule enrobe chaque formule en ligne dans une
  boîte insécable (pour caler sa ligne de base) : une formule presque aussi
  large que la ligne ne tenait plus à côté du numéro et passait en dessous,
  laissant « a) » seul sur sa ligne (décompositions d'entiers `CM2N1D-3`).
  Avec un numéro de largeur nulle, la boîte tient dans la ligne.
- Une question qui **commence** par un bloc (figure, tableau) n'a pas de
  ligne de texte où poser le numéro : elle garde la présentation en deux
  cellules alignées par le haut.

Conséquence à connaître : dans une liste ainsi numérotée, la syntaxe de fusion
de colonnes de `taskize` (`+ () …`, `+ (2) …`) n'est plus reconnue, le repère
n'étant plus en tête du contenu de l'item. MathALÉA ne l'émet pas, mais du
code modifié à la main pourrait l'utiliser.

#### Enrobage à retirer quand `taskize` corrigera le cas en amont

L'enrobage est un contournement : le correctif a sa place dans le paquet, qui
gère déjà l'alignement des énoncés purement en ligne (`is-inline-content`,
chemin `make-inline-cell`). Il ne lui manque que la branche « commence en
ligne, puis contient un bloc ». Un patch en ce sens (fonction
`starts-inline()` et branche `make-hanging-cell()` dans `make-item-cells()`) a
été proposé à l'auteur sur
[nathan-ed/typst-package-taskize](https://github.com/nathan-ed/typst-package-taskize)
(paquet MIT).

**Dès qu'une version de `taskize` aligne elle-même le numéro dans ce cas**, il
faut retirer l'enrobage plutôt que de l'empiler sur un paquet corrigé :

1. supprimer `MATHALEA_TASKS_HELPER` (`latexToTypst.ts`) et rétablir l'import
   simple `#import "@preview/taskize:VERSION": tasks, tasks-setup` dans
   `TASKIZE_IMPORT` (le nouvel import ne sert plus `taskize-tasks`,
   `is-inline-content` ni `format-label`) ;
2. retirer le `MATHALEA_TASKS_HELPER` des quatre points d'émission :
   `buildTypstDocument.ts` (document complet et `buildStandaloneExerciseCode`),
   `buildSlidesDocument.ts`, `buildFlashcardsDocument.ts` ;
3. adapter les tests du bloc « numérotation alignée sur la première ligne de
   l'énoncé » (`buildTypstDocument.test.ts`) : l'assertion sur l'import aliasé
   et celles sur `mathalea-question-numerotee` tombent, le test de compilation
   CLI du QCM à fractions reste utile (il vaut alors vérification du rendu du
   paquet) ;
4. supprimer cette sous-section et l'avertissement sur la fusion de colonnes
   ci-dessus, qui redevient valable.

Le code généré ne change pas au passage (les listes s'écrivent toujours
`#tasks(...)`) : le retrait ne touche que le préambule.

### Consigne en mode fusionné

Hors fusion, `exerciseBody` affiche `TypstExerciseInput.intro` (consigne

- introduction, concaténées) une fois avant la liste `#tasks(...)`, chaque
  exercice gardant par ailleurs son titre ou son badge. Quand
  **« Fusionner tous les exercices »** (`options.mergeExercises`) est coché, il
  n'y a plus ni titre ni badge et les questions de tous les exercices sont
  numérotées à la suite dans des listes séparées : une question isolée au
  milieu du flux ne dirait plus quoi faire. `exerciseBody` recopie donc la
  **consigne seule** (`TypstExerciseInput.consigne`, tenue à part de
  `introduction` par `Typst.svelte` et `typst-batch-worker.ts`) en tête de
  **chaque** item de la liste, derrière un retour à la ligne Typst (`\`), juste
  après le numéro ; seule l'`introduction` éventuelle reste affichée une fois
  avant la liste. Le repli (`repeatConsigne`) ne s'active que si la consigne se
  rend sur une seule ligne — une consigne-bloc garde l'affichage classique
  avant la liste. La fusion **locale** (bouton « fusionner avec le précédent »
  de la palette), qui conserve un titre par groupe, n'est pas concernée.

### Colonnes des QCM

Les propositions d'un QCM (`propositionsQcm`, ou le QCM statique d'un
`multi-mathfield` — `<span class="ex0">` au lieu de `<div>` —, repérées par les libellés
`labelEx{N}Q{i}R{rep}`) sont mises en colonnes par le même paquet `taskize`
que les questions : `qcmToTypst` (`latexToTypst.ts`) émet
`#tasks(columns: …, label: none, equilibre: true)`. Les `<br>` qui séparent
l'énoncé des propositions (deux, posés par `buildQcmForExercise` pour aérer la
page web) sont retirés par `protectQcm` : le bloc a déjà son propre espacement
et ils laissaient des lignes vides au-dessus. L'étiquetage automatique de `tasks`
(identique pour chaque item) n'est pas utilisé : `qcmToTypst` préfixe
lui-même chaque item de son propre marqueur, calculé selon le format détecté
par `qcmChoiceFormat` (présence ou non d'un `<input>` dans le choix, voir
`propositionsQcm` côté `qcm.ts`) — une case à cocher `qcm-case` (format
`case`, le défaut) ou une lettre en boîte `qcm-lettre` (format `lettre`),
définies dans `MATHALEA_QCM_HELPERS`. Dans le corrigé, la bonne réponse
(détectée par `qcmChoiceIsCorrect`, valable pour une case à cocher ou un
bouton radio de QCU) reçoit en plus le marqueur « correct » (case cochée,
lettre en boîte blanche à bordure noire) et son texte est mis en évidence
par `qcm-bonne` — ce double repère reproduit l'apparence des cases/lettres
du PDF (`\faSquare`/`\faCheckSquare`, `\colorbox`/`\fcolorbox` dans
`preambuleTex.ts`), là où le texte de consigne dit « Cocher » ou « Entourer
la lettre ».

Le nombre de colonnes se règle **par exercice**, comme celui des questions :
`htmlToTypst` reçoit en dernier argument le nom de la variable à écrire, et
`exerciseBody` lui passe `#let exN-qcm-colonnes` (ou `exN-corr-qcm-colonnes`
pour la correction, réglable indépendamment). Le préfixe `exN-qcm` traverse
donc toute la mécanique existante sans cas particulier : découverte par scan
du code généré, déclaration dans le préambule à partir du carry-over,
renumérotation par `shiftCarryOver`/`swapCarryOver`, pastille de la palette.
Deux différences avec les listes de questions :

- pas de variable `-gutter` : les propositions gardent l'espacement du paquet ;
- le défaut dépend du **contenu des propositions** (`qcmHasFigure`) :
  - propositions textuelles : `"auto-fit"`, comme les questions, mais résolu
    par l'enrobage `tasks` de `MATHALEA_TASKS_HELPER` et non par `taskize` :
    `qcmToTypst` passe `equilibre: true`, et `mathalea-colonnes-equilibrees`
    retient le plus grand nombre de colonnes **équilibré** (toutes les lignes
    pleines sauf la dernière : 4, 2 ou 1 pour quatre propositions) où la
    proposition la plus large tient sur une ligne. Quatre fractions courtes
    s'étalent sur quatre, des phrases moyennes passent sur deux lignes de deux,
    une phrase longue retombe sur une colonne (y compris quand aucune proposition
    ne tient sur une ligne : `mathalea-colonnes-equilibrees` renvoie alors `1`,
    et non `none`, que `taskize` refuse comme nombre de colonnes). L'`auto-fit` de `taskize`
    pouvait choisir trois colonnes (la quatrième proposition seule sur sa
    ligne) ou, en mode `fill`, étaler une proposition sur plusieurs colonnes ;
  - **au moins une proposition est une figure : 1 colonne.** `auto-fit` serait
    ici trompeur : une figure passe par `mathalea-fit` /
    `mathalea-figure-block`, qui la **réduisent** pour tenir dans la largeur
    qu'on leur donne. Elle « tient » donc dans une colonne de n'importe quelle
    largeur, `auto-fit` en choisit quatre, et quatre droites graduées
    deviennent illisibles. Une colonne est la seule largeur qui les préserve.

Un exercice peut imposer son propre défaut : l'option `typstColumns` de
`propositionsQcm(this, i, { style: '', format: 'lettre', typstColumns: 2 })`
pose `data-typst-colonnes="2"` sur le bloc des propositions (vue Typst
seulement). `protectQcm` le relaie à `qcmToTypst`, qui écrit alors
`// mathalea:qcm-colonnes(2)` sur le `#tasks(...)` à la place du marqueur
`qcm-figures` ; `qcmRequestedColumns` (`buildTypstDocument.ts`) le relit et
l'emporte sur le défaut par contenu, y compris pour des figures (voir `TSA3-46` :
quatre courbes rangées en grille 2×2). Comme le défaut par contenu, il n'est pas
figé dans le carry-over : la palette garde la main. `typstFigureAlign: 'left'` fait de même
pour l'alignement des figures des propositions (`data-typst-align`) : `protectQcm`
ajoute `default-align: left` à chaque appel `mathalea-figure-block` du QCM (argument
sans effet au rendu), `figureDefaultAligns` le relit pour déclarer
`#let fig-N-align = left`, et `harvestCarryOver` ne fige que les alignements qui
s'écartent de ce défaut (recentrer une figure depuis la palette est donc conservé).
Un exercice qui veut ses
propositions nommées A, B, C, D passe `format: 'lettre'` (hors interactif, et
toujours en Typst, où la case à cocher n'a pas de sens).

Ce défaut par contenu est transmis au préambule par un marqueur
`// mathalea:qcm-figures` posé sur la ligne du `#tasks(...)`
(`QCM_FIGURES_MARKER`), relu par `qcmFigureTasksPrefixes`. `harvestCarryOver`
l'utilise aussi pour **ne pas** figer ce 1 dans le carry-over : ce n'est pas un
réglage du professeur, et le figer rendrait le choix par contenu insensible aux
régénérations.

Un exercice à question unique n'a pas de liste `tasks`, donc pas de repère
`mathalea-anchor` : `exerciseBody` en émet un quand le corps référence la
variable de QCM, sinon la palette n'aurait nulle part où poser ses contrôles.

Quand plusieurs questions contiennent chacune un QCM, la liste extérieure est
forcée à une colonne (`// mathalea:taches-imbriquees`) : `taskize` ne sait pas
résoudre son mode `auto-fit` pour des items qui contiennent eux-mêmes une
grille et transmettrait `none` à `render-tasks-grid`. Les propositions de
chaque QCM gardent leur propre calcul de colonnes ; cinq ensembles courts
restent donc sur une même ligne.

La variable globale `#let qcm-colonnes = 2` subsiste comme **repli** des
chemins sans réglage par exercice : le tableau « Course aux nombres » (dont les
énoncés ne passent pas par `exerciseBody`) et les trois autres vues Typst
(Flash-cards, Diaporama PDF, lecture optique), qui la déclarent dans leur
propre préambule. En mode export (`.typ` téléchargé, modale d'édition), la
valeur est écrite littéralement dans le `#tasks(...)`, comme pour les
questions.

#### Alignement vertical des cases d'un QCM sous une formule courte

Un QCM posé juste sous une expression inline courte (`$(-5)^8$`, puis les
cases `Positif`/`Négatif`) peut voir ses cases décalées verticalement d'une
colonne à l'autre d'une même ligne de questions, alors que `#tasks` aligne
ses cellules par le haut : la cause n'est pas la mise en colonnes des
questions elle-même, mais le paquet `breather` (`BREATHER_CALL`,
`buildTypstDocument.ts`), qui bascule une équation inline sur des marges de
texte « ink réel » (`bounds`) plutôt que la métrique de police par défaut dès
que sa hauteur mesurée dépasse un seuil (`threshold`, 1.1em par défaut dans le
paquet). Une expression avec parenthèses (`(-5)^8`) peut franchir ce seuil de
justesse quand une expression voisine sans parenthèses (`3^{-2}`) reste
dessous : les deux utilisent alors une métrique de ligne différente, donc une
hauteur de première ligne différente dans leur cellule respective, ce qui
décale le bloc `#tasks` du QCM placé juste après (visible sur l'exercice
4C37). `BREATHER_CALL` relève ce seuil à 1.25em pour laisser ce cas de bord
en métrique par défaut (uniforme entre les colonnes), tout en restant
nettement sous la hauteur d'une fraction « display » (~1.5em, forcée par
`#show math.frac: it => math.display(it)`), qui continue de déclencher
l'espacement adapté. Vérifié en conditions réelles sur l'aperçu Typst de
l'application (le moteur `typst.ts` embarqué) : la mesure équivalente au CLI
`typst` local ne reproduit pas l'écart, probablement par différence de
version/métriques avec ce moteur — ne pas se fier au CLI seul pour retoucher
ce réglage.

### Figures SVG

Les figures SVG (mathalea2d) sont **embarquées dans le document** : chaque figure est déclarée en tête de fichier (`#let fig-N = image(bytes("<svg...>"), format: "svg", width: ...pt)`) et référencée dans le corps. Le document reste autonome (il compile aussi avec le CLI `typst`). La largeur reprend celle de la figure (96 px CSS = 72 pt). `sanitizeSvg` corrige au passage le SVG pour le parseur XML strict de Typst (point-virgule parasite entre attributs généré par `lib/2d/textes.ts`, entités HTML indéfinies en XML, attributs dupliqués) et remplace `dominant-baseline="central"` par un `dy="0.325em"` : l'aperçu affiche la figure comme une image SVG que le navigateur met en page avec les polices de la machine, et sans Libertinus Math (postes Linux) `central` décalait les noms de points jusqu'à les coller au point (#9785).

Pour les figures mathalea2d qui contiennent des labels KaTeX (`divLatex`), seul le tracé géométrique part dans le SVG. Les labels sont extraits depuis l'annotation TeX KaTeX, convertis en Typst, puis placés par les helpers `mathalea-label` et `mathalea-figure`. Le code généré reste donc éditable côté Typst sans réinjecter le HTML visible de KaTeX. Les blancs à compléter posés par `MetaInteractif2d` en mode non interactif (`$\ldots ^\circ$`) ne sont pas encore rendus par KaTeX : leur formule est lue directement entre les `$`, et le `\ldots` devient des pointillés de réponse, moitié moins larges (2,5 em) que dans le texte pour ne pas masquer le tracé.

### Tableaux

Les tableaux LaTeX visuels (`tabular`, `tblr`, ou `array` avec bordures/`\hline`) sont convertis en `#table(...)` natif (aucun paquet nécessaire : l'ancien recours au paquet `tblr` a été abandonné). Les commandes `\def\arraystretch{...}` et `\renewcommand{\arraystretch}{...}` sont interprétées comme un agrandissement vertical des cellules (`inset.y`), puis retirées du code final.

Les environnements mathématiques non visuels (`aligned`, `cases`, `array` sans bordures) restent des expressions mathématiques converties par `tex2typst`.

### Deux colonnes (deuxColonnesResp)

`deuxColonnesResp` (`src/lib/format/miseEnPage.js`) produit en HTML une grille CSS `<div class="cols-responsive">` (et un `<style>` retiré à la conversion) : sans traitement, ses deux colonnes s'empileraient dans le document Typst. `protectResponsiveColumns` (`latexToTypst.ts`) les convertit en `#grid(columns: (…fr, …fr), column-gutter: 1em, align: top + left, […], […])`, le contenu de chaque colonne étant reconverti récursivement par `htmlToTypst` (formules, figures, tableaux, QCM compris) ; les figures s'ajustent d'elles-mêmes à la largeur de leur colonne, `mathalea-fit` mesurant l'espace disponible.

Le partage des colonnes reprend le `largeur1` passé à la fonction — le même qu'en sortie LaTeX (`minipage`) —, publié dans le HTML par `data-largeur1` ; sans cet attribut les colonnes sont égales, comme la grille CSS. Une seule colonne remplie donne le contenu seul, sans grille. Les colonnes imbriquées sont gérées par la conversion récursive : seul le conteneur extérieur ouvre une grille, et la restauration des segments protégés boucle tant qu'il reste un jeton (un segment peut en contenir un autre).

Les mises en page à flottants `deuxColonnes` et `troisColonnes` (même fichier) ne sont **pas** converties : leurs `float: left` sont ignorés et les contenus s'empilent.

### Schémas en barres et figures 3D

Les schémas en barres (`SchemaEnBoite`, HTML en grille CSS `SchemaContainer`) sont convertis en grilles Typst natives : boîtes avec fond et bordures (les côtés partagés, `border-left: none`, ne sont pas doublés), accolades et flèches étirées sur la largeur de leur cellule par le helper `mathalea-schema-span` (courbe de Bézier pour les accolades, `stretch(<->)` pour les flèches). Les accolades horizontales gardent une hauteur de `0.65em` et un trait de `0.8pt`, indépendamment de la largeur de la barre et de la police mathématique. Les accolades latérales (`latexAccoladeRight`, rares) ne sont pas rendues.

Les empilements de cubes des exercices de motifs (`<canvas-3d>`, rendu WebGL Three.js) n'ont pas d'image extractible : les cubes décrits par l'attribut `content` (JSON) sont redessinés en SVG isométrique (`canvas3dToSvg`), embarqué comme les autres figures. Un contenu 3D sans cubes est remplacé par un encart.

### Figures des annales rédigées en Typst (cetz, ctz-euclide)

Une ressource statique dont le référentiel déclare `typ: true` fournit une source Typst rédigée à la main (`static/<sujet>/<année>/typ/<uuid>.typ`, correction dans `<uuid>_cor.typ`), utilisée telle quelle à la place de l'image scannée. Ces fichiers dessinent leurs figures avec des paquets Typst, importés dans le préambule **uniquement quand le code s'en sert** (comme `taskize`, `vartable`, `tblr`…) :

- `cetz.` → `#import "@preview/cetz:…"` (`CETZ_IMPORT`) ;
- `chart.` → `#import "@preview/cetz-plot:…": chart` (`CETZ_PLOT_CHART_IMPORT`) ;
- `ctz-` → `#import "@preview/ctz-euclide:…": *` (`CTZ_EUCLIDE_IMPORT`), le portage Typst de `tkz-euclide` : figures de géométrie euclidienne (`ctz-canvas`, `ctz-def-points`, `ctz-draw`, `ctz-draw-mark-right-angle`, `ctz-draw-measure-segment`, `ctz-draw-labels`…). Toute son API est préfixée `ctz-`, d'où l'import en `: *` ; `ctz-` n'est un sous-mot ni de `cetz.` ni de `cetz-plot`, la détection est donc sûre.

`ctz-euclide` réexporte `cetz` (v0.5.2 embarquée), ce qui satisfait le `import cetz.draw: *` que ces figures ouvrent dans le corps de `ctz-canvas`. Quand `ctz-euclide` est importé, l'import `cetz` autonome **n'est pas** ajouté : le nom `cetz` doit résoudre vers la version du paquet. La détection et l'émission se font aux deux points de montage du préambule (`buildTypstDocument` pour la fiche, `buildStandaloneExerciseCode` pour la modale d'édition). Une source `.typ` qui appelle `ctz-…` sans cet import produit sinon l'erreur de compilation « Variable ou fonction inconnue : « ctz-canvas » ».

### Images

Chaque `<img>` du contenu HTML d'un exercice (pas seulement les annales scannées) est préchargé par `prefetchStaticImages` (`Typst.svelte`) : ses octets sont récupérés par `fetch` (mis en cache via `cachedBytes`), enregistrés dans le système de fichiers virtuel du compilateur, puis embarqués comme les autres figures. Le chemin virtuel reprend l'extension réelle de l'image (Typst en déduit le format). Une image dont la récupération échoue (hôte externe n'autorisant pas le CORS, réseau indisponible) reste un encart grisé « image non convertie », sans bloquer le reste de la fiche.

Les tableaux HTML (par opposition aux tableaux LaTeX visuels, voir ci-dessus) ne sont **pas convertis** : un encart grisé « tableau non converti » les remplace.

#### Annales en images et hauteur de page

Une annale sans source Typst est insérée comme une ou plusieurs images,
et non comme du texte paginable. Dans `latexToTypst.ts`, `mathalea-fit`
ajuste leur largeur à celle de la page ou de la colonne, puis applique le
zoom de l'exercice ; il ne découpe pas leur hauteur. Un saut de page avant
l'exercice ne résout donc pas le cas d'une image plus haute qu'une page
entière. La palette propose « Réduire l'exercice », mais ce réglage réduit
aussi la taille du texte de l'image.

`computeStaticExercicePngUrls` (`src/lib/components/refUtils.ts`) accepte
déjà des listes d'URL dans `png` et `pngCor` ; `buildExercise`
(`src/lib/components/exercisesUtils.ts`) produit un `<img>` par URL.
Chaque image est ensuite convertie séparément en Typst : plusieurs images
permettent une pagination entre les fragments, sans imposer un saut de page
entre chacun. Ces listes ne choisissent pas les coupures à l’intérieur d’une image. Une source native `.typ` permet, elle,
de composer le texte avec les réglages du document.

#### Outil « Découper l’image »

Lorsqu'un énoncé ou un corrigé d'annale en image dépasse réellement la page, un
encart au-dessus de l'aperçu explique comment répartir une image trop haute
sur plusieurs pages sans réduire le texte. « Choisir une image à découper »
donne accès à chaque énoncé et corrigé concerné, même lorsque la palette est
masquée. Les corrigés sont proposés seulement si leur affichage est activé,
et cet encart n'apparaît pas en présentation « Course aux nombres ».
Une croix permet de le masquer jusqu'au prochain chargement de la vue.
`imageOverflow.ts` instrumente uniquement la source de l'aperçu : Typst
publie la position et les dimensions finales de chaque image ou fragment,
après ajustement de largeur et zoom. `overflowingImages` compare ces mesures
aux limites des pages, avec une tolérance de 0,5 pt. Les images qui tiennent
dans la page ne sont pas proposées. Les repères de mesure ne figurent ni
dans le code de l'éditeur ni dans les exports.

La palette de mise en page propose un bouton ciseaux pour les énoncés et
les corrections statiques sans source Typst, hors présentation « Course aux
nombres ». `TypstImageCutModal.svelte` affiche chaque image originale :

- cliquer entre deux questions ajoute une coupure ;
- déplacer sa ligne horizontale ajuste la coupure ; les flèches haut/bas et
  le champ en pourcentage permettent également un réglage au clavier ;
- « Ajouter une coupure » partage en deux le plus grand fragment restant ;
- chaque coupure peut être supprimée, ou toutes retirées avant d’appliquer ;
- « Annuler » et Échap ferment sans modifier la fiche.

Les fragments conservent la même échelle et passent automatiquement à la
page ou colonne suivante quand l’espace restant ne suffit pas. Une coupure
n’impose pas à elle seule un saut de page. Chaque fragment doit tenir dans
une page : ajouter d’autres coupures si nécessaire. L’énoncé et la correction
se règlent indépendamment, de même que les différents sujets d’une fiche.

`imageCuts.ts` produit des appels à `mathalea-image-slice` : le helper réserve
la taille complète de l’image dans une boîte avant de recadrer chaque
fragment avec `block(clip: true)`. Aucune image n’est rééchantillonnée ou
créée : les octets originaux restent utilisés pour l’aperçu, le PDF et
l’export Typst avec ses ressources.

Les commentaires `// mathalea:image-cuts(N,enonce|correction)` portent les
positions relatives à la hauteur de chaque image. `harvestCarryOver` les
relit dans `imageCuts`, persisté dans `typstParam`. Les coupures survivent à
la régénération, au rechargement du lien, à la duplication et au déplacement
des exercices ; les modifications sont annulables dans l’éditeur. Les
sources d’annales publiées restent inchangées.

## Compilation dans le navigateur

`typstCompiler.ts` s'appuie sur `@myriaddreamin/typst.ts` : le compilateur WASM (~28 Mo) et le moteur de rendu sont chargés à la première compilation (import dynamique, URL des `.wasm` résolues par Vite). L'aperçu est un rendu SVG du document ; le bouton « Télécharger le PDF » compile en vrai PDF côté client, sans serveur.

Les noms des fichiers téléchargés sont dérivés du titre du document : les
accents sont retirés (`é` devient `e`), seuls les lettres ASCII, chiffres,
espaces, tirets et underscores sont conservés, puis les espaces deviennent
des underscores. Un titre vide après nettoyage utilise `fiche`. Cette règle
s'applique aux PDF, aux fichiers `.typ` et aux archives `.zip` ; les PDF
séparés ajoutent les suffixes `_enonce.pdf` et `_corrige.pdf`.

Le bouton **Énoncé + corrigé séparés** transforme le code courant via
`enonceCode` et `corrigeCode` (`typstExport.ts`), sans régénérer les exercices.
Avec la banque, le corrigé utilise `display: "sol"`. Dans les présentations
fusionnée et « Course aux nombres », il retire les blocs d’énoncés et active
les sections Corrections, même si « Afficher la correction » est décoché.
Cette séparation conserve les retouches des corrections et tous les sujets.
L’enchaînement et les exemplaires répétés ne sont imprimés que dans le PDF
des énoncés pour les présentations sans banque.

### Coût de démarrage

Les gros fichiers passent par un cache persistant du navigateur (Cache API,
`ASSET_CACHE`), donc téléchargés une seule fois par poste et non par session.
`cachedResponse` vérifie la signature des fichiers `.wasm` avant leur mise en
cache et à leur relecture. Une entrée invalide (par exemple une page HTML servie
avec HTTP 200) est supprimée puis retéléchargée en contournant le cache HTTP.
Une réponse réseau invalide est réessayée une fois et n'est jamais enregistrée.

Deux points demandent une attention particulière :

- **le WASM est fourni sous forme de `Response`** (`cachedResponse`) et non
  d'octets. `WebAssembly.instantiateStreaming` s'applique alors, et avec lui le
  cache de code compilé du navigateur : sans cela, les 28 Mo du compilateur
  sont recompilés de zéro à **chaque chargement de page**, même en cache. Le
  type MIME `application/wasm` est rétabli au besoin en écrivant dans le cache,
  faute de quoi `instantiateStreaming` refuse la réponse et retombe
  silencieusement sur le chemin lent ;
- **les polices d'assets de Typst** (8,3 Mio : Libertinus Serif, New Computer
  Modern et DejaVu Sans Mono, `assets: ['text']` de typst.ts) sont téléchargées
  par le paquet lui-même, avec son propre `fetch`. Elles échappent donc au
  cache persistant, sauf à lui passer un `fetcher` — c'est ce que fait
  `preloadRemoteFonts(fonts, { assets, fetcher })`. Attention : appeler
  `preloadRemoteFonts` **sans options** ne supprime pas ces polices, typst.ts
  ajoute alors le pack `text` de lui-même (voir `TypstCompilerDriver.init`),
  avec un `fetch` nu vers jsdelivr à chaque session.

Les 10 polices libres servies par MathALÉA (`public/fonts/typst/`, 5,3 Mio)
sont chargées **toutes** à l'initialisation : le jeu de polices est figé pour
la session (`$typst` est un singleton) alors que le professeur peut changer de
police à tout moment depuis les réglages.

Le numéro de version d'`ASSET_CACHE` sert à invalider les entrées quand le
contenu d'une URL stable change ; `purgeOldAssetCaches` supprime au démarrage
les caches des versions précédentes, pour ne pas laisser une copie de 28 Mo par
version dans le quota du navigateur.

### Recompilations

Une compilation n'est pas annulable une fois lancée : le jeton `compileToken`
n'écarte que les _résultats_ périmés. Trois garde-fous dans `Typst.svelte` :

- `compile()` sort immédiatement si la source est identique à la dernière
  compilée (`lastCompiledCode`). `resetCompileCache()` lève la mémoïsation
  après un échec et après `prefetchStaticImages`, où le même code doit être
  recompilé avec un registre d'images différent ;
- les recompilations déclenchées par un contrôle (palette, réglages,
  régénération) passent par un court débounce `PALETTE_COMPILE_DELAY` plutôt
  que par un délai nul : un clic répété sur un pas-à-pas ne lance qu'une
  compilation. Seul Ctrl/Cmd + Entrée (`onCompileNow`) compile sans délai ;
- `scheduleDocumentSync` diffère la relecture de la palette
  (`refreshTasksLayout`) et le report dans l'URL (`persistToUrl`), qui balaient
  chacun tout le document à coups d'expressions régulières. Une **édition de
  la palette** relit ses valeurs tout de suite (`immediate`) : les pas-à-pas
  calculent la valeur suivante à partir de celle affichée, un clic répété
  repartirait sinon d'une valeur périmée.

`mapStaticImages` ne recopie les images scannées dans la mémoire WASM que
lorsque le registre a changé (`setStaticImageBytes`), et non avant chaque
compilation.

### Mémoire du compilateur WASM : figures à labels

Le WASM est limité à 4 Go. Une fiche de quelques centaines de labels
mathématiques (ex. 6N2E : multiplications posées, 3 000 labels sur 5 pages)
peut l'épuiser : typst.ts échoue alors avec `RuntimeError: unreachable` (« Unreachable
code should not be executed … typstcompileworld_get_artifact »), alors que la
même source compile avec le CLI natif (qui consomme ~5 Go).
Chaque label coûte un `context` + `measure()` (centrage), la règle d'équation
inline en ajoute deux, et `mathalea-figure-block` mesurait en plus toute la
figure avant de la remettre en page. Pour une figure à labels, le générateur
passe donc `natural-width:` (la largeur de la boîte de `mathalea-figure`) :
c'est la seule économie qui laisse le rendu identique au pixel près. Les
pistes testées qui déplaçaient les labels (`move(dx: -50%)`, centrage par
`align(horizon)`) ne sont pas équivalentes. Pour reproduire : compiler la
source via `compileTypstToSvg` dans le navigateur, le CLI ne plante pas.

### Un seul sujet dans l'aperçu

Sur une fiche à plusieurs sujets (`nbVersions`), l'aperçu ne compile que le
sujet montré : c'est de loin le plus gros levier, la mise en page étant
l'essentiel du temps d'attente et croissant plus vite que le nombre de pages.
Mesuré sur une fiche de 6 exercices en 2 sujets : 10 pages et ~12 s de
compilation contre 5 pages et ~5 s.

Le découpage se fait côté `Typst.svelte` (`previewCode`), pas dans le document :

- `buildTypstDocument` pose un commentaire `// mathalea:sujet(N)` en tête du
  bloc de chaque sujet (`subjectMarker`), seulement quand la fiche en compte
  plusieurs. Un commentaire ne change ni le rendu ni l'export ;
- `previewCode` conserve le préambule (commun à tous les sujets, c'est là que
  sont déclarées les figures) et le bloc du sujet choisi, et **remplace les
  autres lignes par des lignes vides** plutôt que de les supprimer : les
  numéros de ligne des diagnostics restent ceux de l'éditeur. Les figures des
  sujets masqués restent déclarées mais ne sont jamais mises en page, donc
  jamais décodées ;
- le sélecteur « Aperçu » de la barre d'outils n'apparaît qu'à partir de deux
  sujets. Il ne touche ni au code de l'éditeur ni aux exports : « Télécharger
  le PDF » compile `currentCode()`, qui porte tous les sujets, et le `.typ`
  est nettoyé depuis le texte actuel de l’éditeur par `buildExportCode`.

Chaque sujet porte les mêmes repères `mathalea-anchor` et propose la palette
complète : édition des énoncés et corrections, insertions, fusions, lignes de
réponse, réglages et nouvelles données. Les surcharges de contenu et les
insertions sont propres au sujet affiché et persistent dans `carryOver.versions`
pour B, C… (A conserve les champs historiques). Les variables du préambule
(colonnes, espacements, en-tête, page de garde) et la liste des exercices restent
communes. Les marqueurs `mathalea:banque(N)` identifient également les définitions
pour que le double-clic et les éditions ciblent le bon sujet. Les surcharges
conservent une numérotation locale des figures ; `mathalea:figures-offset(N)`
permet de convertir les références lors de la génération et de la relecture.

Reste ensuite `buildCode` (~1,3 à 2,3 s sur cette fiche) : il régénère les
exercices de **tous** les sujets, puisque le code de l'éditeur, lui, les
contient tous.

#### Graines par sujet et « Nouvelles données »

`buildAllVersionInputs` (`Typst.svelte`) calcule le contenu de chaque sujet :
le sujet A part de la graine de base (`exercicesParams`), les suivants d'une
graine dérivée `${graineA}${index}` — même formule que le diaporama
(`Diaporama.svelte` `reroll`), pour que le 2ᵉ sujet corresponde à la 2ᵉ vue du
diaporama.

Sur une fiche à plusieurs sujets, **« Nouvelles données »** propose le sujet
affiché dans « Aperçu » (« Sujet B ») et « Tous les sujets ». Quand les sujets
sont enchaînés sur une page (sélecteur « Aperçu » masqué), il y a un bouton par
sujet (« A », « B »…) suivi de « Tous les sujets ». Un bouton de sujet ne
rebrasse que ce sujet (`newDataForSubject`) :

- Sujet A (ou fiche mono-sujet) : nouvelle graine de base, comme avant. Les
  sujets suivants sont d'abord **épinglés** à leur tirage courant
  (`documentOptions.versionSeeds[v] = exercices.map(ex => `${ex.seed}${v}`)`,
  calculé avant le tirage de la nouvelle base) pour ne pas suivre la nouvelle
  graine de A ;
- Sujet B, C… : nouvelle graine dérivée mais distincte pour ce seul sujet
  (`${graineA}${v}~${jeton}`), inscrite dans `versionSeeds[v]` ; base et autres
  sujets inchangés.

« Tous les sujets » (`newDataForAllSubjects`) tire une nouvelle graine de base
et vide `versionSeeds` : B, C… suivent alors leur graine dérivée de la nouvelle
base.

Les icônes ↶ ↷ annulent et rétablissent un tirage (bouton de sujet, « Tous les
sujets » ou pastille d'un exercice). Chaque tirage mémorise l'état complet des
graines (`seedState` : graines de base, `versionSeeds` et questions du Sujet A
figées par la palette, `frozenInputs`) dans un arbre en mémoire (`DrawNode`, non
persisté) : annuler remonte au parent, rétablir reprend la branche suivie en
dernier (`lastChild`). Un nouveau tirage fait après une annulation devient la
branche suivie : le tirage annulé n'est plus atteignable. Seuls les sujets
touchés par le tirage changent ; si l'aperçu n'en montre aucun, il passe sur le
premier. L'arbre est oublié avec `versionSeeds` quand la liste d'exercices
change, et limité à 50 tirages sur le chemin courant. Le nombre de questions et
la mise en page ne font pas partie de l'état : annuler ne défait que le tirage.
Pas de raccourci clavier : Ctrl/Cmd + Z reste celui de l'éditeur.

Les questions figées ne valent que pour le Sujet A : seul un tirage qui change
le Sujet A les libère (bouton du Sujet A, « Tous les sujets », pastille d'un
exercice du Sujet A, celle-ci pour son seul exercice). Une pastille du Sujet A
épingle d'abord les autres sujets (`pinOtherSubjects`), comme le bouton du
Sujet A, pour qu'ils ne suivent pas la nouvelle graine de l'exercice.

Les pastilles « Nouvelles données » d'un exercice agissent sur le sujet dont
l'aperçu porte les repères (`overlaySubject`) : le sujet affiché, ou le Sujet A
quand les sujets sont enchaînés (`paletteAnchors` ne garde que ses repères).
Leur infobulle nomme ce sujet.

`versionSeeds` (`TypstDocumentOptions.versionSeeds`, `(string | null)[][]`,
indexé `[sujet][exercice]`) est persisté dans `typstParam`. Une entrée absente
ou `null` retombe sur la graine dérivée. La liste est **vidée**
(`dropVersionSeeds`) dès que les exercices changent (ajout, suppression,
déplacement) : ses index par exercice ne correspondraient plus. Réduire le
nombre de sujets tronque la liste (`applyDocumentOptions`).

## Tests

- `src/components/setup/typst/latexToTypst.test.ts` : conversion des formules et du HTML ;
- `src/components/setup/typst/typstHighlights.test.ts` : factorisation de la mise en évidence et comparaison du rendu SVG avec le CLI Typst ;
- `src/components/setup/typst/typstExport.test.ts` : conservation des retouches libres, nettoyage des repères, comparaison du rendu SVG de plusieurs sujets et vérification des PDF séparés dans les trois présentations (CLI Typst et `pdftotext` pour lire les PDF) ;
- `src/components/setup/typst/imageCuts.test.ts` : découpage des images, conservation par sujet et partie, export et compilation des fragments sur plusieurs pages ;
- `src/components/setup/typst/typstDiagnostics.test.ts` : lecture du format « unix » et traduction des messages ;
- `src/components/setup/typst/buildTypstDocument.test.ts` : structure du document généré. Les cas qui lancent le binaire externe `typst compile` sont exécutés en local quand le CLI `typst` est installé, ignorés en CI par défaut, et réactivables avec `TYPST_CLI_TESTS=1` pour un job dédié ;
- `pnpm typst:check:compile` : vérification explicite par compilation CLI Typst pour les environnements qui installent le binaire `typst`.
