# Documentation complète : Tableau de Signes et Variations

Ce document aide les développeurs à créer des exercices interactifs utilisant le composant `<tableau-signes-variations>`.

## Vue d'ensemble

Le composant `<tableau-signes-variations>` est un Web Component personnalisé qui affiche et gère un tableau interactif de signes et/ou de variations d'une fonction. Les élèves peuvent :

- **Éditer les cellules** en cliquant dessus pour ouvrir une toolbar contextuelle
- **Entrer des valeurs** via une toolbar avec MathLive (pour les mathématiques)
- **Voir le feedback** en temps réel (vert = correct, rouge = incorrect)
- **Exporter en LaTeX** au format tkz-tab pour la sortie PDF

### Modes interactifs

Le composant supporte plusieurs types de cellules éditables :

| Mode | Description | Exemples |
|------|-------------|----------|
| `signe` | Signe d'une fonction (+, −, 0) | Signes d'un polynôme |
| `variation` | Sens de variation (↗, ↘, interdit) | Monotonicité |
| `valeur` | Valeur ponctuelle (nombre, expression) | Images f(x) |
| `valeurDroite` | Limite à droite d'une discontinuité | Saut en un point |
| `barre` | Marqueur de discontinuité (simple \| ou double \|\|) | Zéros, pôles |
| `valeurBarree` | Combinaison valeur + barre | Cellules doubles |
| `signeBarree` | Combinaison signe + barre | Signes avec discontinuités |

## Architecture du code

Le composant suit la [convention MathALÉA de custom element](../../../../documentation/developpement/maintenance-moteur/interactivite/custom-elements.md) : la classe (`extends MathaleaCustomElement`), `create()`, `verifQuestion()` et les helpers d'injection (`creerTableauSignesVariations`, `addTableauSignesVariations`) vivent dans `src/lib/customElements/TableauSignesVariationsElement.ts`. Ce dossier ne contient que les modules de support (types, rendu, toolbar, export LaTeX) et les builders de données purs.

```
src/lib/customElements/
└── TableauSignesVariationsElement.ts   # Web Component + create()/verifQuestion() + helpers d'injection

src/lib/interactif/tableauSignesVariations/
├── types.ts                            # Interfaces TypeScript
├── helpers.ts                          # Builders de données purs (colonne, celluleSigne, ligneVariation, configCorrige...)
├── toolbar.ts                          # Barre d'édition contextuelle
├── render.ts                           # Rendu du tableau en HTML/SVG
├── latexExport.ts                      # Export tkz-tab pour LaTeX
├── typstExport.ts                      # Export Typst (package vartable)
└── DOCUMENTATION.md                    # Ce fichier
```

## Utilisation rapide

### Cas simple : tableau de signes

```typescript
import { creerTableauSignes } from '@/lib/customElements/TableauSignesVariationsElement'
import type { TableauSVConfig } from '@/lib/interactif/tableauSignesVariations/types'

const config: TableauSVConfig = {
  variableName: 'x',
  colonnes: [
    { valeur: '-\\infty' },
    { valeur: '0', editable: true, expected: '0' },
    { valeur: '+\\infty' },
  ],
  lignes: [{
    type: 'signe',
    label: 'f(x)',
    cellules: [
      { symbole: '' },                      // sous -∞
      { symbole: '-', editable: true, expected: '-' },  // intervalle
      { symbole: '|' },                     // sous 0
      { symbole: '+', editable: true, expected: '+' },  // intervalle
      { symbole: '' },                      // sous +∞
    ],
  }],
}

export function monExercice(numeroExercice: number): string {
  return creerTableauSignes(config, { numeroExercice, numeroQuestion: 0 })
}
```

### Cas avancé : tableau de variations

```typescript
import { ligneVariation, celluleValeur, celluleFleche } from '@/lib/interactif/tableauSignesVariations/helpers'
import { creerTableauVariations } from '@/lib/customElements/TableauSignesVariationsElement'

const config: TableauSVConfig = {
  variableName: 'x',
  colonnes: [
    { valeur: '-\\infty' },
    { valeur: '1' },
    { valeur: '+\\infty' },
  ],
  lignes: [
    ligneVariation('f(x)', [
      celluleValeur('-\\infty'),
      celluleValeur('2', { editable: true, expected: '2' }),
      celluleValeur('+\\infty'),
    ], [
      celluleFleche('haut', { editable: true, expected: 'haut' }),
      celluleFleche('bas', { editable: true, expected: 'bas' }),
    ]),
  ],
}
```

## Configuration complète

### Interface `TableauSVConfig`

```typescript
interface TableauSVConfig {
  /** Nom de la variable, par défaut 'x'. */
  variableName?: string
  
  /** Liste des antécédents (colonnes du tableau). */
  colonnes: ColonneConfig[]
  
  /** Lignes : signes, variations, ou valeurs. */
  lignes: Ligne[]

  /**
   * Autorise l'élève à ajouter/supprimer des colonnes (antécédents).
   * Affiche deux boutons +/− à droite du tableau. Défaut : false.
   */
  colonnesEditables?: boolean

  /**
   * Autorise l'élève à ajouter/supprimer des lignes.
   * Affiche un menu +▾ (choix du type) et un bouton − sous le tableau. Défaut : false.
   */
  lignesEditables?: boolean

  /**
   * Couleur (`#RRGGBB`) de tout le tableau : traits et textes (HTML, Typst et
   * LaTeX). Sert aux réponses courtes. Les cellules `highlight` restent en
   * orange et en gras.
   */
  couleur?: string
}
```

### Colonnes : `ColonneConfig`

```typescript
interface ColonneConfig {
  /** Antécédent en LaTeX : '-\\infty', '0', '2', '+\\infty', etc. */
  valeur: string
  
  /** L'élève peut-il modifier cet antécédent ? */
  editable?: boolean
  
  /** Réponse attendue pour validation automatique. */
  expected?: string
  
  /** Configuration du clavier MathLive pour cette cellule. */
  clavier?: string
}
```

**Exemple :**
```typescript
const colonnes = [
  { valeur: '-\\infty' },
  { valeur: '0', editable: true, expected: '0' },
  { valeur: '\\frac{1}{2}' },
  { valeur: '+\\infty' },
]
```

### Lignes de signes : `LigneSigne`

```typescript
interface LigneSigne {
  type: 'signe'
  
  /** Étiquette (ex. 'f(x)', 'f\'(x)', 'P(x)').*/
  label: string
  
  /** Cellules du tableau.
   * Pour n colonnes : 2n-1 cellules
   *  - Indices pairs (0, 2, 4...) : sous les antécédents ('', '|', '||')
   *  - Indices impairs (1, 3, 5...) : entre antécédents ('+', '-')
   */
  cellules: CelluleSigne[]
}

interface CelluleSigne {
  symbole: '+' | '-' | '0' | '|' | '||' | '|0' | '||0' | ''
  editable?: boolean
  expected?: SigneSymbol
}
```

**Structure des cellules (3 colonnes = 5 cellules) :**
```
           -∞          0          +∞
f(x)  [0]  -   [1]   |   [2]   +   [3]      [4]
     sous   entre  sous  entre  sous
```

**Signification des symboles :**
| Symbole | Sens |
|---------|------|
| `'+'` | Fonction positive |
| `'-'` | Fonction négative |
| `'0'` | Zéro simple (annule sans changer de signe) |
| `'\|'` | Zéro simple avec trait vertical |
| `'\|\|'` | Zéro double (annule avec changement de signe) |
| `'\|0'` | Double zéro simple |
| `'\|\|0'` | Double zéro double |
| `''` | Cellule vide (sous un antécédent ou aux limites) |

### Lignes de variations : `LigneVariation`

```typescript
interface LigneVariation {
  type: 'variation'
  label: string
  
  /** Valeurs aux antécédents. Longueur = nombre de colonnes. */
  valeurs: CelluleValeur[]
  
  /** Sens de variation entre antécédents. Longueur = colonnes - 1. */
  fleches: CelluleFleche[]
}

interface CelluleValeur {
  /** Contenu LaTeX : '2', '-1', '\\frac{3}{2}', '+\\infty', etc. */
  latex: string
  
  /** Limite à droite (discontinuité) : si présent, affiche deux valeurs. */
  latexDroite?: string
  
  editable?: boolean
  expected?: string
  
  /** Réponse attendue pour la limite droite. */
  expectedDroite?: string
  
  /** Configuration du clavier MathLive. */
  clavier?: string
}

interface CelluleFleche {
  sens: 'haut' | 'bas' | 'interdite' | ''
  editable?: boolean
  expected?: SensFleche
}
```

**Exemple avec discontinuité :**
```typescript
ligneVariation('f(x)', [
  celluleValeur('2'),
  celluleValeurDouble('1', '3'),  // Saut de 1 à 3 en x=1
  celluleValeur('0'),
], [
  celluleFleche('haut'),
  celluleFleche('interdite'),  // Pôle ou asymptote
  celluleFleche('bas'),
])
```

### Lignes de valeurs : `LigneValeur`

```typescript
interface LigneValeur {
  type: 'valeur'
  label: string
  
  /** Valeurs ponctuelles. Longueur = nombre de colonnes. */
  valeurs: CelluleValeur[]
}
```

**Exemple :** pour afficher f(x) en chaque antécédent
```typescript
ligneValeur('f(x)', [
  celluleValeur('0'),
  celluleValeur('4'),
  celluleValeur('0'),
])
```

## Intégration dans un exercice

### Approche 1 : Fonction helper simple

Pour un tableau en lecture seule (correction) :

```typescript
function creerTableauSignesVariations(
  config: TableauSVConfig,
  options: CreerTableauOptions = {},
): string
```

**Options :**
```typescript
interface CreerTableauOptions {
  numeroExercice?: number     // Utilisé dans l'ID du DOM
  numeroQuestion?: number     // Utilisé dans l'ID du DOM
  readonly?: boolean          // Tableau en lecture seule
  className?: string          // Classes CSS additionnelles
}
```

**Exemple :**
```typescript
const html = creerTableauSignes(config, {
  numeroExercice: 1,
  numeroQuestion: 0,
  readonly: true,  // Correction
})
```

### Approche 2 : Avec auto-correction automatique

Utilise `addTableauSignesVariations(exercice, questionIndex, options)` pour intégrer le tableau dans le système d'auto-correction :

```typescript
import { addTableauSignesVariations } from '@/lib/customElements/TableauSignesVariationsElement'

function generateur(numeroExercice: number): string {
  const config: TableauSVConfig = { /* ... */ }

  // En HTML : injecte le tableau + enregistre les attendus
  // En LaTeX : génère directement du tkz-tab
  return addTableauSignesVariations(this, 0, {
    config,
    className: 'mon-tableau', // CSS optionnel
    bareme: 10,               // Points totaux (optionnel)
  })
}
```

**Structure interne :**

Le système stocke les réponses attendues dans `exercice.autoCorrection[i].reponse.valeur.reponse.value` sous forme d'un JSON `{ cellId: expected, ... }`.

### Approche 3 : Accès direct au Web Component

Pour un contrôle fin :

```typescript
// Récupérer l'élément (id = `${elementTag}Ex${numeroExercice}Q${questionIndex}` sauf id explicite)
const el = document.getElementById('tableau-signes-variationsEx1Q0') as HTMLElement & {
  value: Record<string, string>
  effectiveValue: Record<string, string>
  config: TableauSVConfig | null
  showFeedback: (feedback: Record<string, 'ok' | 'ko'>) => void
  toLatex: () => string
}

// Lire la valeur actuelle
console.log(el.value)

// EffectiveValue inclut les valeurs initiales
console.log(el.effectiveValue)

// Appliquer du feedback
el.showFeedback({
  'L1C1': 'ok',
  'L1C3': 'ko',
})

// Exporter en LaTeX
const latex = el.toLatex()
```

## Système d'ID de cellules

Chaque cellule éditable est identifiée par une clé `L{ligne}C{colonne}`.

**Format :**
- `L0C{j}` : En-tête, antécédent de la colonne j
- `L{i}C{j}` : Ligne i (1-indexée), cellule j
- `L{i}C{j}R` : Limite à droite (discontinuité)
- `L{i}C{j}B` : Marqueur de barre (| ou ||)

**Exemple pour 3 colonnes, 2 lignes de contenu :**

```
         L0C0      L0C1      L0C2
          -∞        2         +∞
L1C0(vide) L1C1(-) L1C2(|) L1C3(+) L1C4(vide)    [Ligne de signes]

L2C0(val) L2C1(val) L2C2(val)                      [Ligne de variations]
L2C0(flèche) L2C1(flèche)
```

**Récupération dans la verification :**

```typescript
const actual = el.effectiveValue  // { L0C1: '2', L1C1: '-', L1C3: '+', ... }
const expected = { L0C1: '2', L1C1: '-', L1C3: '+' }

// Comparer cellule par cellule
for (const key of Object.keys(expected)) {
  const isOk = actual[key] === expected[key]
}
```

## Structure dynamique : ajout/suppression de colonnes et lignes

L'élève peut être autorisé à modifier la structure du tableau (nombre de colonnes et/ou de lignes) via deux propriétés de la config.

> Ces fonctionnalités n'apparaissent que si le tableau n'est pas en mode `readonly` ou `disabled`.

### Colonnes éditables

```typescript
const config: TableauSVConfig = {
  colonnesEditables: true,   // ← active les boutons +/− à droite du tableau
  colonnes: [
    { valeur: '-\\infty' },
    { valeur: '+\\infty' },  // toujours en dernière position
  ],
  lignes: [ /* ... */ ],
}
```

**Comportement :**
- `+` insère une nouvelle colonne vide en **avant-dernière** position : `+\infty` reste toujours le dernier antécédent.
- `−` supprime l'avant-dernière colonne (désactivé si ≤ 2 colonnes).
- Les valeurs déjà saisies dans les colonnes conservées sont préservées.
- Les clés de flèches dans les lignes de variations sont automatiquement remappées.

**Ne pas donner le nombre de colonnes :** pour que l'élève trouve lui-même les
antécédents (zéros, valeurs interdites…), montrer un tableau réduit aux bornes et
passer le tableau complet dans `configAttendue` : les attendus sont calculés sur
celui-ci. Les colonnes ajoutées par l'élève prennent, dans l'ordre, les positions
des colonnes du tableau complet. Le nombre de colonnes est aussi vérifié (clé
`nbColonnes` des attendus) : une colonne de trop compte faux.

```typescript
addTableauSignesVariations(this, i, {
  config: { colonnesEditables: true, colonnes: [bornes[0], bornes[1]], lignes: lignesReduites },
  configAttendue: configComplete,
  bareme: 3,
})
```

### Lignes éditables

```typescript
const config: TableauSVConfig = {
  lignesEditables: true,   // ← active les boutons +▾/− sous le tableau
  colonnes: [ /* ... */ ],
  lignes: [],              // peut démarrer vide
}
```

**Comportement :**
- `+▾` ouvre un menu avec trois choix : **Ligne de signes**, **Ligne de variations**, **Ligne de valeurs**.
- La nouvelle ligne est ajoutée en fin de tableau, avec toutes ses cellules éditables et vides.
- `−` supprime la dernière ligne (désactivé si le tableau est vide).
- Les deux options sont indépendantes : on peut activer l'une, l'autre, ou les deux.

### Exemple combiné

```typescript
const config: TableauSVConfig = {
  colonnesEditables: true,
  lignesEditables: true,
  colonnes: [
    { valeur: '-\\infty' },
    { valeur: '+\\infty' },
  ],
  lignes: [],
}
```

L'élève construit son tableau de zéro, en ajoutant d'abord des colonnes puis des lignes selon ses besoins.

### Réagir aux changements de structure

```typescript
el.addEventListener('column-change', (e: CustomEvent) => {
  // e.detail.config contient la nouvelle config complète
  sauvegarderConfig(e.detail.config)
})

el.addEventListener('ligne-change', (e: CustomEvent) => {
  const { action, type } = e.detail
  if (action === 'add') console.log(`Ligne "${type}" ajoutée`)
})
```

## Validation et feedback

### Feedback automatique

Le hook statique `TableauSignesVariationsElement.verifQuestion()` compare les réponses et colore chaque cellule. Il est appelé automatiquement par le pipeline générique des `MathaleaCustomElement` (`gestionInteractif.ts`, `Can.svelte`) :

```typescript
import TableauSignesVariationsElement from '@/lib/customElements/TableauSignesVariationsElement'

// Appelé lors de la vérification
const result = TableauSignesVariationsElement.verifQuestion(exercice, questionNumber)
// { isOk: false, feedback: '', score: { nbBonnesReponses: 7, nbReponses: 10 } }
```

**Comportement :**
- **Antécédents (L0C\*)** : comparaison mathématique (ex. `2` = `2.0` = `\frac{4}{2}`)
- **Autres (signes, flèches)** : égalité stricte

**Feedback visuel :**
- Vert clair : cellule correcte
- Rouge clair : cellule incorrecte
- L'élément devient `readonly` après vérification

### Barème proportionnel

Si un `bareme` est défini dans `addTableauSignesVariations` :

```typescript
nbBonnesReponses = round((correctCount / totalCount) * bareme)
nbReponses = bareme
```

## Exemples complets

### Exemple 1 : Signe d'un trinôme

```typescript
import { creerTableauSignes, celluleSigne } from '@/lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '@/lib/interactif/tableauSignesVariations/types'

export function trinome(): string {
  // f(x) = (x - 1)(2 - x), racines en 1 et 2
  const config: TableauSVConfig = {
    colonnes: [
      { valeur: '-\\infty' },
      { valeur: '1', editable: true, expected: '1' },
      { valeur: '2', editable: true, expected: '2' },
      { valeur: '+\\infty' },
    ],
    lignes: [{
      type: 'signe',
      label: 'f(x)',
      cellules: [
        celluleSigne(''),
        celluleSigne('-', { editable: true, expected: '-' }),
        celluleSigne('|'),
        celluleSigne('+', { editable: true, expected: '+' }),
        celluleSigne('|'),
        celluleSigne('-', { editable: true, expected: '-' }),
        celluleSigne(''),
      ],
    }],
  }

  return creerTableauSignes(config, {
    numeroExercice: 1,
    numeroQuestion: 0,
  })
}
```

### Exemple 2 : Tableau de variations avec discontinuité

```typescript
import {
  creerTableauVariations,
  ligneVariation,
  celluleValeur,
  celluleValeurDouble,
  celluleFleche,
} from '@/lib/interactif/tableauSignesVariations/helpers'

export function variationsDiscontinuite(): string {
  const config: TableauSVConfig = {
    variableName: 't',
    colonnes: [
      { valeur: '-\\infty' },
      { valeur: '0' },
      { valeur: '+\\infty' },
    ],
    lignes: [
      ligneVariation("f(t)", [
        celluleValeur('0'),
        celluleValeurDouble('1', '-1', { editable: true, expected: '1', expectedDroite: '-1' }),
        celluleValeur('0'),
      ], [
        celluleFleche('haut'),
        celluleFleche('interdite', { editable: true, expected: 'interdite' }),
        celluleFleche('bas'),
      ]),
    ],
  }

  return creerTableauVariations(config, {
    numeroExercice: 2,
    numeroQuestion: 0,
    readonly: false,
  })
}
```

### Exemple 3 : Intégration avec auto-correction

```typescript
import { IExercice } from '@/lib/interactif/types'
import TableauSignesVariationsElement, {
  addTableauSignesVariations,
  creerTableauSignes,
} from '@/lib/customElements/TableauSignesVariationsElement'
import { configCorrige } from '@/lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '@/lib/interactif/tableauSignesVariations/types'

export class MonExercice implements IExercice {
  numeroExercice: number
  
  constructor(numeroExercice: number) {
    this.numeroExercice = numeroExercice
  }

  generateur(): string {
    const config: TableauSVConfig = {
      colonnes: [
        { valeur: '-2' },
        { valeur: '1', editable: true, expected: '1' },
        { valeur: '+\\infty' },
      ],
      lignes: [{
        type: 'signe',
        label: "P(x)",
        cellules: [
          { symbole: '' },
          { symbole: '+', editable: true, expected: '+' },
          { symbole: '|' },
          { symbole: '-', editable: true, expected: '-' },
          { symbole: '' },
        ],
      }],
    }

    return addTableauSignesVariations(this, 0, {
      config,
      bareme: 10,
    })
  }

  correctionGenerateur(): string {
    const config: TableauSVConfig = { /* même config */ }
    const configCorrigee = configCorrige(config)

    return creerTableauSignes(configCorrigee, {
      numeroExercice: this.numeroExercice,
      numeroQuestion: 0,
      readonly: true,
    })
  }

  verification(): void {
    const result = TableauSignesVariationsElement.verifQuestion(this, 0)
    console.log(`Score: ${result.score.nbBonnesReponses}/${result.score.nbReponses}`)
  }
}
```

## API du Web Component

### Propriétés

| Propriété | Type | Description |
|-----------|------|-------------|
| `config` | `TableauSVConfig \| null` | Configuration du tableau (setter/getter) |
| `value` | `Record<string, string>` | État actuel (valeurs saisies) |
| `effectiveValue` | `Record<string, string>` | État avec fallback sur valeurs initiales |

### Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `toLatex()` | `() => string` | Exporte en code LaTeX tkz-tab |
| `showFeedback(feedback)` | `(Record<string, 'ok' \| 'ko'>) => void` | Colore les cellules selon le feedback |

### Attributs HTML

| Attribut | Type | Description |
|----------|------|-------------|
| `config` | string (JSON encodé) | Configuration du tableau |
| `value` | string (JSON encodé) | État courant |
| `disabled` | boolean | Désactive l'édition |
| `readonly` | boolean | Mode lecture seule |

### Événements

| Événement | Détail | Description |
|-----------|--------|-------------|
| `change` | `{ cellId, value, state }` | Une cellule a été modifiée |
| `column-change` | `{ action: 'add' \| 'remove', config }` | Une colonne a été ajoutée ou supprimée |
| `ligne-change` | `{ action: 'add' \| 'remove', type?, config }` | Une ligne a été ajoutée (`type` = `'signe'` \| `'variation'` \| `'valeur'`) ou supprimée |

**Utilisation :**
```typescript
el.addEventListener('change', (e: CustomEvent) => {
  const { cellId, value, state } = e.detail
  console.log(`Cellule ${cellId} = ${value}`)
})

el.addEventListener('column-change', (e: CustomEvent) => {
  const { action, config } = e.detail  // action = 'add' | 'remove'
  console.log(`Colonne ${action === 'add' ? 'ajoutée' : 'supprimée'}`, config)
})

el.addEventListener('ligne-change', (e: CustomEvent) => {
  const { action, type, config } = e.detail
  if (action === 'add') console.log(`Ligne de ${type} ajoutée`, config)
  else console.log('Ligne supprimée', config)
})
```

## Style CSS personnalisé

Le composant expose des variables CSS pour le thème :

```css
:root {
  --tab-sv-border: #444;                           /* Couleur des bordures */
  --tab-sv-cell-padding: 4px 8px;                  /* Padding des cellules */
  --tab-sv-toolbar-bg: #fff;                       /* Fond de la toolbar */
  --tab-sv-toolbar-color: #1a1a1a;                 /* Texte de la toolbar */
  --tab-sv-toolbar-shadow: 0 4px 12px rgba(...);   /* Ombre de la toolbar */
  --tab-sv-accent: #2563eb;                        /* Couleur d'accent */
}
```

## Points d'attention

### Structure des cellules de signes

Pour n colonnes, vous devez avoir exactement **2n - 1 cellules** :

```
Colonnes : A    B    C        (3 colonnes)
Cellules:  []  []  []  []  [] (5 cellules)
           sous A   entre AB  sous B   entre BC  sous C
           indice 0,2,4 = pairs (antécédents)
           indice 1,3 = impairs (intervalles)
```

Si vous oubliez une cellule, le tableau sera désaligné.

### Discontinuités (cellules doubles)

Utilisez `celluleValeurDouble` **et** `celluleFleche('interdite')` pour les points de discontinuité :

```typescript
valeurs: [
  celluleValeur('2'),
  celluleValeurDouble('1', '-1'),  // Saut
  celluleValeur('3'),
],
fleches: [
  celluleFleche('haut'),
  celluleFleche('interdite'),      // Discontinuité !
  celluleFleche('bas'),
],
```

### Export LaTeX

- Les antécédents et valeurs sont supposés être du LaTeX valide
- Utilisez des commandes : `\infty`, `\frac{a}{b}`, `\sqrt{x}`, etc.
- L'export utilise le package `tkz-tab` pour les tableaux de variations

### Export Typst

`TableauSignesVariationsElement.create()` détecte `context.isTypst` (vrai
pendant la régénération d'un exercice pour la [vue Typst](../../../../documentation/developpement/maintenance-moteur/exports/typst.md), alors même que
`context.isHtml` reste vrai) et retourne, au lieu du custom element, du code
Typst natif (package [`vartable`](https://typst.app/universe/package/vartable),
fonction `tabvar`) inséré tel quel via le marqueur `<mathalea-typst>` reconnu
par `htmlToTypst` (voir `src/components/setup/typst/latexToTypst.ts`).

- Le code est produit par `toTypst(config, state)` dans `typstExport.ts`,
  miroir de `toLatex()` (mêmes valeurs effectives via `resolveValues`, donc
  les mêmes cellules apparaissent vides dans un tableau « à compléter »).
- `latexFragmentToTypstMath` (interne à `typstExport.ts`) ne convertit qu'un
  sous-ensemble volontairement restreint de LaTeX (`\infty`, `\frac`/`\dfrac`,
  `\sqrt`, `\mathrm{e}`, `^{…}`/`_{…}`, `\pm`, `\times`, `\cdot`) : suffisant
  pour les antécédents/valeurs usuels d'un tableau de signes/variations, pas un
  convertisseur général (voir la limitation de couches ci-dessous). Une commande
  absente de cette liste ne compile pas ou s'affiche mal en Typst : l'y ajouter
  dès qu'un exercice en a besoin.
- Limitation architecturale volontaire : ce fichier vit dans
  `src/lib/interactif/` et ne doit pas importer `src/components/setup/typst/`
  (romprait la séparation des couches, entraînerait du code DOM-dépendant dans
  des contextes — tests unitaires notamment — où il n'a pas sa place). D'où le
  mini-convertisseur local plutôt qu'une réutilisation de `latexMathToTypst`.
- Limitations fonctionnelles : pas de rendu propre pour les lignes
  `type: 'valeur'` (pas d'équivalent natif dans `vartable`, actuellement sans
  incidence puisque ce type de ligne n'est pas exposé dans l'UI), pas de
  hachurage pour les flèches `'interdite'`, pas de discontinuité gérée sur
  l'antécédent extrême (première ou dernière colonne).
- Marqueurs de barre (`signeToVartableBar` dans `typstExport.ts`) : contrairement
  à l'export LaTeX (`signeToTkz`, où le marqueur tkz-tab `'z'` affiche toujours
  le zéro), `vartable` distingue barre simple (`'|'` → pas de zéro) et barre
  avec zéro (`'|0'` → zéro affiché), comme `SIGNE_DISPLAY` dans `render.ts`.
  Un mapping naïf (traiter `'|'` comme `'|0'`) affiche un zéro sur *toutes*
  les barres, y compris celles où l'antécédent est juste celui d'un autre
  facteur (bug corrigé — vérifié sur l'exercice démo : plus de zéro parasite
  ni dans l'énoncé (barres encore vides, jamais `'|0'`) ni dans le corrigé
  (`configCorrige`/`corrigeSigneSymbol` ne produit `'|0'` que pour un vrai zéro)).
- Lignes de signes : hauteur imposée à 9mm (`SIGN_ROW_HEIGHT` dans
  `typstExport.ts`, via le 2ᵉ élément du `label` de `vartable`) pour éviter
  le minimum par défaut de `vartable` (13,5mm), inutilement haut pour des
  cellules ne contenant qu'un symbole. Volontairement **pas** appliqué aux
  lignes de variations : leur hauteur code l'amplitude visuelle du zigzag
  haut/bas des flèches, qu'une hauteur imposée trop petite aplatit au point
  de rendre les sens indiscernables (vérifié empiriquement) ; ces lignes
  gardent donc la hauteur automatique de `vartable`.
- Tableau « à compléter » (élève) : si aucune flèche de variation n'a de
  sens renseigné (`hasAnyFlecheSens` dans `typstExport.ts`), les flèches
  sont masquées (`arrow-mark`/`arrow-style`) — sinon `vartable` trace par
  défaut une flèche horizontale entre deux valeurs sans sens connu, ce qui
  donnerait à tort l'impression que le sens de variation est déjà indiqué.
  Le corrigé (`configCorrige`, qui remplit les flèches attendues) n'est pas
  concerné et affiche les flèches normalement.

### Comparaison mathématique des antécédents

Les antécédents (L0C*) sont comparés via `fonctionComparaison`, qui normalise les expressions mathématiques. Cela signifie :
- `2` = `2.0` = `\frac{4}{2}`
- Tous les autres types de cellules (signes, flèches, valeurs) utilisent l'égalité stricte

## Dépannage

### Le tableau n'affiche rien

1. Vérifier que `config` est bien défini et non null
2. Vérifier que le nombre de cellules correspond à 2n-1 pour une ligne de signes
3. Vérifier la console pour les erreurs de parsing JSON

### Les cellules ne sont pas alignées

- Vérifier que toutes les lignes ont le même nombre de colonnes
- Pour les signes : vérifier 2n-1 cellules exactement
- Pour les variations : n valeurs et n-1 flèches

### Le feedback ne s'affiche pas

- Vérifier que les IDs de cellules dans `feedback` correspondent aux cellules du tableau
- Vérifier que `readonly` n'est pas activé (sinon le feedback n'a pas d'effet visuel)

### Export LaTeX vide

- Vérifier que le composant est initialisé (connecté au DOM)
- Vérifier que `config` n'est pas null
- Vérifier que les valeurs ne contiennent pas de caractères non-échappés

## Ressources

- **Web Components** : https://developer.mozilla.org/en-US/docs/Web/API/Web_Components
- **MathLive** : https://cortexjs.io/mathlive/ (pour l'édition mathématique)
- **tkz-tab** : https://ctan.org/pkg/tkz-tab (pour l'export LaTeX)
