# Afficher des nombres

Ce guide explique comment afficher correctement un nombre dans un énoncé, une correction, une réponse interactive ou un export LaTeX. L'objectif est d'obtenir une notation française lisible, compatible HTML/KaTeX et LaTeX, sans laisser apparaître les artefacts des flottants JavaScript.

## Réflexe de départ

Ne concaténez pas un nombre brut avec `String(nombre)`, `nombre.toString()` ou une interpolation directe comme `${nombre}` dès que le nombre est destiné à l'élève.

Choisissez d'abord le type d'affichage attendu :

| Besoin                                                 | Helper à utiliser                                          | Où placer le résultat                                             |
| ------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Nombre dans une formule ou une correction mathématique | `texNombre(nombre, precision)`                             | entre `$...$`, ou dans une chaîne LaTeX déjà en mode maths        |
| Nombre dans du texte hors mode maths                   | `stringNombre(nombre, precision)`                          | directement dans le texte                                         |
| Prix avec centimes utiles                              | `texPrix(nombre)`                                          | entre `$...$`, puis ajouter `\\text{ €}` ou `€` selon le contexte |
| Coefficient devant une inconnue                        | `rienSi1`, `ecritureAlgebrique`, `ecritureAlgebriqueSauf1`, `ecritureAlgebriqueSauf0Sauf1` | dans une formule                                                  |
| Nombre relatif à parenthéser                           | `ecritureParentheseSiNegatif` ou `ecritureNombreRelatif`   | dans une formule                                                  |
| Fraction exacte                                        | `FractionEtendue` et ses propriétés LaTeX                  | entre `$...$`                                                     |

## Imports

Dans un exercice sous `src/exercices`, les imports les plus fréquents sont :

```ts
import { texNombre, stringNombre, texPrix } from '../../lib/outils/texNombre'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureNombreRelatif,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
```

Adaptez seulement le nombre de `../` au dossier réel de l'exercice. Par exemple, depuis `src/exercices/can/6e`, le chemin vers `texNombre` est généralement `../../../lib/outils/texNombre`.

## Étape 1 : choisir la précision

Le deuxième argument de `texNombre` et `stringNombre` est le nombre maximal de décimales à afficher. Même si le code garde une valeur par défaut pour compatibilité, indiquez toujours la précision dans les nouveaux exercices.

```ts
const distance = 12345.6789

const enonce = `La distance est $${texNombre(distance, 2)}\\text{ km}$.`
// rendu attendu : 12 345,68 km
```

Règles pratiques :

- utilisez `0` pour un entier affiché comme entier ;
- utilisez `1`, `2`, `3`, etc. quand l'énoncé demande une précision décimale ;
- utilisez `2` pour une valeur au centième ;
- n'affichez pas une valeur calculée avec plus de décimales que ce qui est mathématiquement attendu ;
- pour un arrondi pédagogique, calculez ou arrondissez la valeur avant l'affichage si la correction doit expliquer l'arrondi.

## Étape 2 : afficher en mode mathématique

Utilisez `texNombre` dès que le nombre est dans une formule, même si le rendu final est HTML. La chaîne retournée contient du LaTeX : virgule protégée, espaces de classes et espaces dans la partie décimale.

```ts
const a = 1000.3
const b = 25

this.question = `Calculer $${texNombre(a, 1)}+${texNombre(b, 0)}$.`
this.correction = `$${texNombre(a, 1)}+${texNombre(b, 0)}=${texNombre(a + b, 1)}$.`
```

À faire :

```ts
;`$${texNombre(1000.3, 1)}$`
```

À éviter :

```ts
;`${1000.3}``$${1000.3}$`
```

Le premier exemple ne respecte pas la notation française. Le second est en mode maths mais garde le point décimal anglais.

## Étape 3 : afficher hors mode mathématique

Utilisez `stringNombre` pour du texte qui n'est pas placé entre `$...$`, par exemple dans un libellé, une consigne non mathématique ou une option HTML déjà textuelle.

```ts
const longueur = 12.5

this.question = `Tracer un segment de ${stringNombre(longueur, 1)} cm.`
```

N'utilisez pas `texNombre` hors mode maths : il peut contenir `,` ou `\\,`, qui sont destinés à KaTeX/LaTeX.

## Étape 4 : compléter les zéros quand ils ont du sens

Le troisième argument de `texNombre` ou `stringNombre` force l'affichage des décimales jusqu'à la précision demandée.

```ts
texNombre(3.5, 2, true) // 3,50 en LaTeX
stringNombre(3.5, 2, true) // 3,50 en texte
```

Utilisez-le quand les zéros sont significatifs pour l'élève :

- prix ou centimes ;
- mesures données au dixième, centième ou millième ;
- tableaux où toutes les valeurs doivent avoir la même précision ;
- correction qui insiste sur une précision imposée.

Pour compléter aussi un entier, passez le quatrième argument à `true` :

```ts
texNombre(3, 2, true, true) // 3,00 en LaTeX
```

Pour les prix, préférez `texPrix` quand le comportement attendu est simplement : entier sans centimes, non-entier avec deux décimales.

```ts
const prix = 4.5

this.question = `Le prix est de $${texPrix(prix)}\\text{ €}$.`
// rendu attendu : 4,50 €
```

## Étape 5 : utiliser les helpers d'écriture algébrique

Les helpers de `src/lib/outils/ecritures.ts` évitent les écritures comme `1x`, `+-3` ou `x-(-2)`.

### Coefficient devant une lettre

```ts
const a = -1
const b = 3

const expression = `$${rienSi1(a)}x${ecritureAlgebrique(b)}$`
// rendu attendu : -x+3
```

Utilisez :

- `rienSi1(a)` pour écrire `x`, `-x`, `3x` au lieu de `1x`, `-1x`, `3x` ;
- `ecritureAlgebrique(a)` pour ajouter le signe `+` aux nombres positifs ;
- `ecritureAlgebriqueSauf1(a)` pour écrire un terme signé devant une inconnue : `+x`, `-x`, `+3x`, `-3x`.
- `ecritureAlgebriqueSauf0Sauf1(a)` pour écrire un terme signé devant une inconnue qui doit disparaître quand son coefficient est nul : rien pour `0`, `+x`, `-x`, `+3x`, `-3x`.
- `reduireAxPlusB(a, b)`, `reduireAxPlusByPlusC(a, b, c)` et `reduireAxPlusByPlusCzPlusD(a, b, c, d)` pour écrire en une fois `ax+b`, `ax+by+c` ou `ax+by+cz+d` : les termes nuls disparaissent et le coefficient 1 ne s'écrit pas (`reduireAxPlusByPlusCzPlusD(1, 0, -1, 4)` donne `x-z+4`).

```ts
const terme = `${ecritureAlgebriqueSauf1(-1)}x`
// rendu attendu : -x
```

### Parenthèses pour les nombres négatifs

Utilisez `ecritureParentheseSiNegatif` quand un nombre peut apparaître après une multiplication, une puissance, une soustraction ou dans des coordonnées.

```ts
const xA = -2

this.correction = `$3\\times ${ecritureParentheseSiNegatif(xA)}=${texNombre(3 * xA, 0)}$`
// rendu attendu : 3 × (-2) = -6
```

Utilisez `ecritureNombreRelatif` quand vous voulez explicitement le signe et les parenthèses :

```ts
ecritureNombreRelatif(3) // (+3)
ecritureNombreRelatif(-3) // (-3)
ecritureNombreRelatif(0) // 0
```

Les variantes colorées existent (`ecritureNombreRelatifc`, `ecritureAlgebriquec`), mais réservez-les aux corrections où la mise en couleur porte un sens pédagogique.

## Étape 6 : garder les fractions exactes

Si une valeur est rationnelle et doit rester exacte, utilisez `FractionEtendue` plutôt qu'un flottant.

```ts
const f = new FractionEtendue(2, 6)

this.question = `Simplifier $${f.texFraction}$.`
this.correction = `$${f.texFraction}=${f.texFractionSimplifiee}$.`
```

Propriétés utiles :

| Propriété                     | Usage                                                     |
| ----------------------------- | --------------------------------------------------------- |
| `texFraction`                 | fraction telle qu'elle a été construite                   |
| `texFractionSimplifiee`       | fraction simplifiée                                       |
| `texFSD`                      | écriture simplifiée directe, pratique dans les calculs    |
| `texFractionSignee`           | fraction avec signe algébrique                            |
| `texFractionSaufUn`           | coefficient fractionnaire sans écrire `1` quand il vaut 1 |
| `ecritureParentheseSiNegatif` | fraction parenthésée si elle est négative                 |

Quand vous voulez une valeur décimale approchée d'une fraction, faites-le explicitement :

```ts
const f = new FractionEtendue(1, 3)

this.correction = `$${f.texFraction}\\approx ${texNombre(f.valeurDecimale, 2)}$.`
```

Ne remplacez pas une fraction exacte par `texNombre(f.valeurDecimale, precision)` si la réponse attendue est une fraction.

## Étape 7 : mettre en évidence un résultat

`miseEnEvidence` s'utilise dans une formule. Formatez d'abord le nombre, puis mettez la chaîne en évidence.

```ts
const resultat = 77.7777

this.correction = `$A=${miseEnEvidence(texNombre(resultat, 2))}$.`
```

Pour une fraction, `miseEnEvidence` accepte aussi une `FractionEtendue`, mais dans un guide ou un nouvel exercice il est souvent plus lisible de passer explicitement la propriété LaTeX :

```ts
const f = new FractionEtendue(3, 4)

this.correction = `$p=${miseEnEvidence(f.texFraction)}$.`
```

## Exemples complets

### Énoncé avec nombre décimal

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texNombre } from '../../lib/outils/texNombre'

const prixUnitaire = 2.35
const quantite = 4
const resultat = quantite * prixUnitaire

this.question = `Calculer $${texNombre(quantite, 0)}\\times ${texNombre(prixUnitaire, 2, true)}$.`
this.correction = `$${texNombre(quantite, 0)}\\times ${texNombre(prixUnitaire, 2, true)}=${texNombre(resultat, 2, true)}$.`

handleAnswers(this, i, {
  reponse: {
    value: resultat,
    options: { nombreDecimalSeulement: true },
  },
})
```

### Texte hors formule

```ts
import { stringNombre } from '../../lib/outils/texNombre'

const mesure = 7.5

this.question = `La règle mesure ${stringNombre(mesure, 1)} cm.`
```

### Expression algébrique

```ts
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'

const a = -1
const b = -3
const x = -2

this.question = `Calculer $${rienSi1(a)}x${ecritureAlgebrique(b)}$ pour $x=${texNombre(x, 0)}$.`
this.correction = `$${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${texNombre(a * x + b, 0)}$.`
```

### Fraction exacte puis approximation

```ts
import FractionEtendue from '../../modules/FractionEtendue'
import { texNombre } from '../../lib/outils/texNombre'

const ratio = new FractionEtendue(5, 8)

this.question = `Donner une écriture décimale de $${ratio.texFraction}$.`
this.correction = `$${ratio.texFraction}=${texNombre(ratio.valeurDecimale, 3)}$.`
```

## Réponses interactives

L'affichage et la comparaison de la réponse sont deux sujets différents.

- Pour afficher la réponse dans l'énoncé ou la correction, utilisez les helpers de ce guide.
- Pour déclarer la réponse attendue, donnez une valeur cohérente avec le comparateur utilisé.
- Pour une valeur décimale imposée, ajoutez des options de comparaison adaptées dans `handleAnswers`.
- Pour une fraction exacte, transmettez une `FractionEtendue` ou une chaîne LaTeX selon le format attendu par l'exercice.

Exemple de réponse décimale affichée en français, mais stockée explicitement :

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texNombre } from '../../lib/outils/texNombre'

const reponse = 1.25

this.correction = `$x=${texNombre(reponse, 2)}$.`

handleAnswers(this, i, {
  reponse: {
    value: '1.25',
    options: { nombreDecimalSeulement: true },
  },
})
```

Ne déduisez pas automatiquement la valeur de comparaison depuis une chaîne d'affichage si la précision ou le format de saisie est important.

## Edge cases

### Flottants JavaScript

JavaScript peut produire des valeurs comme `0.30000000000000004`. Ne les affichez pas directement.

```ts
const somme = 0.1 + 0.2

texNombre(somme, 1) // 0,3
```

Si le calcul décimal doit rester exact avant l'affichage, utilisez `Decimal` ou `FractionEtendue` selon le besoin. Voir aussi [Gérer les décimaux](gerer-les-decimaux.md).

### Plus de 15 chiffres significatifs

Pour un `number`, `texNombre` et `stringNombre` signalent un risque au-delà de 15 chiffres significatifs, car les flottants JavaScript ne garantissent plus l'exactitude. Réduisez les valeurs générées, diminuez la précision affichée ou utilisez `Decimal` si un très grand nombre de chiffres est vraiment nécessaire.

### Très petits ou très grands nombres

Pour des nombres très petits ou très grands, choisissez explicitement l'écriture attendue dans l'exercice : décimale, scientifique, fractionnaire ou symbolique. Ne laissez pas un flottant décider seul de la forme affichée.

### Strings en entrée

Les helpers sont prévus pour des nombres, `Decimal`, `Complexe` ou `FractionEtendue` selon les fonctions. Plusieurs helpers notifient une erreur quand ils reçoivent une chaîne. Convertissez ou parsez la valeur avant l'appel.

```ts
const valeur = Number(saisie)
const affichage = texNombre(valeur, 2)
```

### Unités

Gardez l'unité hors du helper numérique.

```ts
;`$${texNombre(12.5, 1)}\\text{ cm}$``${stringNombre(12.5, 1)} cm`
```

N'écrivez pas l'unité dans `texNombre`.

## Vérifications avant commit

Pour une modification de guide uniquement, relisez les exemples et vérifiez les imports avec `rg` :

```bash
rg "export function texNombre|export function stringNombre|export function rienSi1" src/lib/outils
rg "class FractionEtendue|export default FractionEtendue|export interface IFractionEtendue" src/modules/FractionEtendue.ts src/modules/FractionEtendue.type.ts
```

Pour une modification d'exercice qui touche l'affichage des nombres, vérifiez au minimum :

```bash
pnpm prebuild-unit-tests
pnpm check
```

Contrôlez aussi un rendu HTML et un rendu LaTeX si l'exercice contient :

- des décimaux ;
- des prix ou mesures avec zéros significatifs ;
- des fractions exactes ;
- des coefficients `1` ou `-1` ;
- des nombres négatifs dans des produits, puissances ou coordonnées.

## Dépannage

| Symptôme                                 | Cause probable                                     | Correction                                                                     |
| ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Le rendu affiche `3,5` dans du texte     | `texNombre` est utilisé hors mode maths            | Utiliser `stringNombre` ou entourer le nombre par `$...$` si c'est une formule |
| Le rendu affiche `3.5`                   | nombre brut interpolé                              | Remplacer par `texNombre(3.5, 1)` ou `stringNombre(3.5, 1)`                    |
| Des décimales inattendues apparaissent   | précision absente ou calcul flottant brut          | Passer une précision explicite et stabiliser le calcul                         |
| Les centimes `0` disparaissent           | zéros non forcés                                   | Utiliser `texNombre(nb, 2, true)` ou `texPrix(nb)`                             |
| On obtient `1x` ou `+-3`                 | concaténation algébrique manuelle                  | Utiliser `rienSi1`, `ecritureAlgebrique` ou `ecritureAlgebriqueSauf1`          |
| Un produit affiche `3\\times -2`         | nombre négatif non parenthésé                      | Utiliser `ecritureParentheseSiNegatif(-2)`                                     |
| Une fraction exacte devient `0,33333333` | conversion trop tôt en décimal                     | Garder `FractionEtendue` et afficher `texFraction` ou `texFractionSimplifiee`  |
| Notification "Trop de chiffres"          | plus de 15 chiffres significatifs avec un `number` | Réduire la précision, réduire la taille du nombre ou utiliser `Decimal`        |

## Checklist rapide

Avant de considérer l'affichage terminé :

1. Le nombre destiné à une formule passe par `texNombre` ou une propriété LaTeX de `FractionEtendue`.
2. Le nombre destiné à du texte hors formule passe par `stringNombre`.
3. La précision est explicitement choisie.
4. Les zéros significatifs sont forcés quand ils ont un sens.
5. Les nombres négatifs sont parenthésés dans les produits, puissances et substitutions.
6. Les coefficients `1` et `-1` sont gérés par les helpers algébriques.
7. Les fractions restent exactes tant qu'une approximation n'est pas demandée.
