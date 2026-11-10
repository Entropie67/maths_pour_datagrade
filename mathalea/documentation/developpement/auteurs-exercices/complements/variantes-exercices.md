# Variantes d'exercices

Cette page complète le parcours essentiel quand la structure classique ne
suffit pas.

## `ExerciceSimple`

`ExerciceSimple` convient à une question unique dont les propriétés principales
sont `question`, `correction` et `reponse`. Avant de choisir cette classe,
cherchez un exercice récent et comparable : certaines fonctionnalités supposent
encore les listes d'un exercice classique. Voir
[Exercice simple et Course aux nombres](exercice-simple.md).

## Vrai ou faux

`ExerciceVraiFaux` (`src/exercices/ExerciceVraiFaux.ts`) tire au sort des
affirmations parmi `this.affirmations` ; l'élève répond « Vrai » ou « Faux »
par un QCM. Il suffit de déclarer les affirmations dans le constructeur :

```ts
import ExerciceVraiFaux from '../ExerciceVraiFaux'

export const titre = 'Affirmations sur les logarithmes'
export const interactifReady = true
export const interactifType = 'qcm'
export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '24/09/2026'
export const uuid = 'UUID_GENERE'
export const refs = { 'fr-fr': ['REFERENCE'], 'fr-ch': [] }

export default class VraiFauxLogarithmes extends ExerciceVraiFaux {
  constructor() {
    super()
    this.nbQuestions = 4
    this.affirmations = [
      {
        texte: '$\\ln(ab)=\\ln(a)+\\ln(b)$ pour tous réels $a$ et $b$ strictement positifs.',
        statut: true,
        correction: "C'est une propriété du logarithme népérien.",
      },
      // …
    ]
  }
}
```

- `nbQuestions` est ramené au nombre d'affirmations disponibles.
- La correction commence par « L'affirmation est vraie. » (ou fausse), suivie
  de `correction`.
- Exemples : `src/exercices/TSpe/TSA5-40.ts`, `TSA7-10.ts`, `TSA8-10.ts`.

## Exercice HTML

Pour une activité interactive sans équivalent papier, un exercice peut
construire lui-même ses éléments du DOM :

- `this.typeExercice = 'html'` dans le constructeur ;
- le getter `html` renvoie l'élément à afficher ;
- `ExerciceHtml.svelte` insère cet élément, puis déclenche sur son premier
  enfant l'événement `addedToDom` ;
- la méthode `destroy()`, si elle existe, est appelée quand l'exercice est
  retiré.

Les écouteurs d'événements et les mises à jour du DOM sont gérés dans le
fichier de l'exercice. Exemples : `src/exercices/ressources/iframe.ts` et
`video.ts`, ainsi que les apps de `src/exercices/apps/` (voir
[Apps externes](../../maintenance-moteur/architecture/apps-externes.md)). Les
ressources de ce type sont déclarées dans `src/json/uuidsRessources.json` (voir
[JSON du menu des exercices](../../maintenance-moteur/architecture/menu-exercices.md)).

## Plusieurs types de questions

Pour répartir plusieurs types, construisez un plan de tirage avant la boucle ou
utilisez les helpers déjà présents dans un exercice voisin. Le plan doit :

- contenir exactement `nbQuestions` choix ;
- rester stable pendant une génération ;
- éviter qu'un nouveau tirage à chaque tentative déséquilibre la répartition.

Passez toutes les données significatives à `questionJamaisPosee()`.

## Branches de rendu

Utilisez les informations de `context` seulement lorsqu'un rendu nécessite une
alternative réelle :

- `context.isHtml` pour distinguer HTML et LaTeX ;
- `context.isAmc` pour une structure AMC spécifique ;
- `context.isTypst` lorsqu'un composant HTML ne peut pas être converti.

La branche par défaut doit conserver un énoncé et une correction lisibles.

## Aller plus loin

- [Architecture des exercices](../../maintenance-moteur/architecture/exercices.md)
- [Export AMC](export-amc.md)
- [Vue Typst](../../maintenance-moteur/exports/typst.md)
