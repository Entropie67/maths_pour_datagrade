import type { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import type { PartialKbType } from '../lib/interactif/claviers/keyboard'
import type { IExercice } from '../lib/types'

// Types purs pour la couche 2D — ce fichier doit rester sans import runtime
export type ObjetDivLatex = {
  x: number
  y: number
  orientation: number
  opacity: number
  backgroundColor: string
  color: string
  latex: string
  letterSize: string
  gras: boolean
  /** marge intérieure (en px) autour du texte, utile avec un fond coloré */
  padding?: number
  /** couleur d'un fin cadre arrondi autour du texte (HTML uniquement) */
  bordure?: string
  bordures: [number, number, number, number]
}

export type MetaInteractif2dInputs = {
  x: number
  y: number
  content: string
  classe?: string | PartialKbType
  blanc: string
  opacity: number
  index?: number
}[]

export type MetaInteractif2dData = {
  exercice: IExercice
  question: number
  inputs: MetaInteractif2dInputs
}

// Type récursif décrivant la structure des tableaux d'objets 2D.
// On utilise l'interface ObjetMathalea2D (type-only) pour conserver un typage
// significatif sans introduire d'import runtime.
export type NestedObjetMathalea2dArray = (
  | ObjetMathalea2D
  | ObjetDivLatex
  | NestedObjetMathalea2dArray
)[]
