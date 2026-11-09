# Gérer les décimaux

JavaScript stocke les `number` en flottants binaires. Certaines valeurs décimales simples pour les élèves, comme `0.1`, `0.2` ou `1.25`, ne sont donc pas toujours exactes en mémoire. Dans un exercice, cela peut produire une correction fausse, une réponse interactive refusée ou un affichage du type `0.30000000000000004`.

Ce guide donne une procédure complète pour choisir le bon type, générer les valeurs, calculer, afficher et tester un exercice avec décimaux.

## Décider quoi utiliser

Utiliser un `number` JavaScript est acceptable quand la valeur ne sert pas de vérité mathématique sensible :

- entiers, compteurs, indices, bornes de boucle, numéros de questions ;
- coordonnées ou mesures graphiques déjà approximatives ;
- calculs courts dont le résultat est explicitement arrondi pour l'énoncé ou la correction ;
- valeurs affichées avec `texNombre()` quand une approximation est assumée ;
- paramètres passés à un helper qui attend uniquement un `number`.

Utiliser `Decimal` est requis dès que le décimal est une valeur de référence :

- addition, soustraction, multiplication ou division de nombres décimaux dont le résultat exact est attendu ;
- prix, pourcentages, conversions d'unités, périmètres ou aires avec des dixièmes, centièmes ou millièmes ;
- réponse interactive qui doit être comparée à une valeur décimale ;
- correction qui réutilise le même résultat à plusieurs endroits ;
- tests d'égalité, d'ordre ou de divisibilité impliquant des décimaux ;
- construction d'une valeur comme `3.7`, `0.25` ou `12.08` à partir de chiffres tirés au hasard.

Utiliser `FractionEtendue` plutôt que `Decimal` quand la valeur exacte est rationnelle et doit rester sous forme fractionnaire : fraction irréductible, calcul littéral de fractions, démonstration de simplification. `Decimal` sert aux écritures décimales finies et aux approximations contrôlées, pas à remplacer une fraction exacte.

## Importer les helpers

Dans un exercice, importer seulement ce qui est utile :

```ts
import Decimal from 'decimal.js'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
```

Adapter le chemin relatif selon le dossier de l'exercice. Les usages vérifiés dans le code importent `Decimal` depuis `decimal.js`, affichent avec `texNombre()` et déclarent les réponses interactives avec `handleAnswers()`.

## Générer un décimal propre

La règle principale : ne pas créer un `Decimal` à partir d'un calcul flottant déjà contaminé.

À éviter :

```ts
const a = new Decimal(randint(1, 9) / 10)
const b = new Decimal(0.1 + 0.2)
const c = new Decimal(unites + dixiemes * 0.1 + centiemes * 0.01)
```

Préférer des entiers, des chaînes ou des opérations `Decimal` :

```ts
const a = new Decimal(randint(1, 9)).div(10)
const b = new Decimal('0.1').plus('0.2')
const c = new Decimal(unites)
  .plus(new Decimal(dixiemes).div(10))
  .plus(new Decimal(centiemes).div(100))
```

Pour une valeur avec un nombre fixe de décimales, tirer l'entier correspondant puis diviser :

```ts
const dixiemes = randint(21, 69, [30, 40, 50, 60])
const longueur = new Decimal(dixiemes).div(10) // 2.1 à 6.9

const centiemes = randint(101, 999)
const prix = new Decimal(centiemes).div(100) // 1.01 à 9.99
```

Une chaîne littérale est aussi correcte si la valeur est connue :

```ts
const coefficient = new Decimal('2.5')
const quart = new Decimal('0.25')
```

## Calculer avec `Decimal`

Les méthodes de `Decimal` remplacent les opérateurs arithmétiques :

```ts
const a = new Decimal(randint(41, 61)).div(10)
const b = new Decimal(randint(111, 149)).div(100)

const somme = a.plus(b)
const difference = a.minus(b)
const produit = a.mul(100)
const quotient = a.div(4)
```

Ne pas utiliser `+`, `-`, `*` ou `/` entre des `Decimal`. Ces opérateurs peuvent provoquer une conversion implicite ou produire du texte inattendu. Rester dans l'API `Decimal` jusqu'au dernier moment.

Les opérations ne modifient pas l'objet de départ : elles renvoient un nouveau `Decimal`.

```ts
const a = new Decimal('1.2')
a.plus('0.3') // résultat ignoré

const b = a.plus('0.3') // b vaut 1.5
```

Pour arrondir un `Decimal`, préférer les méthodes de `Decimal` :

```ts
const valeur = new Decimal(1).div(3)
const auCentieme = valeur.toDP(2) // Decimal
const texteAvecDeuxDecimales = valeur.toFixed(2) // string
```

Utiliser `arrondi()` seulement quand le code travaille volontairement avec un `number` :

```ts
const q = arrondi(aNumber / bNumber, 3)
```

Si une API impose un `number`, convertir à la frontière :

```ts
const valeurPourUnHelperNumber = somme.toNumber()
```

Ne pas convertir avant d'avoir fini les calculs fiables.

## Afficher dans l'énoncé et la correction

Utiliser `texNombre()` pour produire le format français attendu en HTML et LaTeX. Il accepte les `number`, les `Decimal` et les fractions étendues.

```ts
const a = new Decimal(randint(41, 61)).div(10)
const b = new Decimal(randint(111, 149)).div(100)
const reponse = a.plus(b)

const texte = `$${texNombre(a, 1)}+${texNombre(b, 2)}$`
const texteCorr = `$${texNombre(a, 1)}+${texNombre(b, 2)}=${texNombre(reponse, 2)}$`
```

Choisir explicitement la précision affichée :

- `texNombre(valeur, 0)` pour un entier ;
- `texNombre(valeur, 1)` pour un dixième ;
- `texNombre(valeur, 2)` pour un centième ;
- `texNombre(valeur, 2, true)` pour forcer deux décimales, par exemple `3,50`.

Éviter `String(valeur)`, `value.toString()` ou une concaténation directe dans un texte élève si le rendu doit respecter les conventions françaises.

## Déclarer la réponse interactive

Pour une réponse qui doit être un nombre décimal ou entier final, utiliser `handleAnswers()` avec `nombreDecimalSeulement`.

```ts
handleAnswers(this, i, {
  reponse: {
    value: reponse,
    options: { nombreDecimalSeulement: true },
  },
})
```

`handleAnswers()` sait convertir des valeurs métier comme `Decimal`, `FractionEtendue`, `Grandeur`, `Hms`, `Complexe` et `number` avant comparaison. Sans option explicite, une valeur `number` ou `Decimal` dont l'écriture est un nombre reçoit déjà `nombreDecimalSeulement` ; une chaîne comme `'0.8'` n'en reçoit pas et accepte alors tout calcul égal. L'option explicite rend l'intention visible dans le code (voir [Choisir les options de comparaison](../complements/options-de-comparaison.md#sans-option--attention-au-type-de-value)).

Si l'élève doit saisir un calcul équivalent, ne pas utiliser seulement `nombreDecimalSeulement` :

```ts
handleAnswers(this, i, {
  reponse: {
    value: '0.3+0.4',
    options: { expressionNumerique: true },
  },
})
```

Si l'élève doit saisir une fraction, utiliser une option de fraction :

```ts
handleAnswers(this, i, {
  reponse: {
    value: fraction,
    options: { fractionIrreductible: true },
  },
})
```

Avec `nombreDecimalSeulement`, les saisies `0.5` et `0,5` sont acceptées pour `0.5`, mais `\frac{1}{2}` ou `1/2` sont refusées comme forme de réponse décimale.

## Procédure complète pour un exercice

1. Identifier la valeur exacte attendue : décimal fini, fraction exacte ou approximation.
2. Choisir le type : `Decimal` pour les décimaux sensibles, `FractionEtendue` pour les fractions exactes, `number` pour le reste.
3. Générer les valeurs depuis des entiers ou des chaînes, jamais depuis une expression flottante comme `randint(...) / 10`.
4. Faire tous les calculs avec `.plus()`, `.minus()`, `.mul()`, `.div()` et les autres méthodes `Decimal`.
5. Arrondir seulement au moment pédagogique voulu, avec `.toDP()` pour garder un `Decimal` ou `.toFixed()` pour obtenir une chaîne.
6. Afficher avec `texNombre(valeur, precision)` dans l'énoncé et la correction.
7. Déclarer la réponse interactive avec `handleAnswers()` et les options de comparaison adaptées.
8. Tester une bonne réponse, une mauvaise réponse proche et une forme équivalente qui doit être acceptée ou refusée.

Exemple minimal :

```ts
import Decimal from 'decimal.js'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'

const a = new Decimal(randint(21, 69)).div(10)
const b = new Decimal(randint(111, 149)).div(100)
const reponse = a.plus(b)

texte = `Calculer $${texNombre(a, 1)}+${texNombre(b, 2)}$.`
texteCorr = `$${texNombre(a, 1)}+${texNombre(b, 2)}=${texNombre(reponse, 2)}$.`

handleAnswers(this, i, {
  reponse: {
    value: reponse,
    options: { nombreDecimalSeulement: true },
  },
})
```

## Vérifier et tester

Avant de considérer l'exercice terminé, vérifier manuellement les cas qui déclenchent souvent des bugs de flottants :

- `0.1 + 0.2` doit donner `0,3`, pas `0,30000000000000004` ;
- `1.2 - 0.9` doit donner `0,3` ;
- `2.5 * 4` doit donner `10` ;
- `0.3 / 0.1` doit donner `3` ;
- une valeur négative doit garder le bon signe ;
- une valeur entière obtenue par calcul doit s'afficher comme un entier si c'est l'objectif.

Pour une réponse interactive, essayer :

- la réponse avec un point : `0.5` ;
- la réponse avec une virgule MathLive : `0,5` ;
- une fraction équivalente si elle doit être refusée : `\frac{1}{2}` ;
- une expression équivalente si elle doit être refusée avec `nombreDecimalSeulement` : `0.2+0.3`.

Lancer les validations adaptées avant commit :

```bash
pnpm prebuild-unit-tests
pnpm check:changed
```

Pour un doute sur le comparateur, les tests unitaires de `fonctionComparaison()` couvrent notamment `nombreDecimalSeulement`, les fractions et les options combinées.

## Erreurs courantes

Créer un `Decimal` trop tard :

```ts
const faux = new Decimal(0.1 + 0.2)
```

Corriger en créant les opérandes en `Decimal` avant le calcul :

```ts
const juste = new Decimal('0.1').plus('0.2')
```

Construire un décimal avec des multiplications flottantes :

```ts
const faux = new Decimal(unites + dixiemes * 0.1)
```

Corriger avec des divisions `Decimal` :

```ts
const juste = new Decimal(unites).plus(new Decimal(dixiemes).div(10))
```

Mélanger `Decimal` et opérateurs JavaScript :

```ts
const faux = a + b
```

Corriger avec les méthodes :

```ts
const juste = a.plus(b)
```

Convertir trop tôt :

```ts
const faux = a.plus(b).toNumber()
const reponse = new Decimal(faux).mul(10)
```

Corriger en gardant `Decimal` jusqu'à la frontière :

```ts
const reponse = a.plus(b).mul(10)
```

Afficher directement une valeur :

```ts
texteCorr = `${reponse}`
```

Corriger avec le helper d'affichage :

```ts
texteCorr = `$${texNombre(reponse, 2)}$`
```

Accepter une forme de réponse trop large :

```ts
handleAnswers(this, i, { reponse: { value: reponse } })
```

Corriger en déclarant la forme attendue :

```ts
handleAnswers(this, i, {
  reponse: {
    value: reponse,
    options: { nombreDecimalSeulement: true },
  },
})
```

## Dépannage

Si la correction affiche beaucoup de chiffres, chercher une opération restée en `number` :

```bash
rg -n " / 10| / 100|\\* 0\\.1|\\* 0\\.01|\\+ .*0\\." src/exercices/mon-exercice.ts
```

Remplacer la génération par `new Decimal(entier).div(10)` ou `new Decimal('0.1')`.

Si `texNombre()` affiche une valeur arrondie au mauvais rang, vérifier le deuxième argument :

```ts
texNombre(reponse, 2)
```

Si une bonne réponse interactive est refusée, vérifier l'option :

- `nombreDecimalSeulement` pour un nombre final ;
- `expressionNumerique` pour un calcul ;
- `fractionEgale`, `fractionIrreductible` ou `fractionDecimale` pour une fraction ;
- `unite` et éventuellement `precisionUnite` pour une grandeur avec unité.

Si un helper attend un `number`, convertir uniquement au moment de l'appel et garder la valeur de référence en `Decimal`.

Si le calcul devrait rester exact sous forme fractionnaire, revenir à `FractionEtendue` au lieu d'accumuler des approximations décimales.
