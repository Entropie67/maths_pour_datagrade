# Mes sauvegardes

La vue « Mes sauvegardes » (`v=mes-sauvegardes`) rassemble, en trois
arborescences de dossiers indépendantes par défaut :

- **Mes feuilles** : les fiches de la vue Impression (Typst) et de la vue
  LaTeX (`v=tex`) que l'enseignant a enregistrées, ces dernières repérées par
  le logo LaTeX (`LatexLogo`) ;
- **Mes sélections** : des liens MathALÉA (exercices, graines et réglages
  d'une vue), avec un commentaire et de 0 à 3 étoiles ;
- **Mes séances au vidéoprojecteur** : l'état complet de la vue TBI (voir
  [Séances au vidéoprojecteur](#séances-au-vidéoprojecteur)).

Le fichier `.mathalea` reprend aussi des données gardées hors de cette vue
(voir [Réglages](#réglages)) : les **parcours** de l'application (vue
`v=parcours`, avec leurs classes et leurs objectifs), les modèles de document
de la vue Impression, les réglages du lien pour les élèves, les classes du
tirage au sort de la vue TBI et l'historique des diaporamas. Les parcours se
consultent dans la section « Mes parcours »
(voir [Mes parcours](#mes-parcours-dans-la-vue)), les modèles, les classes et
l'historique dans la section « Mes réglages » de la vue (voir
[Mes réglages](#mes-réglages-dans-la-vue)).

Les données restent dans le navigateur, sans compte ni serveur. Un fichier
`.mathalea` sert de sauvegarde à recharger ailleurs.

## Ajouter un lien web

« Ajouter un lien » accepte les adresses HTTP et HTTPS. Les liens vers
`mathalea.fr/alea` ou `coopmaths.fr/alea` (avec ou sans slash final)
sont reconnus comme des sélections MathALÉA et conservent les options propres
aux exercices, y compris pour les liens cryptés. Les autres adresses gardent
leur URL complète, leur nom, leurs étoiles, leur commentaire et leur dossier.
Leur fiche permet de les ouvrir, copier, commenter, renommer, déplacer,
dupliquer ou supprimer, sans proposer les vues et les réglages MathALÉA.

L’URL externe est enregistrée dans le champ optionnel `externalUrl` d’une
sélection (avec `query: '?'` et une liste d’exercices vide). Elle est reprise
par le fichier `.mathalea`, la corbeille et la synchronisation. L’import
valide le protocole HTTP(S) avant de conserver une adresse externe.

## Choisir l’organisation des dossiers

Dans « Mes réglages > Affichage », le menu « Organisation des sauvegardes » propose
« Feuilles, sélections et séances séparées » (fonctionnement par défaut) et
« Dossiers communs ». Dans ce second mode, une seule arborescence accueille
les feuilles, les sélections et les séances : navigation, compteurs, déplacement groupé,
glisser-déposer, suppression et export d’un dossier concernent les trois types.
Les fenêtres d’enregistrement proposent également les dossiers communs.

Le passage aux dossiers communs réunit les dossiers existants en conservant
les contenus. Les dossiers de même nom sous un même parent sont fusionnés,
ainsi que leurs sous-dossiers homonymes ; les feuilles, sélections et séances sont
rattachées au dossier conservé. Les dossiers homonymes situés dans des
branches différentes restent distincts. Les anciens dossiers communs homonymes
sont également réunis à la lecture de la bibliothèque ou d’un fichier importé.
Revenir au mode séparé conserve une copie du classement dans chaque espace ; les dossiers des sélections et des séances reçoivent alors de nouveaux
identifiants pour redevenir indépendants.

Le choix est enregistré dans la bibliothèque IndexedDB et dans le fichier
`.mathalea` (champ optionnel `organization`, avec date de modification).
La synchronisation retient le choix le plus récent. Les anciens fichiers,
sans ce champ, restent en mode séparé. En mode commun, `folders` et
`selectionFolders` contiennent le même arbre pour conserver la compatibilité
avec les fonctions et les fenêtres d’enregistrement existantes ; `repair`
réunit leurs versions et la synchronisation n’émet chaque dossier qu’une fois.

## Principe : une feuille est un état rejouable

Une feuille n'enregistre ni PDF ni code Typst. Elle garde la **requête de l'URL**
de la vue Impression (`?uuid=…&alea=…&v=typst…`) avec le `typstParam` complet
(réglages du document, palette de mise en page, retouches de code
`carryOver.versions[n]`), sans l'origine du site. Rouvrir la feuille recharge
cette URL : la stabilité des graines des exercices publiés (voir
[stabilité des exercices](../../../tests/stabilite-exercices.md)) garantit la
même fiche. La requête est construite comme le lien de partage
(`buildShareUrl`) : quand le `typstParam` est trop long pour l'URL, il passe
dans le fragment `#typstParam=…`.

Seul l'**aperçu** est figé : le SVG de l'aperçu compilé (sujet affiché), pour
les vignettes et la fenêtre « Aperçu ». `buildPreview` le resérialise en XML
après avoir retiré les `<script>` et la couche de sélection du texte
(`<foreignObject>`) : la sérialisation HTML de `separatePages` contient des
entités (`&nbsp;`) que le lecteur XML d'une image refuse. L'aperçu s'affiche
dans une `<img>` (URL `blob:`), qui n'exécute rien, même pour un fichier
importé.

## Enregistrer depuis la vue Impression

`SaveSheetButton` (en-tête de la vue Typst, absent dans un iframe) :

- fiche **non reliée** : « Enregistrer » ouvre la fenêtre (nom proposé : titre
  du document, choix ou création du dossier) ;
- fiche **ouverte depuis Mes feuilles** : le paramètre d'URL `feuille=<id>`
  (store `currentSheetStore`, réécrit par `appendGlobalOptionsToURL` pour
  `v=typst`) relie la fiche à sa feuille. « Enregistrer » la met à jour
  directement ; « Enregistrer sous » en crée une copie.

La liaison ne vaut que si la vue Impression est ouverte avec `feuille=` dans
l'URL (depuis Mes feuilles, ou après un rechargement) : elle est recalculée à
chaque ouverture de la vue. Revenir de l'accueil, où le document a pu être
remplacé par un tout autre, donne une fiche **non reliée** : « Enregistrer »
crée une nouvelle feuille au lieu d'écraser l'ancienne. Cette dernière est
gardée dans `previousSheetStore` et la fenêtre d'enregistrement propose
« Remplacer « … » », pour une fiche simplement complétée en passant par
l'accueil. Un lien partagé contenant `feuille=` est sans effet chez un autre
utilisateur : l'identifiant n'existe pas dans sa bibliothèque et la liaison
est retirée.

`getSheetContent` (dans `Typst.svelte`) recompile d'abord le code courant,
pour que l'aperçu inclue la dernière retouche, puis construit l'URL avec
`mathaleaBuildUrlFromExercicesParams` : l'écriture de l'URL dans la barre
d'adresse est différée de 0,5 s, elle peut encore porter l'état précédent.

## Feuilles de la vue LaTeX

Le bouton « Enregistrer » (`SaveSheetButton`, `kind="tex"`) figure aussi dans
la vue LaTeX (`Tex.svelte`, absent dans un iframe). Il fonctionne comme dans la
vue Impression (paramètre `feuille`, « Enregistrer sous », remplacement de la
dernière feuille reliée), mais une fiche ne relie ou ne remplace qu'une feuille
**de la même vue**. La vue d'une feuille se lit dans sa requête (`queryKind` :
`v=tex` ou non) : aucun champ à ajouter, et `sheetUrl` rouvre la feuille dans la
bonne vue. `appendGlobalOptionsToURL` écrit `feuille` pour `v=tex` comme pour
`v=typst`.

- **Requête** : l'URL de la vue avec `texParam` (réglages du document), les
  exercices et leurs graines (`mathaleaBuildUrlFromExercicesParams`).
- **Code retouché** : le code LaTeX modifié à la main ne se régénère pas depuis
  l'URL. Il est gardé dans `SavedSheet.code` (500 000 caractères au plus,
  `cleanSheetCode`) quand l'éditeur a été modifié, remis dans l'éditeur à
  l'ouverture (`savedSheetCode`), et retiré si le code a été régénéré.
- **Aperçu** : `getSheetContent` recompile le PDF si l'aperçu est périmé
  (moteur Coopmaths seulement : texlive.net ne rend pas le PDF, la feuille n'a
  alors pas d'aperçu, ou garde l'ancien), puis `buildPdfPreview`
  (`pdfPreview.ts`) rastérise ses trois premières pages avec pdf.js (chargé à
  la demande) et `buildRasterPreview` les empile dans un SVG d'images JPEG
  (`data:`), au même format `SheetPreview` que l'aperçu Typst.

## Évaluations avec scan (bêta)

Dans la vue `v=omr`, nommée « Évaluation avec scan », le bouton
« Enregistrer » est proposé en bêta, hors iframe. Un clic crée une feuille
à la racine de « Mes feuilles », nommée d'après le titre de l'évaluation.
Les clics suivants mettent à jour cette même sauvegarde ; « Enregistrer sous »
permet de choisir un nom et un dossier pour une copie.

La feuille porte un repère « Évaluation avec scan ». « Modifier » rouvre
la vue avec `feuille=<id>` et le mode bêta. Le champ `SavedSheet.omr`
(`omrSavedState.ts`) conserve, en plus de la requête des exercices et de leurs
graines :

- le titre, les consignes, la liste de classe et les graines des sujets ;
- les réglages, le gabarit retouché et l'élève choisi pour l'aperçu ;
- le fichier d'accompagnement, le PDF scanné (octets encodés en base64), les
  résultats d'analyse, les associations de pages et toutes les révisions ;
- l'onglet ouvert, l'affichage et, pour la correction, la copie sélectionnée,
  la page, le filtre des copies non validées et le zoom.

La reprise restaure ces données avant de reconstruire l'aperçu et réapplique
le gabarit enregistré. Elle ne relance pas l'analyse du scan. Le bouton est
indisponible pendant le chargement, la génération des sujets ou l'analyse.
La sauvegarde représente l'état au dernier clic sur « Enregistrer ».

Ces données sont gardées dans IndexedDB avec la feuille, jamais dans l'URL
ni dans les préférences `localStorage`. Elles suivent les opérations des
feuilles : classement, duplication, corbeille, export/import `.mathalea` et
sauvegarde automatique. Le fichier exporté contient donc aussi la liste de
classe et les copies scannées, et peut être volumineux.

## La vue

- Les trois arborescences à gauche (« Mes feuilles », « Mes sélections »,
  « Mes séances au vidéoprojecteur »), fil
  d'Ariane, dossiers puis feuilles (vignette de la première page, date,
  références des exercices) ou sélections. Le dossier ouvert est gardé dans
  `savesLocationStore` : on y revient en rouvrant la vue, et les boutons des
  autres vues y conduisent (dossier de la feuille, de la sélection ajoutée).
- Actions sur une feuille : Modifier (rouvre sa vue, Impression ou LaTeX), Aperçu
  (toutes les pages), Renommer (en place), Déplacer, Dupliquer, Supprimer.
- Actions sur un dossier : ouvrir, renommer, déplacer, exporter, supprimer
  (avec ses sous-dossiers et ses feuilles, après confirmation).
- Glisser-déposer d'une feuille ou d'un dossier sur un dossier de
  l'arborescence, du fil d'Ariane ou de la liste. Un dossier ne peut aller ni
  dans lui-même ni dans un de ses descendants (`canMoveFolder`).
- Recherche dans les noms, les références des exercices, les commentaires et
  les noms des dossiers (sans accents), dans les trois arborescences.
- Bouton « Mes sauvegardes » dans la barre de titre (`NavBar`) de toutes les
  vues, sauf dans un iframe.

## Séances au vidéoprojecteur

Une séance (`SavedSession`) garde l'**état de la vue TBI** (`v=tbi`, voir
[la vue TBI](tbi.md)) : le fichier de réglages de la vue (`state`,
`type: "mathalea-tbi"`, produit par `exportTbiSession`) tel quel. Il porte la
liste des exercices avec leurs graines et paramètres (`exercices`) et tous les
réglages d'affichage : mode de page, colonnes, onglets, zoom, correction de
chaque carte, repli, positions du mode libre, onglets, outils, écriture, ainsi que les
visualiseurs (`documents` : position et taille, avec le lien saisi pour un
document, une vidéo, une figure GeoGebra ou une page web, le contenu pour une
note ou une figure ApiGeom ou JSXGraph, dans l'état affiché ; pas les PDF ni les
images de l'ordinateur). La liste des exercices peut être
vide : une séance peut ne contenir que des outils, des documents, des
vidéos, des notes ou des figures (`isSessionState` exige seulement la liste). S'y ajoutent un nom, un
dossier et `exercises` (références des exercices, recalculées à chaque
enregistrement, pour l'affichage et la recherche). Les dossiers des séances
(`sessionFolders`) sont distincts de ceux des feuilles et des sélections en mode séparé ; en mode fusionné, les trois espaces partagent les dossiers ;
`foldersOf` / `changeFolders` prennent l'espace `'seances'`.

- **Enregistrer** : `SaveSessionButton`, dans le menu Séance du bandeau de la vue TBI
  dès que la séance a un contenu (exercice, outil, écriture ou visualiseur de
  document ; absent quand le stockage est indisponible). Le bouton
  « Enregistrer » (icône disquette) ouvre la fenêtre (nom proposé d'après les
  exercices, sinon d'après les documents, vidéos, notes et figures, choix ou
  création du dossier) ; pour une vue **reliée** à une séance, il la met à jour
  directement et « Enregistrer sous » en crée une copie. Le bouton
  « Mes sauvegardes » (dossier ouvert, le même que dans la barre de titre des
  autres vues) ouvre « Mes séances » dans le dossier de la séance reliée. La
  fenêtre d'enregistrement garde la barre d'outils affichée : masquée, elle est
  transparente et insensible au pointeur, ce qu'hérite la fenêtre.
- **Liaison** : le paramètre d'URL `seance=<id>` (`SESSION_URL_PARAM`, store
  `currentSessionStore`, réécrit par `appendGlobalOptionsToURL` pour `v=tbi`)
  relie la vue à sa séance, comme `feuille` pour une fiche. `Tbi.svelte` le lit
  à l'initialisation ; une séance introuvable (lien d'un autre navigateur,
  séance supprimée) est détachée (`SaveSessionButton` fait de même quand la
  séance disparaît de la bibliothèque).
- **Ouvrir** : `sessionUrl(session)` (`sessionLink.ts`) construit l'URL de la
  vue TBI à partir des `exercices` de l'état (`createURL`, comme
  `slideshowUrl` pour l'historique des diaporamas), avec `v=tbi` et `seance`.
  Sans `tbiParam` dans l'URL, `Tbi.svelte` relit la séance dans la
  bibliothèque après le chargement des exercices et lui applique
  `importTbiSettings` (réglages partageables, positions du mode libre, repli,
  mode de l'horloge, colonnes, documents, vidéos, notes et figures) ; avec un
  `tbiParam` (vue rechargée), l'URL porte l'état courant, éventuellement retouché
  depuis l'enregistrement, et seuls les visualiseurs, absents de l'URL, sont
  repris de la séance.
- **Importer un ancien fichier JSON** : le bouton « Importer » (et le dépôt
  d'un fichier sur la page) reconnaît un fichier de réglages de la vue TBI
  (`type: "mathalea-tbi"`, téléchargé par l'ancien bouton « Sauvegarder » de la
  vue) avant de lire le fichier comme un `.mathalea` (`importTbiFile`) : il
  devient une séance du dossier ouvert de « Mes séances » (sinon la racine),
  nommée d'après le fichier (`defaultSessionName` pour le nom d'origine
  `reglages-tbi.json`). Un fichier sans liste d'exercices (versions antérieures
  de la vue) est refusé, car il ne peut pas se rouvrir seul
  (`readTbiSettings`).
- **La liste** (`SessionItem`) : nom, résumé de l'affichage
  (`describeSession` : mode de page, outils, tableaux, documents, vidéos, notes et
  figures), exercices, date. Actions :
  Ouvrir (même onglet), Renommer, Déplacer (aussi par glisser-déposer),
  Copier le lien, Dupliquer, Supprimer (corbeille). Le lien copié
  (`sessionShareUrl`) porte les exercices et leurs graines et les réglages
  partageables (`tbiParam`), sans `seance` (qui n'existe que dans ce
  navigateur) ni les positions du mode libre, propres à l'écran.

À la lecture d'un fichier `.mathalea` (`readSession`), une séance dont l'état
n'est pas celui de la vue TBI, sans exercice ou avec un exercice sans `uuid`
(`isSessionState`) est écartée. Les liens d'ouverture ne passent que par
`createURL` : l'état ne peut pas faire ouvrir une autre adresse que MathALÉA.

## Mes parcours dans la vue

**Version bêta seulement** (`&beta` dans l'URL, ou `localhost`, comme « Mon
MathALÉA ») : la section, son volet, la recherche des parcours et leur mention
dans les textes de la vue (état de la sauvegarde, aide, message d'import) n'y
apparaissent qu'avec `$globalOptions.beta`. Les données, elles, suivent le
même chemin partout (fichier `.mathalea`, sauvegarde automatique,
synchronisation) : un parcours créé dans la vue Parcours est donc déjà dans un
export, sans qu'on le voie dans la vue hors bêta.

La section « Mes parcours » (un seul volet, « Parcours pour l'application »)
ouvre `ParcoursPanel` à la place de la liste des dossiers, comme « Mes
réglages ». Les parcours sont regroupés par niveau, avec le chapitre,
l'organisation (exercices, paliers ou ceintures), les classes qui les
reçoivent, la date de modification et leur état de publication pour les élèves
(`toPublish`). La barre de recherche filtre les titres, niveaux, chapitres et
classes.

- **Essayer** ouvre les exercices du parcours en vue élève, dans un nouvel
  onglet (`studentPreviewUrl`, comme « Essayer comme un élève » de l'éditeur) ;
- **Modifier** ouvre la vue Parcours sur ce parcours (`parcoursUrl`, paramètre
  d'URL `parcours=<id>`, lu une fois à l'ouverture de la vue) ;
- **Supprimer** (après confirmation) retire le parcours de la bibliothèque et
  laisse une pierre tombale (`removeParcours`, `MesSauvegardes.svelte`). Les
  élèves gardent la dernière version publiée tant que l'enseignant ne republie
  pas.

Créer, dupliquer, attribuer à une classe et publier un parcours se fait dans la
vue Parcours (voir [Vue Parcours](parcours.md)), qui enregistre par le même
module et appelle `watchAutoSave()` : la sauvegarde automatique réécrit le
fichier après chaque modification.

## Mes réglages dans la vue

Sous les trois arborescences, la section « Mes réglages » ouvre ses volets à la
place de la liste des dossiers (comme la corbeille, état `panel`). La barre de
recherche y filtre les noms. Les modifications passent par `changePreferences`,
`changeClasses` et `changeSlideshows` (`MesSauvegardes.svelte`), qui relisent
les réglages pour recalculer l'état de la sauvegarde. `savesLocationStore.panel`
ouvre un volet à l'arrivée (`'classes'` depuis l'outil « Tirage au sort »).

- **Modèles de document** (`TypstModelsPanel`) : étoile « modèle des nouvelles
  fiches », Modifier, Renommer, Dupliquer (`duplicateTypstModel`), Supprimer
  (après confirmation). « Modifier » ouvre `TypstModelEditor`, qui règle le nom,
  les polices, la taille, l'interligne, le format, l'orientation, les colonnes,
  l'en-tête, le pied de page et la correction ; seuls les réglages changés sont
  écrits (`patchTypstModel`), les autres restent ceux du modèle. Un modèle se
  crée depuis la vue Impression (il faut un document à copier), et tous ses
  réglages se changent là aussi (« Mettre à jour le modèle »).
- **Classes** (`StudentClassesPanel`) : une classe par bloc dépliable, avec
  le tableau de ses élèves (nombre de tirages modifiable, chance d'être tiré au
  prochain tirage, retrait d'un élève). Nouvelle classe, Modifier la liste des
  élèves (zone de texte, un élève qui reste garde ses tirages), Remettre les
  compteurs à zéro, Renommer, Supprimer (après confirmation).
- **Historique des diaporamas** (`SlideshowHistoryPanel`) : titre, résumé des
  exercices et des réglages, dates. Modifier rouvre le diaporama
  (`slideshowUrl` : exercices, graines et `ds`, `dGlobal`, `dCorr`, `select`,
  `order`), Renommer, Supprimer, Effacer l'historique (après confirmation).

## Mes sélections

Une sélection (`SavedSelection`) garde la **requête complète** d'un lien
MathALÉA, graines comprises, sans l'origine : elle se rouvre sur le site qui
l'affiche. S'y ajoutent un nom, un dossier, `stars` (0 à 3), `comment` (texte
brut, 2 000 caractères au plus) et `newDataEachTime`. Les dossiers des
sélections (`selectionFolders`) sont distincts de ceux des feuilles
(`folders`) : les fonctions des dossiers de `library.ts` travaillent sur un
`FolderSet`, et `changeFolders(library, space, …)` les applique à l'une ou
l'autre arborescence.

### Ajouter une sélection

- **Bouton « Ajouter à mes sélections »** (`SaveSelectionButton`) dans la barre
  d'outils de la conception de document (état courant,
  `mathaleaBuildUrlFromExercicesParams`) et dans la page « Lien pour les
  élèves » (lien en clair de la vue élève). Absent dans un iframe et sous une
  plateforme (`recorder`).
- **« Ajouter un lien »** dans la vue : l'enseignant colle une adresse
  complète, sans protocole, cryptée (`?EEEE…`, décryptée par `decrypt`) ou une
  requête `?uuid=…`.

`readMathaleaLink` (`selectionLink.ts`) refuse un lien sans exercice et retire
les paramètres propres à une copie d'élève ou à une plateforme (`recorder`,
`answers`, `done`, `iframe`, `feuille`, `triche`, `log`, `cor`). Le nom proposé
est le titre (`title`), sinon les références des exercices.

### Réglages d'un lien

La fenêtre « Réglages » (`SelectionSettings`) relit et réécrit la requête :

| Réglage                                      | Paramètres d'URL                                                     |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Vue d'ouverture                              | `v` (absent : conception de document)                                |
| Interactivité : tout / rien / tel quel       | `i=1` de chaque exercice ; `es[1]` en vue élève ; `canI` pour la CAN |
| Présentation, correction, une seule réponse… | `es[0]`, `es[2]`, `es[3]`, `es[4]` (vue élève)                       |
| Titre du bandeau                             | `title` (doublement encodé, comme `buildMathAleaURL`)                |
| Nouveaux énoncés à chaque ouverture          | `newDataEachTime` : les `alea` sont retirés du lien ouvert           |

`applySettings` ne touche qu'à ce qui change : un `es` court (6 à 8 caractères)
reste tel quel si la présentation ne change pas, et les `i` d'exercice ne sont
réécrits que si l'interactivité ou la vue change. La requête découpe les
paramètres par exercice comme `mathaleaUpdateExercicesParamsFromUrl` (un
`uuid`, ou un `id` qui ne suit pas un `uuid`, ouvre un exercice), pour que
chaque `i` reste après son exercice.

Les réglages d'une autre vue restent dans la requête (`es`, `title`, `ds`,
`can…`) : revenir à cette vue les retrouve. `selectionUrl` ne met dans le lien
ouvert, copié ou en QR code que ceux de la vue choisie, comme
`appendGlobalOptionsToURL`.

### Modifier les exercices

« Modifier les exercices » ouvre la requête dans la conception de document
(`editExercisesUrl`, mêmes graines) et mémorise l'identifiant de la sélection
dans `sessionStorage` (`mathalea-selection-modifiee`, propre à l'onglet). Tant
qu'il est présent, `EditedSelectionBar` (dans `Header`, sous la barre de titre)
affiche « Vous modifiez la sélection « … » » avec :

- **Enregistrer et revenir** (actif dès que les exercices diffèrent de ceux de
  la sélection) : `replaceExercises` remplace les exercices (ajout, retrait,
  ordre, paramètres, graines) et garde les réglages de la sélection (vue,
  présentation, titre) ; « tout interactif » vaut aussi pour les nouveaux
  exercices, et un `es` absent n'est pas créé. La vue « Mes sauvegardes »
  s'ouvre ensuite sur le dossier de la sélection, mise en évidence
  (`savesLocationStore.selectionId`) ;
- **Revenir sans enregistrer** ;
- la croix, qui oublie la sélection et masque le bandeau.

« Ajouter à mes sélections » propose aussi « Mettre à jour » pendant ce temps.

### La liste

Chaque sélection affiche l'icône de sa vue, ses étoiles (cliquer sur l'étoile
de la note actuelle la retire), le résumé de ses réglages
(`describeSettings`), ses exercices et son commentaire. Actions : ouvrir dans
un nouvel onglet (dans la vue de la sélection), ouvrir directement en
diaporama, en vidéoprojection ou dans la vue Impression (`QUICK_VIEWS`,
`selectionUrl(…, view)`), copier le lien, Réglages (avec QR code), Modifier
les exercices, Commenter, Renommer, Déplacer (aussi par glisser-déposer, dans un
dossier de « Mes sélections » seulement), Dupliquer, Supprimer. Tri par nom,
étoiles, date de modification ou vue (`viewRank`, ordre de `SELECTION_VIEWS`,
avec un intertitre par vue) et filtre par nombre d'étoiles minimal. La
recherche porte aussi sur les commentaires.

## Réglages

Quatre jeux de données vivent dans `localStorage` (lecture synchrone : la vue
Impression applique le modèle par défaut avant sa première compilation) et
font partie du fichier `.mathalea`. `src/lib/mesFeuilles/settings.ts` les
rassemble (`LibrarySettings`) pour l'export, l'import et l'état de la
sauvegarde. Chaque écriture appelle `notifyContentChange()` (`storage.ts`) :
la sauvegarde automatique réécrit le fichier et les autres onglets se
rechargent. Les vues qui modifient ces réglages appellent `watchAutoSave()`.

| Réglage                         | Clé `localStorage`                                              | Module                |
| ------------------------------- | --------------------------------------------------------------- | --------------------- |
| Modèles de document, lien élève | `mathalea-mes-reglages`                                         | `preferences.ts`      |
| Historique des diaporamas       | `mathalea:slideshow-history`                                    | `slideshowHistory.ts` |
| Parcours de l'application       | `mathalea-parcours-bibliotheque`, `mathalea-parcours-supprimes` | `parcoursSettings.ts` |
| Classes du tirage au sort (TBI) | `mathalea-classes`                                              | `studentClasses.ts`   |

Le jeton edurl.fr (`mathalea-edurl-token`, avec sa date dans
`mathalea-edurl-token-date`) est un réglage à part : voir
[Jeton edurl.fr et liens raccourcis](#jeton-edurlfr-et-liens-raccourcis).

### Modèles de document (vue Impression)

`TypstModels` (en tête du volet « Réglages du document ») :

- **Modèle** : la liste applique d'un clic les réglages d'un modèle
  (`applyTypstModel`, puis `sanitizeDocumentOptions` de `Typst.svelte`, qui
  écarte une valeur qui n'existe plus) ; « Réglages d'origine » remet ceux de
  MathALÉA ;
- **Nouveau modèle** enregistre les réglages actuels sous un nom ;
  « Mettre à jour le modèle » apparaît dès qu'ils diffèrent du modèle choisi
  (`matchesTypstModel`) ;
- **Par défaut** choisit le modèle des nouvelles fiches (une seule à la fois) ;
  renommer, supprimer (après confirmation dans le volet).

Un modèle garde tous les `TypstDocumentOptions` sauf ceux de la fiche
(`SHEET_SPECIFIC_OPTIONS` : titre, sous-titre, graines épinglées, présentation
« Course aux nombres », détectée d'après les exercices) et le barème de la page
de garde, qui dépend des exercices (`typstModelOptions`).

Le modèle par défaut ne s'applique qu'à une **nouvelle fiche**, ouverte sans
`typstParam` : une feuille enregistrée ou un lien partagé gardent leurs
réglages. L'ordre est : valeurs de MathALÉA, modèle par défaut, préférences de
la session (`mathaleaTypstView`, 15 minutes), `typstParam`.

### Lien pour les élèves

La page « Lien pour les élèves » (`ConfigEleve`) mémorise ses réglages à
chaque changement et les reprend à l'ouverture suivante
(`StudentLinkPreferences`) :

- présentation, correction, calculatrices, deux colonnes, titre et référence
  des exercices… (`STUDENT_GLOBAL_OPTIONS`, valeurs revérifiées à la lecture) ;
- Course aux nombres : chronomètre, durée par question, feedback, accès aux
  solutions, interactivité (`STUDENT_CAN_OPTIONS`) ; ni l'onglet choisi, ni la
  durée totale, ni le titre, qui dépendent de la fiche ;
- nouvelles données à chaque chargement et format du lien (clair, crypté,
  raccourci).

L'interactivité (`setInteractive`) n'en fait pas partie : elle suit le choix
« Papier » ou « Numérique » de la conception de document, qui partage ce
réglage. Les réglages sont restaurés à la fin du script, avant la création des
sections (`ReglagesPresentation` lit `presMode` une seule fois) ; une simple
visite n'écrit rien (`preferencesApplied`, passé à `true` au montage).

### Historique des diaporamas

`SlideshowHistoryModal` lit et écrit l'historique par `slideshowHistory.ts`.
Sa fenêtre garde son propre export et import JSON. Deux entrées de même
`signature` (réglages et exercices) sont un même diaporama : à la fusion, le
titre est celui de la version modifiée le plus récemment (`updatedAt`, posé à
la création et par `renameSlideshow`), la dernière utilisation (`lastUsedAt`)
la plus récente des deux est gardée, et l'identifiant local reste.

### Parcours de l'application

`parcoursSettings.ts` garde la `TeacherLibrary` de la vue Parcours (parcours
et leurs classes dans l'ordre vu par les élèves, classes, objectifs, derniers
choix de création) sous sa clé historique `mathalea-parcours-bibliotheque`, et
les pierres tombales des parcours supprimés (par identifiant de parcours) sous
`mathalea-parcours-supprimes`. La vue Parcours enregistre par
`saveParcoursLibrary` ; la synchronisation et l'import par
`saveParcoursSettings` (`saveLibrarySettings`).

- **Date de modification** : chaque `LibraryEntry` porte `updatedAt`, posé par
  `saveParcoursLibrary` quand le parcours ou ses classes changent (comparés au
  stockage, aucune opération de `parcoursLibrary.ts` n'a à s'en occuper).
  Publier ne date pas le parcours, et un enregistrement sans modification
  n'écrit rien et ne déclenche pas la sauvegarde automatique : la vue Parcours
  enregistre à chaque changement de son état, y compris au montage. La date n'est
  pas dans le fichier de publication des élèves (`classes-mathalea/1`).
- **Lecture** : `readParcoursSettings` vérifie un fichier en entier
  (`isParcours`, `isObjective` : un parcours invalide est écarté) ; la lecture
  du stockage tolère les brouillons.
- **Fusion** (`mergeParcours`) : un parcours est reconnu à son identifiant. À
  l'import, un parcours inconnu est ajouté et un parcours connu n'est remplacé
  que par une version modifiée plus récemment (sinon version plus haute, plus
  publiée, puis un choix identique sur tous les appareils) ; un parcours
  supprimé ici revient, daté de l'import. En synchronisation, la modification
  ou la suppression la plus récente l'emporte. Les classes et les objectifs
  sont réunis, l'ordre est celui d'ici et les nouveaux parcours viennent
  ensuite : un changement d'ordre, une classe supprimée ou un objectif supprimé
  sur un appareil ne se propage pas.
- **Empreinte** (`parcoursContent`) : parcours, classes, ordre et objectifs,
  sans `updatedAt` ni l'état de publication. Elle n'entre dans
  `settingsFingerprint` que s'il y a des parcours (ou des suppressions), pour
  ne pas changer l'empreinte des sauvegardes qui n'en ont pas.

### Classes du tirage au sort

`studentClasses.ts` garde les classes de l'outil « Tirage au sort » de la vue
TBI (`StudentClass` : `id`, `name`, `students` — `{ name, draws }` —,
`createdAt`, `updatedAt`). L'outil et le volet écrivent par
`updateStudentClasses` (relit le stockage, n'écrit rien si rien ne change),
l'import par `saveStudentClasses` (`saveLibrarySettings`).

- **Liste des élèves** (`parseStudentNames`) : un par ligne, ou séparés par des
  virgules ou des points-virgules ; espaces normalisés, doublons écartés.
  `setStudentNames` garde le compteur d'un élève qui reste (par son nom).
- **Tirage** (`pickStudentIndex`) : poids `DRAW_WEIGHT_RATIO ^ (min − draws)`
  (`drawWeights`, ratio 4) : chaque tirage de plus divise par 4 la chance d'un
  élève face aux moins tirés. `drawProbabilities` alimente la colonne
  « Prochain tirage » du volet.
- **Import** (`mergeStudentClasses`) : rien n'est effacé ; une classe inconnue
  est ajoutée, une classe connue n'est remplacée que par une version plus
  récente (`updatedAt` : chaque tirage date la classe).
- **Empreinte** (`studentClassesContent` : identifiant, nom, élèves et
  compteurs) : elle n'entre dans `settingsFingerprint` que s'il y a des
  classes, pour ne pas changer l'empreinte des sauvegardes qui n'en ont pas.

### Dans le fichier et l'état de la sauvegarde

- `buildLibraryFile(…, settings)` ajoute `settings` (`preferences`,
  `slideshowHistory`, `parcours`, `edurlToken`, `classes`) à l'export de toute la bibliothèque, pas à celui d'un
  dossier, et pas s'il n'y a aucun réglage.
- L'import fusionne sans rien effacer (`mergeSettings`) : un modèle par
  identifiant et `updatedAt`, le lien élève et le modèle par défaut par date,
  un parcours par identifiant et `updatedAt`. Le message compte les parcours
  et les réglages importés.
- `BackupRecord.savedSettings` garde l'**empreinte** des réglages écrits dans
  un fichier (`settingsFingerprint`, sans `lastUsedAt` : relancer un diaporama
  ne compte pas comme une modification). `backupStatus` signale
  `settingsOnlyInBrowser`, affiché dans le cadre « État de la sauvegarde »
  (aussi quand il n'y a ni feuille ni sélection).

## Jeton edurl.fr et liens raccourcis

edurl.fr est le raccourcisseur de liens de l'éducation nationale (un serveur
Shlink). Il demande un **jeton d'accès personnel** (portail.apps.education.fr →
Mon profil → Jeton d'accès). Un seul jeton sert partout : le module
`src/lib/edurl/` (`token.ts` pour le jeton, `api.ts` pour les appels) est la
seule source, et les vues ne gardent plus de copie du code.

### Jeton

- **Stockage** : `localStorage`, clé historique `mathalea-edurl-token` (la
  valeur seule, donc un jeton déjà saisi est repris) et sa date de dernière
  modification dans `mathalea-edurl-token-date`. `saveEdurlToken` appelle
  `notifyContentChange()` : la sauvegarde automatique réécrit le fichier.
- **Fichier `.mathalea`** : `settings.edurlToken` (`{ value, updatedAt }`).
  Il fait partie de `LibrarySettings` mais pas de `hasSettings` (un
  navigateur qui n'a que le jeton n'a rien à synchroniser) : `hasSecretSettings`
  décide si le fichier l'écrit, et l'empreinte `settingsFingerprint` le compte
  s'il existe. Un fichier avec jeton prévient l'enseignant de ne pas le
  partager (aide de la vue, formulaire du jeton).
- **Import** (`mergeEdurlToken`) : le jeton du fichier n'est repris que s'il est
  plus récent que celui de ce navigateur ; un fichier sans jeton n'efface rien,
  et un jeton oublié ici plus récemment que le fichier le reste.
- **Interface** : section « Mes réglages › Jeton edurl.fr » (`EdurlTokenPanel` :
  enregistrer, changer, oublier après confirmation). Un jeton refusé par edurl.fr
  (`401`) est oublié et redemandé, par `EdurlTokenForm`, partout.

### Raccourcir un lien partout où l'on en propose un

`ButtonShortLink` (à côté des boutons Lien et QR-code, pastille
`bx-move-horizontal` comme le format « Raccourci ») ouvre `ShortLinkDialog` :
jeton demandé une seule fois, lien court créé (`shortenUrlOnce` : une même URL
n'est raccourcie qu'une fois par visite, pas de doublon dans edurl.fr), copie
et QR code téléchargeable. Il figure dans le quizz (`QuizzConf`), les réglages
et la fin du diaporama (`LinksSettings`, `SlideshowPlayEndButtons`) et les
réglages d'une sélection (`SelectionSettings`). Le lien élève
(`ConfigEleve`, format « Raccourci ») et le QR-code des fiches Typst
(`TypstLayoutOverlay`) avaient déjà leur propre commande : ils utilisent
maintenant le même module. Le lien de jointure d'une partie de quizz
multi-joueurs n'a pas de bouton : il est propre à une partie, un lien durable
n'aurait pas de sens.

### Liens raccourcis dans la vue

La section « Liens raccourcis » (`ShortLinksPanel`) liste les liens edurl.fr de
l'enseignant dont l'URL longue pointe vers coopmaths.fr ou mathalea.fr
(`isMathaleaUrl`, sous-domaines compris). La liste est lue sur edurl.fr à chaque
ouverture (bouton « Actualiser ») et n'est gardée ni dans le navigateur ni dans
le fichier : elle appartient à edurl.fr. Actions : ouvrir, copier, QR code,
renommer (le titre), supprimer (après confirmation : le lien court cesse de
fonctionner). La recherche de la vue filtre les titres et les adresses.

#### API de gestion

Le « Jeton d'accès » du portail n'est **pas** une clé de l'API Shlink d'edurl.fr
(`X-Api-Key` y est refusé en `401`) : c'est celle de l'API REST de l'application
du raccourcisseur, qui accepte les requêtes de tout site (CORS ouvert) et que
MathALÉA appelle directement, sans relais n8n (création comprise : l'ancien
relais `mathalea-edurl-relay` n'est plus utilisé).

`https://raccourcisseur.apps.education.fr/api/shortUrls`, en-tête
`x-auth-token: <jeton>` (et non `x-api-key`, qui donne `401`) :

| Action    | Requête                                                                                                                                                                                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Créer     | `POST /api/shortUrls` avec **tous** ces champs : `longUrl`, `title`, `enabled: true`, `tags: []`, `groups: []`, `expireAt: null`, `deleteAt: null`, et `customSlug` pour choisir le lien court (réponse `201` : le lien complet, `shortUrl`, `shortCode`, `ownerId`) ; sans l'un des cinq, réponse `400 [api.createOneShortUrl.emptyContent]` |
| Liste     | `GET /api/shortUrls?page=1&itemsPerPage=1000`                                                                                                                                                                                                                                                                                                 |
| Modifier  | `PATCH /api/shortUrls/{shortCode}` avec les seuls réglages changés : `title`, `longUrl`, `expireAt`, `deleteAt` (`AAAA-MM-JJ`, `null` pour retirer)                                                                                                                                                                                           |
| Visites   | `GET /api/shortUrls/{shortCode}/nbVisits` (un nombre, ou un objet qui le porte : `readVisitsCount`)                                                                                                                                                                                                                                           |
| Supprimer | `DELETE /api/shortUrls/{shortCode}`                                                                                                                                                                                                                                                                                                           |

- **La liste contient les liens de tous les utilisateurs** (`ownerId`), et
  l'instance n'applique pas fiablement recherche, tri et pagination : on lit
  tout, `listMathaleaLinks` ne garde que ceux dont l'URL longue est sur
  coopmaths.fr ou mathalea.fr. La réponse est un tableau brut (ou dans `body`,
  ou l'enveloppe Shlink `shortUrls.data`) ; la date de création est celle de
  l'événement `CREATE` de `history` ; `shortUrl` vaut `https://edurl.fr/<code>`
  s'il manque ; les visites ne sont affichées que si la réponse les donne.
- **Modifier** (bouton « Modifier », `updateShortLink`) : titre, URL de
  destination, **fin de validité** (`expireAt` : ensuite le lien ne redirige
  plus, il apparaît « Expiré », voir `isExpired`) et **suppression prévue**
  (`deleteAt` : le lien est effacé d'edurl.fr). Le code du lien court n'est
  pas modifiable : c'est l'identifiant du lien (`customSlug` n'existe qu'à la
  création). Un lien dont la destination quitte coopmaths.fr et mathalea.fr
  disparaît de la liste.
- **Actions groupées** : une case par lien (et « Tout cocher », limité aux liens
  affichés : une recherche masque les autres, qui restent hors de l'action).
  _Supprimer_ demande deux confirmations, la seconde (« Dernier avertissement »)
  dans un cadre rouge, et rien n'est envoyé avant la seconde. _Prolonger d'un
  an_ repousse la fin de validité et/ou la suppression prévue au choix
  (`extendOneYear` : un an après la date, ou après aujourd'hui si elle est déjà
  passée, ce qui réactive le lien) ; les liens sans la date choisie ne sont pas
  touchés. Les requêtes partent trois par trois (`runBatch`) avec la
  progression affichée ; un échec n'arrête pas les autres (sauf jeton refusé),
  et le message final compte les réussites et les échecs.
- **Visites** : lues lien par lien après la liste (`fetchVisits`, 4 requêtes à la
  fois), sans bloquer l'affichage ; elles manquent si l'API ne les donne pas.
- **Lien court choisi** : la fenêtre « Lien raccourci » (`ShortLinkDialog`)
  demande d'abord le code souhaité (facultatif, `slugError` : lettres sans
  accent, chiffres, `-` et `_`, 60 caractères au plus) avant de créer le lien.
  Un code déjà pris est signalé (`409`, ou un message de l'API qui le dit). Le
  code ne peut plus être modifié ensuite. **À la création, le lien est copié
  dans le presse-papier et la fenêtre se ferme** (message de confirmation) ;
  si la copie échoue, la fenêtre reste ouverte sur le lien. Rouvrir la fenêtre
  montre le lien créé (`knownShortUrl`), avec son QR code et « Créer un autre
  lien court ». Le bouton qui l'ouvre (`ButtonShortLink`, icône
  `bx-collapse-horizontal`) se distingue ainsi du bouton qui copie le lien
  complet.
- **Lien pour les élèves** (`ConfigEleve`, format « Raccourci ») : le lien
  automatique (code généré, recréé à chaque changement de réglage) reste le
  comportement par défaut ; « Personnaliser le lien court… » ouvre la même
  fenêtre (`fresh` : toujours sur le formulaire). Le lien personnalisé
  remplace l'automatique tant qu'il correspond aux réglages ; s'ils changent,
  son code étant déjà pris, il n'est pas recréé : le lien long est affiché et
  « Mettre à jour » change la destination du même lien court (`PATCH`).
  « Revenir au lien automatique » l'abandonne (il reste dans « Liens
  raccourcis »). Le lien automatique déjà créé avant la personnalisation y
  reste aussi. Le QR-code des fiches Typst garde un code généré.
- **Retrouver ses liens** (`detectOwnerId`) : la réponse d'une création donne
  `ownerId`, gardé aussitôt (`saveEdurlOwnerId`) : un enseignant qui a déjà créé
  un lien depuis MathALÉA n'a rien à chercher. Sinon, l'API ne dit pas à qui est le
  jeton. Pour chaque propriétaire (le plus de liens d'abord), on réécrit à
  l'identique l'URL longue d'un de ses liens (`PATCH { longUrl }`) ; l'écriture
  n'aboutit que pour les liens du jeton. L'identifiant trouvé est gardé dans
  `localStorage` (`mathalea-edurl-owner`, avec l'empreinte du jeton, hors du
  fichier `.mathalea`) ; la première ouverture peut durer jusqu'à 15 s. Sans
  aucun lien à soi vers MathALÉA, la recherche ne trouve rien et la liste est
  vide jusqu'au premier lien créé. Même méthode que UrledManager
  (urledmanager.forge.apps.education.fr).
- **Erreurs** : l'API répond `401` (et non `403`) pour un lien qui n'est pas à
  nous, avec `[api.shortUrls.….notPermitted]` dans `error` (code `NOT_OWNER`).
  Un autre `401` (code `TOKEN_INVALID`) signale un jeton refusé : il est oublié
  et redemandé.

Côté client : `listMathaleaLinks`, `renameShortLink`, `deleteShortLink`,
`detectOwnerId` (`src/lib/edurl/api.ts`, tests dans `api.test.ts`).

## Actions groupées

Une case à cocher (visible au survol, puis sur tous les éléments dès que l'un
est coché) sélectionne feuilles et sélections de la liste affichée. La barre
« N éléments cochés » propose Tout cocher, Déplacer (`moveItems`, grisé si
feuilles et sélections sont mêlées, par exemple dans une recherche : elles
n'ont pas les mêmes dossiers) et Supprimer (corbeille). Changer de dossier, de
recherche ou ouvrir la corbeille décoche tout.

## Corbeille

Supprimer une feuille ou une sélection (bouton, case à cocher, ou glisser sur
« Corbeille ») la place sans confirmation dans `library.trash`
(`TrashedItem` : l'élément, `deletedAt` et `location`, noms des dossiers qui
la contenaient) ; le message propose « Annuler ». Supprimer un dossier, après
confirmation, efface le dossier et ses sous-dossiers et met leur contenu à la
corbeille.

- **Restaurer** (`restoreItems`) remet l'élément dans son dossier, ou recrée
  un dossier du même chemin s'il a été supprimé entre-temps. L'élément prend
  la date de la restauration (`updatedAt`), pour l'emporter sur sa mise à la
  corbeille à la synchronisation.
- **Supprimer définitivement** et **Vider la corbeille** (`deleteForever`)
  effacent aussi les aperçus des feuilles, gardés jusque-là.
- À l'ouverture de la vue, `purgeTrash` efface les éléments supprimés depuis
  plus de `TRASH_DAYS` (30) jours.

La corbeille n'est ni exportée ni comptée dans l'état de la sauvegarde. Un
import qui contient un élément de la corbeille le rend à la bibliothèque et
l'en retire (`repair`), daté de l'import. Supprimer définitivement laisse une
pierre tombale (voir [Synchronisation](#synchronisation-entre-appareils)).

## Aide et état de la sauvegarde

Le bouton « Aide » de la vue ouvre une fenêtre qui explique que tout reste
dans le navigateur (aucune donnée ne transite par les serveurs de MathALÉA),
que ces données peuvent disparaître, que l'association CoopMaths ne peut être
tenue responsable de leur perte, et comment exporter puis importer un fichier
`.mathalea`.

Le cadre « État de la sauvegarde » (en tête de la vue dès qu'il y a une
feuille ou une sélection) donne la part des sauvegardes qui ne sont que dans
ce navigateur et la date du dernier export. `BackupRecord` (clé `sauvegarde`
du magasin `bibliotheque`) mémorise, pour chaque feuille et chaque sélection
(`libraryItems`), le `updatedAt` de la version écrite dans un fichier : par un export, ou par l'import d'un fichier qui la
contient dans sa version actuelle (l'import ne change pas la date du dernier
export). `backupStatus` compte comme « seulement dans le navigateur » tout
élément absent de ce relevé ou modifié, renommé ou déplacé depuis (pour une
sélection : étoiles, commentaire et réglages compris).

Dans la vue Impression, « Enregistrer » ne s'accompagne d'aucun message :
l'icône du bouton devient une coche (ou une alerte) pendant deux secondes,
sans décaler la barre ; un `role="status"` masqué l'annonce aux lecteurs
d'écran.

## Sauvegarde automatique (Chrome, Edge)

`src/lib/mesFeuilles/autoSave.ts` réécrit un fichier `.mathalea` choisi par
l'enseignant (API File System Access, navigateurs Chromium seulement ;
Firefox et Safari n'ont pas `showSaveFilePicker`, le bouton n'apparaît pas).
Placé dans un dossier synchronisé (client Nextcloud d'apps.education.fr,
OneDrive…), le fichier part aussi dans le nuage sans serveur MathALÉA.

- **Choix** : « Sauvegarde automatique » dans le cadre d'état
  (`chooseAutoSaveFile`). Le `FileSystemFileHandle` est gardé en IndexedDB
  (clé `fichierAuto`) et toute la bibliothèque est écrite aussitôt.
- **Écriture** : `watchAutoSave()` (vue Mes feuilles et bouton « Enregistrer »
  de la vue Impression) écoute les modifications de contenu faites dans
  l'onglet (`onLocalChange`, type `contenu`) et réécrit le fichier 1,5 s après
  la dernière. Les écritures ne se chevauchent pas. Une écriture réussie
  marque toutes les feuilles comme sauvegardées et note `lastAutoSaveAt` ; ce
  relevé est une modification de type `sauvegarde`, qui ne relance pas
  d'écriture.
- **Pause** : le navigateur ne garde l'autorisation d'écrire que pendant la
  session (sauf « Autoriser à chaque visite »). `queryPermission` renvoie
  alors `prompt` : le cadre affiche « en pause » et le bouton « Reprendre »
  (`resumeAutoSave`, `requestPermission` qui exige un clic).
- **Échec** (fichier déplacé, disque plein…) : le cadre propose de choisir un
  autre fichier.

La synchronisation directe avec nuage.apps.education.fr (WebDAV) n'est pas
possible depuis le navigateur : le serveur n'envoie pas d'en-têtes CORS
(requête préliminaire `OPTIONS` refusée en 401, sans
`Access-Control-Allow-Origin`). Il faudrait que la DNE autorise l'origine de
MathALÉA et enregistre un client OAuth2 Nextcloud.

## Nom des fichiers exportés

`exportFileName` met la date et l'heure locales à la seconde
(`mes-sauvegardes-2026-10-25-13h36m11.mathalea`) : sans l'heure, Safari renomme
un second export du même jour en `….mathalea-2`, qui perd son extension. Le
champ d'import filtre les fichiers `.mathalea` (et JSON) ; un fichier déposé
sur la page n'est pas filtré. Dans les deux cas, `parseLibraryFile` vérifie
le contenu.

## Stockage

IndexedDB, base `mathalea-mon-mathalea` (`src/lib/mesFeuilles/storage.ts`) :

| Magasin        | Clé                    | Contenu                                                                               |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `bibliotheque` | `fichierAuto`          | `AutoSaveFile` : fichier de la sauvegarde automatique                                 |
| `bibliotheque` | `sauvegarde`           | `BackupRecord` : versions écrites dans un fichier                                     |
| `bibliotheque` | `feuilles`             | `SheetLibrary` : dossiers, feuilles, sélections, séances, corbeille, pierres tombales |
| `apercus`      | identifiant de feuille | `SheetPreview` : SVG et dimensions de la page 1                                       |

Une bibliothèque enregistrée avant les sélections ou les séances est complétée à la lecture
(`repair`). `updateLibrary(change)` relit et réécrit la bibliothèque **dans la même
transaction** : un onglet ne peut pas effacer une feuille qu'un autre vient
d'enregistrer. Il ajoute aussi une pierre tombale pour chaque élément disparu
(`recordDeletions`) : aucune opération n'a à s'en occuper. Un `BroadcastChannel` prévient les autres onglets, qui se
rechargent. Au premier enregistrement, `navigator.storage.persist()` demande
au navigateur de ne pas effacer ces données.

## Fichier `.mathalea`

Archive ZIP (`zipLibraryFile`) qui contient un seul fichier,
`mes-sauvegardes.json`. À l'ouverture, `readLibraryFileText` reconnaît l'archive
à ses premiers octets (`PK`) ; un fichier qui ne commence pas ainsi est lu
directement comme du JSON, ce qui garde lisibles les anciens `.mathalea` et les
réglages de la vue TBI. Le fichier est écrit en `application/octet-stream` pour
que le navigateur ne le traite pas comme une archive à renommer ou à
décompresser. Le document de synchronisation reste du JSON non zippé.

JSON au format `mon-mathalea/1` (`libraryFile.ts`) : `folders`, `sheets` (avec
leur `preview`), `selectionFolders`, `selections`, `sessionFolders`, `sessions` et, pour un export complet,
`settings` (dont `parcours` : `library` et `deleted`) et `deleted` (pierres
tombales). Le document de synchronisation
ajoute `trash`. Ces clés ont été ajoutées sans changer le numéro du format : un
fichier qui ne les a pas reste valide. L'export porte sur toute la bibliothèque ou sur un dossier de l'une
des trois arborescences (`ExportedFolder`), qui devient alors une racine.

L'import **fusionne** sans rien effacer : un élément inconnu est ajouté, un
élément connu n'est remplacé que si la version du fichier est plus récente
(`updatedAt`). `repair` rattache à la racine les dossiers et feuilles dont le
parent manque et casse les boucles de dossiers. Une feuille ou une sélection dont
`query` ne commence pas par `?` est écartée : un fichier ne peut pas faire
ouvrir une autre adresse que MathALÉA. Étoiles et commentaire d'une sélection
importée sont revérifiés (`toStars`, `cleanComment`).

Importer un fichier sert à **récupérer** : ses pierres tombales sont
ignorées, et un élément du fichier qui avait été supprimé ici (corbeille ou
pierre tombale) revient, avec la date de l'import pour revenir aussi sur les
autres appareils. Il en va de même pour un modèle de document ou un diaporama
de l'historique.

## Synchronisation entre appareils

Les fonctions de fusion et les pierres tombales restent disponibles dans le
moteur ; aucune synchronisation par compte n'est active.

### Pierres tombales

Fusionner deux copies de la bibliothèque sans trace des suppressions ferait
revenir un élément supprimé sur un appareil depuis la copie d'un autre. Une
pierre tombale (`Tombstone` : `id`, `deletedAt`, `tombstones.ts`) est gardée
`TOMBSTONE_DAYS` (365) jours, puis oubliée (`recordRemovals`). Elles sont
posées par le stockage, en comparant l'avant et l'après d'une modification,
pas par chaque opération :

| Éléments                                | Où                                                  | Posées par                          |
| --------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| Dossiers, feuilles, sélections, séances | `SheetLibrary.deleted` (IndexedDB)                  | `updateLibrary` (`recordDeletions`) |
| Modèles de document                     | `Preferences.deleted` (`mathalea-mes-reglages`)     | `updatePreferences`                 |
| Diaporamas de l'historique (signature)  | `localStorage` `mathalea:slideshow-history-deleted` | `saveSlideshowHistory`              |
| Parcours de l'application               | `localStorage` `mathalea-parcours-supprimes`        | `saveParcoursLibrary`               |

Mettre à la corbeille n'est pas supprimer : l'élément reste dans
`library.trash`, qui voyage avec le document de synchronisation. Un élément
présent (recréé, restauré, importé) perd sa pierre tombale.

### Fusion

`syncLibraries(local, remote)` (`sync.ts`) garde, pour chaque dossier,
feuille ou sélection, la version la plus récente : modification
(`updatedAt`), mise à la corbeille (`deletedAt` de la corbeille) ou
suppression (pierre tombale). À date égale, la suppression l'emporte sur la
corbeille, qui l'emporte sur une modification (`latest`). Le résultat ne
dépend pas de l'ordre des deux versions, et fusionner deux fois ne change
rien. Une feuille dont le dossier a été supprimé ailleurs revient à la
racine (`repair`).

`mergeSettings(local, remote, { sync: true })` fait de même pour les modèles
de document (par identifiant), l'historique des diaporamas (par signature,
la dernière utilisation ou modification contre la suppression) et les parcours
(par identifiant, `updatedAt` contre la suppression). Sans `sync`,
c'est l'import d'un fichier : rien n'est effacé. `saveLibrarySettings`
enregistre des réglages fusionnés avec leurs pierres tombales.

## Fichiers

| Fichier                                                         | Rôle                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/lib/mesFeuilles/library.ts`                                | Modèle et opérations pures (dossiers, feuilles, sélections, URL) |
| `src/lib/mesFeuilles/selectionLink.ts`                          | Liens des sélections : lecture, réglages, URL d'ouverture        |
| `src/lib/mesFeuilles/libraryFile.ts`                            | Fichier `.mathalea` : export, lecture, fusion, réparation        |
| `src/lib/mesFeuilles/preview.ts`                                | Aperçu SVG affichable comme image                                |
| `src/lib/mesFeuilles/autoSave.ts`                               | Sauvegarde automatique dans un fichier (Chromium)                |
| `src/lib/mesFeuilles/preferences.ts`                            | Réglages : modèles de document, lien élève (`localStorage`)      |
| `src/lib/mesFeuilles/slideshowHistory.ts`                       | Historique des diaporamas (`localStorage`)                       |
| `src/lib/mesFeuilles/parcoursSettings.ts`                       | Parcours de l'application : lecture, fusion, stockage            |
| `src/lib/mesFeuilles/parcoursLink.ts`                           | Lien qui ouvre la vue Parcours sur un parcours                   |
| `src/lib/mesFeuilles/studentClasses.ts`                         | Classes du tirage au sort : liste, tirage pondéré, import        |
| `src/lib/mesFeuilles/settings.ts`                               | Réglages du fichier : empreinte, fusion, import                  |
| `src/lib/mesFeuilles/tombstones.ts`                             | Pierres tombales des éléments supprimés, choix de la version     |
| `src/lib/mesFeuilles/sync.ts`                                   | Synchronisation : fusion, document, étape selon le serveur       |
| `src/lib/mesFeuilles/slideshowLink.ts`                          | Lien qui rouvre un diaporama de l'historique                     |
| `src/lib/mesFeuilles/pdfPreview.ts`                             | Aperçu d'une feuille LaTeX : pages du PDF rastérisées (pdf.js)   |
| `src/components/setup/mesFeuilles/TypstModelsPanel.svelte`      | Volet « Modèles de document »                                    |
| `src/components/setup/mesFeuilles/TypstModelEditor.svelte`      | Modification d'un modèle                                         |
| `src/components/setup/mesFeuilles/SlideshowHistoryPanel.svelte` | Volet « Historique des diaporamas »                              |
| `src/components/setup/mesFeuilles/StudentClassesPanel.svelte`   | Volet « Classes » (tirage au sort de la vue TBI)                 |
| `src/components/setup/mesFeuilles/ParcoursPanel.svelte`         | Volet « Parcours pour l'application »                            |
| `src/components/setup/mesFeuilles/LatexLogo.svelte`             | Logo LaTeX des feuilles de la vue LaTeX                          |
| `src/components/setup/mesFeuilles/TypstModels.svelte`           | Modèles de document du volet de réglages de la vue Impression    |
| `src/lib/mesFeuilles/storage.ts`                                | IndexedDB et synchronisation entre onglets                       |
| `src/components/setup/mesFeuilles/MesSauvegardes.svelte`        | La vue                                                           |
| `src/components/setup/mesFeuilles/SaveSheetButton.svelte`       | Bouton « Enregistrer » de la vue Impression                      |
| `src/components/setup/mesFeuilles/FolderTree.svelte`            | Arborescence (navigation, dépôt)                                 |
| `src/components/setup/mesFeuilles/FolderPicker.svelte`          | Choix d'un dossier (enregistrer, déplacer)                       |
| `src/components/setup/mesFeuilles/SheetThumbnail.svelte`        | Vignette et aperçu agrandi                                       |
| `src/components/setup/mesFeuilles/SaveSelectionButton.svelte`   | Bouton « Ajouter à mes sélections » (conception, lien élève)     |
| `src/components/setup/mesFeuilles/NewSelectionForm.svelte`      | Ajout d'une sélection (lien collé ou état courant), mise à jour  |
| `src/components/setup/mesFeuilles/SelectionItem.svelte`         | Une sélection de la liste                                        |
| `src/components/setup/mesFeuilles/SelectionSettings.svelte`     | Réglages d'une sélection, lien et QR code                        |
| `src/components/setup/mesFeuilles/EditedSelectionBar.svelte`    | Bandeau « Enregistrer et revenir » de la conception de document  |
| `src/components/setup/mesFeuilles/StarRating.svelte`            | Étoiles (0 à 3)                                                  |

## Tests

- `src/lib/mesFeuilles/library.test.ts` : dossiers (chemin, comptage, tri,
  déplacements interdits, suppression en cascade), feuilles, recherche, URL,
  aller-retour du fichier, fusion, réparation, aperçu en XML valide.
  `library.test.ts` couvre aussi les feuilles LaTeX (vue lue dans la requête,
  lien, code retouché, aller-retour du fichier, aperçu rasterisé).
- `src/lib/mesFeuilles/trash.test.ts` : corbeille (mise à la corbeille,
  restauration, dossier recréé, suppression définitive, purge après 30 jours,
  import), déplacement groupé, tri par vue.
- `src/lib/mesFeuilles/selections.test.ts` : dossiers et opérations des
  sélections, tri, recherche, état de la sauvegarde, fichier (aller-retour,
  export d'un dossier, ancien fichier, fusion), lecture d'un lien (crypté,
  sans protocole, refusé), réglages (vue élève, interactivité, `es` court,
  CAN), lien ouvert, nouveaux énoncés, remplacement des exercices.
- `src/lib/mesFeuilles/settings.test.ts` : réglages du lien élève (filtre,
  comparaison), modèles (réglages exclus, application, opérations, lecture
  d'un réglage abîmé, `localStorage`), modification et duplication d'un modèle,
  lien d'un diaporama de l'historique, fusion (modèles, diaporamas par
  signature), fichier (aller-retour, export d'un dossier sans réglages),
  empreinte et état de la sauvegarde, import.
- `src/lib/mesFeuilles/parcoursSettings.test.ts` : lecture (fichier strict,
  stockage tolérant), enregistrement (date, pierre tombale, rien d'écrit sans
  modification), import (ajout, version plus récente, parcours supprimé ici),
  synchronisation (symétrie, suppression, idempotence), fichier (aller-retour,
  fichier abîmé), empreinte et état de la sauvegarde.
- `src/lib/mesFeuilles/studentClasses.test.ts` : liste d'élèves saisie,
  tirage pondéré, compteurs gardés en modifiant la liste, enregistrement,
  import, aller-retour du fichier `.mathalea`.
- `src/lib/mesFeuilles/sync.test.ts` : pierres tombales (suppression,
  corbeille, dossier, oubli après un an, fichier, retour à l'import), fusion
  de synchronisation (suppression, modification plus récente, corbeille puis
  restauration, dossier supprimé, symétrie), modèles et diaporamas supprimés,
  document sans aperçus, étape selon la version du serveur.
