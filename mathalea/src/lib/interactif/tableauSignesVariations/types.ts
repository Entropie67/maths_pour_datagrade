// Types pour le custom element <tableau-signes-variations>
// Tableau de signes / variations interactif avec export tkz-tab.

export type SigneSymbol = '+' | '-' | '0' | '|' | '||' | '|0' | '||0' | ''

export type SensFleche = 'haut' | 'bas' | 'interdite' | ''

export interface ColonneConfig {
  /** Antécédent (LaTeX), ex. '-\\infty', '0', '2', '+\\infty'. */
  valeur: string
  /** Met la valeur en évidence dans un tableau de correction. */
  highlight?: boolean
  /** Si true, l'élève peut modifier l'antécédent lui-même. */
  editable?: boolean
  /** Réponse attendue pour la cellule d'antécédent. */
  expected?: string
  /** Configuration du clavier MathLive pour cette cellule. */
  clavier?: string
}

export interface CelluleSigne {
  symbole: SigneSymbol
  /** Met le signe en évidence dans un tableau de correction. */
  highlight?: boolean
  editable?: boolean
  expected?: SigneSymbol
}

export interface CelluleFleche {
  sens: SensFleche
  /** Met la flèche en évidence dans un tableau de correction. */
  highlight?: boolean
  editable?: boolean
  expected?: SensFleche
}

export interface CelluleValeur {
  /** Contenu LaTeX (valeur unique, ou limite à gauche d'une discontinuité). */
  latex: string
  /** Met la valeur en évidence dans un tableau de correction. */
  highlight?: boolean
  /** Limite à droite d'une discontinuité. Si défini, la cellule affiche deux valeurs. */
  latexDroite?: string
  editable?: boolean
  expected?: string
  /** Réponse attendue pour la valeur droite (si latexDroite). */
  expectedDroite?: string
  /** Configuration du clavier MathLive (cf. buildDataKeyboardFromStyle). */
  clavier?: string
}

/**
 * Ligne de signes.
 * `cellules.length === 2 * colonnes.length - 1`
 *  - indices pairs (0, 2, 4...) : cellules d'antécédent → '|', '||', ''
 *  - indices impairs (1, 3, 5...) : cellules d'intervalle (entre antécédents) → '+', '-'
 */
export interface LigneSigne {
  type: 'signe'
  label: string
  labelEditable?: boolean
  cellules: CelluleSigne[]
}

/**
 * Ligne de variations.
 * `valeurs.length === colonnes.length` : valeurs de f aux antécédents
 * `fleches.length === colonnes.length - 1` : sens de variation entre deux antécédents
 */
export interface LigneVariation {
  type: 'variation'
  label: string
  labelEditable?: boolean
  valeurs: CelluleValeur[]
  fleches: CelluleFleche[]
}

/**
 * Ligne de valeurs ponctuelles (par exemple les images f(x)).
 * `valeurs.length === colonnes.length`
 */
export interface LigneValeur {
  type: 'valeur'
  label: string
  labelEditable?: boolean
  valeurs: CelluleValeur[]
}

export type Ligne = LigneSigne | LigneVariation | LigneValeur

export interface TableauSVConfig {
  /** Nom de la variable, par défaut 'x'. */
  variableName?: string
  colonnes: ColonneConfig[]
  lignes: Ligne[]
  /**
   * Couleur (`#RRGGBB`) de tout le tableau : traits et textes. Sert pour une
   * réponse courte, par exemple `orangeMathalea` (voir `minimalCorrection.ts`).
   */
  couleur?: string
  /** Autorise l'élève à ajouter/supprimer des colonnes (antécédents). Défaut : false. */
  colonnesEditables?: boolean
  /** Autorise l'élève à ajouter/supprimer des lignes. Défaut : false. */
  lignesEditables?: boolean
}

/**
 * État courant d'un tableau (saisies de l'élève).
 * Clé : `L{i}C{j}` (ligne 0 = en-tête de colonnes, j = index de cellule de la ligne)
 * Clé droite : `L{i}C{j}R` pour la limite à droite d'une discontinuité
 * Valeur : selon le type de cellule
 *   - signe : SigneSymbol
 *   - flèche : SensFleche
 *   - valeur : string LaTeX
 */
export type TableauSVValue = Record<string, string>

export type ToolbarMode =
  | 'signe'
  | 'variation'
  | 'valeur'
  | 'valeurDroite'
  | 'barre'
  | 'valeurBarree'
  | 'signeBarree'
  | null

export interface ActiveCellInfo {
  cellId: string
  mode: ToolbarMode
  ligneIndex: number
  cellIndex: number
  /** Configuration du clavier MathLive pour la cellule (cf. buildDataKeyboardFromStyle). */
  clavier?: string
  secondaryCellId?: string
}
