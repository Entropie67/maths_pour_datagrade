# Chantier : un seul index `autoCorrection` par question

Cette page recense les exercices interactifs qui ne respectent pas la règle
« une question = une entrée de `listeQuestions[i]` = une seule entrée
`autoCorrection[i]` », et indique comment les corriger. Elle fait suite à
l'issue #9893 (cas de 3G20 / 4G30, corrigé dans la MR !9508).

## Pourquoi c'est un problème

Le moteur, les enregistreurs (Capytale, Moodle…) et le barème raisonnent par
question : un numéro de question, un score, un smiley. Un exercice qui crée
`ajouteChampTexteMathLive(this, 2 * i, …)` puis `ajouteChampTexteMathLive(this, 2 * i + 1, …)`
fabrique deux « questions interactives » pour une seule question affichée :

- le nombre d'entrées de `autoCorrection` dépasse `nbQuestions`, donc le score
  maximal n'a plus de lien avec le nombre de questions ;
- les smileys, le bouton « Valider » et les scores partiels s'appliquent à des
  index que l'élève ne voit pas comme des questions ;
- deux questions peuvent se **marcher dessus** quand les compteurs se croisent
  (voir « Collisions d'index » ci-dessous), ou **partager** les mêmes index
  (la dernière question écrase les réponses attendues des précédentes).

## Comment repérer les exercices concernés

```bash
pnpm scan:index                                   # tout le catalogue (~2 min)
CIBLES=3e/3G20.ts,4e/4G30.ts pnpm scan:index      # quelques exercices
ARCHIVES=1 pnpm scan:index                        # avec les exercices archivés (…Old)
```

Le script (`tasks/scan-index-autocorrection.test.ts`, configuration
`tests/e2e/vitest.config.scan-index.js`) génère chaque exercice interactif du
catalogue (hors exercices simples et sélecteurs `-automatismes`) en mode
interactif, avec 4 questions, une graine fixe et les combinaisons de
paramètres `sup`, `sup2`, `sup3` du test de stabilité. Il écrit le rapport dans
`reports/index-autocorrection.json` et affiche les exercices par catégorie :

| Catégorie   | Signification                                                                        |
| ----------- | ------------------------------------------------------------------------------------ |
| `partages`  | plusieurs questions utilisent les mêmes index (les dernières écrasent les premières) |
| `collision` | un même index sert à deux questions différentes                                      |
| `multi`     | plus d'entrées `autoCorrection` que de questions (2 index ou plus pour une question) |
| `orpheline` | une entrée en trop dans certaines combinaisons seulement (question rejetée, § 10)    |

Un exercice dont `autoCorrection` compte exactement une entrée par question
n'est jamais signalé, même quand l'énoncé contient des identifiants `Q<j>`
internes : c'est le cas des [couteaux suisses](couteau-suisse.md) (6N4B,
6N4B-2, 6N4A-5, 5D1A, CM2P1A), de 6N3B (figure apigeom), 6N2J-3
(`meta-custom`), 2S20-7 et des exercices QCM (`ExerciceQcmA`, 1A-*, CAN…) dont
les figures et tableaux portent un identifiant `Q0` fixe sans lien avec
`autoCorrection`.

Un exercice qui a moins d'entrées que de questions sans index partagé
(egaliteFGLycee6 : 14 questions, 13 entrées) n'est pas détecté : à examiner à
la main.

Les chiffres ci-dessous sont ceux du premier recensement (graine et paramètres
par défaut, exercices archivés écartés) ; la liste à jour est celle du script.
Sept exercices n'apparaissent qu'avec certains paramètres, voir § 11.

**Bilan : 110 exercices à reprendre (dont 11 avec collision d'index), plus 17
exercices avec une entrée orpheline (§ 10).**

## Comment corriger

Dans tous les cas, **une question = un seul `ajoute…` / `handleAnswers` à
l'index `i`**, avec un `formatInteractif` `multi-mathfield` ou une
`remplisLesBlancs()`. Les champs sont nommés `field0`, `field1`… dans la
réponse, ou `%{nom}` dans le gabarit. Les tirages ne changent pas : seul le
HTML interactif et `handleAnswers` sont modifiés, la sortie papier, LaTeX et
Typst reste identique.

| Situation actuelle                                                      | Remède                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| plusieurs `ajouteChampTexteMathLive(this, k, …)` pour une même question | `addMultiMathfield(this, i, { dataTemplate, dataOptions })` avec `%{field0}`, `%{field1}`… puis un seul `handleAnswers(this, i, { field0, field1, bareme }, { formatInteractif: 'multi-mathfield' })` ; ou `createQuestion()` avec `subQuestions` quand la question est faite de a), b), c) |
| plusieurs `ajouteChoixDeroulant` / listes déroulantes                   | même `addMultiMathfield`, avec `field0: { choices, ldots: true }` (premier choix neutre, voir [Formats interactifs](formats-interactifs.md))                                                                                                                                                |
| plusieurs QCM radio dans une question                                   | même `addMultiMathfield`, avec `field0: { qcm: [...] }`                                                                                                                                                                                                                                     |
| plusieurs `remplisLesBlancs` dans une question                          | un seul `remplisLesBlancs(this, i, contenu)` avec plusieurs `%{nom}`, la réponse étant `{ champ1: …, champ2: … }`                                                                                                                                                                           |
| champs mêlés à un tableau MathLive                                      | à étudier au cas par cas (voir plus bas)                                                                                                                                                                                                                                                    |

Dans tous les cas :

1. **Barème fixe.** Quand le nombre de champs dépend du tirage, fixer un
   `bareme` (`toutAUnPoint`, `toutPourUnPoint`, `troisPointsProportionnels`…) ;
   la note maximale d'une question ne doit pas changer avec la graine
   (voir [Interactivité simple](../interactivite-simple.md)). Si l'exercice
   fixe `pointsParQuestions`, vérifier qu'il reste cohérent avec le barème.
2. **Un `formatInteractif` `multi-mathfield`** : plus aucun
   `setReponse` / `ajouteChampTexteMathLive(this, autreIndex, …)`.
3. **Ne rien changer aux tirages.** Lancer
   `CHANGED_FILES="<fichier>" pnpm stability:check`, puis un test à la main
   dans le navigateur (saisie dans chaque champ, validation, smileys).
4. **Exercices qui héritent d'une classe commune** (par exemple 3G20 et 4G30
   qui héritent de `_Thales2D`) : corriger la classe commune, tous les
   exercices concernés sont alors réglés d'un coup.

## 1. Collisions d'index (à traiter en priorité)

Les compteurs de champs sont mélangés avec l'index de la question : l'index `1`
est à la fois le deuxième champ de la question 0 et le champ de la question 1,
ou bien toutes les questions utilisent les index `0`, `1`, `2`. Les réponses
attendues d'une question écrasent alors celles d'une autre, et la correction
interactive peut être fausse même pour un élève qui répond juste.

| Exercice         | Champs             | Constat (graine par défaut) |
| ---------------- | ------------------ | --------------------------- |
| `3e/3G10-1.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `4e/4G10-1.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `5e/5G1B-1.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `5e/5G1B-6.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `5e/5G3A-6.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `5e/5G3A-7.ts`   | mathalea-mathfield | 3 entrées pour 4 questions  |
| `5e/5N4autoB.ts` | liste-deroulante   | 7 entrées pour 4 questions  |
| `6e/6M2autoB.ts` | liste-deroulante   | 7 entrées pour 4 questions  |
| `6e/6M2autoD.ts` | liste-deroulante   | 8 entrées pour 2 questions  |
| `6e/6M3A.ts`     | liste-deroulante   | 7 entrées pour 4 questions  |
| `6e/6G0-5.ts`    | liste-deroulante   | 16 entrées pour 4 questions |

Pour 3G10-1, 4G10-1, 5G1B-1, 5G1B-6, 5G3A-6 et 5G3A-7, les quatre questions
utilisent chacune les index `0`, `1` et `2` (l'exercice a trois entrées
`autoCorrection` pour quatre questions). Pour 5N4autoB, 6M2autoB, 6M3A et
6M2autoD, le compteur de champs (par exemple `indiceInteractif` dans 5N4autoB)
se croise avec l'index de la question : question 1 et deuxième champ de la
question 0 écrivent au même index.

## 2. Champs de saisie (`mathalea-mathfield`) : passer en `multi-mathfield`

| Exercice                | Champs             | Constat (graine par défaut) |
| ----------------------- | ------------------ | --------------------------- |
| `2e/2G24-1.ts`          | mathalea-mathfield | 8 entrées pour 4 questions  |
| `3e/3F13-1.ts`          | mathalea-mathfield | 4 entrées pour 1 question   |
| `3e/3G10-2.ts`          | mathalea-mathfield | 12 entrées pour 4 questions |
| `3e/3G12-1.ts`          | mathalea-mathfield | 3 entrées pour 1 question   |
| `3e/3G12.ts`            | mathalea-mathfield | 4 entrées pour 1 question   |
| `3e/3G22.ts`            | mathalea-mathfield | 5 entrées pour 1 question   |
| `3e/3G32-0.ts`          | mathalea-mathfield | 10 entrées pour 4 questions |
| `3e/3G32-2.ts`          | mathalea-mathfield | 16 entrées pour 4 questions |
| `3e/3G32-3.ts`          | mathalea-mathfield | 24 entrées pour 4 questions |
| `3e/3G32-4.ts`          | mathalea-mathfield | 32 entrées pour 4 questions |
| `3e/3L13-7.ts`          | mathalea-mathfield | 20 entrées pour 4 questions |
| `4e/4C10-11.ts`         | mathalea-mathfield | 16 entrées pour 4 questions |
| `4e/4G10.ts`            | mathalea-mathfield | 12 entrées pour 4 questions |
| `4e/4G11-1.ts`          | mathalea-mathfield | 3 entrées pour 1 question   |
| `4e/4L13-3.ts`          | mathalea-mathfield | 16 entrées pour 4 questions |
| `5e/5G11.ts`            | mathalea-mathfield | 12 entrées pour 4 questions |
| `5e/5G2E-3.ts`          | mathalea-mathfield | 8 entrées pour 4 questions  |
| `5e/5G3A-9.ts`          | mathalea-mathfield | 4 entrées pour 1 question   |
| `5e/5G3A.ts`            | mathalea-mathfield | 12 entrées pour 4 questions |
| `5e/5G3autoA.ts`        | mathalea-mathfield | 12 entrées pour 4 questions |
| `5e/5N5autoB.ts`        | mathalea-mathfield | 12 entrées pour 4 questions |
| `5e/5N5autoC.ts`        | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6G7B-10.ts`         | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6G7B-6.ts`          | mathalea-mathfield | 3 entrées pour 1 question   |
| `6e/6G7B-7.ts`          | mathalea-mathfield | 3 entrées pour 1 question   |
| `6e/6G7B.ts`            | mathalea-mathfield | 12 entrées pour 4 questions |
| `6e/6M2C-4.ts`          | mathalea-mathfield | 8 entrées pour 4 questions  |
| `6e/6M2autoC-1.ts`      | mathalea-mathfield | 8 entrées pour 4 questions  |
| `6e/6M2autoC.ts`        | mathalea-mathfield | 8 entrées pour 4 questions  |
| `6e/6N1L.ts`            | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6N2E-5.ts`          | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6N2G-1.ts`          | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6N2G.ts`            | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6N2I-1.ts`          | mathalea-mathfield | 8 entrées pour 4 questions  |
| `6e/6N2I-2.ts`          | mathalea-mathfield | 8 entrées pour 4 questions  |
| `6e/6N3M.ts`            | mathalea-mathfield | 12 entrées pour 4 questions |
| `6e/6N4A-2.ts`          | mathalea-mathfield | 16 entrées pour 4 questions |
| `6e/6N5-1.ts`           | mathalea-mathfield | 32 entrées pour 4 questions |
| `6e/6N5-2.ts`           | mathalea-mathfield | 32 entrées pour 4 questions |
| `6e/6P14-NoCapytale.ts` | mathalea-mathfield | 6 entrées pour 4 questions  |
| `6e/6P3C.ts`            | mathalea-mathfield | 8 entrées pour 4 questions  |
| `CM2/CM2P3B-2.ts`       | mathalea-mathfield | 12 entrées pour 4 questions |
| `CM2/CM2N1D-2.ts`       | mathalea-mathfield | 9 entrées pour 4 questions  |
| `CM2/CM2N6C-1.ts`       | mathalea-mathfield | 24 entrées pour 4 questions |
| `CM2/CM2N6C-2.ts`       | mathalea-mathfield | 24 entrées pour 4 questions |
| `CM2/CM2N6C-4.ts`       | mathalea-mathfield | 16 entrées pour 4 questions |
| `CM2/CM2N6C-5.ts`       | mathalea-mathfield | 12 entrées pour 4 questions |
| `CM2/CM2N6C-6.ts`       | mathalea-mathfield | 8 entrées pour 4 questions  |
| `TEx/TEG1-21.ts`        | mathalea-mathfield | 8 entrées pour 4 questions  |
| `TEx/TEM1-14.ts`        | mathalea-mathfield | 6 entrées pour 4 questions  |
| `TEx/TEM1-15.ts`        | mathalea-mathfield | 12 entrées pour 4 questions |
| `TEx/TEM1-22.ts`        | mathalea-mathfield | 8 entrées pour 4 questions  |
| `TEx/TEM1-23.ts`        | mathalea-mathfield | 12 entrées pour 4 questions |
| `TEx/TEM1-24.ts`        | mathalea-mathfield | 20 entrées pour 4 questions |
| `TEx/TEM1-25.ts`        | mathalea-mathfield | 16 entrées pour 4 questions |
| `TEx/TEM1-32.ts`        | mathalea-mathfield | 16 entrées pour 4 questions |
| `TSpe/TSG2-26.ts`       | mathalea-mathfield | 16 entrées pour 4 questions |

Ce sont les cas les plus simples. Plusieurs de ces exercices sont des
questions à sous-questions a), b), c) (par exemple les familles 3G32-_, 5G3A-_,
CM2N6C-_, 6N5-_, TEM1-*) : utiliser alors `createQuestion()` avec
`subQuestions`, qui numérote a), b), c) et place chaque champ dans son item.

## 3. Listes déroulantes

| Exercice          | Champs           | Constat (graine par défaut) |
| ----------------- | ---------------- | --------------------------- |
| `2e/2F22-6.ts`    | liste-deroulante | 12 entrées pour 4 questions |
| `3e/3G24-1.ts`    | liste-deroulante | 24 entrées pour 4 questions |
| `4e/4G12-1.ts`    | liste-deroulante | 12 entrées pour 4 questions |
| `5e/5G24-1.ts`    | liste-deroulante | 12 entrées pour 4 questions |
| `5e/5G3A-12.ts`   | liste-deroulante | 12 entrées pour 4 questions |
| `5e/5I1F.ts`      | liste-deroulante | 16 entrées pour 4 questions |
| `6e/6G6A-8.ts`    | liste-deroulante | 16 entrées pour 4 questions |
| `6e/6I1B-2.ts`    | liste-deroulante | 16 entrées pour 4 questions |
| `6e/6M2B.ts`      | liste-deroulante | 12 entrées pour 4 questions |
| `6e/6N2C.ts`      | liste-deroulante | 6 entrées pour 3 questions  |
| `CM2/CM2I1A.ts` | liste-deroulante | 16 entrées pour 4 questions |
| `TSpe/TSA3-43.ts` | liste-deroulante | 3 entrées pour 1 question   |

`addMultiMathfield` avec des champs `choices` (libellés en texte, sans LaTeX).

## 4. QCM radio

| Exercice          | Champs       | Constat (graine par défaut) |
| ----------------- | ------------ | --------------------------- |
| `2e/2G21-2.ts`    | mathalea-qcm | 4 entrées pour 1 question   |
| `3e/3I10-1.ts`    | mathalea-qcm | 16 entrées pour 4 questions |
| `5e/5G3A-13.ts`   | mathalea-qcm | 12 entrées pour 4 questions |
| `6e/6G4A-1.ts`    | mathalea-qcm | 16 entrées pour 4 questions |
| `6e/6G4A.ts`      | mathalea-qcm | 8 entrées pour 4 questions  |
| `6e/6M2autoA.ts`  | mathalea-qcm | 8 entrées pour 4 questions  |
| `CM2/CM2G5B-2.ts` | mathalea-qcm | 12 entrées pour 4 questions |

`addMultiMathfield` avec des champs `qcm`.

## 5. Textes à trous (`remplisLesBlancs`)

| Exercice       | Champs            | Constat (graine par défaut) |
| -------------- | ----------------- | --------------------------- |
| `2e/2G12-6.ts` | fill-in-the-blank | 12 entrées pour 4 questions |
| `3e/3G30-1.ts` | fill-in-the-blank | 12 entrées pour 4 questions |
| `3e/3L16.ts`   | fillInTheBlank    | 12 entrées pour 4 questions |
| `4e/4P12-2.ts` | fillInTheBlank    | 8 entrées pour 4 questions  |

Fusionner les `remplisLesBlancs` successifs en un seul contenu avec plusieurs `%{nom}`.

## 6. Mélanges de types de champs

| Exercice       | Champs                                | Constat (graine par défaut) |
| -------------- | ------------------------------------- | --------------------------- |
| `1e/1G21-6.ts` | fill-in-the-blank, mathalea-mathfield | 32 entrées pour 4 questions |
| `2e/2N33-1.ts` | fill-in-the-blank, mathalea-qcm       | 8 entrées pour 4 questions  |
| `4e/4C25-0.ts` | fill-in-the-blank, mathalea-qcm       | 8 entrées pour 4 questions  |
| `5e/5N1I-5.ts` | mathalea-mathfield, mathalea-qcm      | 8 entrées pour 4 questions  |
| `5e/5N3C.ts`   | fill-in-the-blank, mathalea-qcm       | 8 entrées pour 4 questions  |
| `6e/6N4B-1.ts` | mathalea-mathfield, mathalea-qcm      | 8 entrées pour 4 questions  |

Un `multi-mathfield` accepte dans une même question des champs MathLive, des
listes déroulantes (`choices`) et des QCM (`qcm`) : tout regrouper dans un
seul `addMultiMathfield`.

## 7. Tableaux MathLive mêlés à des champs

| Exercice        | Champs                               | Constat (graine par défaut) |
| --------------- | ------------------------------------ | --------------------------- |
| `3e/3L11-10.ts` | mathalea-mathfield, tableau-mathlive | 12 entrées pour 4 questions |
| `3e/3L11-17.ts` | mathalea-mathfield, tableau-mathlive | 8 entrées pour 4 questions  |
| `3e/3S20-2.ts`  | mathalea-mathfield, tableau-mathlive | 16 entrées pour 4 questions |
| `5e/5N5A-3.ts`  | mathalea-mathfield, tableau-mathlive | 8 entrées pour 4 questions  |
| `6e/6N0A-12.ts` | mathalea-mathfield, tableau-mathlive | 8 entrées pour 4 questions  |

Le tableau MathLive est lui-même un custom element avec ses propres cellules,
non prévu pour être imbriqué dans un `multi-mathfield`. Deux pistes à évaluer :
séparer le tableau et les champs en deux questions distinctes (une question =
un format), ou faire porter le tableau par un [couteau suisse](couteau-suisse.md),
qui rassemble plusieurs éléments sous un seul index.

## 8. Cas particuliers

| Exercice                       | Champs                           | Constat (graine par défaut)  |
| ------------------------------ | -------------------------------- | ---------------------------- |
| `2e/2P10-4.ts`                 | mathlive, multi-mathfield        | 6 entrées pour 4 questions   |
| `4e/4S11-3.ts`                 | mathalea-qcm, multi-mathfield    | 8 entrées pour 4 questions   |
| `egaliteFG/egaliteFGLycee3.ts` | mathalea-mathfield, mathalea-qcm | 39 entrées pour 10 questions |
| `egaliteFG/egaliteFGLycee6.ts` | mathalea-mathfield               | 13 entrées pour 14 questions |

- **2P10-4** : chaque question n'a qu'un champ, mais l'index est décalé par
  `i += numQuestionInteractif` selon le type de question. Les index utilisés
  (0, 1, 4…) ne correspondent plus au numéro de la question. Supprimer le
  décalage et utiliser `i` partout.
- **4S11-3** mélange un QCM (index `2 * i + 1`, ancien format
  `autoCorrection[…].propositions`) et un `multi-mathfield` (index `2 * i`) :
  regrouper dans un seul `multi-mathfield` avec un champ `qcm`.
- **egaliteFGLycee3** compte trente champs dans la première question.
  **egaliteFGLycee6** a 14 questions mais seulement 13 entrées
  `autoCorrection` : à examiner à la main (consignes sans champ, ou index
  décalé).
- **4F12** (et les exercices du § 10) : voir « Entrée orpheline ».

## 9. Exercices archivés présents dans le catalogue

`5M11-2bOld`, `6I1BOld` et `6N4BOld` suivent le même motif. Plutôt que de les
corriger, vérifier s'ils sont encore référencés et, sinon, les retirer du
catalogue.

## 10. Entrée `autoCorrection` orpheline (anomalie mineure)

Dans les exercices suivants, une entrée `autoCorrection[nbQuestionsGenerees]`
subsiste quand l'exercice n'arrive pas à produire autant de questions que
demandé (toutes les questions possibles ont été tirées). La dernière tentative
rejetée par le test d'unicité a déjà appelé `handleAnswers`. Aucune
conséquence visible, mais l'exercice a plus d'entrées que de questions :

`4e/4C10-10`, `4e/4C10-3`, `4e/4F11`, `4e/4F12`, `4e/4G20-9`, `5e/5N2G`, `5e/5N2I-1`, `5e/5N5F`, `6e/6N0A-1`, `6e/6N3F`, `CM1/CM1N1E`, `CM2/CM2N4A-2`, `CM2/CM2N4A-3`, `CP/CPCA11-0`, `CP/CPCA11-1`, `CP/CPCA11`, `enigmes-jeux/EN-gratte-ciel`

Remède : appeler `handleAnswers` (et `ajouteChampTexteMathLive`) après le test
`questionJamaisPosee()` / `listeQuestions.indexOf(texte) === -1`, ou
réinitialiser l'entrée quand la question est rejetée.

## 11. Anomalies visibles seulement avec certains paramètres

Le script les détecte, la graine et les paramètres par défaut ne les
montrent pas. À traiter comme les autres (un seul index par question) :

| Exercice                                                 | Paramètres concernés |
| -------------------------------------------------------- | -------------------- |
| `2e/2F32-2.ts`                                           | `s=3`                |
| `3e/3G32-1.ts`, `3e/3G32-5.ts`, `3e/3G32-dereference.ts` | `s2=1`               |
| `4e/4G40-3.ts`                                           | `s=2`, `s=3`         |
| `bp2/bp2autoP1.ts`                                       | `s=3`                |
| `CM2/CM2P3B-1.ts`                                        | `s=1`                |

## Vérifier après correction

Pour contrôler un exercice, vérifier que :

- `this.autoCorrection.length === this.listeQuestions.length` ;
- `CIBLES=<chemin> pnpm scan:index` ne signale plus l'exercice ;
- chaque champ de la question `i` porte un identifiant `…Q<i>` (aucun `…Q<j>`
  avec `j ≠ i`) ;
- le total de points est le même pour toutes les graines.
