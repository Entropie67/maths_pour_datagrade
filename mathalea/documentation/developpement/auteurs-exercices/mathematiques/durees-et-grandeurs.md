# Gérer des durées et des grandeurs

Ce guide explique comment choisir et utiliser `Hms` et `Grandeur` dans un exercice MathALÉA, depuis le calcul interne jusqu'à l'affichage, l'interactivité et les tests.

Sources vérifiées : `src/modules/Hms.ts`, `src/modules/Grandeur.ts`, `src/lib/interactif/comparisonFunctions.ts`, `src/lib/interactif/gestionInteractif.ts`, `src/lib/interactif/claviers/keyboard.ts`, `src/exercices/6e/6M4A.ts`, `src/exercices/6e/6M4C.ts`, `tests/unit/hms.test.ts`, `tests/unit/grandeur.test.ts`, `tests/unit/fonctionsDeComparaison.test.ts`, ainsi que les anciennes pages `old-documentation/.../Comment-gérer-des-durées.md` et `old-documentation/.../Comment-gérer-des-grandeurs-(longueurs,-masses...).md`.

## Choisir le bon outil

Utiliser `Hms` quand la réponse est une écriture de durée ou d'horaire en semaines, jours, heures, minutes et secondes :

- addition ou différence de durées ;
- conversion entre secondes et écriture `h min s` ;
- comparaison interactive avec le clavier `clavierHms` et l'option `{ HMS: true }`.

Utiliser `Grandeur` quand la réponse est une mesure avec une unité :

- longueur, masse, volume, aire, angle, température, monnaie ou unité préfixée ;
- conversion entre unités compatibles, par exemple `cm` vers `m`, `kg` vers `g`, `m^2` vers `ha` ;
- vitesse `m/s` ou `km/h` ;
- durée décimale avec les unités spéciales `hhmmss`, `hdec`, `mindec`, `sec` ;
- comparaison interactive avec l'option `{ unite: true }`.

Règle pratique : si l'élève doit écrire `1 h 25 min`, partir de `Hms`. Si l'élève doit écrire `1,25 h`, `75 min`, `3,5 cm` ou `12 km/h`, partir de `Grandeur`.

## Imports

Les deux classes sont des exports par défaut.

```ts
import Hms from '../../modules/Hms'
import Grandeur from '../../modules/Grandeur'
```

Dans un exercice interactif MathLive, ajouter aussi les imports habituels :

```ts
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
```

Adapter le nombre de `../` au dossier de l'exercice.

## Utiliser `Hms`

### Construire une durée

Le constructeur accepte un objet partiel. Les valeurs absentes valent `0`.

```ts
const duree = new Hms({ hour: 2, minute: 5, second: 30 })
const seulementMinutes = new Hms({ minute: 75 })
const avecSemaines = new Hms({ week: 1, day: 2, hour: 3 })
```

`Hms.fromString()` lit les écritures courantes utilisées dans les exercices et les réponses interactives.

```ts
const d1 = Hms.fromString('2 h 05 min 30 s')
const d2 = Hms.fromString('2h05min30s')
const d3 = Hms.fromString('5min')
const d4 = Hms.fromString('14000s')
```

Le parsing accepte aussi certaines écritures LaTeX nettoyées par le comparateur, comme `\text{h}`, `\text{min}` et `\text{s}`.

### Normaliser et calculer

`normalize()` transforme les retenues secondes/minutes en minutes/heures. La méthode modifie l'objet courant et le renvoie.

```ts
const duree = new Hms({ hour: 1, minute: 70, second: 120 })
const normalisee = duree.normalize()

normalisee.toString() // '2 h 12 min'
```

`add()` et `substract()` créent une nouvelle durée à partir des secondes totales, puis la normalisent. `substract()` renvoie toujours la valeur absolue de l'écart.

```ts
const t1 = new Hms({ hour: 12, minute: 34, second: 56 })
const t2 = new Hms({ hour: 12, minute: 35, second: 3 })

t1.add(t2).toString() // '25 h 09 min 59 s'
t2.substract(t1).toString() // '7 s'
```

Pour convertir en secondes :

```ts
const total = new Hms({ hour: 1, minute: 30 }).toSeconds()
// 5400
```

### Comparer

Choisir la comparaison selon l'intention.

```ts
const uneMinute = new Hms({ minute: 1 })
const soixanteSecondes = new Hms({ second: 60 })

uneMinute.isEqual(soixanteSecondes) // true : même durée en secondes
uneMinute.isTheSame(soixanteSecondes) // false : écriture différente
uneMinute.isEquivalentToString('60 s') // true : même durée en secondes
```

`isGreaterThan()` compare aussi les secondes totales.

```ts
new Hms({ hour: 2 }).isGreaterThan(new Hms({ minute: 90 })) // true
```

### Afficher

`toString()` produit une chaîne pour l'énoncé, la correction ou la réponse attendue.

```ts
new Hms({ hour: 2, minute: 5, second: 30 }).toString()
// '2 h 05 min 30 s'
```

`toString2()` supprime la dernière unité quand elle n'est pas seule. C'est utile pour des écritures abrégées comme `4 h 12` ou `2 min 54`.

```ts
new Hms({ hour: 2, minute: 12 }).toString2()
// '2 h 12'
```

Pour un affichage LaTeX plus fin dans une correction, les exercices existants combinent souvent les valeurs numériques avec `formatMinute()` ou `texNombre()` plutôt que de transformer directement `toString()` en LaTeX.

## Utiliser `Grandeur`

### Construire une grandeur

Le constructeur prend une mesure numérique et une unité.

```ts
const longueur = new Grandeur(250, 'cm')
const aire = new Grandeur(14, 'cm^2')
const masse = new Grandeur(5, 'kg')
const vitesse = new Grandeur(12, 'km/h')
```

`Grandeur.fromString()` lit une mesure suivie d'une unité, avec virgule française, espace ou `\text{...}`.

```ts
const g1 = Grandeur.fromString('12,345~\\text{cm}')
const g2 = Grandeur.fromString('13cm')
const g3 = Grandeur.fromString('130\\,mm')
```

Éviter `fromString()` pour une durée écrite `1 h 30 min` : utiliser `Hms.fromString()` ou `Grandeur.fromHHMMSS()` selon le besoin.

### Convertir

`convertirEn()` renvoie une nouvelle `Grandeur`.

```ts
new Grandeur(12, 'km').convertirEn('cm').mesure
// 1200000

Grandeur.fromString('1 ha').convertirEn('m^2').mesure
// 10000

new Grandeur(10, 'm/s').convertirEn('km/h').mesure
// 36
```

Les unités compatibles partagent une unité de référence. Les préfixes SI usuels sont gérés, par exemple `mm`, `cm`, `dm`, `m`, `dam`, `hm`, `km`, `Mg`, `GW`. Les cas spécifiques déjà pris en charge incluent notamment `t`, `q`, `L`, `m^3`, `a`, `ha`, `°`, `°C`, `€`, `m/s`, `km/h`.

Si les unités ne sont pas compatibles, `convertirEn()` lance une erreur.

```ts
new Grandeur(3, 'cm').convertirEn('g')
// Error: Conversion impossible de cm en g
```

### Durées décimales avec `Grandeur`

`Grandeur` sait convertir des durées entre :

- `hhmmss` : valeur interne en secondes, affichée en heures/minutes/secondes ;
- `hdec` : heures décimales ;
- `mindec` : minutes décimales ;
- `sec` : secondes.

```ts
const duree = new Grandeur(5400, 'hhmmss')

duree.toHHMMSS() // '1 h 30 min'
duree.convertirEn('hdec').mesure // 1.5
duree.convertirEn('mindec').mesure // 90
```

Pour partir d'une chaîne compacte :

```ts
const duree = Grandeur.fromHHMMSS('01:30:00')
const memeDuree = Grandeur.fromHHMMSS('013000')

duree.mesure // 5400
duree.unite // 'hhmmss'
```

`fromHHMMSS()` attend `HH:MM:SS` ou `HHMMSS`. Pour `1 h 30 min`, utiliser `Hms.fromString('1 h 30 min')`.

### Comparer et accepter une approximation

`estEgal()` compare deux grandeurs après conversion vers leur unité de référence.

```ts
Grandeur.fromString('13cm').estEgal(Grandeur.fromString('130\\,mm'))
// true
```

`estUneApproximation()` accepte un écart maximal. La précision est évaluée dans l'unité la plus petite des deux grandeurs.

```ts
const attendu = new Grandeur(12, 'cm')
const saisie = new Grandeur(11.4, 'cm')

attendu.estUneApproximation(saisie, 1) // true
```

### Afficher

`toString()` produit une chaîne avec une espace fine insécable entre la mesure et l'unité.

```ts
new Grandeur(12, 'km').convertirEn('mm').toString()
// '12 000 000 mm'
```

`toTex()` produit une écriture LaTeX.

```ts
new Grandeur(12, 'km').convertirEn('mm').toTex()
// '12\\,000\\,000~\\text{mm}'
```

Pour les durées `hhmmss`, `toString()` et `toTex()` affichent directement une écriture en heures/minutes/secondes.

```ts
new Grandeur(4528, 'hhmmss').toString()
// '1 h 15 min 28 s'

new Grandeur(4528, 'hhmmss').toTex()
// '1~\\text{h}~15~\\text{min}~28~\\text{s}'
```

## Intégrer dans un exercice interactif

### Réponse attendue en `Hms`

Exemple minimal pour une addition de durées, sur le modèle de `src/exercices/6e/6M4A.ts`.

```ts
const t1 = new Hms({ hour: 1, minute: 45 })
const t2 = new Hms({ minute: 30 })
const reponse = t1.add(t2)

texte = `$1~\\text{h}~45~\\text{min}+30~\\text{min}=$`

if (this.interactif) {
  texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
  handleAnswers(this, i, {
    reponse: { value: reponse, options: { HMS: true } },
  })
}
```

Points à respecter :

- utiliser `KeyboardType.clavierHms` pour proposer les touches `h`, `min`, `s` ;
- passer `options: { HMS: true }` ;
- transmettre un `Hms` ou une chaîne produite par `toString()` ;
- garder un énoncé lisible en mode non interactif.

Attention : le comparateur `{ HMS: true }` vérifie la même écriture décomposée avec `isTheSame()`. Dans les tests actuels, `1m` n'est pas accepté pour une réponse attendue `60s`. Si plusieurs écritures équivalentes doivent être acceptées, générer la réponse attendue dans l'unité demandée par l'énoncé ou utiliser une stratégie de comparaison plus adaptée.

### Réponse attendue en `Grandeur`

Exemple minimal pour une longueur avec unité.

```ts
const reponse = new Grandeur(3.5, 'cm')

texte = `$35~\\text{mm}=$`

if (this.interactif) {
  texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur)
  handleAnswers(this, i, {
    reponse: { value: reponse, options: { unite: true } },
  })
}
```

Avec `{ unite: true }`, une saisie équivalente dans une autre unité compatible peut être acceptée. Par exemple `0,035 m` peut être accepté pour `3,5 cm`.

Pour accepter un arrondi, ajouter `precisionUnite`.

```ts
handleAnswers(this, i, {
  reponse: {
    value: new Grandeur(3.47, 'm'),
    options: { unite: true, precisionUnite: 0.1 },
  },
})
```

`precisionUnite` est la tolérance utilisée par la comparaison de grandeurs. Dans les tests actuels, `3,5 m` est accepté pour `3.47 m` avec `precisionUnite: 0.1`, alors qu'un arrondi incompatible est refusé avec un feedback d'arrondi.

### Choisir le clavier d'un champ de grandeur

Choisir le clavier selon l'unité attendue :

- `KeyboardType.longueur` pour longueurs ;
- `KeyboardType.aire` pour aires ;
- `KeyboardType.volume` pour volumes et capacités ;
- `KeyboardType.masse` pour masses ;
- `KeyboardType.nombresEtDegre` ou `KeyboardType.nombresEtDegreCelsius` pour angles et températures ;
- `KeyboardType.clavierFullOperations` si l'exercice attend surtout une expression numérique et que l'unité est ajoutée par `texteApres`.

Le clavier aide la saisie, mais la validation dépend de `handleAnswers()` et des options de comparaison.

## Tests et vérifications

Pour un changement qui touche `Hms`, `Grandeur` ou une comparaison associée, lancer au minimum :

```bash
pnpm vitest tests/unit/hms.test.ts tests/unit/grandeur.test.ts tests/unit/fonctionsDeComparaison.test.ts
```

Avant commit, respecter la commande projet :

```bash
pnpm prebuild-unit-tests
```

Pour une modification TypeScript ou Svelte liée à un exercice :

```bash
pnpm check
```

Vérifications manuelles utiles sur un exercice interactif :

1. Ouvrir l'exercice en HTML interactif.
2. Saisir une réponse correcte dans l'unité attendue.
3. Saisir une réponse correcte dans une unité compatible si `{ unite: true }` doit l'accepter.
4. Saisir une réponse sans unité pour vérifier le feedback de grandeur.
5. Saisir une écriture équivalente mais décomposée autrement pour vérifier si `{ HMS: true }` doit l'accepter ou la refuser.
6. Vérifier que la version non interactive et l'export LaTeX restent lisibles.

## Dépannage

### `1 min` est refusé alors que `60 s` est attendu

C'est le comportement de `{ HMS: true }` : la comparaison attend la même décomposition d'unités, pas seulement la même durée totale. Construire la réponse attendue dans l'écriture demandée par l'énoncé.

### La durée affiche des retenues, par exemple `1 h 70 min`

Appeler `normalize()` avant l'affichage si la durée a été construite avec des valeurs non normalisées.

```ts
new Hms({ hour: 1, minute: 70 }).normalize().toString()
// '2 h 10 min'
```

### `normalize()` change ma variable

`normalize()` modifie l'instance courante. Si la durée brute doit être conservée, créer une nouvelle instance ou utiliser `add()`/`substract()` qui renvoient une nouvelle durée.

### Une grandeur sans unité est refusée

Avec `{ unite: true }`, l'unité doit être saisie. Les tests actuels renvoient un feedback du type : `La réponse pourrait être correcte si l'unité avait été précisée.`

### La conversion lance `Conversion impossible`

Les unités ne sont pas compatibles ou l'unité n'est pas reconnue par `parseUnite()`. Vérifier l'orthographe exacte (`m^2`, `cm^3`, `km/h`, `°C`, etc.) et éviter de mélanger des familles différentes comme longueur et masse.

### `Grandeur.fromString()` ne lit pas `1 h 30 min`

`Grandeur.fromString()` lit une mesure suivie d'une seule unité, comme `12cm` ou `3,5~\\text{m}`. Pour `1 h 30 min`, utiliser `Hms.fromString()`. Pour une durée décimale à convertir, utiliser `new Grandeur(secondes, 'hhmmss')` ou `Grandeur.fromHHMMSS('01:30:00')`.

### `toHHMMSS()` lance une erreur

`toHHMMSS()` ne fonctionne que pour les unités de durée de `Grandeur` : `hhmmss`, `hdec`, `mindec`, `sec`.

### Une unité saisie dans MathLive ne passe pas

La comparaison `{ unite: true }` nettoie certaines écritures MathLive, dont `\operatorname{\mathrm{cm}}`, `°` et `°C`. Si une unité personnalisée échoue, vérifier d'abord qu'elle est produite dans un format reconnu, puis qu'elle est compatible avec `Grandeur`.
