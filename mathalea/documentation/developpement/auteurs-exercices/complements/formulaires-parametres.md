# Formulaires de paramétrage

Un exercice expose ses réglages à l'enseignant via des propriétés `besoinFormulaire*`
déclarées dans le constructeur. Les valeurs saisies sont rangées dans `this.sup` à
`this.sup5`, puis sérialisées dans l'URL partagée (`s`, `s2`, … `s5`).

## Formulaires classiques

Chaque emplacement `supN` accueille **un seul** réglage, choisi parmi trois types.

| Déclaration                                                     | Valeur dans `supN` | Rendu                 |
| --------------------------------------------------------------- | ------------------ | --------------------- |
| `this.besoinFormulaireNumerique = [titre, max]`                 | nombre             | champ numérique borné |
| `this.besoinFormulaireNumerique = [titre, max, '1 : …\n2 : …']` | index de l'option  | menu déroulant        |
| `this.besoinFormulaireCaseACocher = [libellé]`                  | booléen            | case à cocher         |
| `this.besoinFormulaireTexte = [titre, aide]`                    | chaîne             | champ texte           |

Les emplacements suivants utilisent les mêmes noms préfixés du numéro :
`besoinFormulaire2Numerique`, `besoinFormulaire3CaseACocher`, etc.

Pour choisir un type de questions, préférer `besoinFormulaireTexte` à un menu
`besoinFormulaireNumerique` : l'enseignant peut alors combiner plusieurs cas
(`1-2`) au lieu d'un seul. Modèle : `src/exercices/1e/1AL10-2.ts` (aide
« Nombres séparés par des tirets : », puis un cas par ligne, le dernier étant
le mélange). Sur un exercice déjà publié, `gestionnaireFormulaireTexte()`
consomme le générateur aléatoire : ne pas l'ajouter sur le chemin par défaut
s'il décale les tirages (`pnpm stability:check`).

### Formulaire texte énumérant des cas

Un `besoinFormulaireTexte` dont l'aide énumère des cas (`1 : …`, `2 : …`) attend des
numéros séparés par des tirets, chaque numéro répété autant de fois qu'on veut de
questions de ce type : `1-1-1-2` demande trois questions du cas 1 pour une du cas 2.
C'est ce que lit `gestionnaireFormulaireTexte()`.

Cette saisie n'est plus présentée comme un champ texte : l'interface affiche une case
à cocher et un poids d'apparition par cas, comme une `listePonderee` (voir plus bas).
Cocher le cas 1 avec un poids de 3 et le cas 2 produit exactement `1-1-1-2` : **rien ne
change ni pour `this.sup` ni pour les URL déjà partagées**, seule la présentation
change. Les exercices n'ont donc rien à modifier.

L'extraction des cas est faite par
[src/lib/formulaireTexteListe.ts](../../../../src/lib/formulaireTexteListe.ts), à partir
de l'aide seule (les exercices ne déclarent pas leurs cas ailleurs) :

- une ligne `<numéro><séparateur><libellé>` décrit un cas, le séparateur pouvant être
  `:`, `-`, `.` ou `)` ;
- la consigne de saisie (« Nombres séparés par des tirets ») est ignorée ;
- **toute autre ligne annule la conversion** et l'aide garde son champ texte : elle
  décrit en général des valeurs qui ne sont pas énumérées, donc impossibles à cocher
  (« Entre 1 et 12 : pour choisir un motif particulier ») ;
- il faut au moins deux cas, de numéros distincts, qui n'ont besoin ni de se suivre ni
  de commencer à 1.

### Le cas « Mélange »

Le numéro passé à `gestionnaireFormulaireTexte()` par le paramètre `melange` remplace
la saisie par **tous** les cas. Il n'est déclaré nulle part ailleurs que dans l'aide,
et sa valeur change d'un exercice à l'autre (`7` pour 3L11, `0` pour 2F40-1, `6` pour
5M11-2b…). Il n'est donc pas affiché comme un cas à cocher, mais rendu par :

- un raccourci **Tout cocher**, qui remet tous les cas au même poids ;
- une lecture qui coche tous les cas dès que `sup` contient ce numéro ;
- une écriture qui utilise ce numéro dès que tous les cas sont cochés au même poids —
  la valeur historique, et la seule qui reste juste quand l'exercice écarte certains
  cas selon ses autres réglages (`exclus`).

Le numéro est repéré au libellé (« Mélange », « Mélange des cas précédents »…), avec
deux garde-fous contre un vrai type de question qui porterait ce nom : un seul libellé
de l'aide peut commencer par « Mélange », et son numéro doit être en bordure de
l'énumération. `4C23`, qui propose `5 : Mélange` **et** `7 : Mélange avec quotient`
alors que sa sentinelle vaut `0`, garde ainsi ses deux cas cochables.

Une aide dont le libellé « tous les cas » s'écrit autrement (« Toutes les questions »,
« Ensemble de ces 6 propositions »…) n'est pas reconnue : le cas reste une case à
cocher ordinaire, ce qui produit la même génération, sans le raccourci.

Pour un nouvel exercice, préférez cependant `besoinFormulaireComplexe` : les cas y sont
déclarés explicitement, avec leurs libellés, au lieu d'être devinés depuis une aide.

### Exemple : choisir un pavage

Dans [5G3A-10](../../../../src/exercices/5e/5G3A-10.ts), le formulaire `sup2`
énumère les huit pavages et réserve `9` au mélange. Le générateur lit cette
sélection avec `gestionnaireFormulaireTexte()` : `1-1-1-8` donne au pavage carré
un poids trois fois supérieur à celui des losanges. Un seul pavage est tiré pour
l'ensemble de la question. Le réglage `sup3` choisit de un à trois centres de
symétrie ; les réponses sont regroupées avec un barème `troisPointsProportionnels`
pour conserver un maximum de trois points.

Ces formulaires conviennent tant que l'exercice reste à cinq réglages indépendants.
Au-delà, on finit par encoder plusieurs dimensions dans un seul menu déroulant
(« 1 : multiplications / 2 : divisions / 3 : les deux / 4 : octets / 5 : mélange »),
ce qui devient vite illisible pour l'enseignant comme pour l'auteur.

## Formulaire complexe

`besoinFormulaireComplexe` regroupe plusieurs champs de natures différentes dans le
seul emplacement `this.sup`. Il est décrit dans
[src/lib/formulaireComplexe.ts](../../../../src/lib/formulaireComplexe.ts) et rendu par
`FormulaireComplexe.svelte`, qui délègue l'affichage des listes au composant partagé
`ListePondereeItems.svelte` (également utilisé par les formulaires texte énumérant des
cas).

### Déclarer le formulaire

```ts
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'

const monFormulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePondereeOrdonnee',
      nom: 'unites',
      label: 'Unités (poids d’apparition)',
      labelOrdre: 'Respecter l’ordre des unités',
      items: [
        { nom: 'm', label: 'Longueurs (m)', poids: 1 },
        { nom: 'g', label: 'Masses (g)', poids: 1 },
        { nom: 'euro', label: 'Prix (€)', poids: 0 },
      ],
    },
    {
      type: 'selection',
      nom: 'operations',
      label: 'Type d’opérations',
      options: [
        { valeur: 'mult', label: 'Multiplications' },
        { valeur: 'div', label: 'Divisions' },
      ],
      defaut: 'mult',
    },
    { type: 'case', nom: 'decimaux', label: 'Avec des nombres décimaux' },
  ],
}
```

Dans le constructeur :

```ts
this.besoinFormulaireComplexe = monFormulaire
this.sup = serialiseFormulaireComplexe(
  monFormulaire,
  valeursParDefaut(monFormulaire),
)
```

Fixer `this.sup` dès le constructeur garantit que l'exercice se génère correctement
avant toute ouverture du panneau de paramètres.

### Types de champs

| `type`                  | Rendu                                                                              | Valeur lue                                               |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `case`                  | case à cocher                                                                      | `boolean`                                                |
| `selection`             | menu déroulant                                                                     | `valeur` de l'option choisie                             |
| `liste`                 | items à cocher ou décocher                                                         | items `{ nom, label, poids }` avec `poids` valant 0 ou 1 |
| `listePonderee`         | items cochables, avec un poids d'apparition                                        | items `{ nom, label, poids }`                            |
| `listePondereeOrdonnee` | idem, plus des flèches de réordonnancement et une case « tenir compte de l'ordre » | items `{ nom, label, poids }` + booléen d'ordre          |

Les trois types de listes partagent la même lecture côté exercice ; ils diffèrent par
ce que l'enseignant peut régler.

- `liste` : items déclarés avec `actif` (`true` par défaut). Décocher revient à un poids
  nul, ce qui permet d'utiliser `listeActive()` et `repartition()` comme pour les autres
  listes.
- `listePonderee` : items déclarés avec `poids` (`1` par défaut, `0` pour décoché).
  `poidsMax` borne le poids saisissable (10 par défaut). Pas de flèches : l'ordre
  affiché est toujours celui de la déclaration.
- `listePondereeOrdonnee` : ajoute les flèches et une case dont le libellé est réglé par
  `labelOrdre` (`LABEL_ORDRE_DEFAUT` sinon) et l'état initial par `defautOrdre`
  (`false` par défaut). Tant que cette case est décochée, l'ordre affiché n'a aucun effet
  sur la génération.

### Lire les valeurs dans `nouvelleVersion()`

```ts
const params = lireFormulaireComplexe(monFormulaire, this.sup)

params.case('decimaux') // boolean
params.selection('operations') // 'mult' | 'div'
params.liste('unites') // items dans l'ordre affiché, items décochés compris
params.listeActive('unites') // items de poids strictement positif
params.declares('unites') // items tels que déclarés par l'exercice (poids par défaut)
params.ordreImpose('unites') // case « tenir compte de l'ordre »
params.repartition('unites', this.nbQuestions) // ordonnée ou mélangée selon la case
params.repartitionOrdonnee('unites', this.nbQuestions) // ordonnée quoi qu'il arrive
```

Tous ces accès se font **par nom de champ** (`nom`), jamais par position. N'indexez pas
`monFormulaire.champs` par sa position (`monFormulaire.champs[0]`) pour retrouver la
déclaration d'un champ — l'ordre des champs est un choix d'affichage et change sans
prévenir. Utilisez `params.declares(nom)` si vous avez besoin des items tels que
déclarés par l'exercice, par exemple pour reconstruire des items de repli après avoir
filtré `params.liste(nom)`.

`repartition()` est le point d'entrée normal : il respecte l'ordre affiché si la case
« tenir compte de l'ordre » est cochée, et mélange sinon. Pour une `liste` ou une
`listePonderee`, `ordreImpose()` vaut toujours `false` et la répartition est donc
mélangée.

Dans les deux cas, le nombre de questions attribué à chaque item est **exactement**
proportionnel à son poids (`repartitionExacte()`) : la somme vaut le nombre de questions
demandé, et les questions qui ne tombent pas juste vont aux plus grandes parts
fractionnaires, à égalité au premier item dans l'ordre affiché.

La version ordonnée **regroupe** ensuite les questions par item, dans l'ordre affiché :

| Poids               | Questions | Résultat              |
| ------------------- | --------- | --------------------- |
| `m` 1, `L` 1, `g` 1 | 5         | `m, m, L, L, g`       |
| `m` 3, `L` 1, `g` 1 | 5         | `m, m, m, L, g`       |
| `m` 2, `L` 1        | 7         | `m, m, m, m, m, L, L` |

La version mélangée applique la même répartition puis un `shuffle()` : le tirage dépend
de la graine de l'exercice et reste donc reproductible.

Si l'enseignant décoche tout, les répartitions retombent sur les poids déclarés dans
le formulaire, puis sur l'ensemble des items : un exercice ne reste jamais sans
question à générer.

### Sérialisation et URL

Les valeurs sont concaténées dans une chaîne unique, dans l'ordre de déclaration des
champs, avec des caractères que `URLSearchParams` n'encode pas. Chaque type de champ a
sa forme compacte :

| `type`                  | Forme                                                      | Exemple         |
| ----------------------- | ---------------------------------------------------------- | --------------- |
| `case`                  | `1` ou `0`                                                 | `1`             |
| `selection`             | valeur de l'option                                         | `mult`          |
| `liste`                 | un caractère `1`/`0` par item, dans l'ordre de déclaration | `101`           |
| `listePonderee`         | poids séparés par `-`, dans l'ordre de déclaration         | `2-1-0`         |
| `listePondereeOrdonnee` | `<ordre>_<indice>.<poids>-…`, dans l'ordre choisi          | `1_2.3-0.2-1.0` |

```
s=0_0.1-1.1-2.0*2-1*101*mult*0
  │              │   │   │   └── case
  │              │   │   └────── selection
  │              │   └────────── liste
  │              └────────────── listePonderee
  └───────────────────────────── listePondereeOrdonnee
```

Le désérialiseur est tolérant : une URL tronquée, un item inconnu ou une option
disparue reprennent la valeur par défaut du champ. Ajouter un champ **à la fin** de la
liste, ou un item **à la fin** d'une liste pondérée, préserve donc les URL déjà
partagées ; insérer ou supprimer un champ existant les invalide.

Pour convertir une `liste` en `listePonderee` en conservant les mêmes items dans le
même ordre, ajouter `acceptLegacyBinary: true` au champ. Le lecteur accepte alors
une ancienne chaîne binaire complète (`101` devient `1-0-1`), aussi bien dans le
panneau de réglages que lors de la génération. Les nouvelles URL utilisent les
poids séparés par des tirets. Cette compatibilité est explicite pour ne pas
réinterpréter les poids d'autres exercices. Elle ne dispense pas du contrôle de
stabilité des tirages.

## Exemple complet

[src/exercices/6e/\_Exercice_conversions_parametrable.ts](../../../../src/exercices/6e/_Exercice_conversions_parametrable.ts)
combine une `listePondereeOrdonnee` (les unités), une `selection` (le type d'opérations)
et deux `case` (décimaux, fractions dans la correction). Il est instancié par
[src/exercices/5e/5G2D-4.ts](../../../../src/exercices/5e/5G2D-4.ts).

Les tests correspondants sont dans `tests/unit/formulaireComplexe.test.ts` et
`tests/unit/conversionsParametrable.test.ts`. La conversion des formulaires texte en
liste pondérée est testée dans `tests/unit/formulaireTexteListe.test.ts`.

## Contraindre une liste de paramètres texte

Les listes issues de `besoinFormulaireTexte` peuvent imposer un nombre minimal
de cases cochées et masquer les poids d'apparition avec `textFormOptions`.
La clé correspond à l'indice du paramètre (`1` pour `sup`, `2` pour `sup2`, etc.).

```ts
this.textFormOptions = { 2: { minSelections: 2, weighted: false } }
```

Avec trois choix, cette configuration permet d'en décocher au maximum un.
Lorsque le minimum est atteint, les cases cochées sont désactivées ; les cases
non cochées restent disponibles. Les autres exercices conservent leur interface
habituelle. L'exercice doit aussi normaliser les paramètres lus depuis une URL
pour respecter ce minimum pendant la génération. Le `2N12-10` utilise ce réglage
pour afficher deux ou trois colonnes et adapter les réponses attendues au tableau.

## Afficher une case à cocher selon un autre paramètre

Un exercice peut afficher ou retirer une case à cocher du panneau en fonction d'un
autre paramètre : il suffit de changer `besoinFormulaire…CaseACocher` dans
`nouvelleVersion()`. Le libellé est remis quand la case doit paraître, `false` quand
elle doit disparaître. Le panneau se met à jour à chaque changement de paramètre.

```ts
nouvelleVersion() {
  this.besoinFormulaire2CaseACocher = this.sup3 ? ['Mon option', false] : false
  // …
}
```

`true` afficherait une case sans texte : le libellé est à fournir à chaque fois.

Le même principe vaut pour un choix numérique (`besoinFormulaire…Numerique`) : le panneau
relit sa déclaration à chaque mise à jour de l'exercice. Le `5N5C` s'en sert pour ne
proposer « Type d'exercices AMC » que dans la vue AMC (`context.isAmc`). Garder la
déclaration dans le constructeur et ne la retirer que dans `nouvelleVersion()` (en la
conservant dans un champ pour la remettre) : `pnpm stability:check` énumère les
combinaisons de paramètres à partir du constructeur.

```ts
nouvelleVersion() {
  this.besoinFormulaire3Numerique = context.isAmc ? this.formulaireTypeAmc : false
  // …
}
```

`SupParameterGroup.svelte` enveloppe la case dans une `<div>` : sans elle, retirer une
case fait disparaître celles qui la suivent. À conserver.
