import type { OptionsForQcmAmc, TypeKeys } from '../amc/amcTypes'
import type { InterfaceParams } from '../types'

/**
 * Types partagés de la lecture optique de marques (OMR) : description d'une
 * évaluation papier produite par MathALÉA, et résultats de son analyse.
 *
 * Tout le traitement se fait dans le navigateur du professeur : ni le sujet,
 * ni la liste des élèves, ni les copies scannées ne sortent du poste.
 */

/** Point 2D. Selon le contexte : fraction de page (0 à 1) ou pixels. */
export interface Point {
  x: number
  y: number
}

/**
 * Image en niveaux de gris, 1 octet par pixel (0 = noir, 255 = blanc).
 * Volontairement indépendante de `ImageData` pour rester testable sous Node
 * et jsdom, où le canevas n'existe pas.
 */
export interface GrayImage {
  width: number
  height: number
  data: Uint8Array
}

/**
 * Une case à cocher, telle que publiée par la compilation Typst.
 * Les coordonnées sont en **fraction de page** (0 à 1) : elles restent
 * valables quelle que soit la résolution de numérisation.
 */
export interface OmrBox {
  /** Identifiant unique de la case dans le document */
  id: string
  /** Question à laquelle la case se rattache (voir `OmrQuestion.qid`) */
  qid: string
  /** Numéro de page, à partir de 1 */
  page: number
  x: number
  y: number
  w: number
  h: number
  /** Vrai si cocher cette case est la bonne réponse */
  correct: boolean
  /** Pour AMCNum : le chiffre (ou le signe) que cette case code */
  valeur?: string
}

/** Une question du sujet, avec son barème. */
export interface OmrQuestion {
  qid: string
  /** Index de l'exercice dans le sujet, à partir de 0 */
  exercice: number
  /** Index de la question dans l'exercice, à partir de 0 */
  question: number
  type: TypeKeys
  points: number
  bareme?: OptionsForQcmAmc['bareme']
}

/** Une copie nominative : un élève, une version du sujet. */
export interface OmrCopie {
  /** Identifiant court porté par le QR-code de chaque page */
  copieId: string
  eleve: { id: string; nom: string }
  /** Clé dans `OmrEvaluation.layouts` */
  layoutId: string
  /**
   * Rangs physiques, dans le PDF imprimé, des pages de cette copie, dans
   * l'ordre. C'est ce que porte le QR-code ; l'indice dans ce tableau donne le
   * rang de la page *dans la copie*, celui qu'utilise le layout.
   */
  pages: number[]
}

/**
 * Le fichier d'accompagnement téléchargé avec le PDF (`.mathalea-eval.json`).
 * Il contient les positions des cases, le corrigé, le barème et la liste des
 * élèves : c'est une donnée personnelle, elle reste sur le poste du professeur.
 */
export interface OmrEvaluation {
  version: 1
  sujet: {
    titre: string
    checkSum: string
    exercicesParams: InterfaceParams[]
  }
  /** Dimensions de la page en points PostScript (A4 : 595,28 × 841,89) */
  page: { widthPt: number; heightPt: number }
  /**
   * Centres des 4 marqueurs de calage, en fraction de page, dans l'ordre
   * haut-gauche, haut-droit, bas-droit, bas-gauche.
   */
  reperes: [Point, Point, Point, Point]
  /** Un jeu de cases par version de sujet */
  layouts: Record<string, OmrBox[]>
  copies: OmrCopie[]
  questions: OmrQuestion[]
}

/** Statut de lecture d'une case. */
export type OmrBoxStatus = 'vide' | 'cochee' | 'ambigue'

/** Résultat de lecture d'une case. */
export interface OmrBoxReading {
  id: string
  /** Proportion de pixels sombres à l'intérieur de la case, de 0 à 1 */
  darkness: number
  status: OmrBoxStatus
}

/** Résultat de l'analyse d'une page scannée. */
export interface OmrPageResult {
  copieId: string
  /** Rang de la page dans la copie, à partir de 1 */
  page: number
  /** Faux si le recalage a échoué : la page est à reprendre à la main */
  recalage: boolean
  lectures: OmrBoxReading[]
}
