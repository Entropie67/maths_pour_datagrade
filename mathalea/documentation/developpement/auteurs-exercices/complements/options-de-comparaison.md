# Choisir les options de comparaison

Cette page aide à choisir comment MathALÉA compare la saisie de l'élève à la
réponse attendue déclarée avec `handleAnswers()`. C'est la réponse attendue, et
la forme sous laquelle on veut l'obtenir, qui déterminent le choix.

Les exemples n'ont pas d'intérêt pédagogique : ils illustrent chaque option.
Les tableaux « saisie → verdict » ont été obtenus en exécutant
`fonctionComparaison()` sur le code actuel ; le message indiqué est le feedback
affiché à l'élève sous le champ.

Pour un nouvel exercice, utiliser en priorité les
[checks composables](checks-composables.md), qui permettent aussi de combiner
plusieurs critères ou d'attribuer un score partiel. Une fonction de comparaison
n'est jamais écrite dans le fichier d'un exercice.

## Principe

Chaque réponse attendue accepte une clé `options`, transmise à
`fonctionComparaison()` (`src/lib/interactif/comparisonFunctions.ts`) :

```ts
handleAnswers(this, i, {
  reponse: { value: '\\frac{3}{4}', options: { fractionIrreductible: true } },
})
```

- `value` peut être un tableau : la saisie est acceptée si elle correspond à
  l'une des valeurs.
- `compare` remplace `fonctionComparaison()` par une autre fonction, par
  exemple un comparateur construit avec les
  [checks composables](checks-composables.md).
- Une seule famille d'options est appliquée : `fonctionComparaison()` teste les
  options dans un ordre fixe et s'arrête à la première reconnue. Combiner
  `fractionEgale` et `unite`, par exemple, n'a pas de sens.
- La saisie arrive au format LaTeX produit par MathLive : virgule décimale
  (`3,5`), unités sous la forme `3,5\operatorname{\mathrm{cm}}`. La réponse
  attendue peut utiliser le point (`3.5`) et une unité collée (`3.5cm`).

### Sans option : attention au type de `value`

Sans option explicite, le comportement dépend du **type** de `value` :

| `value` fournie                                                                           | Option appliquée         | Effet                                                            |
| ----------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| chaîne (`'4'`, `'0.8'`, `'\\frac{3}{4}'`, `'2x+1'`)                                       | aucune                   | toute saisie de même valeur est acceptée (`3+1`, `\frac{8}{2}`…) |
| `number`, `Decimal` ou `Grandeur` dont l'écriture est un nombre (`4`, `new Decimal(0.8)`) | `nombreDecimalSeulement` | seule l'écriture décimale ou entière est acceptée                |
| `FractionEtendue`                                                                         | aucune                   | convertie en `texFraction`, comparaison libre                    |

`handleAnswers()` convertit les objets métier en chaînes, puis ajoute
`nombreDecimalSeulement` si la valeur convertie est un nombre écrit en chiffres
(voir `handleDefaultValeur()` dans `src/lib/interactif/gestionInteractif.ts`).
Une chaîne est laissée telle quelle. Rendez l'intention explicite : passez
`{ nombreDecimalSeulement: true }` si seul le résultat doit être accepté, ou
une chaîne sans option si un calcul égal suffit.

## Tableau de choix

| La réponse attendue est…                        | Option                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| un nombre, sous n'importe quelle forme          | aucune (`value` en chaîne)                                                                                                                            |
| un nombre décimal ou entier, sans calcul        | `nombreDecimalSeulement`                                                                                                                              |
| un calcul, pas son résultat                     | `expressionNumerique`, `additionSeulementEtNonResultat`, etc.                                                                                         |
| une fraction                                    | `fractionEgale`, `fractionIdentique`, `fractionIrreductible`, `fractionSimplifiee`, `fractionReduite`, `fractionDecimale`, `fractionSansRacineCarree` |
| une puissance ou une notation scientifique      | `puissance`, `sansExposantUn`, `seulementCertainesPuissances`, `ecritureScientifique`                                                                 |
| un ensemble `\{…\}` ou une liste `a;b;c`        | `ensembleDeNombres`, `kUplet`, `suiteDeNombres`, `suiteRangeeDeNombres`                                                                               |
| des coordonnées                                 | `coordonnees`                                                                                                                                         |
| une expression factorisée                       | `factorisation`, `exclusifFactorisation`, `nbFacteursIdentiquesFactorisation`, `unSeulFacteurLitteral`, `facteursPremierDegre`                        |
| une expression développée                       | `developpementEgal`                                                                                                                                   |
| une expression littérale                        | `calculFormel`, `expanded`, `sansTimes`                                                                                                               |
| une égalité                                     | `egaliteExpression`                                                                                                                                   |
| une durée ou un horaire                         | `HMS`                                                                                                                                                 |
| un texte                                        | `texteAvecCasse`, `texteSansCasse`                                                                                                                    |
| une grandeur avec unité                         | `unite`, éventuellement `precisionUnite`                                                                                                              |
| un intervalle, ou une valeur dans un intervalle | `intervalle`, `estDansIntervalle`, `estDecimalDansIntervalle`                                                                                         |

Un [tableau synoptique](#tableau-synoptique) récapitule les exemples en fin de
page.

## Nombres

### Toute forme de même valeur

Passez `value` sous forme de chaîne, sans option :

```ts
handleAnswers(this, i, { reponse: { value: '8' } })
handleAnswers(this, i, {
  reponse: { value: new FractionEtendue(3, 4).texFraction },
})
```

| `value`   | Saisies acceptées                                       |
| --------- | ------------------------------------------------------- |
| `'8'`     | `8`, `4\times2`, `5+2+1`, `16/2`, `\frac{16}{2}`        |
| `'4'`     | `4`, `3+1`, `8\times0.5`, `\frac82`, `\sqrt{16}`, `2^2` |
| `\frac34` | `\frac34`, `0.75`, `0,75`, `\frac{6}{8}`, `1-\frac14`   |
| `'0.8'`   | `\frac{8}{10}`, `0,8`                                   |

### Nombre décimal ou entier, sans calcul

Option `nombreDecimalSeulement`. À utiliser quand recopier le calcul de
l'énoncé ne doit pas suffire.

```ts
handleAnswers(this, i, {
  reponse: { value: -6, options: { nombreDecimalSeulement: true } },
})
```

| `value` | Saisie                                          | Verdict | Message                                                               |
| ------- | ----------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `4`     | `4`, `4,0`                                      | ✓       |                                                                       |
| `4`     | `3+1`, `8\times0.5`, `\sqrt{16}`, `\frac{8}{2}` | ✗       | Résultat incorrect car une valeur décimale (ou entière) est attendue. |
| `-6`    | `-3-3`                                          | ✗       | Résultat incorrect car une valeur décimale (ou entière) est attendue. |

### Un calcul et non son résultat

`expressionNumerique` accepte le même calcul, à l'ordre des termes (ou des
facteurs) et aux parenthèses inutiles près. La structure est contrôlée : mêmes
nombres, mêmes opérations appliquées aux mêmes opérandes. Les sommes et les
produits sont aplatis (`(1+3)+2` = `1+2+3`) et une différence est une somme
d'opposés (`8-3-2` = `8-2-3`), mais `8-(3-2)`, `8-(3+2)` et `8-3-2` sont trois
calculs différents :

```ts
handleAnswers(this, i, {
  reponse: { value: '1+3\\times2', options: { expressionNumerique: true } },
})
```

| Saisie                                                   | Verdict | Message                                                                        |
| -------------------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `1+3\times2`, `1+2\times3`, `1+(3\times2)`, `3\times2+1` | ✓       |                                                                                |
| `7`                                                      | ✗       | Ce résultat pourrait être correct mais un calcul est attendu.                  |
| `3+4`, `3\times3-2`                                      | ✗       | Ce résultat pourrait être correct mais ce n'est pas ce calcul qui est attendu. |

Avec `8-(3-2)` attendu, `8-3+2` (même valeur, mêmes nombres) est refusé avec le
même message.

`additionSeulementEtNonResultat`, `soustractionSeulementEtNonResultat`,
`multiplicationSeulementEtNonResultat` et `divisionSeulementEtNonResultat`
acceptent n'importe quelle opération du type demandé dont le résultat est égal
à la valeur attendue :

| `value`       | Option                                 | Acceptées                                      | Refusées (message)                                                                                                     |
| ------------- | -------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `'5+3'`       | `additionSeulementEtNonResultat`       | `1+7`, `3+5`, `2.5+5.5`, `2+5+1`, `2+3\times2` | `8` (un calcul est attendu), `8+0` (la somme par 0 est inutile), `12-4`, `4\times2` (c'est une somme qui est attendue) |
| `'5-3'`       | `soustractionSeulementEtNonResultat`   | `7-5`, `3.1-1.1`, `5-2-1`                      | `2`, `2-0`, `1\times2`                                                                                                 |
| `'6\\times2'` | `multiplicationSeulementEtNonResultat` | `3\times4`, `24\times0.5`                      | `12`, `12\times1`, `10+2`                                                                                              |
| `'6\\div2'`   | `divisionSeulementEtNonResultat`       | `12\div4`, `6\div2`                            | `3`, `3\div1`, `1+2`                                                                                                   |

`value` peut aussi être le résultat seul (`'10'`) : toute opération du bon type
qui donne ce résultat est acceptée.

## Fractions

Toutes ces options attendent une fraction à numérateur et dénominateur entiers,
éventuellement négatifs. Une écriture décimale est refusée avec « Résultat
incorrect car une fraction est attendue. ». Une fraction dont un terme n'est pas
un entier écrit en chiffres est refusée avec un message qui nomme ce terme :
`\frac{36-7-11-9}{18}` donne « Résultat incorrect car le numérateur est un calcul :
il doit être un nombre entier. », `\frac{2}{1+2}` la même phrase pour le
dénominateur, `\frac{2,5}{3}` « Résultat incorrect car le numérateur doit être un
nombre entier. » ; si les deux termes sont fautifs, « Résultat incorrect car
dénominateur et numérateur doivent être entiers. ».

Exemples avec `value: '\\frac{90}{120}'` :

| Option                 | Acceptées                                                               | Refusées                                    | Message de refus                                                          |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| `fractionEgale`        | `\frac{90}{120}`, `\frac{9}{12}`, `\frac34`, `\frac68`, `\frac{60}{80}` | `0.75`, `\frac{9\times10}{120}`             | voir ci-dessus                                                            |
| `fractionIdentique`    | `\frac{90}{120}`                                                        | `\frac{9}{12}`, `\frac34`                   | Résultat incorrect car la fraction n'est pas identique à celle attendue.  |
| `fractionIrreductible` | `\frac34`                                                               | `\frac{90}{120}`, `\frac{9}{12}`, `\frac68` | Résultat incorrect car une fraction irréductible est attendue.            |
| `fractionSimplifiee`   | `\frac{9}{12}`, `\frac34`, `\frac68`, `\frac{90}{120}`                  | `\frac{60}{80}`                             | Cette fraction est bien égale à celle attendue mais n'est pas simplifiée. |
| `fractionReduite`      | `\frac{9}{12}`, `\frac34`, `\frac68`, `\frac{60}{80}`                   | `\frac{90}{120}`                            | Cette fraction est bien égale à celle attendue mais n'est pas réduite.    |

Différence entre `fractionSimplifiee` et `fractionReduite` :

- `fractionSimplifiee` accepte une fraction obtenue en divisant numérateur et
  dénominateur attendus par un même entier : `\frac{60}{80}` est refusée car
  90 n'est pas un multiple de 60. La fraction attendue elle-même est acceptée.
- `fractionReduite` accepte toute fraction égale dont les termes sont plus
  petits, même si elle ne s'obtient pas par une division entière, mais refuse
  la fraction attendue elle-même.
- Si la valeur attendue est entière (`\frac{24}{12}`), l'entier (`2`) et les
  fractions égales (`\frac{12}{6}`, `\frac{10}{5}`, `\frac{24}{12}`) sont
  acceptés par les deux options.

`fractionDecimale` attend une fraction de dénominateur 10, 100, 1000… Avec
`value: '\\frac{40}{100}'` (ou `0.4`) : `\frac{4}{10}`, `\frac{40}{100}`,
`\frac{400}{1000}` sont acceptées ; `\frac{20}{50}` est refusée avec « Résultat
incorrect car une fraction décimale est attendue. ».

`fractionSansRacineCarree` accepte toute écriture égale sans racine carrée au
dénominateur. Avec `value: '-\\dfrac{1}{\\sqrt{2}}'` : `-\frac{\sqrt{2}}{2}`,
`\frac{-\sqrt{2}}{2}` et `-\frac{\sqrt{18}}{6}` sont acceptées ;
`-\frac{1}{\sqrt{2}}` et `\frac{-1}{\sqrt{2}}` sont refusées avec « Incorrect
car la fraction possède une racine carrée au dénominateur. ».

## Puissances et notation scientifique

`puissance` accepte une puissance égale à la valeur attendue :

| `value` | Acceptées                                   | Refusées (message)                                                                                             |
| ------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `'2^4'` | `2^4`, `4^2`, `(-2)^4`, `16^1`, `256^{0.5}` | `16` (Une puissance est attendue.), `1\times2^4` (Avant l'exposant, on n'attend qu'un nombre et rien d'autre.) |
| `'16'`  | `16`, `2^4`                                 |                                                                                                                |

Si `value` n'est pas elle-même une puissance, le nombre seul est accepté :
écrivez la réponse attendue sous forme de puissance pour exiger une puissance.
L'exposant doit être un nombre unique : `2^{3+1}` est refusé.

`sansExposantUn` accepte les mêmes puissances sauf l'exposant 1 : avec
`value: '2^4'`, `16^1` est refusé avec « On attend un exposant différent de

1. ».

`seulementCertainesPuissances` n'accepte que les puissances listées dans
`value` : avec `value: '2^4'`, `4^2` est refusé avec « La puissance est égale
au résultat attendu mais ne correspond pas à l'énoncé. ». Pour accepter
plusieurs écritures, passez un tableau : `value: ['4^2', '2^4']`.

Avec un exposant pair, le signe de la base est indifférent : avec
`value: '6^4'`, `(-6)^4` est accepté (et réciproquement), puisque `(-6)^4` et
`6^4` sont la même puissance. Avec un exposant impair, `(-6)^3` reste refusé.

`ecritureScientifique` n'accepte que la notation scientifique de la valeur
attendue, que `value` soit `'3100'` ou `'3.1\\times10^{3}'` :

| Saisie                                                | Verdict | Message                                                                                                        |
| ----------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `3.1\times10^{3}`, `3,1\times10^3`, `10^{3}\times3.1` | ✓       |                                                                                                                |
| `3100`, `31\times10^{2}`, `0.31\times10^{4}`          | ✗       | La réponse fournie est bien égale à celle attendue mais la réponse fournie n'est pas en notation scientifique. |

Les mantisses longues sont acceptées sans arrondi : `1.2345\times10^3` est
accepté pour `value: '1234.5'`, tout comme `3,340\,739\times10^{10}` pour
`value: '3.340739\times10^{10}'`. Les espaces de regroupement des chiffres
ne changent pas le verdict.
Pour vérifier séparément la valeur et la forme scientifique, utiliser les
[checks composables](checks-composables.md) avec
`compare: seq([isEqual(), isScientificNotation()])`.

## Ensembles, listes et coordonnées

Un ensemble s'écrit entre accolades, une liste sans délimiteur ; dans les deux
cas les nombres sont séparés par des points-virgules et peuvent être de tout
type (entiers, fractions, racines…).

| `value`         | Option                 | Acceptées                             | Refusées (message)                                                                                                                                                                                                               |
| --------------- | ---------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'\\{1;3;2\\}'` | `ensembleDeNombres`    | `\{1;3;2\}`, `\{1;2;3\}`, `\{3;2;1\}` | `\{1;3;2;2\}` (cet ensemble contient des valeurs qui se répètent), `\{1,2,3\}` (les nombres doivent tous être séparés par un point-virgule), `1;2;3` (cet ensemble doit commencer par une accolade ou bien être l'ensemble vide) |
| `'\\{1;3;2\\}'` | `kUplet`               | `\{1;3;2\}` seulement                 | `\{1;2;3\}` (les nombres ne sont pas rangés dans le bon ordre)                                                                                                                                                                   |
| `'1;3;2'`       | `suiteDeNombres`       | `1;2;3`, `1;3;2`, `3;1;2`             | `\{1;2;3\}`, `1:2:3`, `1 2 3`, `1-2-3`                                                                                                                                                                                           |
| `'1;3;2'`       | `suiteRangeeDeNombres` | `1;3;2` seulement                     | `1;2;3`, `3;1;2` (les nombres ne sont pas rangés dans le bon ordre)                                                                                                                                                              |

`kUplet` et `suiteRangeeDeNombres` imposent l'ordre de `value`, qui n'est pas
forcément l'ordre croissant.

Ces quatre options refusent une valeur écrite comme une somme de nombres (`3+1`,
`5-1`) avec « Résultat incorrect car chaque valeur doit être écrite sous la forme
d'un nombre, pas d'un calcul. », sauf si `value` contient cette somme telle
quelle. Les fractions, racines et puissances (`\frac{1}{2}`, `1+\sqrt{2}`) restent
admises.

`coordonnees` compare des coordonnées de dimension quelconque, dans l'ordre.
Les parenthèses sont facultatives et les valeurs peuvent se répéter :

| `value`               | Acceptées                      | Refusées (message)                                                      |
| --------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| `'(3;\\frac{12}{5})'` | `(3;12/5)`, `(3;2,4)`, `3;2,4` | `(3;2)` (Coordonnée 2 incorrecte), `(12/5;3)` (Coordonnée 1 incorrecte) |
| `'(1;2;2;3)'`         | `(1;2;2;3)`, `1;2;2;3`         | `(1;2;3)` (Nombre de coordonnées différent)                             |

Dans un `multi-mathfield` (sous-questions), chaque coordonnée saisie passe en
vert ou en rouge après vérification. Ajouter `noFeedback: true` pour retirer le
message quand cette couleur et le smiley du champ suffisent (voir 3G10-1).

Cette tolérance aux répétitions permet aussi de vérifier une série statistique
ordonnée comme `5;7;7;9;9;9;12`, ce que refusent `ensembleDeNombres` et
`suiteDeNombres`.

## Expressions littérales

### Factorisations

Exemples avec `value: '(3x+1)(2x-6)'` :

| Saisie                         | `factorisation` | `exclusifFactorisation` | `nbFacteursIdentiquesFactorisation` | `unSeulFacteurLitteral` | `facteursPremierDegre` |
| ------------------------------ | --------------- | ----------------------- | ----------------------------------- | ----------------------- | ---------------------- |
| `(3x+1)(2x-6)`, `(2x-6)(3x+1)` | ✓               | ✓                       | ✓                                   | ✓                       | ✓                      |
| `(2x-6)\times(1+3x)`           | ✓               | ✓                       | ✓                                   | ✓                       | ✓                      |
| `2(x-3)(3x+1)`                 | ✓               | ✗ (a)                   | ✗ (a)                               | ✓                       | ✓                      |
| `(2x-7+1)(2x+1+x)`             | ✓               | ✗ (b)                   | ✓                                   | ✓                       | ✓                      |
| `2(3x^2-8x-3)`                 | ✓               | ✗ (b)                   | ✓                                   | ✗ (c)                   | ✗ (g)                  |
| `6x^2-16x-6`                   | ✗ (d)           | ✗ (d)                   | ✗ (e)                               | ✗ (c)                   | ✗ (d)                  |
| `1\times(6x^2-16x-6)`          | ✗ (f)           | ✗ (f)                   | ✗ (e)                               | ✗ (c)                   | ✗ (d)                  |

Messages : (a) « L'expression saisie a trop de facteurs. » ; (b) « 1 facteur
n'est pas sous la forme attendue. » ou « 2 facteurs ne sont pas sous la forme
attendue. » ; (c) « On n'attend pas une factorisation
par un entier. » ; (d) « L'expression saisie n'est pas factorisée bien qu'elle
soit égale à l'expression attendue. » ; (e) « L'expression saisie peut être
davantage factorisée. » ; (f) « Une factorisation par 1 a peu d'intérêt. » ;
(g) « Chaque facteur doit être du premier degré. ».

- `factorisation` : toute expression factorisée égale.
- `exclusifFactorisation` : les mêmes facteurs que `value`, dans n'importe quel
  ordre et à l'écriture de chaque facteur près.
- `nbFacteursIdentiquesFactorisation` : le même nombre de facteurs que `value`.
- `unSeulFacteurLitteral` : refuse une factorisation qui ne met en facteur
  qu'un entier.
- `facteursPremierDegre` : un produit de facteurs du premier degré, en même
  nombre que dans `value` (une puissance compte pour autant de facteurs que son
  exposant) ; les facteurs numériques sont autorisés. Avec `value: '(2x+4)^2'`,
  `(2x+4)(2x+4)` et `4(x+2)^2` sont acceptées, `4(x^2+4x+4)` est refusée (g).
- `exposantsAvecAccolades` : MathLive écrit `x^10` sans accolades ; avec cette
  option, la saisie `2x^10` est lue comme `2x^{10}`. Sans elle, l'exposant ne
  porte que sur le premier chiffre. Option utile seulement pour les exposants
  d'au moins deux chiffres.

### Développements et expressions

| Option              | `value`               | Acceptées                                                                                             | Refusées (message)                                                                   |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `developpementEgal` | `'25x^2-40x+16'`      | `25x^2-40x+16`, `16-40x+25x^2`, `5x\times5x-2\times4\times5x+4\times4`, `4\times4+5x\times5x-20x-20x` | `(5x-4)^2` (Incorrect car cette expression n'est pas développée.)                    |
| `calculFormel`      | `'5\\times c_{n}+20'` | `20+5\times c_{n}`, `13+5\times c_{n}+7`, `c_{n}+20+4c_{n}`                                           | `5c_{n}+21`                                                                          |
| `expanded`          | `'5x^2+7'`            | `5\times x\times x+7`, `7+5\times x\times x`, `x\times5\times x+7`                                    | `5x^2+7`, `5\times x^2+7` (il manque au moins un signe $\times$)                     |
| `sansTimes`         | `'5(x^2+7)'`          | `5(x^2+7)`, `5x^2+35`                                                                                 | `5\times(x^2+7)`, `5\times(x\times x+7)` (il y a au moins un signe $\times$ en trop) |

- `calculFormel` accepte toute expression égale, y compris non réduite. C'est
  aussi un moyen d'accepter un calcul quand `value` est un nombre non passé en
  chaîne.
- `expanded` exige que tous les produits soient écrits avec le signe
  $\times$, à l'ordre des termes et des facteurs près.
- `sansTimes` accepte toute expression égale écrite sans signe $\times$,
  développée ou non.

### Égalités

Sans option, `fonctionComparaison()` utilise la comparaison symbolique du
Compute Engine. Elle peut accepter des équations transformées : pour
`value: '6x=5.7'`, `12x=11.4`, `6x-5.7=0` et `x=0.95` sont acceptées.
Cette comparaison est utilisée par défaut pour les réponses courtes de
`ExerciceQcmACourt`. Elle ne permet donc pas d'exiger que l'élève conserve
la forme de l'équation qui traduit directement la situation.

`egaliteExpression` compare deux égalités, quelles que soient les lettres
utilisées. Avec `value: 'n=6b'` : `n=6b`, `6b=n`, `n=3b+b+2b`, `n=3\times2b`,
`n=\frac{18}{3}b` sont acceptées ; `6b` est refusée avec « Incorrect car une
égalité est attendue. ». Les membres ne sont pas interchangeables avec les
lettres : pour `value: 'y=3x'`, `x=3y` est refusée.

### Primitives

`fonctionComparaison()` n'a pas d'option dédiée aux primitives. Utilisez les
checks `samePrimitiveUpToConstant()`, `integrationConstantPresence()` et
`sameFunctionWithConstantFeedback()` décrits dans
[Checks composables](checks-composables.md#primitives).

## Durées, textes et grandeurs

### Durées et horaires

`HMS` compare une durée écrite dans les mêmes unités que `value` :

```ts
handleAnswers(this, i, {
  reponse: {
    value: new Hms({ hour: 12, minute: 24 }).toString(),
    options: { HMS: true },
  },
})
```

`new Hms({ hour: 12, minute: 24 }).toString()` vaut `'12 h 24 min'`. Avec
cette valeur, `12h24min` et `12 h 24 min` sont acceptées,
`744 min` est refusée. Avec `value: '7min15s'`, `435s` est refusée. Pour
accepter des écritures équivalentes dans d'autres unités, utiliser le check
[`sameDuration`](checks-composables.md#sameduration). Détails dans
[Durées et grandeurs](../mathematiques/durees-et-grandeurs.md).

### Textes

| Option           | `value`   | Acceptées              | Refusées                                                                               |
| ---------------- | --------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `texteAvecCasse` | `'[MN]'`  | `[MN]`                 | `[NM]`, `[mn]`, `MN` (Résultat incorrect car majuscules ou minuscules non respectées.) |
| `texteSansCasse` | `'[MN]'`  | `[MN]`, `[mn]`, `[Mn]` | `[NM]`, `MN`                                                                           |
| `texteSansCasse` | `'élève'` | `Élève`, `ÉLÈVE`       | `eleve`                                                                                |

`texteSansCasse` ignore les majuscules, pas les accents.

### Grandeurs avec unité

`unite` compare deux grandeurs, même exprimées dans des unités différentes :

| `value`   | Options                                 | Saisie                                     | Verdict | Message                                                          |
| --------- | --------------------------------------- | ------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `'568cm'` | `{ unite: true }`                       | `568 cm`, `5680 mm`, `5,68 m`, `0,568 dam` | ✓       |                                                                  |
| `'568cm'` | `{ unite: true }`                       | `568`                                      | ✗       | La réponse pourrait être correcte si l'unité avait été précisée. |
| `'568cm'` | `{ unite: true }`                       | `568 g`                                    | ✗       | L'unité choisie n'est, déjà, pas correcte.                       |
| `'3.12m'` | `{ unite: true, precisionUnite: 0.05 }` | `3,12 m`, `3,1 m`, `3,15 m`, `312 cm`      | ✓       |                                                                  |
| `'3.12m'` | `{ unite: true, precisionUnite: 0.05 }` | `3,2 m`                                    | ✗       | Incorrect car la réponse n'est pas arrondie comme il faut.       |

`precisionUnite` est la tolérance, exprimée dans l'unité de `value`. Sans
`precisionUnite`, la grandeur doit être exacte : `31 cm` est refusé pour
`'32cm'`. Pour
exiger une unité précise, utiliser le check
[`sameWithUnit({ strictSameUnit: true })`](checks-composables.md#samewithunit).

## Intervalles

`intervalle` compare des intervalles, réunions et intersections d'intervalles,
ensembles prédéfinis (`\mathbb{R}`, `\mathbb{N}`…) et l'ensemble vide :

| `value`                     | Acceptées                                        | Refusées (message)                                                        |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `'[-1;2['`                  | `[-1;2[`                                         | `[-1;2]` (Le crochet placé en position 2 est mal orienté.), `]-1;2[`      |
| `']-8;5[\\cup]5;+\\infty['` | `]-8;5[\cup]5;+\infty[`, `]5;+\infty[\cup]-8;5[` | `]-8;+\infty[`                                                            |
| `'\\emptyset'`              | `\emptyset`, `\{\}`, `∅`                         | `vide`                                                                    |
| `'\\mathbb{R}'`             | `\mathbb{R}`                                     | `]-\infty;+\infty[` (La bonne réponse était cet ensemble : $\mathbb{R}$.) |

Pour un singleton, utiliser `ensembleDeNombres`. Pour une inégalité ou un
encadrement (`-3<x\leqslant 5`), utiliser le check
[`sameIntervalCondition`](checks-composables.md#sameintervalcondition).

`estDansIntervalle` accepte tout nombre de l'intervalle donné en `value`. Avec
`value: '[1;2['` : `1`, `1.2`, `\frac76`, `\sqrt{3}` sont acceptés ; `2` et
`-8` sont refusés avec « $2$ est hors de l'intervalle. ». Une saisie infinie ou
indéfinie (`1/0`, `0/0`) est refusée avec « Il faut saisir un nombre. ».

`estDecimalDansIntervalle` est plus stricte : la saisie doit être un nombre écrit
en chiffres (`3,5`, `12`) et non un calcul, une fraction ou une racine. Avec
`value: '[16;20]'` : `18` et `17,5` sont acceptés ; `21` est refusé avec « $21$ est
hors de l'intervalle. » ; `10+8`, `\frac{36}{2}` et `\sqrt{300}` sont refusés avec
« Résultat incorrect car une valeur décimale (ou entière) est attendue. ». À choisir
pour une note, une mesure ou une lecture graphique, quand la valeur lue ou calculée
doit être donnée en chiffres.

## Autres options

Moins courantes, elles sont décrites dans `OptionsComparaisonType`
(`src/lib/types.ts`) et testées dans `tests/unit/fonctionsDeComparaison.test.ts` :

- `fonction`, avec `variable`, `domaine` et `entier` : compare deux fonctions
  par évaluation ;
- `nombreAvecEspace` : impose les espaces entre les classes de chiffres ;
- `sansTrigo` : refuse toute saisie contenant `cos`, `sin` ou `tan` ;
- `nonReponseAcceptee` : accepte un champ vide quand `value` est vide (champ facultatif d'un texte à trous) ;
- `ordered`, `multi`, `feedbackOnLabels` : options du glisser-déposer.

## Tableau synoptique

| `value`                   | Option                                   | Réponses acceptées                                      | Réponses refusées                               |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `'4'`                     | aucune                                   | `4`, `3+1`, `8\times0.5`, `\frac82`, `\sqrt{16}`, `2^2` |                                                 |
| `4`                       | aucune (`nombreDecimalSeulement` ajouté) | `4`                                                     | `3+1`, `8\times0.5`, `\sqrt{16}`, `\frac{8}{2}` |
| `'1+3\\times2'`           | `expressionNumerique`                    | `1+3\times2`, `1+2\times3`, `3\times2+1`                | `7`, `3+4`                                      |
| `'5+3'`                   | `additionSeulementEtNonResultat`         | `1+7`, `2.5+5.5`, `2+5+1`                               | `8`, `8+0`, `4\times2`                          |
| `'\\frac{90}{120}'`       | `fractionEgale`                          | `\frac{9}{12}`, `\frac34`, `\frac{60}{80}`              | `0.75`                                          |
| `'\\frac{90}{120}'`       | `fractionIdentique`                      | `\frac{90}{120}`                                        | `\frac34`, `0.75`                               |
| `'\\frac{90}{120}'`       | `fractionIrreductible`                   | `\frac34`                                               | `\frac{9}{12}`, `0.75`                          |
| `'\\frac{90}{120}'`       | `fractionSimplifiee`                     | `\frac{9}{12}`, `\frac34`, `\frac68`, `\frac{90}{120}`  | `\frac{60}{80}`, `0.75`                         |
| `'\\frac{90}{120}'`       | `fractionReduite`                        | `\frac{9}{12}`, `\frac34`, `\frac68`, `\frac{60}{80}`   | `\frac{90}{120}`, `0.75`                        |
| `'\\frac{40}{100}'`       | `fractionDecimale`                       | `\frac{4}{10}`, `\frac{400}{1000}`                      | `\frac{20}{50}`, `0.4`                          |
| `'-\\frac{1}{\\sqrt{2}}'` | `fractionSansRacineCarree`               | `-\frac{\sqrt{2}}{2}`, `-\frac{\sqrt{18}}{6}`           | `-\frac{1}{\sqrt{2}}`                           |
| `'2^4'`                   | `puissance`                              | `2^4`, `4^2`, `(-2)^4`, `16^1`                          | `16`, `1\times2^4`                              |
| `'2^4'`                   | `sansExposantUn`                         | `2^4`, `4^2`, `256^{0.5}`                               | `16^1`, `16`                                    |
| `'2^4'`                   | `seulementCertainesPuissances`           | `2^4`                                                   | `4^2`, `16`                                     |
| `'3100'`                  | `ecritureScientifique`                   | `3.1\times10^{3}`                                       | `3100`, `31\times10^{2}`                        |
| `'\\{1;3;2\\}'`           | `ensembleDeNombres`                      | `\{1;2;3\}`, `\{3;2;1\}`                                | `\{1;3;2;2\}`, `\{1,2,3\}`, `1;2;3`             |
| `'\\{1;3;2\\}'`           | `kUplet`                                 | `\{1;3;2\}`                                             | `\{1;2;3\}`                                     |
| `'1;3;2'`                 | `suiteDeNombres`                         | `1;2;3`, `3;1;2`                                        | `\{1;2;3\}`, `1 2 3`                            |
| `'1;3;2'`                 | `suiteRangeeDeNombres`                   | `1;3;2`                                                 | `1;2;3`                                         |
| `'(1;2;2;3)'`             | `coordonnees`                            | `(1;2;2;3)`, `1;2;2;3`                                  | `(1;2;3)`                                       |
| `'(3x+1)(2x-6)'`          | `factorisation`                          | `(2x-6)(3x+1)`, `2(x-3)(3x+1)`                          | `6x^2-16x-6`                                    |
| `'(3x+1)(2x-6)'`          | `exclusifFactorisation`                  | `(2x-6)(3x+1)`                                          | `2(x-3)(3x+1)`                                  |
| `'25x^2-40x+16'`          | `developpementEgal`                      | `16-40x+25x^2`, `4\times4+5x\times5x-20x-20x`           | `(5x-4)^2`                                      |
| `'5x^2+7'`                | `expanded`                               | `5\times x\times x+7`                                   | `5x^2+7`                                        |
| `'5(x^2+7)'`              | `sansTimes`                              | `5(x^2+7)`, `5x^2+35`                                   | `5\times(x^2+7)`                                |
| `'n=6b'`                  | `egaliteExpression`                      | `6b=n`, `n=3b+b+2b`                                     | `6b`                                            |
| `'[MN]'`                  | `texteAvecCasse`                         | `[MN]`                                                  | `[mn]`, `[NM]`                                  |
| `'[MN]'`                  | `texteSansCasse`                         | `[MN]`, `[mn]`                                          | `[NM]`                                          |
| `'568cm'`                 | `unite`                                  | `5680 mm`, `5,68 m`                                     | `568`, `568 g`                                  |
| `'[1;2['`                 | `estDansIntervalle`                      | `1`, `1.2`, `\sqrt{3}`                                  | `2`, `-8`                                       |
| `'[16;20]'`               | `estDecimalDansIntervalle`               | `18`, `17,5`                                            | `21`, `10+8`, `\frac{36}{2}`                    |
| `'12 h 24 min'`           | `HMS`                                    | `12h24min`                                              | `744 min`                                       |

## Quand une bonne réponse est refusée

1. Vérifier le type de `value` (voir [Sans option](#sans-option--attention-au-type-de-value))
   et l'option choisie.
2. Reproduire le cas dans un test unitaire appelant
   `fonctionComparaison(saisie, value, options)`. La saisie doit être écrite
   telle que MathLive la produit (virgule décimale,
   `\operatorname{\mathrm{cm}}` pour les unités…). Dans la console du
   navigateur, `document.querySelector('math-field').value` donne ce LaTeX.
3. Dans le navigateur, placer un point d'arrêt dans
   `verifySingleMathLiveField()` (`src/lib/interactif/mathLiveVerifications.ts`)
   avant l'appel de la fonction de comparaison pour lire la saisie et la
   réponse attendue.
4. Les saisies sont nettoyées avant comparaison par les nettoyeurs de
   `src/lib/interactif/cleaners.ts`, combinés avec `generateCleaner()`.

Toute modification de `fonctionComparaison()` doit s'accompagner d'un cas dans
`tests/unit/fonctionsDeComparaison.test.ts`.
