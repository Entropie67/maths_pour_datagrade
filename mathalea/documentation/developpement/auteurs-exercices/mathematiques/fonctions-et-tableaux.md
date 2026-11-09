# Fonctions, splines et tableaux

Ce guide sert a coder un exercice qui etudie une fonction, trace une courbe definie par des noeuds ou affiche un tableau de signes ou de variations. Les helpers principaux sont dans `src/lib/mathFonctions/Spline.ts` et `src/lib/mathFonctions/etudeFonction.ts`.

## Choisir le bon helper

Pour les calculs algébriques sur des polynômes, utiliser `Polynome` dans
`src/lib/mathFonctions/Polynome.ts`. Les méthodes `multiplyExact()` et
`evaluateExact()` conservent les coefficients et les valeurs rationnels ;
`fromRationalCoefficients()` et `toRational()` normalisent les coefficients.
Voir [Polynome et calcul rationnel exact](../../maintenance-moteur/mathematiques/nombres-et-calculs.md#polynome-et-calcul-rationnel-exact)
avant de réécrire ces opérations dans un exercice.

| Besoin                                                                | Helper a utiliser                                                                                      | Quand l'eviter                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Courbe definie par des points de controle                             | `spline()` ou `new Spline()`                                                                           | Si la fonction a une expression simple et une derivee connue.              |
| Lire images, antecedents, extrema ou signes sur une courbe par noeuds | Methodes de `Spline` : `fonction`, `solve()`, `zeros()`, `signes()`, `variations()`, `tableauSignes()` | Si les valeurs exactes doivent venir d'une expression algebrique.          |
| Tableau de signes d'une fonction numerique                            | `tableauSignesFonction()`                                                                              | Si la fonction a des valeurs interdites ou plusieurs facteurs a detailler. |
| Tableau de signes factorise, quotient, valeur interdite               | `tableauSignesFacteurs()`                                                                              | Si un seul tableau global suffit et que les zeros numeriques sont fiables. |
| Tableau de variations d'une fonction avec derivee connue              | `tableauVariationsFonction()`                                                                          | Si vous n'avez pas de derivee fiable.                                      |
| Tableau tres specifique deja code en syntaxe `tkz-tab`                | `tableauDeVariation()`                                                                                 | Pour un premier exercice : privilegier les wrappers precedents.            |

Regle pratique : partez du helper le plus mathematique possible. N'ecrivez la syntaxe `tabInit` / `tabLines` de `tableauDeVariation()` que si les wrappers ne savent pas representer le cas.

## Imports courants

Pour une spline :

```ts
import { repere } from '../../lib/2d/reperes'
import { spline, type NoeudSpline } from '../../lib/mathFonctions/Spline'
import { mathalea2d } from '../../modules/mathalea2d'
```

Pour un tableau :

```ts
import {
  tableauSignesFacteurs,
  tableauSignesFonction,
  tableauVariationsFonction,
} from '../../lib/mathFonctions/etudeFonction'
import FractionEtendue from '../../modules/FractionEtendue'
```

Adaptez les chemins relatifs au dossier de l'exercice. Les exemples en `src/exercices/can/...` remontent souvent avec `../../../`, ceux en `src/exercices/2e/...` avec `../../`.

## Construire une spline

Une spline est un nuage de noeuds. Chaque noeud fixe un point de la courbe et les nombres derives a gauche et a droite.

```ts
const noeuds: NoeudSpline[] = [
  { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -2, y: 3, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
  { x: 1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
  { x: 4, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]

const f = spline(noeuds)
```

Points importants :

- `deriveeDroit` est le nom actuel de la propriete, sans `e` final.
- Il faut au moins deux noeuds.
- Les abscisses doivent etre distinctes. Le constructeur trie les noeuds par abscisse croissante, mais signale un probleme si deux noeuds ont la meme abscisse.
- `isVisible` ne dit pas si le noeud sert au calcul : il sert a afficher ou non le point quand la courbe est tracee avec `ajouteNoeuds: true`.

Une fois la spline creee, utilisez ses proprietes et methodes au lieu de recalculer a la main :

```ts
const domaine = `[${f.x[0]}\\,;\\,${f.x[f.n - 1]}]`
const imageDe2 = f.fonction(2)
const antecedentsDe0 = f.solve(0, 2) ?? []
const signes = f.signes()
const variations = f.variations()
const tableauDeSignes = f.tableauSignes('x', 'f(x)')
```

`solve(y, precision)` retourne les antecedents de `y` sur le domaine de la spline. La precision `2` arrondit les solutions au centieme.

## Tracer une spline

`f.courbe()` retourne un objet 2D traçable. Le repere est ajoute a cote de la courbe dans l'appel a `mathalea2d()`.

```ts
const r = repere({
  xMin: -5,
  xMax: 5,
  yMin: -3,
  yMax: 5,
  grilleSecondaire: true,
})

const graphique = mathalea2d(
  { xmin: -5, xmax: 5, ymin: -3, ymax: 5, pixelsParCm: 25, scale: 0.6 },
  r,
  f.courbe({
    color: 'blue',
    epaisseur: 2,
    ajouteNoeuds: true,
    optionsNoeuds: { color: 'red', taille: 3 },
  }),
)
```

Le meme objet peut etre mis dans `this.question` ou `this.correction` :

```ts
this.question = `On donne la courbe de $f$ definie sur $${domaine}$.<br>${graphique}`
```

Pour un exercice de lecture graphique, gardez la spline sur l'instance si la correction interactive ou plusieurs questions en ont besoin :

```ts
this.spline = f
```

Pour les exercices qui cherchent beaucoup d'antecedents, calculez les valeurs
utiles une seule fois puis reutilisez-les. Les appels a `solve()` sont mis en
cache par instance de `Spline`, mais les boucles du type
`trouveYPourNAntecedents()` / `nombreAntecedentsMaximum()` restent couteuses si
elles sont relancees plusieurs fois avec les memes bornes.

## Faire un tableau de signes simple

Utilisez `tableauSignesFonction()` quand vous avez une fonction JavaScript et un intervalle.

```ts
const fonction = (x: number) => (x - 2) * (x + 1)

const tableau = tableauSignesFonction(fonction, -10, 10, {
  nomVariable: 'x',
  nomFonction: 'f(x)',
  substituts: [
    { antVal: -10, antTex: '-\\infty' },
    { antVal: 10, antTex: '+\\infty' },
  ],
})

this.correction = `On obtient le tableau de signes suivant :<br>${tableau}`
```

Quand un zero exact est une fraction, fournissez-le avec `zeros` et activez `fractionTex` :

```ts
const zero = new FractionEtendue(2, 3)
const fonction = (x: number) => 3 * x - 2

const tableau = tableauSignesFonction(fonction, -5, 5, {
  zeros: [zero],
  fractionTex: true,
})
```

Les `substituts` remplacent uniquement l'affichage. Ils ne changent ni le domaine numerique ni le calcul des signes.
La hauteur de l'en-tête s'adapte automatiquement aux fractions affichées, y compris celles introduites par les `substituts`, en HTML et en LaTeX.

## Faire un tableau de signes factorise

Utilisez `tableauSignesFacteurs()` pour afficher les lignes des facteurs et la ligne finale. C'est le bon choix pour un produit factorise, un quotient ou une valeur interdite.

```ts
const zeroNumerateur = new FractionEtendue(2, 3)
const valeurInterdite = new FractionEtendue(-1, 2)

const tableau = tableauSignesFacteurs(
  [
    {
      nom: '3x-2',
      fonction: (x: number) => 3 * x - 2,
      zero: zeroNumerateur,
    },
    {
      nom: '2x+1',
      fonction: (x: number) => 2 * x + 1,
      zero: { valeur: valeurInterdite, interdit: true },
    },
  ],
  -10,
  10,
  {
    fractionTex: true,
    nomVariable: 'x',
    nomFonction: 'f(x)',
    borneInf: '-\\infty',
    borneSup: '+\\infty',
  },
)
```

Dans un tableau de quotient, marquez le zero du denominateur avec `interdit: true`. La ligne finale affichera une double barre a cette abscisse.
Par defaut, `tableauSignesFacteurs()` affiche aussi les deux bornes de l'intervalle, comme `tableauSignesFonction()`. Les bornes peuvent rester les valeurs de `xMin` et `xMax`, ou etre remplacees par n'importe quel affichage avec `borneInf` et `borneSup` : `-\\infty`, `+\\infty`, `a`, `b`, une fraction deja formatee, etc. Utilisez `afficherBornes: false` pour conserver des bornes vides. La premiere colonne est elargie automatiquement a partir des libelles ; utilisez `lgt` si un tableau particulier demande une largeur imposee.

## Faire un tableau de variations

`tableauVariationsFonction()` a besoin de la fonction et de sa derivee.

```ts
const fonction = (x: number) => x ** 2
const derivee = (x: number) => 2 * x

const tableau = tableauVariationsFonction(fonction, derivee, -3, 4, {
  ligneDerivee: true,
  nomVariable: 'x',
  nomDerivee: 'f^{\\prime}(x)',
  nomFonction: 'f(x)',
  precisionImage: 0,
  substituts: [
    { antVal: -3, antTex: '-3' },
    { antVal: 4, antTex: '4' },
  ],
})
```

Pour un domaine represente numeriquement mais affiche avec des infinis :

```ts
const tableau = tableauVariationsFonction(fonction, derivee, -10, 10, {
  substituts: [
    { antVal: -10, antTex: '-\\infty', imgTex: '+\\infty' },
    { antVal: 10, antTex: '+\\infty', imgTex: '+\\infty' },
  ],
})
```

Comme pour les signes, le calcul se fait sur les bornes numeriques passees a la fonction. Les textes `-\\infty` et `+\\infty` ne sont que le rendu.

## Utiliser `tableauDeVariation()` directement

Gardez cette option pour les tableaux qui ne rentrent pas dans les wrappers. Le format suit les macros `tkz-tab` :

```ts
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'

const tableau = tableauDeVariation({
  tabInit: [
    [
      ['x', 1.5, 10],
      ['f(x)', 3, 20],
    ],
    [-2, 10, 0, 10, 3, 10],
  ],
  tabLines: [['Var', 10, '-/1', 20, '+/4', 20, '-/2', 20]],
  lgt: 3,
  espcl: 3,
  deltacl: 0.8,
})
```

Repere minimal :

- `tabInit[0]` contient les entetes de lignes sous la forme `[texte, hauteur, largeurEstimee]`.
- `tabInit[1]` alterne les valeurs de la premiere ligne et leurs largeurs estimees.
- Une ligne `Line` affiche des signes ou symboles : `+`, `-`, `z`, `t`, `||`, etc.
- Une ligne `Var` affiche les variations avec la syntaxe `-/valeur`, `+/valeur` ou `R/`.

Si le tableau devient difficile a lire, revenez a `tableauSignesFonction()`, `tableauSignesFacteurs()` ou `tableauVariationsFonction()` et adaptez le probleme au lieu de multiplier les codes manuels.

## Rendu HTML et LaTeX

Les helpers retournent une chaine. En HTML, `tableauDeVariation()` passe par `creerTableauHtml()` puis `mathalea2d()` pour produire un rendu SVG. En LaTeX, il produit un `tikzpicture` avec les macros `tkzTab...`.

Consequences pratiques :

- Inserez le tableau comme une chaine : `` `<br>${tableau}` ``.
- Ne l'entourez pas de `$...$` : le helper gere deja le rendu mathematique interne.
- Verifiez les deux contextes si vous changez `lgt`, `espcl`, `deltacl`, `longueurDefaut` ou les textes de substitution.
- Pour les courbes, utilisez les objets `mathalea2d` et non du HTML brut ; les objets gerent aussi le rendu TikZ quand l'export le permet.

Pour colorer les traits et tous les textes d'un tableau (valeurs, signes et
entêtes), passer `couleur` à `tableauDeVariation()` ou à
`tableauSignesFonction()`. Cette option s'applique en HTML et en LaTeX :

```ts
import { orangeMathalea } from '../../lib/colors'

const tableauOrange = tableauSignesFonction(fonction, -10, 10, {
  couleur: orangeMathalea,
})
```

Pour une réponse courte composée uniquement de ce tableau, affecter la chaîne
à `this.reponseCourteExplicite` ; avec `genereTableauxDeSignes()`, elle est
recopiée dans `listeReponsesCourtes` pour chaque question.

## Integration dans un exercice

Dans `nouvelleVersion()`, l'ordre le plus robuste est :

1. Tirer les parametres aleatoires.
2. Construire la fonction, sa derivee ou la spline.
3. Calculer les valeurs utiles : zeros, antecedents, extrema, bornes.
4. Construire les objets de rendu : courbe, tableau, textes.
5. Affecter `this.question`, `this.correction`, puis les reponses interactives si besoin.
6. Appeler `listeQuestionsToContenu(this)` pour les exercices classiques qui accumulent `listeQuestions` et `listeCorrections`.

Exemple compact :

```ts
const fonction = (x: number) => (x - 1) * (x + 2)
const tableau = tableauSignesFonction(fonction, -10, 10, {
  substituts: [
    { antVal: -10, antTex: '-\\infty' },
    { antVal: 10, antTex: '+\\infty' },
  ],
})

texte = 'Dresser le tableau de signes de $f$.'
texteCorr = `Les zeros sont $-2$ et $1$.<br>${tableau}`

this.listeQuestions.push(texte)
this.listeCorrections.push(texteCorr)
```

Pour une spline, tirez le nuage avant les questions, puis utilisez la meme instance partout :

```ts
const f = spline(noeuds)
const antecedents = f.solve(0, 2) ?? []
const tableau = f.tableauSignes('x', 'f(x)')
```

## Tests et verifications

Avant de proposer la modification :

```bash
pnpm prebuild-unit-tests
pnpm check
```

Pour un exercice precis, verifiez aussi manuellement :

- un rendu HTML dans le navigateur ;
- un rendu LaTeX si l'exercice est exportable ;
- au moins un tirage ou la fonction n'a pas de zero ;
- au moins un tirage avec zero au bord du domaine ;
- pour `tableauSignesFacteurs()`, un tirage avec valeur interdite ;
- pour `Spline`, un tirage ou les noeuds ont ete transformes ou melanges.

## Erreurs frequentes

| Symptome                                                  | Cause probable                                                                        | Correction                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Le tableau affiche des decimaux au lieu de fractions      | Les zeros n'ont pas ete fournis comme `FractionEtendue` ou `fractionTex` vaut `false` | Passer `zeros: [new FractionEtendue(num, den)]` ou `zero: new FractionEtendue(num, den)` et `fractionTex: true`.                    |
| Le tableau de quotient met `0` au lieu d'une double barre | Le zero du denominateur n'est pas marque interdit                                     | Utiliser `zero: { valeur: fraction, interdit: true }`.                                                                              |
| Les infinis changent le calcul                            | Confusion entre borne numerique et affichage                                          | Garder des bornes numeriques finies ; avec `tableauSignesFacteurs()`, utiliser `borneInf` et `borneSup` seulement pour l'affichage. |
| La spline renvoie `NaN`                                   | On evalue hors de son domaine                                                         | Verifier `f.x[0] <= x <= f.x[f.n - 1]`.                                                                                             |
| La spline signale un probleme de noeuds                   | Deux noeuds ont la meme abscisse ou il y a moins de deux noeuds                       | Corriger le nuage avant `spline(noeuds)`.                                                                                           |
| La courbe affiche trop ou pas assez de points visibles    | Mauvaise interpretation de `isVisible`                                                | Mettre `ajouteNoeuds: true`, puis regler `isVisible` noeud par noeud.                                                               |
| Le tableau est trop serre                                 | Largeurs par defaut trop petites                                                      | Ajuster `lgt`, `espcl`, `deltacl` ou `longueurDefaut`.                                                                              |
| Le rendu LaTeX casse                                      | Chaine deja entouree de `$...$` au mauvais niveau                                     | Ne pas entourer le tableau complet de dollars ; mettre seulement les expressions internes attendues.                                |

## Depannage rapide

- Commencez par afficher les donnees brutes dans la correction pendant le developpement : bornes, zeros, signes, variations ou `f.x` / `f.y`.
- Si les zeros numeriques sont fragiles, forcez les valeurs exactes avec `zeros` ou `zero`.
- Si une fonction accepte parfois `FractionEtendue`, typez-la explicitement ou convertissez l'entree en `number` avant le calcul.
- Si une spline sert a une question interactive, stockez-la dans une propriete de classe pour ne pas reconstruire une courbe differente entre enonce et correction.
- Si un tableau manuel devient illisible, cherchez un exemple proche avec `rg "tableauSignesFonction|tableauSignesFacteurs|tableauVariationsFonction|tableauDeVariation" src/exercices`.
