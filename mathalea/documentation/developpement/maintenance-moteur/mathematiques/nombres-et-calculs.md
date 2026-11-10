# Nombres et calculs

## Adaptation MathJSON pour les corrections détaillées

Dans `src/lib/calculerCe.ts`, `toMathJsonNode()` vérifie les expressions
`MathJsonExpression` du ComputeEngine avant leur utilisation par
`renderMathJsonLatex()` et `buildCorrDetails()`. Il copie récursivement les
tableaux, y compris `readonly`, sans changer l'ordre des opérandes ni supprimer
les `Delimiter`. Les objets `fn` et `sym` sont ramenés à leur forme compacte ;
les annotations MathJSON ne font pas partie de l'arbre de calcul.

Les nombres JSON `{ num: string }` restent exacts : leur chaîne n'est pas
convertie en `number`, afin de conserver les grands entiers, les exposants et les
décimaux périodiques. Leur rendu LaTeX est confié au ComputeEngine avec les mêmes
options de rendu brut que les autres opérateurs délégués.

Les objets `str` et `dict`, les nombres non finis et les formes mal construites
ou ambiguës déclenchent une erreur `MathJSON unsupported` indiquant le chemin
dans l'arbre. Ne pas contourner cette frontière par une assertion de type.

## `FractionEtendue`

`FractionEtendue` est l'export par défaut de `src/modules/FractionEtendue.ts`. Elle représente une fraction avec numérateur et dénominateur entiers et expose de nombreuses formes textuelles ou LaTeX : fraction brute, simplifiée, irréductible, signe normalisé, valeur numérique.

Usages typiques :

- stocker une valeur exacte plutôt qu'un flottant ;
- afficher une fraction avec une propriété LaTeX adaptée ;
- comparer ou transformer des fractions avant de les transmettre à `handleAnswers()`.

Pour les réponses interactives, `handleAnswers()` sait normaliser une `FractionEtendue`. Dans les nouveaux exercices, préférer une réponse explicite en LaTeX ou une `FractionEtendue` accompagnée des options de comparaison adaptées.

Pour rédiger une simplification de produit sans décomposition en facteurs premiers,
`texSimplificationParFacteursCommuns(facteursNumerateur, facteursDenominateur)`
affiche les produits de départ, dégage des diviseurs communs strictement inférieurs
à 12 ou des multiples de 10, les barre, puis donne la fraction irréductible. Les tableaux fournis doivent
représenter la fraction sur laquelle la méthode est appelée. Elle complète
`texSimplificationAvecEtapes()` sans modifier ses deux méthodes historiques.

## `Polynome` et calcul rationnel exact

`Polynome` est définie dans `src/lib/mathFonctions/Polynome.ts`. Les coefficients
sont rangés par degré croissant : `[1, 2, 3]` représente $3x^2+2x+1$.
`add()`, `multiply()`, `derivee()` et `primitive0()` sont les opérations
historiques ; `image()` et `fonction()` renvoient une valeur numérique.
La multiplication historique peut convertir des fractions en nombres pendant
l'accumulation des coefficients. Pour un résultat rationnel exact, utiliser
les méthodes explicites suivantes.

| Méthode | Contrat |
| --- | --- |
| `Polynome.fromRationalCoefficients(coeffs, letter = 'x')` | Construire avec des `FractionEtendue` simplifiées et retirer les coefficients dominants exactement nuls. Un tableau vide représente le polynôme nul de degré zéro. |
| `p.toRational()` | Créer une copie normalisée à coefficients rationnels, en conservant la variable de `p`. |
| `p.multiplyExact(q)` | Multiplier par un scalaire ou un polynôme en arithmétique rationnelle ; renvoyer un polynôme normalisé avec la variable de `p`. |
| `p.evaluateExact(x)` | Évaluer par Horner en une borne rationnelle et renvoyer une `FractionEtendue`, sans arrondi intermédiaire. |

Ces méthodes acceptent des `number`, des `Decimal` et des `FractionEtendue`.
Elles ne modifient ni les tableaux fournis ni les polynômes de départ.
La conversion d'un nombre ou d'un `Decimal` n'impose aucune borne artificielle
au dénominateur : elle rejette les valeurs non finies et les numérateurs ou
dénominateurs qui dépassent les entiers sûrs de JavaScript. Pour une fraction
comme $1/3$, fournir une `FractionEtendue` plutôt que le flottant `1 / 3`.
Les calculs restent soumis à la capacité entière de `FractionEtendue`.

```ts
const p = Polynome.fromRationalCoefficients([
  0,
  new FractionEtendue(2, 3),
])
const carre = p.multiplyExact(p) // 4x²/9.
const valeur = carre.evaluateExact(3) // FractionEtendue(4, 1).
const primitive = carre.primitive0()
const integrale = primitive.evaluateExact(3)
  .differenceFraction(primitive.evaluateExact(0))
  .simplifie()
```

Les cas rationnels, décimaux, signés et nuls sont testés dans
`tests/unit/polynome.test.ts`. L'exercice `src/exercices/ch/4mInt-9.ts` utilise
cette API pour les volumes de révolution.

## `Complexe`

`Complexe` est définie dans `src/lib/mathFonctions/Complexe.ts`. La classe encapsule les opérations usuelles sur les nombres complexes et leur affichage : formes algébriques, modules, arguments, opérations, textes symboliques.

Les helpers `texAngleSymbolique()` et `texNombreSymbolique()` complètent la classe pour produire des écritures LaTeX lisibles.

## `Hms`

`Hms` est l'export par défaut de `src/modules/Hms.ts`. Il représente des durées ou horaires en semaines, jours, heures, minutes et secondes. La classe sait notamment :

- construire une durée depuis un objet ou `Hms.fromString()` ;
- convertir en secondes ;
- normaliser les retenues ;
- additionner avec `add()`, calculer une différence absolue avec `substract()` ;
- comparer avec `isGreaterThan()`, `isEqual()`, `isTheSame()` ou `isEquivalentToString()`.

Le comparateur interactif peut comparer des durées via les options dédiées de `fonctionComparaison()`.

## `Grandeur`

`Grandeur` est l'export par défaut de `src/modules/Grandeur.ts`. Elle associe une mesure à une unité et gère des conversions entre unités compatibles : longueurs, masses, volumes, aires, vitesses, durées et cas particuliers pris en charge par le module.

La classe expose notamment `convertirEn()`, `estEgal()`, `estUneApproximation()`, `fromString()`, `fromHHMMSS()`, `toTex()` et `toHHMMSS()`. Elle est utilisée dans les exercices et dans l'interactivité avec l'option `unite`, afin d'accepter les conversions correctes selon la précision attendue.

## Affichage des nombres

L'affichage utilisateur passe principalement par les helpers de `src/lib/outils/texNombre.ts` et les fonctions associées. Ils évitent les problèmes fréquents de notation française, de séparateurs décimaux, d'espaces et de rendu LaTeX/HTML.

## Expressions arithmétiques générées

`generateArithmeticAst()` est défini dans `src/lib/mathFonctions/expression.ts`. Il construit un arbre de calcul pour les exercices qui demandent de traduire une expression numérique en blocs.

Avec trois opérations et `requireParentheses: true`, le générateur tire plusieurs formes qui imposent de calculer une addition ou une soustraction avant une multiplication ou une division. Il peut notamment produire deux sous-expressions additives, par exemple `(a + b) \times (c - d)`, ou une seule sous-expression additive combinée avec un terme non parenthésé, par exemple `(a - b) \div c + d`.

Avec trois opérations et `requireParentheses: false`, il construit au contraire une chaîne gauche de trois opérations, puis filtre les candidats qui exigeraient des parenthèses dans le rendu LaTeX.
