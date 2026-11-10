---
name: qcm-vers-saisie-libre
description: Convertir un exercice MathALÉA publié en QCM (souvent un automatisme 1A-*, 2A-*, une question d'annales ou une composition MetaExerciceCan) en saisie libre par défaut, en gardant le QCM en option. Utiliser quand l'utilisateur demande de "passer en réponse courte", "enlever le QCM par défaut", "saisie libre", ou cite ExerciceQcmACourt / versionQcmDisponible.
---

# Passer un QCM publié en saisie libre

Le changement de défaut modifie ce que voient les anciens liens : on archive
**avant** toute modification. Références :
`documentation/developpement/auteurs-exercices/interactivite-simple.md`
(section « Conserver un QCM en option »),
`complements/coder-un-qcm.md` (section « Variante `ExerciceSimple` ») et,
pour les probabilités, `mathematiques/probabilites.md`.

## 1. Archiver

```sh
pnpm archive <REF>
```

Le fichier de travail reçoit un `uuid` neuf ; l'archive `-old.ts` garde
l'ancien et sort des menus. Si l'archive doit rester dans le référentiel
suisse, rétablir à la main ses `'fr-ch'` d'origine (le script met `['NR']`).

## 2. Choisir la voie selon la classe actuelle

- **`ExerciceQcmA`** : étendre `ExerciceQcmACourt`, supprimer `amcType`. La
  saisie libre devient le défaut (case « Version QCM », `sup3`, décochée). Régler
  au besoin `reponseCourte`, `enonceCourt`, `correctionCourte`,
  `compareReponseCourte`, `clavierReponseCourte`,
  `texteAvantReponseCourte` / `texteApresReponseCourte`.
- **`ExerciceSimple`** : `versionQcmDisponible = true`, `versionQcm = false`
  (`true` si `context.isAmc`), `this.reponse` + `this.distracteurs` pour le
  QCM. Modèle : `src/exercices/1e/1A-C10-8.ts`.
- **Composition `MetaExerciceCan`** : `super(questions, { versionQcm: true })`,
  questions en `ExerciceQcmACourt` avec `this.sup3 = true`. Archiver aussi la
  composition.

## 3. Points de vigilance

- **Aucun tirage aléatoire de plus** : la construction de la saisie libre
  (réponse, correction) réutilise les valeurs déjà tirées, sinon le QCM
  en option dérive.
- Mise en évidence : en saisie libre, `miseEnEvidence()` ne contient que ce
  que le champ attend. Unité hors du champ : `mettreUniteHorsMiseEnEvidence()` ;
  libellé « $S=$ » : `mettreEnEvidenceSansLibelle()`
  (`src/exercices/ExerciceQcmACourt.ts`).
- La consigne demande une valeur (« Quelle est la valeur de… ? »,
  « Déterminer… »), jamais une notation que la comparaison ne sait pas lire.
- Comparaison par défaut sauf si la forme compte (`fractionEgale`,
  `nombreDecimalSeulement`, `estDansIntervalle` avec `'[min;max]'` pour
  plusieurs réponses justes, `intervalle`, `ensembleDeNombres`).
- Clavier adapté : `clavierDeBaseAvecFraction` pour une fraction (sinon `/`
  donne `\div`), `clavierNumbers` pour des positifs, `clavierDeBase` pour des
  relatifs ; grandeurs avec unité : `src/lib/interactif/saisieGrandeur.ts`.
- `this.consigne` est commune à l'exercice : rien de propre à une question
  dedans.
- `formatInteractif = 'fillInTheBlank'` désactive la branche QCM : repasser en
  `'mathlive'` quand `versionQcm` est vrai.
- Distracteurs : en prévoir 4 ou 5 candidats quand des collisions sont
  possibles (petites valeurs), pour en garder 3 distincts de la réponse.

## 4. Enregistrer et vérifier

```sh
pnpm makeJson
STABILITY_UUIDS="<nouvel uuid>" pnpm stability:update
CHANGED_FILES="<chemin de l'archive -old.ts>" pnpm stability:check
pnpm check:changed
```

Tester dans le navigateur : saisie libre (réponse juste, fausse, vide,
écritures équivalentes), puis `&qcm=1` ou la case « Version QCM », et
l'aperçu LaTeX/AMC. Ne pas committer sans l'accord de l'utilisateur ; message
`feat(<REF>): saisie libre par défaut`.
