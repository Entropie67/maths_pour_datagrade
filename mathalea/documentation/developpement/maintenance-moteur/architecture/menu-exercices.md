# JSON du référentiel et du menu d'exercices

Cette page décrit le rôle de chaque fichier JSON impliqué dans la génération et l'affichage du menu d'exercices (arborescence niveau > thème > exercice, annales, outils, etc.).

## Vue d'ensemble

Deux familles de fichiers coexistent :

- **Fichiers générés** par [tasks/updateMenuInternational.js](../../../../tasks/updateMenuInternational.js) (référentiel des exercices aléatoires) et par `tasks/dictionnaireToReferentiel.js` (référentiel des annales statiques). Ils ne doivent pas être édités à la main.
- **Fichiers maintenus manuellement** : squelettes de référentiel, libellés affichés, contenus de menu annexes (outils, ressources, bibliothèque, applications tierces, liens rapides, carrousel). `src/json/referentielStaticFRSessions.json` conserve aussi des corrections manuelles : la moulinette `tasks/dicosDnbBacE3c/dicosManage.py` complète ses entrées manquantes, mais `tasks/dictionnaireToReferentiel.js` le vérifie sans le régénérer (voir plus bas la section « Allègement de `referentielStaticFR.json` »).

Tous ces fichiers sont importés statiquement (ES modules JSON) par le code sous [src/lib](../../../../src/lib) et [src/components](../../../../src/components) ; il n'y a pas de fetch runtime.

## Génération par `tasks/updateMenuInternational.js`

### Détection des fonctions QCM, QCM Cam et « Pas uniquement QCM »

Les indicateurs `features.qcm` et `features.qcmcam` sont produits par la même
détection statique dans `tasks/lib/detect-qcm-capability.js`. Ils ont donc
toujours la même valeur : tout exercice reconnu comme QCM porte le pictogramme
QCM Cam.

La détection parcourt l'AST TypeScript ou JavaScript, sans exécuter l'exercice.
Elle reconnaît :

- les classes qui étendent directement `ExerciceQcm` ou `ExerciceQcmA` ;
- ces mêmes héritages à travers une chaîne de classes parentes importées depuis
  des modules locaux ;
- les appels aux helpers QCM connus, notamment `propositionsQcm()`,
  `buildQcmForExercise()` et `buildSimpleVersionQcm()` ;
- les formats `qcm` et `mathalea-qcm` affectés à `formatInteractif` ;
- les marqueurs `versionQcm` et `versionQcmDisponible` positionnés à `true`.

Le filtre « Pas uniquement QCM » s'appuie sur `features.pasUniquementQcm`,
calculé par `offersNonQcmFormat()` dans le même module : l'exercice appelle un
helper de saisie (`ajouteChampTexteMathLive()`, `remplisLesBlancs()`, helpers de
tableau…), directement ou dans une classe parente importée localement. Les
héritiers de `ExerciceQcmACourt`, dont la saisie courte est l'affichage par
défaut, sont donc reconnus. L'indicateur vaut aussi `true` pour tout exercice qui
n'est pas un QCM ; seuls les QCM sans aucune autre saisie en sont exclus. Seul
`features.qcmcam` n'a plus de filtre : il ne sert qu'au pictogramme.

Les fichiers analysés et le résultat de leur résolution transitive sont mis en
cache pendant la génération. Aucun exercice n'est instancié et aucune
proposition n'est comptée. L'ancien export `interactifType` n'entre pas dans la
détection.

Le bouton d'export de `Start.svelte` contrôle ensuite les questions réellement
générées à partir de `autoCorrection[].formatInteractif`. L'exporteur
`src/lib/qcmCam.ts` ne limite ni le nombre de propositions ni le nombre de
bonnes réponses ; les lettres de toutes les bonnes réponses sont concaténées
dans le champ `reponse`.

Le script doit être relancé après la création ou la modification d'un exercice. Il parcourt `src/exercices`, extrait les métadonnées de chaque fichier d'exercice (`uuid`, `refs`, `titre`, dates, `features` interactif/amc/qcm) et écrit, séparément pour la France (`FR`) et la Suisse (`CH`) :

Le `titre` est lu dans le code source par expression régulière, donc sans exécuter
le fichier : le script restitue lui-même les échappements `\'`, `\\`, `\uXXXX` et
`\xXX` (fonction `unescapeTitre`). On peut ainsi écrire `«\u00a0texte\u00a0»` dans
un titre sans que le menu affiche `\u00a0`. Les autres séquences (`\n`, `\"`…) ne sont pas
interprétées : les éviter dans un titre.

Le type d'interactivité est extrait des littéraux `formatInteractif` présents
dans le fichier, qu'ils soient utilisés dans un objet
(`formatInteractif: 'mathalea-qcm'`) ou dans une affectation
(`autoCorrection[i].formatInteractif = 'clique-figure'`). Seules les valeurs
répertoriées par les unions `InteractivityType` et `OldFormatInteractifType` de
`src/lib/types.ts` sont acceptées. L'ancien export `interactifType` n'est
plus accepté et ne doit pas être renseigné. Le format est déduit des appels aux
helpers et des valeurs de `formatInteractif`.
En l'absence de littéral, les appels à `remplisLesBlancs` et aux helpers `AddTab*Mathlive` sont
respectivement reconnus comme `fill-in-the-blank` et `tableau-mathlive`. Un
exercice interactif sans autre indice conserve le format historique par défaut
`mathlive`.

| Fichier                                                                              | Rôle                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/json/referentiel2022FR.json`, `src/json/referentiel2022CH.json`                 | Arbre complet niveau > thème > exercice construit à partir du squelette `tasks/emptyRef2022.json` / `tasks/emptyRefCH.json`. C'est le référentiel affiché en tant que section « Exercices aléatoires » du menu (`referentielsStore.ts`).                                                                             |
| `src/json/referentielGeometrieDynamique.json`                                        | Sous-arbre « Géométrie dynamique » extrait de `referentiel2022FR.json` (FR uniquement) et retiré de ce dernier. Alimente la section « Géométrie dynamique » du menu.                                                                                                                                                 |
| `src/json/exercicesFR.json`, `src/json/exercicesCH.json`                             | Liste à plat (clé = ref pédagogique) de tous les exercices générés, triée par clé. Sert d'étape intermédiaire à la construction du référentiel ; pas consommée directement ailleurs dans `src/`.                                                                                                                     |
| `src/json/exercicesNonInteractifsFR.json`, `src/json/exercicesNonInteractifsCH.json` | Liste des chemins de fichiers d'exercices dont `interactifReady` n'est pas `true`. Fichier de suivi/inventaire, non consommé au runtime.                                                                                                                                                                             |
| `src/json/uuidsToUrlFR.json`, `src/json/uuidsToUrlCH.json`                           | Dictionnaire `uuid -> chemin du fichier source` (plus quelques entrées fixes pour les outils Svelte comme `spline`, `clavier`, `version`, `equation`). Utilisé par [mathalea.ts](../../../../src/lib/mathalea.ts) et `componentsUtils.ts` pour charger dynamiquement le module d'un exercice à partir de son `uuid`. |
| `src/json/refToUuidFR.json`, `src/json/refToUuidCH.json`                             | Dictionnaire `ref pédagogique -> uuid`. Utilisé par `languagesStore.ts` / `languagesUtils.ts` pour retrouver l'exercice équivalent lors d'un changement de langue/pays (FR ↔ CH) à partir de sa référence pédagogique.                                                                                               |

### Déplacer des fichiers d'exercices dans des sous-dossiers

`readInfos()` parcourt récursivement `src/exercices` : les sous-dossiers sont
pris en compte pour générer le menu. Le classement pédagogique dépend des
`refs`, pas du dossier du fichier.

Le chargement des modules dépend toutefois des motifs `import.meta.glob()`
déclarés dans `src/lib/exerciseLoader.ts` et `src/lib/exerciseModules.ts`.
Le motif `../exercices/*/*.{ts,js}` ne couvre qu'un dossier sous
`src/exercices`. Les arborescences plus profondes doivent être couvertes
explicitement dans les deux fichiers, comme celles de `can`, `ch`, `QCMBrevet` et
`QCMBac`. La détection par le générateur de menu ne garantit donc pas que
l'exercice puisse être chargé.

Après un déplacement, adapter les imports relatifs du fichier et ceux de ses
consommateurs, puis lancer `pnpm makeJson` pour actualiser notamment les
dictionnaires `uuidsToUrlFR.json` et `uuidsToUrlCH.json`. Conserver les UUID
pour que les liens partagés continuent à désigner les mêmes exercices.

### Entrées manuelles

Entrées manuelles utilisées par le script :

- `tasks/emptyRef2022.json`, `tasks/emptyRefCH.json` : squelette des niveaux/catégories (sans exercices) servant de point de départ à `referentiel2022*.json`. À mettre à jour en cas de création de niveau ou de chapitre.
- `src/json/levelsThemesList.json`, `src/json/levelsThemesListCH.json` : libellés (titres humains) des niveaux, thèmes et sous-thèmes affichés dans le menu, utilisés par `ReferentielNode.svelte` (pas régénérés par le script).

Le rattachement d'un exercice à un thème se fait **par préfixe** : le script place un exercice sous une feuille du squelette dès que sa ref commence par le code de cette feuille (`key.startsWith(theme)`). Deux conséquences :

- un exercice est ajouté à **toutes** les feuilles dont le code est un préfixe de sa ref ; il apparaît donc en double si deux codes de thèmes sont l'un préfixe de l'autre (par exemple `BP1G` et `BP1GV`). Il faut choisir des codes de thèmes qui ne se préfixent pas entre eux — c'est pourquoi le thème « Géométrie » du Bac Pro Première porte le code `BP1GEO` (refs `BP1GEO01` à `BP1GEO09`) et non `BP1G`, qui aurait aussi capté les refs `BP1GV01` et suivantes ;
- une ref peut volontairement appartenir à plusieurs thèmes (y compris de niveaux différents) : il suffit de l'ajouter au tableau `refs['fr-fr']` du fichier d'exercice. C'est ainsi qu'un même exercice de collège ou de lycée est réutilisé dans les référentiels Bac Pro.

Après avoir construit le référentiel français, le script affiche aussi un audit
non bloquant :

- chaque référence `refs['fr-fr']` qui n'a été rattachée à aucune feuille de
  `tasks/emptyRef2022.json`, avec le chemin du fichier et son uuid ;
- chaque feuille effectivement utilisée qui n'a de titre ni dans
  `levelsThemesList.json`, ni dans les tables de libellés génériques
  `codeToLevelList.json` et `codeToThemeList.json`.

Le script ne crée aucun rattachement et aucun titre automatiquement. Le rapport
sert à décider des catégories à ajouter ou des références à corriger. Il est
affiché par `pnpm makeJson`, donc également pendant `pnpm build`.

L'apparence d'un noeud du menu dépend à la fois de sa profondeur dans `emptyRef2022.json` et de la fonction `themeCodeisSubthemeCode()` dans `ReferentielNode.svelte`. Cette fonction détecte certains formats de codes comme des sous-thèmes pour masquer le code et appliquer une typographie plus discrète. Le préfixe `can` et l'infixe `auto` sont retirés avant cette détection : `2F12`, `can2F12` et `2F12auto...` suivent donc la même règle d'affichage. Si un nouveau format de code est ajouté au référentiel, il peut être correctement placé dans l'arbre tout en étant affiché comme un thème principal tant que cette fonction ne reconnait pas son motif.

### Cycle d'orientation suisse

Dans `tasks/emptyRefCH.json`, les neuf niveaux du CO s'affichent dans l'ordre
`9R3`, `9R2`, `9R1`, `10LS`, `10LC`, `10CT`, `11LS`, `11LC`, `11CT`.
Les entrées du Cycle d'orientation dans `src/json/mobileMenu.json` reprennent
cet ordre pour la vue mobile et la sélection Typst.
Dans chaque niveau, les axes suivent l'ordre des moyens d'enseignement :
Nombres et opérations, Fonctions et algèbre,
Espace, Grandeurs et mesures, puis QCM. L'ordre des catégories et sous-catégories
est celui des clés du squelette, indépendamment de leur code. Déplacer une feuille
ne nécessite donc pas de renommer ses références.

`src/lib/components/swissReferentiel.ts` fournit `isSwissCycleCode()` et
`sortSwissCycleEntries()`. `ReferentielNode.svelte` conserve cet ordre pédagogique
et trie naturellement les références des exercices (`-2` avant `-10`). La vue
mobile et la sélection Typst partagent le même tri via `splitChildren()` dans
`mobileMenu.ts`. Les catégories et feuilles du CO restent repliées par défaut ;
leur état d'ouverture est ensuite mémorisé comme pour les autres référentiels.

Les groupes de 9e réunissent les décimaux et le calcul, et séparent les familles
de figures planes. Les feuilles existantes peuvent conserver leurs codes sous
un groupe portant un autre préfixe : le rattachement des exercices reste fondé
sur le code de la feuille. Les QCM utilisent les références
`<niveau>QCM<axe>-<n°>`, avec une subdivision par notion si nécessaire
(`11LSQCMFA2D-1`). `regexpQcmCO` dans `ReferentielNode.svelte` masque le code
de ces subdivisions comme pour les autres feuilles du CO.

`tests/unit/swissReferentiel.test.ts` vérifie l'ordre des axes, les regroupements
de 9e, le tri numérique et la répartition des QCM sur le référentiel généré.

Un classement suisse peut conserver un exercice dont certains cas dépassent
le niveau de la feuille, lorsque ses paramètres permettent de choisir les cas
adaptés. Ces réglages restent sélectionnés par l'enseignant dans le formulaire
de l'exercice : un alias du menu ne définit pas de paramètres par défaut.
Les réglages par section et les catégories futures sont consignés dans
`.claude/skills/classer-ref-ch/references/structure-co.md` et `lacunes.md`.
Les catégories futures ne sont ajoutées au squelette que lorsqu'elles peuvent
recevoir un exercice. La mention « sensibilisation » fait partie du titre du
chapitre concerné dans `levelsThemesListCH.json`.

Pour dédupliquer le classement suisse, rechercher les familles qui partagent
un générateur puis vérifier les cas sélectionnables : l'héritage seul ne
suffit pas. Garder dans chaque feuille le représentant le plus paramétrable
qui couvre les variantes ; reporter leurs classements utiles et conserver
les modes distincts non sélectionnables. Une variante entièrement couverte,
sans autre usage au CO, au Collège ou au Préqualifiant, reçoit exclusivement
`refs['fr-ch'] = ['NR']`. Un tableau vide la renverrait dans « Non classés ».
Les décisions et les réglages correspondants sont consignés dans
[l'audit des doublons du CO](../../../../.claude/skills/classer-ref-ch/references/doublons-co.md).

### Sous-thèmes « automatismes » (5e et 6e)

Certains thèmes de 5e et 6e (par exemple `5N4`, `6N2`) contiennent, en plus de leurs sous-thèmes habituels (`5N4A`, `5N4B`…), des sous-thèmes dédiés aux automatismes dont le code insère l'infixe `auto` juste avant la lettre finale : `5N4autoA`, `6N2autoB`… Le code du thème reste ainsi un préfixe valide du sous-thème (`5N4` préfixe `5N4autoA`), contrairement à l'ancienne convention `auto5N4A` où `auto` précédait le code du niveau.

Dans le menu, `prepareSubset()` (`ReferentielNode.svelte`) repousse explicitement ces sous-thèmes en dernier au sein de leur thème, quel que soit l'ordre alphabétique (un sous-thème dont le code contient `auto` est toujours classé après les autres). Cette convention est indépendante des thèmes `3Auto`, `6Auto` et `BP2Auto`, qui regroupent des automatismes sous un thème de premier niveau à part, avec un `A` majuscule (`3AutoG01`, `6AutoA`, `BP2AutoA`…) et ne sont pas concernés par cette règle de tri.

### Rubriques de CM1 et de CM2 (programme du cycle 3)

Les référentiels `cm1` et `cm2` de `tasks/emptyRef2022.json` suivent le programme
de mathématiques du cycle 3, comme la 6e : **un sous-thème (une lettre) par
objectif d'apprentissage**, dans l'ordre du programme, et un thème par rubrique
du programme. Les domaines reprennent ceux de la 6e :

| Domaine                                        | Thèmes                                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N` Nombres, calcul et résolution de problèmes | `N1` Nombres entiers, `N2` Fractions, `N3` Nombres décimaux, `N4` Calcul mental, `N5` Addition, soustraction, multiplication, division, `N6` Résolution de problèmes, `N7` Algèbre |
| `M` Grandeurs et mesures                       | CM1 : `M1` Longueurs, `M2` Masses, `M3` Contenances, `M4` Aires, `M5` Angles, `M6` Durées. CM2 : `M1` Aires, `M2` Angles, `M3` Durées                                              |
| `G` Espace et géométrie                        | `G1` Vocabulaire et outils, `G2` Parallèles et perpendiculaires, `G3` Figures (polygones), `G4` Symétrie axiale, `G5` Solides, `G6` Déplacements                                   |
| `P` Données, probabilités, proportionnalité    | `P1` Organisation et gestion de données, `P2` Probabilités, `P3` Proportionnalité                                                                                                  |
| `I` Pensée informatique                        | `I1`                                                                                                                                                                               |

La lettre d'un sous-thème est celle de l'objectif dans `levelsThemesList.json`
(par exemple `CM2N4J` : « Ajouter ou soustraire 8, 9, 18, 19, 28, 29, …, 98 ou
99 à un nombre »). Un exercice est nommé `<sous-thème>-<n>` (`CM2N4J-3`) ou
`<sous-thème>` s'il est seul (un sous-thème qui n'a qu'un exercice porte donc
le même code que son exercice). Dans le menu, un tel sous-thème n'est pas
affiché : `flattenSingleExerciseSubthemes()` (`tasks/updateMenuInternational.js`)
place l'exercice directement sous le thème, à la place du sous-thème. Les
sous-thèmes sans exercice ou avec plusieurs exercices restent affichés. Chaque objectif du programme doit exister dans
le référentiel, même sans exercice. Les sous-thèmes qui n'appartiennent pas au
programme (`CM2N5F` à `CM2N5H` : opérations posées de CM1 et « compte est
bon ») sont placés après les objectifs du programme.

Pour la Seconde, `2N` (« Calcul numérique ») contient `2N1` à `2N5`, et
`2L` (« Calcul littéral ») contient `2L1` à `2L3`.
La rubrique `2L1` (« Utiliser le calcul littéral ») distingue `2L10` (bases),
`2L11` (développer et factoriser sans identité remarquable), `2L12` (avec
les identités remarquables), `2L13` (calculs complexes sur des expressions
algébriques) et `2L14` (utiliser le calcul littéral).
La rubrique `2N3` (« Fractions ») est elle-même divisée en `2N30`
(simplifier, décomposer, comparer ou encadrer), `2N31` (quatre opérations),
`2N32` (calculs avec des fractions) et `2N33` (problèmes).
La rubrique `2N4` (« Puissances ») est divisée en `2N40` (définition et
notation), `2N41` (puissances de 10), `2N42` (notation scientifique), `2N43`
(calculs avec les puissances) et `2N44` (comparaison et classement).
La rubrique `2N5` (« Racines carrées ») est divisée en `2N50` (définition,
existence et encadrement) et `2N51` (calculs numériques avec les racines
carrées).

La Course aux nombres de Seconde a son propre découpage, qui ne reprend pas
celui des exercices de Seconde. Ses domaines `can2N`, `can2L`, `can2F`,
`can2G`, `can2I` et `can2P` sont divisés en rubriques `can2N1`, `can2L1`… Les
refs d'une rubrique sans sous-rubrique suivent le format `<rubrique>-<numéro>`
(`can2N2-03`). Une rubrique divisée en sous-rubriques ajoute un chiffre par
sous-rubrique, en partant de 0 (`can2N1` contient `can2N10` et `can2N11`), et
ses refs suivent le format `<sous-rubrique>-<numéro>` (`can2N10-01`,
`can2N11-01`). C'est le cas de `can2N1`, `can2L1`, `can2F1`, `can2F2`, `can2G2`
et `can2G3`. Une question qui appartient à deux sous-rubriques porte une ref
dans chacune (par exemple `can2F12-04` et `can2F20-08`).

La Course aux nombres de Sixième est découpée en rubriques numérotées à partir
de 1 (`can6C` contient `can6C1` à `can6C7`, et `can6C5` est elle-même divisée
en `can6C51` à `can6C53`). Ses refs suivent le format `<rubrique>-<numéro>`
(`can6C1-01`, `can6C51-01`). Les domaines sans rubrique (`can6I`, `can6S`)
portent directement des refs `can6I-01`, `can6S-01`…

La Course aux nombres de Cinquième est découpée en rubriques numérotées à
partir de 1 (`can5C` contient `can5C1` à `can5C6`), et ses refs suivent le
format `<rubrique>-<numéro>` (`can5C1-01`). Les domaines sans rubrique
(`can5A`, `can5D`, `can5G`, `can5L`) portent directement des refs `can5D-01`…

La Course aux nombres de Quatrième est découpée en rubriques numérotées à
partir de 1 (`can4C` contient `can4C1` à `can4C4`), et ses refs suivent le
format `<rubrique>-<numéro>` (`can4C1-01`).

La Course aux nombres de Troisième est découpée en rubriques numérotées à
partir de 1 (`can3C` contient `can3C1` à `can3C4`), et ses refs suivent le
format `<rubrique>-<numéro>` (`can3C1-01`). Les domaines sans rubrique
(`can3M`, `can3P`) portent directement des refs `can3M-01`, `can3P-01`.

La Course aux nombres de Première suit le même principe, mais ses rubriques et
sous-rubriques sont numérotées à partir de 1 : `can1SD` contient `can1SD1`
(« Paraboles »), elle-même divisée en `can1SD11` et `can1SD12`, puis `can1SD2`
et `can1SD3`. Les refs suivent le format `<rubrique ou sous-rubrique>-<numéro>`
(`can1D1-01`, `can1SD11-01`, `can1SD3-01`).

Dans les rubriques du lycée (seconde, première et terminale), `ReferentielNode.svelte` place explicitement en tête les exercices dont la référence contient `-flash`. Cette priorité ne modifie pas l'ordre des référentiels du collège.

## Génération par `tasks/dictionnaireToReferentiel.js`

- `src/json/dictionnaireBAC.ts`, `dictionnaireDNB.ts`, `dictionnaireDNBPRO.ts`, `dictionnaireC3.ts`, `dictionnaireCrpeCoop.ts`, `dictionnaireCrpeDida.ts`, `dictionnaireE3C.ts`, `dictionnaireEAM.ts`, `dictionnaireEVACOM.ts`, `dictionnaireFlashBac.ts`, `dictionnaireSTI2D.ts`, `dictionnaireSTL.ts` : sources maintenues à la main listant chaque annale statique (tags, chemins d'images/LaTeX). Ce sont les entrées du script.
- `src/json/referentielStaticFR.json`, `src/json/referentielStaticCH.json` : référentiel des annales d'examens statiques généré à partir des dictionnaires ci-dessus. Consommé par `refUtils.ts` (fusionné dans `baseReferentiel.static`) et par `referentielsStore.ts` (section « Annales examens »).

### Allègement de `referentielStaticFR.json` : champs déduits de l'uuid

`referentielStaticFR.json` répète chaque exercice une fois par regroupement (par année, par thème, par tag) : un même exercice statique FR (DNB, DNBPRO, BAC, STI2D, STL, E3C, EAM, CRPE — pas EVACOM, qui reste dans `referentielStaticCH.json`) apparaît donc plusieurs fois dans l'arbre. Pour limiter le poids du fichier, les entrées de `referentielStaticFR.json` ne stockent **plus** `annee`, `lieu`, `mois`, `numeroInitial`, `typeExercice` : ces champs sont déductibles de l'`uuid` (par exemple `dnb_2013_04_pondichery_5`) et reconstruits au chargement.

- `src/json/referentielStaticFRSessions.json` : table de correspondance `sessionKey -> {annee, mois?, lieu, jour?, typeExercice, filiere?}`, où `sessionKey` est l'uuid **sans son dernier segment** (le numéro d'exercice). Une « session » correspond à une même épreuve (ex. `dnb_2013_04_pondichery` regroupe les 6 exercices de ce sujet). Contient aussi `numeroOverrides` (uuid complet -> `numeroInitial`, pour les rares numéros qui ne sont pas un décodage mécanique du dernier segment de l'uuid, ex. `bac_2024_06_sujet1_metropole_devoile_1` dont le `numeroInitial` réel est `"devoile"`) et `entryOverrides` (uuid complet -> infos complètes, pour les uuid dont la clé de session ne suffit pas à isoler un lieu unique, ex. `crpe_blanc_2017_algo`/`clermont`/`vraifaux`). La moulinette complète cette table sans écraser les corrections manuelles ; `pnpm makeJson` la vérifie sans la modifier : voir la procédure ci-dessous en cas d'erreur au build.
- `src/json/referentielStaticFRCodec.ts` : module ESM sans dépendance à un bundler exportant `deriveInfosExerciceStatique(uuid)` et `hydrateReferentielTree(tree)`. Importé à la fois par `tasks/dictionnaireToReferentiel.js` (exécuté directement par Node, qui retire les annotations de types à la volée — actif par défaut depuis Node 22.18 ; ce script importe donc les `.ts` avec leur extension explicite) et par le code TS/Svelte : c'est la seule implémentation de la logique de dérivation, partagée entre le build et le runtime.
- `src/json/referentielStaticFRHydrated.ts` : point d'entrée runtime. Importe `referentielStaticFR.json` (allégé) et applique `hydrateReferentielTree` une seule fois au chargement du module pour ré-attacher `annee`/`lieu`/`mois`/`numeroInitial`/`typeExercice` (et `jour`/`filiere` s'ils étaient présents) à chaque feuille de l'arbre. Le résultat a exactement la même forme que l'ancien import direct de `referentielStaticFR.json`.
  - **Tout code qui a besoin des exercices statiques FR avec leurs métadonnées (annee/lieu/mois/…) doit importer `referentielStaticFRHydrated.ts`, jamais `referentielStaticFR.json` directement.** Points d'import actuels : `mathalea.ts`, `exercisesUtils.ts`, `referentielsUtils.ts`, `referentielsStore.ts`, `ExerciceStatic.svelte`. Les autres consommateurs (`refUtils.ts`, `sorting.ts`, `mobileMenu.ts`, `filters.ts`, `Latex.ts`, `ReferentielNode.svelte`, `ReferentielEnding.svelte`, `MobileSearch.svelte`, `SearchInput.svelte`, …) reçoivent l'arbre déjà fusionné par ces 5 fichiers et n'ont rien à connaître de l'hydratation.
  - `referentielStaticCH.json` (EVACOM) n'est pas concerné : il garde tous ses champs et s'importe directement.
- Avant d'écrire `referentielStaticFR.json`, le script vérifie pour **chaque** exercice que `deriveInfosExerciceStatique(uuid)` reproduit exactement les champs saisis à la main dans le dictionnaire source ; en cas d'écart il liste les uuid fautifs et échoue (`process.exit(1)`) au lieu d'écrire un référentiel incohérent.

**Que faire si `pnpm makeJson` / `pnpm build` échoue avec « Session inconnue pour l'uuid statique » ou un écart de champs :**

1. Un nouvel exercice a été ajouté dans un dictionnaire (`dictionnaireDNB.ts`, etc.) avec une nouvelle épreuve (nouveau lieu/année/mois) qui n'a pas encore de ligne dans `referentielStaticFRSessions.json` : relancer `tasks/dicosDnbBacE3c/dicosManage.py` pour ce dictionnaire, ou ajouter la clé `sessionKey` correspondante (uuid sans son dernier segment) avec les bons `annee`/`mois`/`lieu`/`jour`/`typeExercice` et `filiere` si présente. La moulinette complète la table depuis les entrées du dictionnaire et conserve les corrections existantes ; voir la [procédure des annales](../contribution/annales.md#déclarer-les-nouvelles-sessions-et-vérifier-la-génération).
2. Le `numeroInitial` réel ne correspond pas au décodage mécanique du dernier segment de l'uuid (identité pour toutes les familles sauf le CRPE, où `exN`/`ex0N` → `N` et `pb` → `Problème`) : ajouter une entrée dans `numeroOverrides`.
3. Le lieu/mois/jour diffère entre exercices qui partagent pourtant la même `sessionKey` (cas rare, ex. CRPE « blanc ») : ajouter une entrée complète par uuid dans `entryOverrides` plutôt que dans `sessions`.
4. Sinon, c'est probablement une faute de frappe dans le dictionnaire source (champ mal traduit, mauvais numéro) : corriger le dictionnaire.

Relancer `node tasks/dictionnaireToReferentiel.js` après toute modification pour vérifier que le message d'erreur a disparu.

## Ressources partenaires (MathAdata)

- `src/json/dictionnaireMathadata.ts` : source maintenue à la main (même esprit que `dictionnaireBAC.ts` et consorts) listant, par chapitre (clé = titre du chapitre), les exercices statiques partenaires MathAdata. Structure récursive : chaque clé d'un nœud est soit un exercice (`{ title, tags? }`, reconnu à la présence de `title`), soit une sous-section imbriquée (nouveau nœud du même type) — on peut donc grouper les exercices d'un chapitre en sous-sections, elles-mêmes subdivisibles, à volonté (`{ 'Titre chapitre': { 'md-000x': { title }, 'Titre sous-section': { 'md-000y': { title } } } }`).
- `src/lib/components/mathadataReferentiel.ts` : construit à la volée (pas de fichier généré) le référentiel `JSONReferentielObject` correspondant à partir de `dictionnaireMathadata.ts`, en parcourant récursivement chaque nœud (`buildNode()`) pour transformer les exercices en terminaisons et les sous-sections en nœuds imbriqués. Pour chaque exercice : `uuid` (préfixe `md-`), `titre`, `tags` (repris tels quels si fournis, sinon `[]`), et `png`/`pngCor`/`tex`/`texCor`/`url`/`urlcor` pointant vers `static/mathadata/tex/<uuid>(.tex|_cor.tex)` et `static/mathadata/tex/png/<uuid>(.png|_cor.png)`. Exporté en tant que `referentielMathadata`, il alimente la section « Ressources partenaires » du menu (`referentielsStore.ts`, FR uniquement) et est fusionné dans les référentiels statiques consommés par `ExerciceStatic.svelte` et `exercisesUtils.ts` pour que ces exercices s'affichent et s'exportent comme les autres statiques. Le menu (`ReferentielNode.svelte`) étant lui-même récursif, les sous-sections s'affichent comme des nœuds pliables sans aucun changement côté composant.
- Le préfixe d'uuid `md-` est reconnu comme statique par `isStatic()` (`componentsUtils.ts`) et par `mathaleaGetExercicesFromParams()` (`mathalea.ts`, qui utilise `referentielMathadata` au lieu de `referentielStaticFR/CH` pour la résolution de l'uuid).
- `MathadataBanner.svelte` affiche un encart d'information en haut de la liste d'exercices (`Exercices.svelte`) dès qu'un exercice `md-` est présent dans `exercicesParams`.

## Fichiers de contenu du menu (maintenus manuellement)

| Fichier                                    | Rôle                                                                                                                                                                                          | Consommateur principal                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/json/referentielsActivation.json`     | Active/désactive chaque section du menu (`aleatoires`, `examens`, `geometrieDynamique`, `outils`, `ressources`, `statiques`, …).                                                              | `referentielsStore.ts`, `refUtils.ts` / `referentielsUtils.ts` (`isReferentielActivated`) |
| `src/json/referentielProfs.json`           | Référentiel de la section « Outils du professeur ».                                                                                                                                           | `referentielsStore.ts`                                                                    |
| `src/json/referentielRessources.json`      | Référentiel de la section « Vos ressources » (ressources HTML importées par l'utilisateur).                                                                                                   | `referentielsStore.ts`                                                                    |
| `src/json/referentielBibliotheque.json`    | Référentiel de la section « Bibliothèque » (FR uniquement).                                                                                                                                   | `referentielsStore.ts`                                                                    |
| `src/json/referentielAppsTierce.json`      | Liste des applications tierces présentées dans la modale dédiée, hors arborescence d'exercices.                                                                                               | `ModalThirdApps.svelte`, `Start.svelte`                                                   |
| `src/json/uuidsRessources.json`            | Dictionnaire `identifiant -> composant/ressource` pour les outils interactifs spéciaux (`iframe`, `video`, `spline`, `clavier`, `equation`, `version`, …), distinct des exercices classiques. | `HeaderExerciceVueProf.svelte`, `Version.svelte`, `ClavierTest.svelte`                    |
| `src/json/quickLinks.json`                 | Contenu des liens rapides affichés sur la page d'accueil.                                                                                                                                     | `QuickLinks.svelte`                                                                       |
| `src/json/carouselContent.json`            | Contenu du carrousel de la page d'accueil.                                                                                                                                                    | `Carousel.svelte`, `MobileCarouselCards.svelte`                                           |
| `src/json/carouselContentForCapytale.json` | Variante du carrousel pour Capytale.                                                                                                                                                          | Non utilisée actuellement (import commenté dans `Carousel.svelte`).                       |
| `src/json/mobileMenu.json`                 | Rubriques (Collège / Lycée) et niveaux proposés par la vue mobile, avec le référentiel et le chemin visés. Voir [Vue mobile](vue-mobile.md).                                                  | `MobileBrowser.svelte` via `lib/components/mobileMenu.ts`                                 |

## Dictionnaires de libellés

| Fichier                                                            | Rôle                                                                                          | Consommateur                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| `src/json/codeToLevelList.json`, `src/json/codeToLevelListCH.json` | Dictionnaire `code niveau -> titre affiché`.                                                  | `codeToLevelTitle()` dans `refUtils.ts` |
| `src/json/codeToThemeList.json`                                    | Dictionnaire `code thème -> titre affiché` (utilisé en repli si le code n'est pas un niveau). | `codeToLevelTitle()` dans `refUtils.ts` |

## Fichiers non consommés dans `src/` (à supprimer)

Ces fichiers existent dans `src/json/` mais n'ont pas de consommateur identifié dans `src/` au moment de la rédaction de cette page : `exercicesList.json`, `allExercice.json`, `referentiel2nd.json`, `2ndeAvecSousThemes.json`, `2ndeListeIndividuelle.json`, `3eAvecSousThemes.json`, `3eListeIndividuelle.json`, `4eAvecSousThemes.json`, `4eListeIndividuelle.json`, `5eAvecSousThemes.json`, `5eListeIndividuelle.json`, `6emeAvecSousTheme.json`, `6emeListeIndividuelle.json`.
