# Statistiques

La classe `Stat` (`src/lib/mathFonctions/Stat.ts`) calcule les indicateurs
d'une série et produit ses représentations (boîte à moustaches, diagrammes) en
HTML et en LaTeX.

Modèle : `src/exercices/modèlesExos/ExempleBoiteAMoustache.ts`.

## Créer une série

```ts
import Stat from '../../lib/mathFonctions/Stat'

const stat = new Stat([12, 15, 15, 9, 20])                // valeurs
const stat2 = new Stat([[12, 3], [15, 5], [20, 2]])       // [valeur, effectif]
const couleurs = new Stat(['rouge', 'bleu', 'rouge'])     // série qualitative
```

- Une série contenant au moins une chaîne est qualitative ; le deuxième
  paramètre (`isQualitative`) force ce choix.
- La série est mélangée à la construction (troisième paramètre `shuffled`,
  vrai par défaut) : `stat.serie` n'est pas dans l'ordre fourni.
  `stat.serieTableau` donne les couples `[valeur, effectif]`, triés par valeur
  pour une série quantitative.

Pour obtenir une série numérique de quartiles imposés :

```ts
import { creerSerieDeQuartiles } from '../../modules/outilsStat'

const serie = creerSerieDeQuartiles({ q1: 3, mediane: 5, q3: 8, min: 1, max: 11, n: 30, isInteger: true })
```

## Indicateurs

`moyenne()`, `variance()`, `ecartType()`, `mediane()`, `mode()`, `min()`,
`max()`, `etendue()`, `coefVariation()`, `quartiles()`,
`ecartInterQuartile()`, `serieTriee()`. Les indicateurs numériques lèvent une
erreur sur une série qualitative.

`quartiles()` calcule les médianes des deux moitiés de la série triée (la
médiane étant exclue quand l'effectif est impair). Ce n'est pas la définition
du collège (plus petite valeur telle qu'au moins 25 % des données lui sont
inférieures ou égales) : vérifier que la correction utilise la même
définition que l'énoncé.

`boiteAMoustache()` renvoie les quartiles, l'écart interquartile, les bornes
à 1,5 écart interquartile, les extrémités des moustaches et les valeurs
aberrantes.

## Représentations

```ts
texte += stat.listeSerie({ triee: false, tableau: false })
texte += stat.traceBoiteAMoustache({ size: 25, height: 4, legendeOn: true, valeursOn: true })
texte += stat.diagramme({ barres: true, percentVsEffectifs: false, valuesOn: true })
texte += stat.diagrammeCirc({ semi: false, rayon: 5 })
```

- `listeSerie()` : la série en ligne ou en tableau (`tableau: true`),
  triée ou non, avec `precision` et `separateur`.
- `traceBoiteAMoustache()` : boîte à moustaches (série quantitative
  uniquement).
- `diagramme()` : diagramme en barres (`barres: true`) ou polygone, effectifs
  ou fréquences (`percentVsEffectifs`), cumulés ou non (`cumul`), avec titre et
  légendes d'axes.
- `diagrammeCirc()` : diagramme circulaire ou semi-circulaire.

Pour faire construire un diagramme par l'élève, voir `DiagramBarAssessmentElement`
et `DiagramPieAssessmentElement` dans
[Formats interactifs spécialisés](../complements/formats-interactifs.md).
