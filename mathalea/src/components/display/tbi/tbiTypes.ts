import type { IExercice } from '../../../lib/types'

export type {
  TbiCorrectionDetail,
  TbiCorrectionMode,
} from '../../../lib/stores/tbiStore'

/**
 * Contenu d'une ressource statique (annale scannée, banque externe) affichée
 * dans la vue TBI comme de simples images, faute d'énoncé rejouable.
 */
export interface TbiStaticContent {
  /** Images de l'énoncé (une seule le plus souvent) */
  png: string[]
  /** Images de la correction, éventuellement vide */
  pngCor: string[]
  /** Titre lisible de la ressource (ex. « DNB juin 2023 Métropole Ex 3 ») */
  title: string
}

/**
 * Un exercice affiché dans la vue TBI.
 * - `exercise` porte l'énoncé rejouable des exercices dynamiques.
 * - `staticContent` porte les images d'une ressource statique.
 * - les deux sont `null` pour une ressource réellement non prise en charge
 *   (exercice svelte, uuid statique introuvable).
 */
export interface TbiItem {
  exercise: IExercice | null
  staticContent: TbiStaticContent | null
  paramsIndex: number
  uuid: string
  id: string
  /** Identité stable de l'item (clé de rendu, survit aux réordonnancements) */
  key: number
}

/** Un onglet tel qu'il est nommé partout dans la vue */
export interface TbiTabEntry {
  id: string
  label: string
}

/** Position et taille d'un outil, à l'issue d'un déplacement ou d'un redimensionnement */
export interface TbiToolGeometry {
  x: number
  y: number
  w: number
  /** Absente d'un outil dont la hauteur suit le contenu */
  h?: number
}

/** Commandes communes que `TbiToolsLayer` donne au cadre de chaque outil */
export interface TbiToolFrameProps {
  chromeVisible: boolean
  hidden: boolean
  pinned: boolean
  onTogglePin: () => void
  onCommit: (geometry: TbiToolGeometry) => void
  onClose: () => void
  onFront: (event: PointerEvent) => void
  /** Sauvegarde locale, à appeler après un changement de réglage de l'outil */
  persistLayout?: () => void
}
