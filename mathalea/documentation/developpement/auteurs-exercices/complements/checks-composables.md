# Checks composables

`fonctionComparaison()` et ses [options](options-de-comparaison.md) rendent un
verdict juste ou faux, avec une seule famille d'options à la fois. Les checks
de `src/lib/interactif/checks/` permettent de combiner plusieurs critères, de
donner un score partiel et de choisir le feedback de chaque critère.

Pour un nouvel exercice, ou quand on retouche l'interactivité d'un exercice,
on utilise en priorité les checks. `fonctionComparaison()` reste la comparaison
utilisée quand on ne précise pas `compare`, et plusieurs checks l'utilisent en
interne.

## Règle : pas de comparaison dans un fichier d'exercice

Un fichier d'exercice ne contient jamais de fonction de comparaison : ni
`compare: (saisie, reponse) => …`, ni fonction locale qui compare la saisie à
la réponse attendue. On combine des checks existants (voir le
[catalogue](#catalogue)). Si aucune combinaison ne convient, on ajoute un check
dans `src/lib/interactif/checks/` (voir [Maintenance](#maintenance)) : il pourra
servir à d'autres exercices et sera testé et documenté.

## Utiliser un comparateur dans un exercice

On ne passe jamais un check seul : on combine une liste de checks avec `all()`
ou `seq()`, ce qui produit un comparateur à donner à la clé `compare` de la
réponse attendue.

```ts
import { all, isEqual, isReduced } from '../../lib/interactif/checks'

handleAnswers(this, i, {
  reponse: {
    value: '2x+3',
    compare: all([isEqual({ weight: 0.6 }), isReduced({ weight: 0.4 })]),
  },
})
```

`value` reste obligatoire : c'est la réponse attendue passée à chaque check, et
elle sert aux exports. Exemples dans le dépôt :
`src/exercices/3e/3L11-11.ts`, `src/exercices/TSpe/TSG2-41.ts`.

Le `score` du comparateur (entre 0 et 1) devient le nombre de points du champ :
un champ unique vaut donc 0,6 point si seul `isEqual` réussit ci-dessus.

## Combinateurs

### `all(checks)`

- Tous les checks sont évalués, même après un échec.
- `isOk` vaut `true` seulement si tous les checks réussissent.
- Avec des poids, le score est la somme des poids des checks réussis ; sans
  poids, il vaut 1 ou 0.

### `seq(checks)`

- Les checks sont évalués dans l'ordre et l'évaluation s'arrête au premier
  échec.
- Utile pour des critères hiérarchiques : inutile de vérifier la forme si la
  valeur est fausse, et seul le message du premier échec est affiché.
- Avec des poids, le score est la somme des poids des checks réussis avant
  l'échec.

### Résultat

```ts
type CompareResult = {
  isOk: boolean
  score: number // entre 0 et 1
  feedback: string // messages retenus, joints par \n
  details: Array<{ name: string; passed: boolean }>
}
```

Le feedback contient le message d'échec (`feedbackKo`) des checks ratés et le
message de réussite (`feedbackOk`) des checks réussis quand la réponse globale
est fausse. Quand elle est juste, seuls les checks avec
`feedbackOnSuccess: true` affichent leur message.

Contrôles faits à la création du comparateur (une erreur est levée sinon) :

- les noms de checks sont uniques dans le comparateur ;
- soit aucun check n'a de poids, soit tous en ont un et leur somme vaut 1.

## Options communes

Tous les checks acceptent ces options (`CheckOverrides` dans
`src/lib/interactif/checks/types.ts`) :

| Option              | Type      | Rôle                                                                                     |
| ------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `name`              | `string`  | Nom dans `details` ; à changer pour utiliser deux fois le même check                     |
| `weight`            | `number`  | Poids dans le score partiel                                                              |
| `feedbackEnabled`   | `boolean` | `false` : le check ne contribue pas au feedback                                          |
| `feedbackOnSuccess` | `boolean` | `true` : le message est affiché même quand la réponse est juste (remarque non bloquante) |
| `feedbackKo`        | `string`  | Remplace le message d'échec par défaut                                                   |
| `feedbackOk`        | `string`  | Message affiché quand ce check réussit mais que la réponse est fausse                    |

## Catalogue

Chaque titre porte le nom exporté par `src/lib/interactif/checks/index.ts`. Les
exemples « saisie → verdict » ont été vérifiés sur le code actuel ; quand la
réponse attendue n'est pas indiquée, le check ne regarde que la saisie.

### Égalité

#### `isEqual`

Égalité mathématique, via `fonctionComparaison()`.

```ts
isEqual()
isEqual({ tolerance: -2 }) // accepte un écart jusqu'à 10^-2
isEqual({ comparisonOptions: { fractionEgale: true } })
```

| Option              | Rôle                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tolerance`         | Exposant : accepte un écart jusqu'à `10^tolerance`. Saisie et réponse doivent être des expressions arithmétiques (pas de `\pi`) ou des monômes simples comme `2.5x`. |
| `comparisonOptions` | [Options](options-de-comparaison.md) transmises à `fonctionComparaison()`                                                                                            |

| Saisie      | Réponse attendue | Option          | Verdict |
| ----------- | ---------------- | --------------- | ------- |
| `\sqrt{36}` | `6`              |                 | ✓       |
| `1,5`       | `1.5`            |                 | ✓       |
| `3.14`      | `3.1416`         | `tolerance: -2` | ✓       |
| `3.1`       | `3.1416`         | `tolerance: -2` | ✗       |

Message de réussite par défaut : « La valeur est correcte. ».

#### `fromOptions`

Délègue entièrement à `fonctionComparaison()` avec les options données, pour
réutiliser n'importe quelle [option de comparaison](options-de-comparaison.md) :

```ts
fromOptions({ fractionIrreductible: true })
fromOptions({ ensembleDeNombres: true }, { name: 'ensemble', weight: 0.5 })
```

Le second argument reçoit les [options communes](#options-communes).

### Même objet

#### `sameWithUnit`

Grandeurs avec unités, conversions autorisées (option `unite` de
`fonctionComparaison()`).

| Option           | Rôle                                    |
| ---------------- | --------------------------------------- |
| `precision`      | Tolérance, transmise à `precisionUnite` |
| `strictSameUnit` | Exige l'unité de la réponse attendue    |

| Saisie                          | Réponse attendue | Option                 | Verdict                                                               |
| ------------------------------- | ---------------- | ---------------------- | --------------------------------------------------------------------- |
| `100\operatorname{\mathrm{cm}}` | `1m`             |                        | ✓                                                                     |
| `1,5\operatorname{\mathrm{kg}}` | `1500g`          |                        | ✓                                                                     |
| `2\operatorname{\mathrm{km}}`   | `1m`             |                        | ✗                                                                     |
| `100\operatorname{\mathrm{cm}}` | `1m`             | `strictSameUnit: true` | ✗ La grandeur est correcte mais l'unité attendue n'est pas respectée. |

#### `sameCoordinates`

Coordonnées, dans l'ordre (option `coordonnees`). `(2;3)`, `(2 ; 3)` et `2;3`
sont acceptés pour `(2;3)` ; `(3;2)` est refusé avec « Coordonnée 1
incorrecte ».

#### `sameInterval`

Intervalles et réunions d'intervalles (option `intervalle`). `[2;3]\cup[4;5]`
est accepté pour lui-même ; `[2;6]` est refusé pour `[2;5]`.

#### `sameDuration`

Durées, comparées avec `Hms` quelle que soit l'écriture.

| Option | Rôle                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| `unit` | `'any'` (défaut), `'hms'`, `'h'`, `'min'` ou `'s'` : unité que la saisie doit contenir |

| Saisie    | Réponse attendue | Option        | Verdict |
| --------- | ---------------- | ------------- | ------- |
| `1h30min` | `90min`          |               | ✓       |
| `5400s`   | `90min`          |               | ✓       |
| `1h30min` | `90min`          | `unit: 'hms'` | ✓       |
| `1.5h`    | `90min`          | `unit: 'hms'` | ✗       |

#### `sameNumberTuple`

Tuple ordonné entre parenthèses. `(2 ; 3 ; 5)` est accepté pour `(2;3;5)` ;
`(3;2;5)` est refusé (ordre), `2;3;5` aussi (« Un tuple doit être écrit entre
parenthèses, par exemple $(1;2;3)$. »).

#### `sameNumberList`

Liste de nombres séparés par des points-virgules, sans tenir compte de l'ordre
(option `suiteDeNombres`). `1;2;3` est accepté pour `3;1;2` ; `1;2` est refusé
avec « Toutes les valeurs sont correctes mais il en manque 1. ». Avec
`allowRepeatedNumbers: true`, les doublons de la saisie sont ignorés.

#### `sameOrderedNumberList`

Même chose en respectant l'ordre (option `suiteRangeeDeNombres`) : `3;2;1` est
refusé pour `1;2;3`.

#### `sameIntegerProgressionSet`

Deux expressions décrivent-elles le même ensemble quand leur variable parcourt
$\mathbb{Z}$ ? Utile pour les solutions d'équations trigonométriques ou les
congruences.

| Option                     | Rôle                                                  |
| -------------------------- | ----------------------------------------------------- |
| `variable`                 | Variable entière ; déduite des expressions si absente |
| `allowMultipleExpressions` | Accepte une liste de plusieurs progressions           |

| Saisie  | Réponse attendue | Verdict                                              |
| ------- | ---------------- | ---------------------------------------------------- |
| `2k\pi` | `2k\pi-2\pi`     | ✓                                                    |
| `4n+1`  | `4n-3`           | ✓                                                    |
| `2x+2`  | `2x`             | ✓                                                    |
| `2x`    | `4x`             | ✗ Les expressions ne décrivent pas le même ensemble. |
| `2x+1`  | `2x+2`           | ✗                                                    |

#### `sameUpToIntegerShift`

Expression littérale en nombres entiers, au choix des lettres près : chaque
lettre libre peut être remplacée par $\pm v+k$ ($k$ entier) et les lettres
libres peuvent être échangées. Toute écriture équivalente est acceptée, réduite
ou non. Utile pour traduire « un nombre pair », « deux entiers consécutifs »,
« le produit d'un nombre pair et d'un nombre impair »… La comparaison est
numérique : une expression égale à une écriture acceptée l'est aussi. Par
défaut, tout décalage entier convient : $k$ est calculé, pas cherché dans une
plage, donc $(n-12)^2$ est accepté pour $n^2$. Ainsi
$n+(n+2)+(n+4)=(n+1)+(n+2)+(n+3)$ convient pour « la somme de trois entiers
consécutifs » ; l'option `shifts` évite ce cas.

| Option          | Rôle                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variables`     | Lettres autorisées dans la saisie ; par défaut celles de la réponse attendue                                                                                                                |
| `fixed`         | Lettres dont l'énoncé fixe le rôle (« le premier noté $n$ ») : ni remplacées, ni échangées                                                                                                  |
| `shifts`        | Décalages $k$ autorisés, bornes comprises (par défaut, tout entier). Avec $[0;2]$ pour $n+(n+1)+(n+2)$, le $n$ de l'élève désigne l'un des trois entiers : $n+(n+2)+(n+4)$ est alors refusé |
| `allowNegation` | Essaie aussi $-v+k$ (`true` par défaut)                                                                                                                                                     |

| Saisie          | Réponse attendue | Options                                | Verdict                                        |
| --------------- | ---------------- | -------------------------------------- | ---------------------------------------------- |
| `(n-1)+n+(n+1)` | `n+(n+1)+(n+2)`  |                                        | ✓                                              |
| `3n+6`          | `n+(n+1)+(n+2)`  |                                        | ✓                                              |
| `4n^2+4m^2`     | `(2n)^2+(2m)^2`  |                                        | ✓                                              |
| `2m(2n+1)`      | `2n(2m+1)`       |                                        | ✓                                              |
| `(n-12)^2`      | `n^2`            |                                        | ✓                                              |
| `(n-12)^8`      | `n^2`            |                                        | ✗                                              |
| `(2n)^2+(2n)^2` | `(2n)^2+(2m)^2`  |                                        | ✗                                              |
| `(n-1)+n+(n+1)` | `n+(n+1)+(n+2)`  | `fixed: ['n']`                         | ✗ Respecter le rôle donné à $n$ dans l'énoncé. |
| `2x+2y`         | `2n+2m`          | `variables: ['n', 'm']`                | ✗ Utiliser uniquement les lettres $n$ et $m$.  |
| `4n`            | `2n+2m`          |                                        | ✗ Utiliser aussi la lettre $m$.                |
| `n+(n+2)+(n+4)` | `n+(n+1)+(n+2)`  | `shifts: [0, 2], allowNegation: false` | ✗                                              |

#### `sameAffineSignTable`

La saisie est-elle une fonction affine qui a le même tableau de signes que la
réponse attendue (même racine, coefficient directeur de même signe) ? Utile
quand plusieurs fonctions affines conviennent, par exemple pour retrouver une
fonction à partir de son tableau de signes. Un préfixe `f(x)=` dans la saisie
est ignoré. `coefficientsAffines(latex)`, exporté par le même fichier, renvoie
les coefficients `[a, b]` d'une expression affine.

| Option     | Rôle                     |
| ---------- | ------------------------ |
| `variable` | Variable, `x` par défaut |

| Saisie    | Réponse attendue | Verdict                                                   |
| --------- | ---------------- | --------------------------------------------------------- |
| `-2(x-3)` | `-x+3`           | ✓                                                         |
| `6-2x`    | `-x+3`           | ✓                                                         |
| `x-3`     | `-x+3`           | ✗ Cette fonction affine ne convient pas.                  |
| `-x^2+9`  | `-x+3`           | ✗ La réponse doit être de la forme $ax+b$ avec $a\neq 0$. |

Exemples : `src/exercices/1e/1A-C14-3.ts`, `src/exercices/1e/1A-C14-5.ts`.

#### `sameParametricLine`

La saisie, un système `\begin{cases}…\end{cases}` affine en une variable, est
une représentation paramétrique de la même droite. La réponse attendue est ce
même type de système ou un JSON
`{"point":[x0,y0,z0],"direction":[a,b,c]}`. Option `dimension` : `3` (défaut)
ou `2`.

Pour `{"point":[1,1,-1],"direction":[-3,0,4]}` :

| Saisie                                           | Verdict                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `\begin{cases}x=1-3t\\y=1\\z=-1+4t\end{cases}`   | ✓                                                                  |
| `\begin{cases}x=1-6s\\y=1\\z=-1+8s\end{cases}`   | ✓ vecteur directeur colinéaire                                     |
| `\begin{cases}x=-2-3u\\y=1\\z=3+4u\end{cases}`   | ✓ autre point de la droite                                         |
| `\begin{cases}x=1-3t\\y=2\\z=-1+4t\end{cases}`   | ✗ La représentation paramétrique ne décrit pas la droite attendue. |
| `\begin{cases}x=1-3t^2\\y=1\\z=-1+4t\end{cases}` | ✗ expression non affine                                            |

Pour une saisie répartie dans plusieurs champs, voir
`sameParametricLineFromFieldsCallback()` dans
`src/lib/interactif/checks/sameParametricLineFromFields.ts`.

#### `sameGeometricName`

Noms d'objets géométriques. La notation de la réponse attendue fixe l'objet :
segment `[AB]`, droite `(AB)`, demi-droite `[AB)`, angle `\widehat{ABC}` ou
triangle `ABC`. Les points doivent être distincts. L'ordre est libre, sauf pour
la demi-droite (origine en premier) et l'angle (sommet au milieu). Les noms de
points peuvent porter des primes ou un indice (`A'`, `A_1`).

| Saisie          | Réponse attendue | Verdict                                                  |
| --------------- | ---------------- | -------------------------------------------------------- |
| `[BA]`          | `[AB]`           | ✓                                                        |
| `(AB)`          | `[AB]`           | ✗ Noter un segment entre crochets.                       |
| `[BA)`          | `[AB)`           | ✗ Les points ne correspondent pas à la réponse attendue. |
| `\widehat{BHX}` | `\widehat{XHB}`  | ✓                                                        |
| `\widehat{HXB}` | `\widehat{XHB}`  | ✗ Placer le sommet de l'angle au milieu.                 |
| `CAB`           | `ABC`            | ✓                                                        |
| `AAB`           | `ABC`            | ✗ Nommer des points distincts.                           |

#### `sameTrigonometricForm`

Forme trigonométrique d'un nombre complexe, de la forme
`r(\cos(\theta)+\mathrm{i}\sin(\theta))`. La saisie doit avoir cette écriture
(parenthèses de MathLive, `i` ou `\mathrm{i}`, `\dfrac` ou `\frac` acceptés),
le même argument dans le cosinus et le sinus, et le module et l'argument de la
réponse attendue. Ils sont comparés avec `fonctionComparaison()` : l'argument
doit être celui de la réponse (pas de valeur à $2\pi$ près).

Les écritures équivalentes du module et de l'argument sont acceptées
(`\sqrt{12}` pour `2\sqrt{3}`). Le module `1` et un terme nul peuvent être
omis : le terme en cosinus quand l'argument vaut $\pm\pi/2$
(`i\sin(\frac{\pi}{2})`), le terme en sinus quand il vaut $0$ ou $\pi$
(`3\cos(\pi)`). Les parenthèses autour de la somme sont facultatives, et la parenthèse
fermante finale peut manquer (MathLive ne la ferme pas tout seul).

| Saisie                                        | Réponse attendue                                | Verdict                                                  |
| --------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| `2(\cos(\frac{\pi}{3})+i\sin(\frac{\pi}{3}))` | `2(\cos(\dfrac{\pi}{3})+i\sin(\dfrac{\pi}{3}))` | ✓                                                        |
| `4(\cos(\frac{\pi}{3})+i\sin(\frac{\pi}{3}))` | idem                                            | ✗ Le module est incorrect.                               |
| `2(\cos(\frac{\pi}{6})+i\sin(\frac{\pi}{6}))` | idem                                            | ✗ L'argument est incorrect.                              |
| `2(\cos(\frac{\pi}{3})+i\sin(\frac{\pi}{6}))` | idem                                            | ✗ Utiliser le même argument dans le cosinus et le sinus. |
| `1+\sqrt{3}i`                                 | idem                                            | ✗ Écrire la forme $r(\cos\theta+i\sin\theta)$.           |

#### `sameExpressionList`

Liste de valeurs séparées par des points-virgules, entourée ou non
d'accolades, sans tenir compte de l'ordre. Chaque valeur est comparée avec
[`isEqual`](#isequal) : contrairement à [`sameNumberList`](#samenumberlist), les
écritures exactes avec `\ln`, `\mathrm{e}` ou des racines sont acceptées.
`\emptyset` désigne une liste vide.

| Saisie                 | Réponse attendue       | Verdict                               |
| ---------------------- | ---------------------- | ------------------------------------- |
| `2\ln(12)-3;\ln(16)-1` | `2\ln(4)-1;2\ln(12)-3` | ✓                                     |
| `1+\sqrt{e}`           | `1+\mathrm{e}^{1/2}`   | ✓                                     |
| `1`                    | `1;3`                  | ✗ Il manque au moins une valeur.      |
| `\ln(5)`               | `\ln(6)`               | ✗ Au moins une valeur est incorrecte. |

#### `sameFunction`

Égalité de deux fonctions de $x$, par échantillonnage numérique sur un
intervalle : toute écriture de la fonction attendue est acceptée (dérivée non
simplifiée, forme factorisée ou développée, `\ln` et `\mathrm{e}` compris).

| Option     | Rôle                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| `variable` | Variable, `x` par défaut                                                                 |
| `domaine`  | Intervalle d'échantillonnage, `[-3, 3]` par défaut, inclus dans le domaine de la réponse |

| Saisie                           | Réponse attendue                | Option              | Verdict                                                  |
| -------------------------------- | ------------------------------- | ------------------- | -------------------------------------------------------- |
| `\frac{2x}{x^2+3}-\frac{1}{x-1}` | `\frac{x^2-2x-3}{(x^2+3)(x-1)}` | `domaine: [1.5, 5]` | ✓                                                        |
| `\frac{1-2\ln(x)}{x^3}`          | `\frac{x-2x\ln x}{x^4}`         | `domaine: [0.2, 5]` | ✓                                                        |
| `\ln(x)+1`                       | `\ln(x)`                        | `domaine: [0.2, 5]` | ✗ Cette fonction n'est pas égale à la fonction attendue. |

Pour une primitive, voir plutôt [`samePrimitiveUpToConstant`](#primitives).

#### `sameRationalFunction`

Comparer exactement deux expressions rationnelles à coefficients rationnels, après simplification. Accepter les écritures développées, factorisées ou décomposées, les fractions imbriquées et les puissances entières. La variable est `x` par défaut, configurable par `variable`.

```ts
compare: all([sameRationalFunction()])
// Exemple : 2 + 3/(x-1) et (2x+1)/(x-1).
```

Le contrôle analyse l'arbre syntaxique puis compare les produits croisés de polynômes en arithmétique entière exacte. Il n'utilise ni échantillonnage numérique ni simplification symbolique générale. Les décimaux finis sont interprétés exactement : une approximation de `1/3` est refusée. Les fonctions transcendantes, les autres variables et les divisions par le polynôme nul sont refusées.

L'égalité est celle des fractions rationnelles après simplification, pas celle des domaines des écritures initiales : `(x^2-1)/(x-1)` et `x+1` sont acceptés comme équivalents. Ce contrôle ne valide pas une liste d'asymptotes ou de points pour un problème à plusieurs solutions.

Pour préserver la réactivité, l'analyse est bornée à 2 000 caractères et 500 nœuds ; les puissances entières vont de -32 à 32 et les polynômes intermédiaires ont un degré au plus 64. Les saisies hors limites sont refusées. Les options de retour usuelles de `CheckOverrides` sont disponibles. Le contrôle et des exemples sont accessibles dans la page de test des checks.

#### `undefinedAt`

Vérifier qu'une expression rationnelle saisie n'est pas définie en chacune des valeurs `values` : son dénominateur, obtenu en réduisant au même dénominateur sans simplifier, s'y annule. `sameRationalFunction` compare les fonctions après simplification ; ce contrôle exige en plus le facteur qui crée un trou dans le graphe. La valeur de l'expression n'est pas vérifiée. La variable est `x` par défaut, configurable par `variable`.

```ts
compare: all([sameRationalFunction(), undefinedAt({ values: [2] })])
// Attendu : (x+1)(x-2)/((x-1)(x-2)) ; (x+1)/(x-1) est refusé.
```

Le message de retour indique les valeurs où l'expression saisie est encore définie. Une saisie non rationnelle est refusée.

#### `sameSet`

Ensembles en extension, sans ordre (option `ensembleDeNombres`). `\{-2;0;5\}`
est accepté pour `\{5;-2;0\}` ; `\{1;2\}` est refusé pour `\{1;2;3\}` (« Toutes
les valeurs sont correctes mais il en manque 1. ») ; `\{1;1;2\}` est refusé
(valeurs répétées).

#### `singleParameterVariable`

Le système paramétrique saisi utilise une seule variable.

| Option                    | Rôle                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `dimension`               | `3` (défaut) ou `2`                                                                   |
| `expectedParameter`       | Nom ou liste de noms attendus                                                         |
| `strictExpectedParameter` | `true` : un autre nom fait échouer le check ; `false` (défaut) : simple avertissement |

Associé à `feedbackOnSuccess: true`, l'avertissement s'affiche même quand la
droite est juste :

```ts
all([
  sameParametricLine(),
  singleParameterVariable({ expectedParameter: 'k', feedbackOnSuccess: true }),
])
```

Avec `t` au lieu de `k`, la réponse est juste et le message « La variable de
paramétrage attendue est $k$ plutôt que $t$. » s'affiche.

### Réduction et forme imposée

#### `isReduced`

Expression réduite : combine `noTrivialFactor`, `noNumericComputation`,
`termsGrouped` et `isDistributed`. Option `allowReducibleFractions` : laisse
passer les fractions numériques réductibles.

Pour n'accepter qu'un résultat, nombre ou fraction même non simplifiée, et pas
un calcul : `all([isEqual(), isReduced({ allowReducibleFractions: true })])`.
Avec la réponse `2`, `2`, `\frac{4}{2}` sont acceptés et `\frac{4\times3}{6}`,
`1+1` refusés ; avec `4\sqrt{3}`, `\sqrt{48}` est accepté et `\sqrt{16\times3}`
refusé (exemples : 1A-G03-1 à 1A-G03-10).

#### `noTrivialFactor`

Refuse `1x`, `x+0` et un signe à sortir d'un produit (`(-x)y`, `x(-y)`,
`-(xy)`, `-(-x)`) ; accepte `x`, `xy`, `-stz`, `-\frac{9}{4}x`.

#### `noNumericComputation`

Refuse un calcul numérique restant : `1+1`, `2\times 3`, `\sqrt{4}` ; accepte
`2x`, `\sqrt{3}`. Le calcul est aussi cherché dans une fraction et sous une
racine : `\frac{4\times3}{6}`, `\frac{2+3}{4}`, `\sqrt{16\times3}` sont refusés.

#### `termsGrouped`

Refuse des termes semblables non regroupés : `x+x`, `2x+3x` ; accepte `2x+3y`.

#### `isDistributed`

Refuse un produit non développé : `2(x+1)`, `(1+x)y` ; accepte `2x+2`.

#### `onlyIrreducibleFractions`

Toutes les fractions de la saisie sont irréductibles. `\dfrac{1}{2}` et `3`
sont acceptés ; `\dfrac{2}{4}` et `x+\dfrac{6}{9}` sont refusés.

#### `fractionReducedFromExpected`

La saisie est une fraction égale à la réponse attendue, obtenue en divisant ses
termes par un entier supérieur à 1. Pour `\frac{90}{120}` : `\frac{9}{12}` et
`\frac{3}{4}` sont acceptés ; `\frac{90}{120}` et `\frac{60}{80}` sont refusés.

#### `noSquareRootInDenominator`

Refuse une racine carrée au dénominateur : `\frac{\sqrt{2}}{2}` est accepté,
`\frac{1}{\sqrt{2}}` refusé.

#### `noDecimal`

Refuse une écriture décimale non entière : `3.14` et `2,75` sont refusés ;
`3`, `3.0`, `\dfrac{1}{2}` et `\sqrt{2}` sont acceptés.

#### `extractedRadicands`

La saisie est égale à la réponse attendue et ses racines carrées sont
simplifiées. Pour `\sqrt{12}` : `2\sqrt{3}` est accepté, `\sqrt{12}` refusé
(« Les facteurs carrés doivent être extraits des racines carrées. »). Pour `2`,
`\sqrt{4}` est refusé.

#### `coordinatesReduced`

Chaque coordonnée est réduite : `(2;3)` et `(\sqrt{3};1)` sont acceptés ;
`(1+1;3)`, `(2x+x;3)` et `(\frac{4}{2};3)` sont refusés. La valeur n'est pas
vérifiée : combiner avec `sameCoordinates`.

#### `intervalBoundsReduced`

Chaque borne est réduite : `[1;3]`, `]-\sqrt{2};\frac{1}{3}[` et `\emptyset`
sont acceptés ; `[1+1;3]` et `[\frac{4}{2};3]` sont refusés. Combiner avec
`sameInterval` pour vérifier la valeur.

### Texte et motif

#### `stringEquals`

Comparaison textuelle, sans interprétation mathématique. Options `trim` et
`ignoreCase` (défaut `false`). Avec `{ ignoreCase: true, trim: true }`,
`Vrai` est accepté pour `vrai`. `stringComparison()` est un alias.
L'option `ignoreLatexText` (défaut `false`) retire les commandes `\text{…}` et
`\mathrm{…}` et ramène les suites d'espaces à un seul espace. Avec
`{ ignoreLatexText: true, trim: true }`, `\text{dizaine}\text{ de }\text{mille}`
est accepté pour `dizaine de mille`. Cela permet de comparer les mots saisis
avec un clavier MathLive aux réponses en texte brut.
L'option `ignoreLatexDelimiters` (défaut `false`) retire les `$`, `{`, `}` et
`\` qui restent après `ignoreLatexText`. Avec
`{ ignoreLatexText: true, ignoreLatexDelimiters: true, trim: true }`, `$A$` et
`{A}` sont acceptés pour `A`.

#### `contains`

La saisie contient un texte ou vérifie une expression régulière :

```ts
contains('\\sin')
contains(/x\^2/i)
contains({ pattern: '\\sin', feedbackKo: 'Écrire la réponse avec sin.' })
```

#### `doesNotContain`

Inverse de `contains`, pour interdire une notation :
`doesNotContain({ pattern: '\\times', feedbackKo: 'Ne pas utiliser le signe ×.' })`.

### Type d'écriture

#### `isFraction`

La saisie est une fraction (`\frac`, `\dfrac`, `\tfrac`, `\cfrac` ou `/`) :
`\dfrac{3}{4}`, `3/4`, `\frac{-1}{2}` sont acceptés ; `0.75` et `3` refusés.

#### `isDecimalFraction`

Fraction de dénominateur 10, 100, 1000… : `\dfrac{3}{10}`, `75/1000` sont
acceptés ; `\dfrac{1}{3}` et `0.75` refusés.

#### `onlyDecimalNumbers`

Uniquement des nombres décimaux ou entiers : `3.14`, `42`, `-0.5` sont
acceptés ; `\dfrac{3}{4}` et `\sqrt{2}` refusés.

#### `isScientificNotation`

Forme `a\times10^n` ou `a\cdot10^n` avec $1\leqslant|a|<10$ :
`3.2 \times 10^4` et `1 \cdot 10^{-3}` sont acceptés ; `0.5 \times 10^5` et
`32000` refusés.

#### `isPowerForm`

La saisie est une puissance. Options `forbidExponentOne` (refuse `x^1`) et
`exactExpectedPower` (exige la même puissance que la réponse attendue). `2^3`
est accepté, `8` refusé.

#### `isPrimeFactorization`

La saisie est un produit de facteurs premiers, avec ou sans puissances :
`2^{3}\times3^{2}\times5` et `2\times2\times3` sont acceptés ; `4\times3`,
`12` et `2+3` refusés. La valeur n'est pas vérifiée : combiner avec `isEqual`.

#### `onlyProduct`

La saisie n'utilise que des multiplications (et des puissances) d'entiers :
`90`, `9\times10` et `2\times3^{2}\times5` sont acceptés ; `80+10`, `100-10`
et `\frac{180}{2}` refusés. La valeur n'est pas vérifiée : combiner avec
`isEqual`. Le champ à plusieurs étapes l'utilise pour les lignes intermédiaires
(option `produitSeulement`).

#### `sameTopLevelOperation`

La saisie a la même opération de plus haut niveau que la réponse attendue
(somme, différence, produit ou quotient), sans son résultat. Avec `3+5`
attendu : `1+7` et `2+5+1` sont acceptés ; `8` (un calcul est attendu), `12-4`
(une somme est attendue) et `3\times5` refusés. Une somme par 0 ou un produit
par 1 est refusé, sauf si la réponse attendue en contient un. Un calcul comme `3\times(a+b)\div c` est lu comme un
produit. La valeur n'est pas vérifiée : combiner avec `isEqual`
(`all([isEqual(), sameTopLevelOperation()])`). Si la réponse attendue n'est pas
une opération, le contrôle ne contraint rien.

#### `sameComparisonSign`

La saisie est le signe attendu, `<` ou `>` (ou `\leq`, `\geq`, `≤`, `≥`, `<=`,
`>=`, avec ou sans `$`). Avec `<` attendu : `<` et `\leq` sont acceptés ; `>`,
`=` et une saisie vide refusés.

#### `noFraction`

La saisie ne contient aucun trait de fraction : `\frac`, `\dfrac`, `\tfrac`,
`\div` ou `/`. `x^2+1` est accepté, `\frac{1}{2}` et `6\div2` refusés. Combiner
avec `isEqual` pour vérifier la valeur.

#### `noRadicalForInteger`

Quand la réponse attendue est un entier, une racine carrée qui vaut cet entier
est refusée : avec `4` attendu, `\sqrt{16}` est refusé avec le message « il faut
écrire $4$ ». Combiner avec `isEqual` avant lui.

#### `hasGroupedNumberSpacing`

La saisie reproduit la réponse attendue avec des espaces entre les classes de
chiffres. Pour `1234567` : `1 234 567` et `1\,234\,567` sont acceptés ;
`1234567` et `1 234567` sont refusés.

#### `noTrigonometry`

Refuse `cos`, `sin`, `tan`, avec ou sans antislash.

### Équations

#### `isEquation`

Exactement un signe `=` : `2x+1=5` est accepté, `2x+1` et `x=2=3` refusés.

#### `isEquivalentEquation`

Équation équivalente à la réponse attendue, testée en plusieurs points :
`2x=6` pour `x=3` et `4x-2=10` pour `2x-1=5` sont acceptés ; `x=4` est refusé
pour `x=3`.

Option `complexes: true` : `i` est l'unité imaginaire et les autres lettres sont
des inconnues complexes (`\overline{z}` est accepté). Deux équations sont
équivalentes lorsque leurs différences « gauche - droite » sont proportionnelles
par un complexe non nul. `(2+3i)z=-1+i` est alors acceptée pour
`z=\frac{1+5i}{13}` ; `z=\frac{2+5i}{13}` est refusée. Sans l'option, `i` est
une lettre comme une autre.

#### `hasZeroMember`

Un membre est nul : `2x-6=0` et `0=x+1` sont acceptés ; `2x=6` refusé.

#### `sameEquationSet`

Liste d'équations séparées par des points-virgules, entourée ou non
d'accolades, sans tenir compte de l'ordre : chaque équation saisie doit être
équivalente à une équation attendue différente (comme
[`isEquivalentEquation`](#isequivalentequation)). `\emptyset`, `\varnothing`
ou `\{\}` désignent l'absence d'équation. Utile pour les asymptotes d'une
courbe.

| Saisie         | Réponse attendue | Verdict                                                                 |
| -------------- | ---------------- | ----------------------------------------------------------------------- |
| `y=0;x=2`      | `x=2;y=0`        | ✓                                                                       |
| `\{2x=4;y=0\}` | `x=2;y=0`        | ✓                                                                       |
| `\varnothing`  | `\emptyset`      | ✓                                                                       |
| `x=2`          | `x=2;y=0`        | ✗ Il manque au moins une équation.                                      |
| `x=2;y=1`      | `x=2;y=0`        | ✗ Au moins une équation est incorrecte.                                 |
| `x=2,y=0`      | `x=2;y=0`        | ✗ Séparer les équations par des points-virgules, par exemple $x=2;y=1$. |

### Inéquations

#### `isEquivalentInequality`

Inéquation équivalente à la réponse attendue, testée en plusieurs points :
`2x<6` et `-x>-3` sont acceptés pour `x<3` ; `x>3` et `x\leqslant 3` sont
refusés.

#### `sameIntervalCondition`

Inégalité ou encadrement qui décrit le même intervalle que la réponse attendue,
dans un sens ou dans l'autre. Option : `variable` (défaut `x`).

| Saisie                     | Réponse attendue  | Verdict                                              |
| -------------------------- | ----------------- | ---------------------------------------------------- |
| `5\geqslant x>-3`          | `-3<x\leqslant 5` | ✓                                                    |
| `3<x`                      | `x>3`             | ✓                                                    |
| `-3\leqslant x\leqslant 5` | `-3<x\leqslant 5` | ✗ Il y a une erreur avec le symbole en $-3$.         |
| `-2<x\leqslant 5`          | `-3<x\leqslant 5` | ✗ Il y a une erreur avec la valeur $-2$.             |
| `x\leqslant 5`             | `-3<x\leqslant 5` | ✗ Il manque une inégalité.                           |
| `-3<x>5`                   | `-3<x\leqslant 5` | ✗ Les deux inégalités ne sont pas dans le même sens. |
| `]-3;5]`                   | `-3<x\leqslant 5` | ✗ Écrire une inégalité ou un encadrement.            |

Exemple dans le dépôt : `src/exercices/2e/2N12-3.ts`.

### Appartenance

#### `valueInInterval`

Nombre de l'intervalle donné comme réponse attendue (option
`estDansIntervalle`) : `2` est accepté pour `[2;5]` ; `7` pour `[2;5]` et
`1.9` pour `]2;5[` sont refusés.

### Primitives

Ces checks comparent des fonctions par
échantillonnage numérique. Options : `variable` (défaut `x`), `constant`
(défaut `c`), `domaine` (défaut `[-3, 3]`, à choisir dans le domaine de
définition).

| Check                              | Vérifie                                                              | Exemple                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `samePrimitiveUpToConstant`        | Même fonction que la réponse attendue à une constante près           | Pour `x^2` : `x^2+c` et `x^2+5` ✓ ; `x^3` ✗                                             |
| `integrationConstantPresence`      | Présence de la constante (ou absence avec `expected: false`)         | `x^2+c` ✓ ; `x^2` ✗ « Il manque la constante d'intégration $+c$. »                      |
| `sameFunctionWithConstantFeedback` | Égalité stricte, avec un message dédié si seule la constante diffère | Pour `x^2+3` : `x^2+5` ✗ « … son terme constant ne vérifie pas la condition demandée. » |

`samePrimitiveUpToConstant({ requireConstantEffect: true })` exige en plus que
la saisie dépende de la constante.

## Exemples

Fraction irréductible, valeur à 70 % et forme à 30 % :

```ts
all([isEqual({ weight: 0.7 }), onlyIrreducibleFractions({ weight: 0.3 })])
```

Pour `\dfrac{1}{2}` : `\dfrac{2}{4}` obtient 0,7, `\dfrac{1}{3}` 0,3 (la
fraction est irréductible mais fausse), `\dfrac{1}{2}` 1.

Expression réduite, valeur à 60 % et réduction à 40 % : pour `2x+3`, la saisie
`x+x+3` obtient 0,6 avec le message « Cette expression n'est pas assez
réduite : les termes semblables doivent être regroupés. ».

```ts
all([isEqual({ weight: 0.6 }), isReduced({ weight: 0.4 })])
```

Forcer une notation après avoir vérifié la valeur :

```ts
seq([
  isEqual(),
  contains({ pattern: '\\sin', feedbackKo: 'Écrire la réponse avec sin.' }),
])
```

Un check sur mesure implémente directement le type `Check` :

```ts
import type { Check } from '../../lib/interactif/checks'

const sansSigneMoins: Check = {
  name: 'sansSigneMoins',
  run: (saisie) => ({
    passed: !saisie.includes('-'),
    feedbackKo: 'Ne pas mettre de signe moins dans la réponse.',
  }),
}

all([isEqual(), sansSigneMoins])
```

`run` reçoit toujours la saisie et la réponse attendue, et peut ignorer la
seconde s'il ne vérifie que la forme.

## Page de test

La vue `check-test` (`src/components/devtools/CheckTest.svelte`) permet
d'essayer les checks sans écrire de code :
`http://localhost:5173/alea/?v=check-test`.

Elle permet de saisir la réponse attendue et une réponse d'élève, d'ajouter et
de paramétrer des checks, de choisir `all` ou `seq`, de voir le résultat de
chaque check, de copier le code TypeScript correspondant et de partager un lien
préconfiguré. Chaque check de la page renvoie vers sa section ci-dessus.

## Maintenance

- Les tests sont à côté du code : `src/lib/interactif/checks/*.test.ts`
  (lancés par `pnpm test:src`).
- Un nouveau check est exporté par `src/lib/interactif/checks/index.ts`,
  ajouté à la page de test (`CheckKind`, `CHECK_GROUPS`) et documenté ici sous
  un titre portant son nom exact, que la page de test utilise comme ancre.

### `fractionSimplification`

Vérifie une simplification détaillée à partir de quatre cases, transmises sous
forme d'un tableau JSON : les deux produits ou diviseurs, puis le numérateur et
le dénominateur du résultat. La réponse attendue est un objet JSON contenant
`numerator`, `denominator`, `mode` (`product` ou `division`) et `maximal`.
Le facteur commun doit être supérieur à 1, et les produits sont acceptés dans
les deux ordres. Pour des cases MathLive, utiliser
`fractionSimplificationFromFieldsCallback` avec `seq([fractionSimplification()])`.
