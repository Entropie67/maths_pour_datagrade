# Mise en forme d'un exercice

Outils de présentation communs aux sorties HTML, LaTeX et Typst : texte,
couleurs, listes et numérotation. Les règles de rédaction (infinitif,
ponctuation, couleur du résultat final) sont dans
[Rédiger un exercice](../rediger-un-exercice.md).

## Texte

Hors mode mathématique (en dehors des `$…$`), dans
`src/lib/outils/embellissements.ts` et `src/lib/format/miseEnPage.ts` :

| Fonction | Effet |
| --- | --- |
| `texteGras(texte)` | gras |
| `texteItalique(texte)` | italique |
| `texteEnCouleur(texte, couleur)` | couleur (orange par défaut) |
| `texteEnCouleurEtGras(texte, couleur)` | couleur et gras (orange par défaut) |
| `texteCentre(texte)` | paragraphe centré |
| `centrage(texte)` | bloc centré (`<center>` ou environnement `center`) |
| `texteEnBoite(texte)` | texte encadré |

En mode mathématique (à l'intérieur des `$…$`) :

| Fonction | Effet |
| --- | --- |
| `miseEnEvidence(texte, couleur)` | couleur et gras, réservé au résultat final |
| `miseEnCouleur(texte, couleur)` | couleur seule |

`couleur` accepte un nom de couleur HTML (`'blue'`), un code hexadécimal
(`'#216D9A'`) ou une constante de `src/lib/colors.ts`. Pour du gras noir en
mode mathématique : `miseEnEvidence(texte, 'black')`.

## Interligne des corrections

Dans le constructeur, régler `this.spacingCorr` pour aérer les lignes des
corrections, par exemple comme dans `src/exercices/2e/2L22-3.ts` :

```ts
this.spacingCorr = 3
```

En HTML, cette valeur règle le `line-height` du bloc de correction. En LaTeX,
elle est transmise à l'environnement `spacing` par `texEnumerate()` dans
`src/modules/outils.ts`. Choisir une valeur plus petite, par exemple `2`, pour
un interligne moins important. `this.spacing` règle celui des énoncés.

Les retours à la ligne restent à placer avec `<br>` en dehors des formules
`$…$` ; augmenter l'interligne ne crée pas de nouvelles lignes.

## Nombres

Dans `src/lib/outils/texNombre.ts`, utiliser `texNombre(nombre)` entre `$…$`
pour séparer les classes de trois chiffres avec des espaces LaTeX.
Hors mode mathématique, utiliser `stringNombre(nombre)`.

`texNombre(nombre, precision = 8, completerZeros = false,
aussiCompleterEntiers = false)` accepte les nombres natifs, les `Decimal`,
les fractions et les complexes. Les paramètres permettent de choisir le nombre
de décimales et de conserver les zéros finaux si nécessaire.

`stringNombre()` insère déjà les séparateurs de classes dans les parties
entière et décimale. Ne pas ajouter un second regroupement de chiffres à sa
sortie : les espaces existants décaleraient les positions des séparateurs.

## Couleurs de la charte

Importer les constantes plutôt que recopier les codes :

```ts
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
```

| Constante | Code | Usage |
| --- | --- | --- |
| `orangeMathalea` (`coopmathsAction`) | `#F15929` | résultat final uniquement |
| `bleuMathalea` (`coopmathsStruct`) | `#216D9A` | explications de la correction, éléments de structure |
| `vertMathalea` (`coopmathsWarn1100`) | `#4d8613` | mises en relief |
| `noirMathalea` (`coopmathsCorpus`) | `#1F2429` | texte |

`src/lib/colors.ts` définit aussi les nuances de la charte (`coopmathsAction100`
à `900`, `coopmathsWarn50` à `1100`, `coopmathsStructLight`…) et les fonds
(`coopmathsCanvas…`).

## Numérotation des questions

Les questions sont numérotées « 1., 2., 3. » par défaut. Pour les exercices où
chaque question porte déjà un nom (« A = …, B = … ») :

```ts
this.listeAvecNumerotation = false
```

## Listes dans une question

`createList()` (`src/lib/format/lists.ts`) produit une liste HTML ou LaTeX
selon la sortie :

```ts
import { createList } from '../../lib/format/lists'

texte += createList({
  items: ['premier point', 'deuxième point', 'troisième point'],
  style: 'puces',
})
```

| `style` | Rendu |
| --- | --- |
| `'none'` | aucune puce |
| `'puces'` | disque |
| `'carres'` | petit carré plein |
| `'qcm'` | carré vide |
| `'fleches'` | triangle orienté vers la droite |
| `'nombres'` | 1. 2. 3. |
| `'alpha'` | a) b) c), repères en gras comme `numAlpha()` |
| `'Alpha'` | A. B. C. |
| `'roman'` / `'Roman'` | i. ii. iii. / I. II. III. |

Options :

- `classOptions` : classes [Tailwind](https://tailwindcss.com) ajoutées en
  HTML, par exemple `'space-y-4 pt-4'` pour espacer les entrées ;
- `introduction` : texte affiché avant la liste, utile pour une sous-liste ;
- un élément de `items` peut être une autre liste (sous-liste), ou un objet
  `{ description, text }` (entrée avec un intitulé).

```ts
const sousListe = {
  items: ['premier sous-point', 'deuxième sous-point'],
  style: 'alpha',
  classOptions: 'space-y-2 pt-2',
  introduction: 'Une sous-liste',
}

texte += createList({
  items: ['premier point', sousListe, 'dernier point'],
  style: 'nombres',
  classOptions: 'space-y-4 pt-4',
})
```

Pour des sous-questions avec un champ de réponse et une correction par
item, utiliser [`createQuestion()`](sous-questions.md), qui s'appuie sur
`createList()`.

Le troisième paramètre de `createList()` donne le numéro de départ d'une liste
numérotée.

## Pièges HTML et LaTeX

- **Ne pas commencer une question, une consigne ou un élément de liste par
  `<br>`.** Dans les listes LaTeX (`texEnumerate()`), `<br>` devient `\\`, et un
  `\\` en début d'élément empêche la compilation. Mettre le `<br>` à la fin de
  la ligne précédente : `texte += 'ligne 1<br>'` puis `texte += 'ligne 2'`.
- **Mettre des espaces autour de `<`.** `$f(x)<g(x)$` peut être lu comme une
  balise HTML `<g…>` et masquer la suite ; écrire `$f(x) < g(x)$` ou `\lt`.
- **Mettre une espace après une commande LaTeX suivie d'une lettre.**
  `\times x` et non `\timesx`, sinon KaTeX ne reconnaît pas la commande.
- **Écrire les mots d'une formule avec `\text{}`** :
  `$\text{Aire}=L\times\ell$`.

## Typographie

- Les majuscules prennent les accents : É, È, À.
- Espace insécable avant `:` (`~` en LaTeX), espace fine insécable avant `;`,
  `!` et `?` (`\,`).
- Une énumération introduite par deux-points commence par une minuscule et
  chaque élément se termine par un point-virgule, sauf le dernier qui se
  termine par un point.
- Les formules suivent la ponctuation de la phrase : elles prennent un point si
  elles la terminent.

## Varier les énoncés

Pour éviter des exercices répétitifs et favoriser le transfert :

- varier les grandeurs (discrètes, continues) et les contextes ;
- varier les formes : développer `k(ax+b)`, mais aussi `k(a+bx)`, `(ax+b)k`,
  `k(ax+b)+cx` ;
- varier les catégories dans les énoncés (élèves, garçons et filles ;
  véhicules, voitures et motos) ;
- choisir des prix et des quantités vraisemblables.

Nommer les variables d'après ce qu'elles représentent (`prixUnitaire` plutôt
que `a`) facilite la relecture.
