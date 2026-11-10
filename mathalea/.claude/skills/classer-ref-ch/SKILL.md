---
name: classer-ref-ch
description: Classer les exercices MathALÉA dans le référentiel suisse (menu `lang=fr-CH`) : Cycle d'orientation genevois (9R1 à 11LS), Collège (1re à 4e) et Préqualifiant (N1 à N3). À utiliser pour réorganiser ce menu, classer les nouveaux exercices, reporter le classement d'une archive `-old` sur la version courante, ou vérifier qu'aucun exercice classé n'a été perdu.
---

# Classer le référentiel suisse

Le classement se fait avec l'enseignant qui pilote la passe : l'agent propose,
l'enseignant tranche. Aucun alias n'est ajouté, retiré ou déplacé sans sa
validation, lot par lot.

## Comment le menu est construit

- Chaque exercice porte ses alias suisses dans son propre fichier :
  `export const refs = { 'fr-fr': [...], 'fr-ch': ['9ES1A-12', '11ES1A-5'] }`.
  Un même exercice peut avoir plusieurs alias (plusieurs sections ou années).
- `tasks/emptyRefCH.json` donne l'arborescence (niveaux, thèmes,
  sous-thèmes) et `src/json/levelsThemesListCH.json` le titre de chaque code.
- `node tasks/updateMenuInternational.js` (lancé par `pnpm makeJson` et
  `pnpm dev`) range chaque alias sous le code dont il est le **préfixe** :
  une feuille `9ES1A` reçoit tout alias qui commence par `9ES1A`. Un code ne
  doit donc jamais être le préfixe d'une autre feuille.
- L'arborescence peut avoir autant de niveaux que nécessaire (le composant
  `ReferentielNode.svelte` est récursif). Pour le CO, l'ordre d'insertion dans
  `emptyRefCH.json` fixe l'ordre pédagogique des catégories, commun aux vues
  bureau, mobile et Typst. `sortSwissCycleEntries()` trie seulement les
  références des exercices par numéro. Un code de feuille peut donc rester
  inchangé lorsqu'il est déplacé sous un nouveau groupe.
- Comme dans le référentiel FR, un code reconnu comme sous-thème
  (`themeCodeisSubthemeCode` dans `ReferentielNode.svelte`, motif
  `regexpCO` pour le Cycle d'orientation : `9R2NO4C`, `10LSFA1B`, et
  `regexpPRQ` pour le Préqualifiant : `PRQNO06B`) s'affiche sans son code.
  `regexpQcmCO` reconnaît aussi `9R2QCMNO` et `11LSQCMFA2D`. Les catégories
  et feuilles du CO restent repliées par défaut pour garder la navigation
  compacte. Un nouveau format de code doit être ajouté à cette détection.
- États d'un exercice pour `'fr-ch'` :
  - au moins un alias : classé ;
  - `['NR']` : non pertinent ou variante redondante déjà couverte, absent du menu suisse ;
  - `[]` ou `['']` : rangé dans « Non classés > divers » ;
  - pas de clé `'fr-ch'` : absent du menu suisse, à classer.

## Archives `-old`

`pnpm archive` recopie la version publiée dans `<exercice>-old.ts` avec
`'fr-ch': ['NR']`, et le fichier courant garde ses alias avec un nouvel uuid.
Les archives plus anciennes, faites à la main, ont parfois gardé les alias
alors que la version courante est vide. Règle : **les alias vont sur la
version courante, l'archive reçoit `['NR']`**. Une archive sans version
courante garde ses alias jusqu'à décision.

## Doublons et variantes d'un même générateur

Règle validée pour la passe de déduplication du CO du 03/11/2026 :

- Rechercher les familles par leurs imports et leur héritage, puis vérifier
  les formulaires, les cas générés et les éventuelles méthodes redéfinies.
  Le partage d'un générateur est un indice, pas une preuve de doublon.
- Dans une même feuille, garder la version la plus paramétrable qui couvre
  les savoir-faire des variantes. Le nombre d'options cochées par défaut ne
  mesure pas cette couverture. Une difficulté supplémentaire doit pouvoir
  être désactivée lorsque la feuille l'exige.
- Conserver les variantes qui imposent une tâche ou un mode utile que les
  paramètres du représentant ne permettent pas de sélectionner. Vérifier
  aussi leurs usages au Collège, au Préqualifiant et dans les autres
  rubriques avant de conclure qu'elles sont redondantes.
- Reporter sur le représentant les classements utiles d'une variante
  entièrement couverte. S'il est déjà dans la même feuille, garder sa
  référence existante ; sinon reprendre celle de la variante pour conserver
  la catégorie et son emplacement. Documenter les réglages nécessaires.
- Une variante entièrement couverte et sans autre usage suisse reçoit
  exclusivement `'fr-ch': ['NR']`, jamais `[]`, pour ne pas encombrer « Non
  classés ». Ne jamais mélanger `NR` et des références actives. Les références
  françaises, les uuid et le code de génération ne changent pas.
- Les variantes encore utiles ailleurs gardent leurs classements pertinents.
  `NR` s'applique à l'ensemble du référentiel suisse, pas à une seule feuille.

La liste des regroupements vérifiés et des modes conservés est dans
[`references/doublons-co.md`](references/doublons-co.md). Un nouveau cas non
couvert peut justifier de réexaminer un ancien `NR`.

## Outil

```sh
node .claude/skills/classer-ref-ch/scripts/inventaire.mjs              # résumé par état
node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --a-classer  # [--depuis AAAA-MM-JJ]
node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --archives
node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --prefixe 9ES1
node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --json inventaire.json
```

Sortie tabulée : uuid, chemin, état, alias, titre. Écrire les fichiers de
travail hors du dépôt.

## Sources du programme

- Plan d'études romand (PER), cycle 3, MSN 31 à 34 : progressions par année
  et attentes fondamentales, avec les marques `Niv. 1 | 2 | 3`.
- Préqualifiant : plan d'études cadre de mathématiques (2026-2029) et son
  annexe d'exercices types ; Niv. 1 AFP, Niv. 2 CFC à exigences moyennes,
  Niv. 3 CFC à exigences élevées. Pas d'exercice de lycée dans ces feuilles.
- Prescriptions cantonales genevoises, Mathématiques 9e-11e (année en cours) :
  le tableau annexe donne les notions par année et par section.
- Indications pédagogiques complémentaires aux prescriptions cantonales,
  Mathématiques 9e-11e (groupe de mathématiques du CO, éd. 2023) : répartition
  des apprentissages du PER par année et par niveau (N1, N2, N3), faite sur la
  base des MER, avec un « résumé des apprentissages » par notion. C'est la
  source la plus précise : en cas d'écart avec le PER, elle tranche (par
  exemple : multiplication et division des relatifs en 10e N2 N3, alors que le
  PER laisse lire « Niv. 2 | 3 » sur tout le cycle).
- Correspondance des niveaux : Niv. 1 = R1 (9e) et CT (10e, 11e) ;
  Niv. 2 = R2 et LC ; Niv. 3 = R3 (ou TC) et LS.

La structure cible et les décisions prises sont dans
[`references/structure-co.md`](references/structure-co.md). Toute nouvelle
décision de classement y est consignée.

Les notions sans exercice (ou avec trop peu d'exercices, ou des réglages par
défaut trop élevés) sont listées dans
[`references/lacunes.md`](references/lacunes.md) : y ajouter chaque lacune
constatée, et retirer un point dès que l'exercice existe et est classé.

## Passe périodique

1. Mettre `origin/main` à jour, puis lancer le résumé de l'inventaire.
2. `--archives` : reporter les alias des archives sur la version courante.
3. `--a-classer --depuis <date de la dernière passe>` : proposer, pour chaque
   nouvel exercice, une ou plusieurs feuilles, ou `['NR']`. Grouper la
   proposition par feuille, avec titre et chemin.
4. Après validation : écrire le plan (`[{ "uuid", "ajouter", "retirer" }]`),
   le passer à `scripts/alias.mjs` (d'abord sans `--appliquer`), puis
   `node tasks/updateMenuInternational.js` et contrôler le menu dans le
   navigateur (`?lang=fr-CH`). Avec Playwright, désactiver la visite guidée
   avant le chargement, sinon elle intercepte les clics :
   `context.addInitScript(() => localStorage.setItem('mathalea-onboarding-tour-vue', '1'))`.
5. Vérifier la couverture : aucun exercice classé avant la passe ne doit
   perdre tous ses alias, sauf décision explicite.
6. Relire `references/lacunes.md` : classer les exercices qui comblent une
   lacune, et retirer les points réglés.
7. Noter la date de la passe dans `references/structure-co.md`.

## Règles de classement

- Les titres des notions et des feuilles reprennent les intitulés officiels
  (annexe des prescriptions cantonales, résumés des indications pédagogiques :
  « Addition dans ℤ », « 4 opérations dans ℤ », « Propriétés des
  puissances »…). Un intitulé maison seulement quand aucun ne correspond,
  pour une subdivision.
- Pas d'exercice de course aux nombres (`src/exercices/can/`) dans les
  feuilles du Cycle d'orientation : leur préférer un exercice équivalent.
  Exception : si aucun autre exercice n'existe et que la CAN correspond
  exactement au programme, elle entre dans la feuille, et la feuille est
  notée dans `references/lacunes.md` (exercices à écrire pour remplacer les
  CAN).
- Une feuille regroupe un savoir-faire précis. Si une feuille dépasse une
  quinzaine d'exercices, proposer de la découper en sous-thèmes.
- Un exercice va dans chaque section où sa notion est au programme, au
  niveau du PER de cette section. Un exercice trop difficile par défaut pour
  une section n'y va pas, ou y va avec un réglage explicite à proposer.
- Ne pas modifier l'énoncé ni le code d'un exercice dans une passe de
  classement : seulement le tableau `'fr-ch'`.
- Les uuid ne changent jamais : renommer un alias ne casse pas les liens,
  mais change l'identifiant affiché aux enseignants.
