# Vue LaTeX

La vue LaTeX (`v=tex` dans l'URL) reprend l'interface de la [vue
Typst](typst.md) — éditeur de code, modes d'affichage, volet de réglages — mais
produit une fiche **LaTeX**, compilée par le même service distant que la vue
PDF.

Elle s'appuie sur le générateur existant [`lib/Latex.ts`](../../../../src/lib/Latex.ts) :
une fiche réglée ici peut être rouverte dans la vue PDF, et réciproquement (les
réglages sont le même objet `LatexFileInfos`, sous un nom de paramètre d'URL
différent).

## Différence de fond avec la vue Typst : la latence

Typst compile dans le navigateur en quelques dizaines de millisecondes, ce qui
autorise une recompilation à la frappe et une palette de mise en page posée sur
l'aperçu. Une compilation LaTeX passe par le réseau et dure plusieurs secondes.
Trois conséquences :

- la compilation est **manuelle** (bouton « Compiler », Ctrl/Cmd + Entrée —
  pas Ctrl/Cmd + S, Safari ouvre sa boîte d'enregistrement de page avant même
  que l'événement clavier n'atteigne la page) ; l'aperçu précédent reste
  affiché, grisé, avec un bouton « Aperçu périmé » tant qu'il n'a pas été
  rafraîchi (il recompile au clic) ;
- il n'y a **pas de palette sur l'aperçu** : les réglages par exercice sont dans
  le volet latéral, où l'on choisit l'exercice dans une liste ;
- l'aperçu est le lecteur PDF du navigateur (une `<iframe>` sur le blob), pas un
  rendu que l'application contrôle. Recharger le document remet donc le
  défilement à zéro.

## Interfaces

Trois modes d'affichage, mémorisés dans `localStorage` (`mathaleaTexView`) :
**Code**, **Côte à côte** et **Aperçu**. Le code est éditable ; toute frappe
marque la fiche comme « modifiée à la main » (`isEdited`) et fait confirmer
l'écrasement avant une régénération. Les éditions faites par la vue elle-même
(régénération, retour à la dernière version qui compilait) ne l'arment pas.

## Éditeur de code

L'éditeur est celui de la vue Typst, extrait dans
[`components/setup/shared/editor/`](../../../../src/components/setup/shared/editor/editorSetup.ts) :
`codeEditorExtensions({ dark, onCompileNow, language })` fournit numéros de
lignes, repliage par indentation, curseurs multiples, recherche, thèmes clair et
sombre, marqueurs d'erreur (`setEditorMarkers`, `revealPosition`) et interface
française (`editorPhrases.ts`). Seule la coloration syntaxique change d'une vue
à l'autre : elle est passée en option — `typstLanguage` pour Typst,
[`latexLanguage`](../../../../src/components/setup/tex/editor/latexLanguage.ts)
(le mode `stex` de CodeMirror) ici.

Les raccourcis sont donc identiques à ceux de la vue Typst ; le bouton
« Raccourcis » de la barre d'outils en affiche la liste.

## Réglages du document

Le volet (`TexSettingsPane.svelte`) écrit dans `LatexFileInfos`. Chaque
modification régénère le code et l'enregistre dans l'URL, sans compiler.

| Réglage | Effet |
| --- | --- |
| Habillage | `Coopmaths`, `Classique`, `ProfMaquette`, `ProfMaquette + QR-code`, `Course aux nombres` |
| Type de fiche, titres des exercices, QR-code | ProfMaquette seulement |
| Durée de l'épreuve | Course aux nombres seulement |
| Colonnes de la fiche | `multicols` autour du contenu d'une version, avec `\raggedcolumns` et `\mathaleaFitPictures` (figures TikZ réduites à la largeur de la colonne, titres pgfplots renvoyés à la ligne) |
| Noir et blanc | `\selectcolormodel{gray}` |
| Marges | `\geometry{...}` en fin de préambule ; le cadre des corrections (`\tikzfootMA`) est redessiné à mi-marge |
| Titre, sous-titre, référence | En-tête de la fiche |
| Correction | Émission du bloc `Correction` |
| Identifiant des exercices | `withReferences` |
| Nombre de versions, numéro de version en en-tête | `\version{i}` (ou champ `Date=` en ProfMaquette) |
| Police (dys, famille, taille) | `loadFonts` |
| Modèle d'épreuve | Brevet, Bac, DS : page de garde et barème (`ExamTemplateEngine`) |

## Réglages par exercice

Portés par `LatexFileInfos.exos`, indexé par la **position** de l'exercice dans
la fiche (comme dans la vue PDF) : déplacer ou supprimer un exercice décale donc
les réglages des suivants.

| Réglage | Effet |
| --- | --- |
| Colonnes de l'énoncé / de la correction | `multicols` |
| Espace entre questions | `itemsep` de l'`enumerate` |
| Numérotation | `label` de l'`enumerate` |
| Interligne | `\begin{spacing}{...}` autour du corps |
| Lignes pour écrire | `\blocrep`, en fin d'exercice ou après chaque question |
| Saut de page / de colonne avant | `\newpage` / `\columnbreak` |
| Ne pas couper entre deux pages | style tcolorbox `mathaleaexo` (voir ci-dessous) |
| Fusionner avec l'exercice précédent | la fermeture du cadre `EXO` est différée |

**Deux réglages ne valent que pour les habillages Coopmaths et Classique** :
« ne pas couper » et « fusionner ». Les cadres de ProfMaquette portent
`breakable` en dur (`ProfMaquette.sty`) et le regroupement y passe par
`exosGrouping`, qui réordonne la fiche. Le volet le dit et masque les deux
cases.

### Découpe des cadres (`mathaleaexo`)

`preambule.tex` définit `\tcbset{mathaleaexo/.style={breakable}}` et les
environnements `EXOcoop` et `EXOlibre` emploient ce style plutôt que la clé
`breakable` en dur. Le générateur redéfinit le style juste avant un exercice à
garder d'un seul tenant :

```latex
\tcbset{mathaleaexo/.style={unbreakable}}
```

Passer par un style plutôt que par un `\tcbset{unbreakable}` global évite de
changer la découpe des autres cadres du document (ProfCollege…).

## Compilation

Le préambule partagé (`loadFonts` dans
[`preambuleTex.ts`](../../../../src/lib/latex/preambuleTex.ts)) détecte le moteur
avec `iftex` : `inputenc` (UTF-8) et `fontenc` (T1) sont chargés avec pdfLaTeX,
`fontspec` avec XeLaTeX (dont Tectonic) et LuaLaTeX. `hyperref` détecte également
son pilote sans option de moteur imposée. Cette sélection automatique concerne
aussi les exports de la vue PDF, qui utilisent le même générateur ; les polices
et paquets particuliers des exercices peuvent avoir leurs propres contraintes
de moteur (Fira nécessite par exemple XeLaTeX ou LuaLaTeX).

Deux moteurs, choisis dans la barre d'outils et persistés dans `localStorage`
(`mathaleaTexView`, avec `displayMode`) :

### Coopmaths (par défaut)

[`texCompiler.ts`](../../../../src/components/setup/tex/texCompiler.ts) envoie
le source et ses images en `multipart/form-data` à
`https://latexcompiler.duckdns.org/generate` — même requête que
[`PdfResult.svelte`](../../../../src/components/setup/latex/PdfResult.svelte),
mais indépendante de `Latex` et de `LatexFileInfos`, pour pouvoir compiler un
code modifié à la main. La réponse est le PDF (en Blob) ou le journal de
compilation en cas d'échec. Une compilation en cours est annulée quand une
nouvelle est lancée (`AbortController`), et abandonnée au bout de 90 secondes.

**Télécharger le PDF** ne recompile pas quand l'aperçu est déjà à jour
(`!isPreviewStale`) et qu'un PDF a déjà été produit : il enregistre alors
directement le Blob affiché. Une recompilation n'a lieu que si le code a
changé depuis le dernier aperçu, ou qu'aucun PDF n'existe encore.

Le service ne renvoie pas d'en-tête `Access-Control-Allow-Origin` pour
`http://localhost` : **l'aperçu ne compile pas en développement**. C'est la même
limitation que la vue PDF, dont la vue reprend la requête à l'identique.

Les images des exercices d'annales sont récupérées avec les helpers de
`lib/Latex.ts` (`makeImageFilesUrls`) et jointes à la requête. Elles sont
déduites des exercices chargés, pas du code affiché : un code modifié à la main
qui en référencerait d'autres les verrait manquer.

La page de garde « Course aux nombres » utilise le même logo que la vue Typst
(`public/images/logoCan.png`, `\includegraphics{logoCan.png}` dans
`loadPreambuleCan`). Ce PNG, trop lourd pour être embarqué, est joint comme une
image d'annale : `getLogoCanUrls` (`lib/Latex.ts`) le détecte dans le code et
l'ajoute aux fichiers envoyés au compilateur, à l'archive ZIP et à Overleaf.
texlive.net corrompt les PNG : pour ce moteur, `Tex.svelte` remplace le logo
par un titre texte.

### texlive.net

Comme la vue LaTeX historique
([`ButtonCompileLatexToPDF.svelte`](../../../../src/components/shared/forms/ButtonCompileLatexToPDF.svelte)).
`https://texlive.net/cgi-bin/latexcgi` redirige la réponse de sa requête POST
vers l'URL du fichier produit, sans en-tête CORS sur cette redirection : un
`fetch` échoue systématiquement depuis le navigateur (vérifié), y compris en
production. La seule voie fiable est un formulaire caché (`filecontents[]`,
`filename[]`, `engine=lualatex`, `return=pdf`) soumis vers l'aperçu, ciblé par
son nom (`TEXLIVE_PREVIEW_NAME`) — une **navigation**, pas une requête script,
donc pas de restriction CORS.

`return=pdf` (pas `pdfjs`) : ce dernier charge le visualiseur complet de
texlive.net (barre d'outils avec vignettes de pages, outils d'annotation…),
hors de propos ici. `return=pdf` renvoie le fichier brut, rendu par le lecteur
natif du navigateur — et, faute de PDF produit, le journal de compilation en
texte brut, lisible directement dans l'aperçu.

Conséquence de cette voie : ni le PDF ni le journal ne sont récupérables par
script. L'aperçu affiche directement ce que renvoie texlive.net, erreurs
comprises, sans diagnostics ni bouton de retour à la dernière version qui
compilait. Le téléchargement ouvre un nouvel onglet avec le PDF brut, comme le
repli de la vue « à la carte »
([`Alacarte.svelte`](../../../../src/components/setup/alacarte/Alacarte.svelte)).
Les images sont jointes en texte (même limite que la vue LaTeX historique) :
une image binaire (png, jpg) y serait corrompue, seuls les formats textuels
(svg, eps) passent correctement.

L'aperçu (`<iframe name={TEXLIVE_PREVIEW_NAME}>`) existe en permanence dans le
DOM, quel que soit le moteur : coopmaths lui donne un `src` (Blob), texlive.net
y navigue par ciblage de formulaire.

## Diagnostics

Propres au moteur coopmaths (voir ci-dessus pour texlive.net). Le service
renvoie le journal complet de LuaLaTeX, dont l'essentiel est du bruit.
[`texDiagnostics.ts`](../../../../src/components/setup/tex/texDiagnostics.ts)
en extrait les erreurs (`! …` suivi de `l.<ligne>`) et les avertissements
(`LaTeX Warning: … on input line N`), et traduit en français les messages les
plus courants (`RULES`, du plus précis au plus général). Comme pour Typst, un
message non couvert reste en anglais — jugé plus utile qu'une approximation — et
le texte d'origine reste consultable.

Sont écartés : les avertissements typographiques (`Overfull \hbox`…), qu'une
fiche produit par dizaines sans qu'ils appellent de correction, et
« Emergency stop » / « Fatal error », qui ne disent rien de plus que l'erreur
qui les précède (gardés seulement faute de mieux).

Côté interface, le panneau est sous les deux volets : repliable, chaque
diagnostic cliquable pour amener le curseur sur sa ligne, lignes fautives
surlignées et marquées d'une pastille dans la marge, et un bouton **« Revenir à
la dernière version qui compilait »** qui passe par l'historique de CodeMirror
(donc annulable par Ctrl/Cmd + Z).

## Persistance dans l'URL

Les réglages du document sont encodés en base64 dans le paramètre `texParam`,
sur le modèle de `typstParam` : `texParamStore` est la source de vérité,
`persistToUrl` le pose avec `history.replaceState` après avoir redéclenché
l'écrivain d'URL de l'application. La liste des exercices, leurs graines et
leurs réglages restent portés par les paramètres habituels (`exercicesParams`).

Le paramètre porte le même objet que `pdfParam` de la vue PDF, sous un autre
nom : les deux vues n'ont pas les mêmes réglages par défaut et se marcheraient
dessus.

## Exports

- **Télécharger le .tex** — ou une archive ZIP (`.tex` + images) quand la fiche
  en a besoin ;
- **Aller sur Overleaf** — bouton partagé avec la vue LaTeX historique ;
- **Télécharger le PDF** — compile si l'aperçu est périmé, puis enregistre.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/components/setup/tex/Tex.svelte` | La vue : barre d'outils, éditeur, aperçu, diagnostics, exports |
| `src/components/setup/tex/TexSettingsPane.svelte` | Volet « Réglages du document » |
| `src/components/setup/tex/TexExerciseSettings.svelte` | Réglages de l'exercice choisi |
| `src/components/setup/tex/texCompiler.ts` | Requête au service de compilation |
| `src/components/setup/tex/texDiagnostics.ts` | Lecture et traduction du journal LaTeX |
| `src/components/setup/tex/editor/latexLanguage.ts` | Coloration syntaxique LaTeX (`stex`) |
| `src/components/setup/shared/editor/editorSetup.ts` | Extensions CodeMirror communes aux vues Typst et LaTeX |
| `src/components/setup/shared/editor/editorPhrases.ts` | Traduction française de l'interface de CodeMirror |

## Tests

`src/components/setup/tex/texDiagnostics.test.ts` : lecture du journal de
compilation et traduction des messages.

`tests/e2e/tests/consistency/consistency.test.ts` parcourt la vue `v=tex`,
sélectionne chaque habillage dans le volet de réglages et compare le source
LaTeX produit avec les autres vues. Le service de compilation distant y est
simulé : ce test vérifie la génération du source, pas la compilation PDF.
