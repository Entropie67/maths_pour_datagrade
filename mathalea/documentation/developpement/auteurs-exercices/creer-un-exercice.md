# Créer un exercice

Un exercice génératif classique est un fichier TypeScript de `src/exercices/`.
Il hérite de `Exercice`, construit ses questions dans `nouvelleVersion()`, puis
remplit les listes de questions et de corrections.

Dans un exercice « Course aux nombres », `listeCanEnonces` et
`listeCanReponsesACompleter` sont indexées comme `listeQuestions` : l'entrée
`i` décrit la question `i`. Si une réponse à compléter est facultative,
initialiser `listeCanReponsesACompleter[i]` à `''` et affecter la valeur à
`[i]` dans les cas concernés. Éviter `push()` : une question sans réponse
décalerait toutes les réponses suivantes dans le tableau imprimé.

## 1. Partir d'un exercice proche

Cherchez un exercice récent du même niveau et du même type :

```sh
rg "notion recherchée" src/exercices
```

Placez le nouveau fichier dans le dossier du niveau, par exemple
`src/exercices/6e/`. Évitez les fichiers suffixés par `Old`, qui illustrent
souvent des conventions historiques.

## 2. Déclarer les métadonnées

Générez un UUID disponible :

```sh
pnpm getNewUuid
```

Un exercice exporte au minimum son titre, sa date, son UUID et ses références :

```ts
export const titre = 'Ajouter 9 à un entier'
export const dateDePublication = '23/07/2026'
export const uuid = 'UUID_GENERE'

export const refs = {
  'fr-fr': ['6N0A-1'],
  'fr-ch': [],
}
```

Remplacez les exemples par les valeurs réelles. Un UUID et une référence ne
doivent pas être copiés depuis un autre exercice.

Si la référence existe déjà, ajouter un suffixe : `5A11-1`, puis `5A11-2`…

Pour le référentiel suisse (`'fr-ch'`) :

| Valeur | Effet dans le menu suisse |
| --- | --- |
| `['9NO1-1']` | exercice rangé dans la catégorie indiquée |
| `[]` | exercice rangé dans « Non classés » |
| `['NR']` | exercice exclu du référentiel suisse (non pertinent) |

Une nouvelle catégorie se déclare dans `tasks/emptyRefCH.json` et son titre
dans `src/json/levelsThemesListCH.json` (voir
[JSON du menu des exercices](../maintenance-moteur/architecture/menu-exercices.md)).

## 3. Construire la classe

Depuis un fichier placé directement dans `src/exercices/6e/` :

```ts
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export default class AjouterNeuf extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    for (
      let i = 0, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const a = randint(10, 99)
      const resultat = a + 9
      const texte = `$${a}+9$`
      const texteCorr = `$${a}+9=${miseEnEvidence(resultat)}$`

      if (this.questionJamaisPosee(i, a)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
```

Adaptez les chemins d'import à la profondeur du fichier. Votre éditeur peut
souvent proposer ou corriger automatiquement ces chemins.

### Typer les données sans `any`

Laissez TypeScript déduire le type d'une valeur initialisée lorsque cela suffit.
Pour un tableau rempli progressivement ou une variable utilisée dans plusieurs
branches, choisissez un type qui couvre ses valeurs réelles : `number[]`,
`(string | number)[]`, `FractionEtendue`, etc.

Réutilisez les contrats du moteur avant de définir une nouvelle structure :

- `ObjetMathalea2D` dans `src/lib/2d/ObjetMathalea2D.ts` pour les objets 2D ;
- `NestedObjetMathalea2dArray` dans `src/types/2d.ts` pour un tableau de rendu
  qui contient aussi des sous-tableaux ou des objets LaTeX ;
- `RepereOptions` dans `src/lib/2d/reperes.ts` et `Mathalea2DOptions` dans
  `src/modules/mathalea2d.ts` pour les options de repère et de rendu ;
- `AnswerValueType`, `AnswerType` et `Valeur` dans `src/lib/types.ts` pour,
  respectivement, une valeur de réponse, cette valeur avec ses options de
  comparaison, et les champs d'une question interactive.

Une donnée JSON à valider entre avec le type `unknown`. Vérifiez sa structure
avec `typeof`, `in` et `Array.isArray` avant de lire ses propriétés. Remplacer
`any` par une assertion vers le type attendu ne valide pas la donnée.

Après une modification de typage, lancez `pnpm check:changed`. Pour un exercice publié,
vérifiez aussi la [stabilité des tirages](../../tests/stabilite-exercices.md),
même si les valeurs tirées sont censées rester identiques.

## 4. Lire la boucle

- `i` compte les questions acceptées ;
- `cpt` limite les tentatives afin d'éviter une boucle infinie ;
- `randint()` produit les données de la question ;
- `questionJamaisPosee()` évite les doublons ;
- `listeQuestions[i]` contient l'énoncé ;
- `listeCorrections[i]` contient la correction ;
- `listeQuestionsToContenu(this)` finalise le contenu affiché.

Les valeurs passées à `questionJamaisPosee()` doivent suffire à distinguer deux
questions. Passez toutes les données qui changent réellement l'énoncé.

## 5. Préserver les sorties

Un exercice doit rester lisible :

- en HTML interactif ;
- en HTML sans interactivité ;
- en LaTeX pour l'impression.

Utilisez les helpers existants pour les nombres, les écritures mathématiques et
les figures. Commencez par les
[recettes mathématiques](mathematiques/README.md) avant de concaténer vous-même
du LaTeX complexe.

## 6. Ajouter l'interactivité

Commencez par produire un énoncé et une correction corrects sans champ de
saisie. Ajoutez ensuite le champ et la réponse attendue en suivant
[Ajouter une interactivité simple](interactivite-simple.md).

Pour `ExerciceSimple`, les répartitions contrôlées ou les branches de rendu plus
complexes, consultez [Variantes d'exercices](complements/variantes-exercices.md).

## Écrire un code lisible

Un exercice est relu et modifié par d'autres pendant des années :

- nommer les variables d'après ce qu'elles représentent, en camelCase
  (`prixUnitaire`, pas `a2`) ;
- déclarer chaque variable au plus près de son usage, avec `const` si elle ne
  change pas ;
- nommer les constantes plutôt que d'écrire des nombres ou des chaînes
  « magiques » (`const majorite = 18`) ;
- factoriser un bloc répété au lieu de le copier-coller ;
- commenter le *pourquoi* d'un passage non évident, pas ce que fait chaque
  ligne ; documenter les fonctions réutilisables avec un bloc `/** … */`.

La présentation des énoncés (texte, couleurs, listes) est décrite dans
[Mise en forme](complements/mise-en-forme.md).
