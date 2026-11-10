# Construire une courbe avec `traceur-de-courbe`

Le custom element `traceur-de-courbe` associe un tableau de couples à un repère. Il trie les colonnes par abscisse, trace la ligne brisée et adapte la fenêtre aux points saisis. Les cellules acceptent les nombres, les décimaux à virgule et les fractions MathLive.

## Utilisation

```ts
import { addTraceurDeCourbe } from '../../../lib/customElements/TraceurDeCourbe'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'

const f = (x: number) => x ** 2 - 2

handleAnswers(
  this,
  i,
  { reponse: { value: f } },
  {
    formatInteractif: 'traceur-de-courbe',
  },
)

texte += addTraceurDeCourbe(this, i, {
  rowLabels: ['x', 'f(x)'],
  columns: 5,
  xMin: -3,
  xMax: 3,
  step: 0.05,
  target: f,
  pgfplotsExpression: 'x^2-2',
})
```

`target` est la fonction numérique utilisée pour le balayage, l’aperçu et la correction. `pgfplotsExpression` est son expression au format PGFPlots. Elle est facultative : sans elle, l’export LaTeX utilise la ligne polygonale calculée par `courbe()` ; avec elle, `courbe()` produit un `\\addplot` compact.

Les intitulés de lignes sont libres, par exemple `['Article', 'Prix (€)']` ou `['Temps (h)', 'Énergie dépensée (kWh)']`.

## Évaluation

La question vaut deux points indépendants :

- tous les couples sont sur la courbe à `epsilon` près ;
- la ligne brisée approche suffisamment la fonction sur tout l’intervalle.

Le second critère approxime l’aire entre la fonction et la ligne brisée avec le pas `step`. Le seuil relatif se règle avec `maxRelativeAreaError` (valeur par défaut : `0.15`). Les points absents aux extrémités de l’intervalle sont pénalisés afin d’encourager une représentation de tout le domaine demandé.

Dans les sorties HTML non interactives, LaTeX et Typst, le tableau est vide et le repère est dimensionné à partir des extrema observés par balayage. Après le contrôle en HTML, la courbe cible est superposée. Pour produire explicitement cette courbe dans une correction imprimée, passer `showExpected: true` ; `courbe()` utilisera alors PGFPlots si `pgfplotsExpression` est renseignée.

Avec `animateCorrection: true`, la correction HTML détaille lentement le calcul des images du tableau dans un panneau placé entre le tableau et le graphique. Elle fait ensuite défiler rapidement les calculs et apparaître 50 points du balayage sous forme de croix pour rappeler que la courbe est constituée d’une infinité de points, puis termine par son tracé continu. `functionLabel` et `calculationExpression` permettent d’afficher le calcul littéral associé à chaque valeur.
