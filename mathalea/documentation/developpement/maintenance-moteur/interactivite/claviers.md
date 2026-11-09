# Claviers virtuels

Un champ MathLive peut afficher un clavier virtuel. L'exercice choisit un
**type de clavier** (`KeyboardType`), qui correspond à une liste de **blocs**
de touches.

La page `http://localhost:5173/alea/?uuid=clavier`
(`src/exercicesInteractifs/ClavierTest.svelte`) affiche chaque type de clavier
pour les essayer.

## Côté exercice

```ts
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

texte += ajouteChampTexteMathLive(
  this,
  i,
  KeyboardType.clavierDeBaseAvecFraction,
)
```

Plusieurs types se combinent en les séparant par une espace
(`` `${KeyboardType.clavierNumbers} ${KeyboardType.grecTrigo}` ``) :
`buildDataKeyboardFromStyle()` réunit leurs blocs sans doublon. Sans type
reconnu, le clavier par défaut contient les blocs `numbers`, `fullOperations`
et `variables`. Pour des
touches propres à une question, utiliser `KeyboardType.clavierPersonnalisable`
et `dataKeys` : voir
[Ajouter des touches propres à une question](../../auteurs-exercices/complements/formats-interactifs.md#ajouter-des-touches-propres-à-une-question).

Quelques types courants :

| Type                                  | Usage                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `clavierDeBase`                       | nombres et opérations                                                            |
| `clavierDeBaseAvecFraction`           | nombres, opérations, fractions                                                   |
| `clavierChiffresEtMultiplication`     | les dix chiffres et le signe ×, par exemple pour un produit de facteurs premiers |
| `clavierDeBaseAvecVariable`           | idem avec des lettres                                                            |
| `complexes`                           | nombres complexes (chiffres, `i`, fraction, puissance, trigonométrie)            |
| `complexesAvecVariable`               | idem avec des lettres (`x`, `y`, `z`…)                                           |
| `clavierMatrice`                      | coefficients usuels du lycée et insertion d'une matrice de dimensions choisies   |
| `lycee`, `lyceeClassique`             | fonctions et opérations du lycée                                                 |
| `grecTrigo`                           | lettres grecques et fonctions trigonométriques                                   |
| `clavierHms`                          | durées et horaires                                                               |
| `clavierEnsemble`                     | ensembles et intervalles                                                         |
| `longueur`, `aire`, `volume`, `masse` | grandeurs avec unités                                                            |
| `alphanumeric`                        | clavier alphanumérique                                                           |

Certains types (`complexes`, `clavierDeBase`, `clavierDeBaseAvecX`…) contiennent
déjà les chiffres : ne pas les combiner avec un autre clavier de nombres, les
chiffres s'afficheraient en double. Utiliser `complexes` seul (ou
`complexesAvecVariable` pour avoir aussi des lettres), ou un type qui réunit déjà
les blocs voulus (`clavierDeBaseAvecXEtEgal`, `clavierDeBaseAvecEgalEtVariable`,
`clavierFonctionsTerminalesEnsemble`, `clavierFonctionsTerminalesTrigo`). Le test
`keyboard.test.ts` repère les combinaisons fautives dans les exercices.

La liste complète est `KEYBOARD_CATEGORIES` dans
`src/lib/interactif/claviers/keyboard.ts`.

Les touches `dataKeys` peuvent aussi compléter un clavier existant, par exemple
`complexesAvecVariable` avec `dataKeys: ['\\overline{z}']` pour insérer le
conjugué de $z$.

## Raccourcis de saisie

Les champs MathLive disposent du raccourci `barre`, défini dans
`shortcutsByKeyboards.default` de `src/lib/interactif/claviers/keyboard.ts`.
Taper `zbarre` place une barre au-dessus du `z` qui précède le raccourci.
La commande insérée est `\\overline{#@}` : elle s'applique à la sélection ou,
sans sélection, à l'élément qui précède le curseur.

## Créer un type de clavier

Dans `src/lib/interactif/claviers/keyboard.ts` :

1. ajouter le nom à `KEYBOARD_CATEGORIES` ;
2. dans `convertKeyboardTypeToBlocks()`, associer ce type à sa liste de blocs.

## Créer un bloc de touches

1. Dans `src/components/keyboard/types/keyboardContent.ts`, ajouter le nom du
   bloc au type `BlockForKeyboard`.
2. Dans `src/components/keyboard/layouts/keysBlocks.ts`, définir les touches
   puis le bloc, et l'ajouter à l'objet `keyboardBlocks` :

   ```ts
   const monBlocCaps: CompleteKeysList = {
     inline: [1, 2, 3, 'ADD', 'SUB'],
     block: [1, 2, 3, 'ADD', 'SUB'],
   }

   export const monBloc: KeyboardBlock = {
     keycaps: monBlocCaps,
     cols: 3,
     title: 'Mon bloc',
     isUnits: false,
   }
   ```

   `inline` donne l'ordre des touches sur une ligne (petits écrans), `block`
   leur ordre dans la grille de `cols` colonnes.

3. Les touches elles-mêmes (affichage et commande insérée) sont définies dans
   `src/components/keyboard/lib/keycaps.ts`.

La touche `MATRIX` ouvre un choix du nombre de lignes et de colonnes, puis
insère une `pmatrix` dont chaque coefficient est un placeholder MathLive. Elle
est fournie par `KeyboardType.clavierMatrice` avec les nombres, fractions,
racines, puissances et opérations usuelles.

Vérifier le résultat sur la page de test `?uuid=clavier`.

## Affichage réduit ou agrandi

Le clavier a deux affichages : **réduit** (touches sur une ligne, réparties
en pages si elles ne tiennent pas) et **agrandi** (blocs en grille, toutes les
touches visibles). Des pages passent facilement inaperçues : à l'ouverture
d'un champ, `choisitClavierReduit()` (`src/components/keyboard/lib/modeClavier.ts`)
choisit l'affichage ainsi :

Sur smartphone (largeur de fenêtre de 640 px au plus), le clavier reste toujours
agrandi, sans bouton de bascule. Ses touches se partagent toute la largeur
disponible : l'estimation avec des touches de largeur fixe ne doit donc pas le
faire passer en mode réduit. Cette règle s'applique aussi lors d'un
redimensionnement vers une largeur mobile.

Sur les écrans plus larges :

1. le dernier choix de l'élève (touche agrandir / réduire, à côté des touches
   spéciales), mémorisé dans `localStorage` (`mathaleaClavierReduit`), prime ;
2. si toutes les touches tiennent sur une ligne, le clavier est réduit ;
3. sinon il est agrandi, sauf s'il est plus large que l'écran ou, hors écran
   tactile, s'il dépasse 40 % de la hauteur de la fenêtre : on garde alors les
   pages.

En affichage réduit, les blocs d'unités suivent le premier bloc du clavier
(souvent les chiffres) pour ne pas être relégués en dernière page.
