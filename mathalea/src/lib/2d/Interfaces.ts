/**
 * Interfaces pour typer les objets 2D sans importer les classes complètes.
 * Utiliser `import type { IRepere, IAxes, ... } from '../lib/2d/Interfaces'`
 * pour éviter les dépendances circulaires runtime.
 */

import type { NestedObjetMathalea2dArray } from '../../types/2d'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'

/**
 * Interface minimale pour Repere
 */
export interface IRepere {
  xUnite: number
  yUnite: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  grilleXMin: number
  grilleXMax: number
  grilleYMin: number
  grilleYMax: number
  objets?: any[]
  bordures?: [number, number, number, number]

  svg?(coeff: number): string
  tikz?(): string
  svgml?(coeff: number, amp: number): string
  tikzml?(amp: number): string
  addObjet?(objet: any): void
  trace?(): any[]
}

/**
 * Interface minimale pour Axes
 */
export interface IAxes {
  xUnite: number
  yUnite: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xThickListe?: number[]
  yThickListe?: number[]
  xLabelListe?: string[]
  yLabelListe?: string[]
  xThickDistance?: number
  yThickDistance?: number
  xLegende?: string
  yLegende?: string
  axeXStyle?: string
  axeYStyle?: string
  pointTaille?: number
  labelsPerpendiculaires?: boolean

  svg?(coeff: number): string
  tikz?(): string
}

/**
 * Interface minimale pour DroiteGraduee
 */
export interface IDroiteGraduee {
  axeStyle?: string
  pointTaille?: number
  labelDistance?: number
  Unite?: number
  Min?: number
  Max?: number
  thickListe?: number[]
  thickOffset?: number
  thickDistance?: number
  thickColor?: string
  labelListe?: string[]
  labelsPerpendiculaires?: boolean
  step1?: number
  step2?: number

  svg?(coeff: number): string
  tikz?(): string
}

/**
 * Interface minimale pour Droite
 */
export interface IDroite extends ObjetMathalea2D {
  x1: number
  x2: number
  y1: number
  y2: number
  a: number
  b: number
  c: number
  pente: number
  angleAvecHorizontale: number
  nom: string
  normal?: { x: number; y: number }
  directeur?: { x: number; y: number }
  stringColor?: string
  color: [string, string]
  epaisseur: number
  opacite: number
  pointilles: number
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
  svgml?(coeff: number, amp: number): string
  tikzml?(amp: number): string
}

/**
 * Interface minimale pour Grille
 */
export interface IGrille {
  xUnite: number
  yUnite: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xDistance?: number
  yDistance?: number
  opacite?: number
  couleur?: string
  pointilles?: number

  svg?(coeff: number): string
  tikz?(): string
}

/**
 * Interface minimale pour LectureImage
 */
export interface ILectureImage {
  xUnite: number
  yUnite: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  grilleXMin: number
  grilleXMax: number
  grilleYMin: number
  grilleYMax: number

  svg?(coeff: number): string
  tikz?(): string
}
/**
 * Interface minimale pour PointAbstrait
 */
export interface IPointAbstrait {
  nom: string
  x: number
  y: number
  positionLabel?: string
  bordures?: [number, number, number, number]
  typeObjet?: string

  xSVG?(coeff: number): number
  ySVG?(coeff: number): number
}

/**
 * Interface minimale pour Point (étend IPointAbstrait)
 */
export interface IPoint extends IPointAbstrait {
  estDansPolygone?(p: any): boolean
  estDansTriangle?(A: IPoint, B: IPoint, C: IPoint): boolean
  estDansPolygoneConvexe?(p: any): boolean
  estDansQuadrilatere?(A: IPoint, B: IPoint, C: IPoint, D: IPoint): boolean
  estSur?(objet: any): boolean
  svg?(coeff: number): string
  tikz?(): string
}

/**
 * Interface minimale pour Plot
 */
export interface IPlot {
  couleurDeRemplissage: string[]
  rayon: number
  x: number
  y: number
  opaciteDeRemplissage: number
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
}

/**
 * Interface minimale pour TracePoint
 */
export interface ITracePoint {
  taille: number
  tailleTikz: number
  points: any[]
  couleurDeRemplissage?: string[]
  epaisseur: number
  opacite: number
  style: string
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
}

/**
 * Interface minimale pour TracePointSurDroite
 */
export interface ITracePointSurDroite {
  lieu: IPoint
  taille: number
  x: number
  y: number
  direction: IPoint
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
}

/**
 * Interface minimale pour Mediatrice
 */
export interface IMediatrice {
  couleurMediatrice?: string
  epaisseurMediatrice?: number
  opaciteMediatrice?: number
  pointillesMediatrice?: number
  couleurConstruction?: string
  color: [string, string]
  epaisseur: number
  opacite: number
  pointilles: number
  objets: any[]
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number, amp: number): string
  tikzml(amp: number): string
}

/**
 * Interface minimale pour Cercle
 */
export interface ICercle {
  centre: IPointAbstrait
  rayon: number
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  hachures?: string
  couleurDesHachures: string[]
  epaisseurDesHachures: number
  distanceDesHachures: number
  color: [string, string]
  epaisseur: number
  pointilles: number
  opacite: number
  style: string
  bordures: [number, number, number, number]

  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number): string
  tikzml(amp: number): string
}

/**
 * Interface minimale pour Segment
 */
export interface ISegment {
  x1: number
  y1: number
  x2: number
  y2: number
  extremite1: IPointAbstrait
  extremite2: IPointAbstrait
  longueur: number
  angleAvecHorizontale: number
  tailleExtremites: number
  styleExtremites: string
  color: [string, string]
  epaisseur: number
  pointilles: number
  opacite: number
  style: string
  bordures: [number, number, number, number]
  typeObjet?: string

  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number, amp: number): string
  tikzml(amp: number): string
  estSecant(objet: any): boolean
}
/**
 * Interface minimale pour Vecteur
 */
export interface IVecteur {
  nom: string
  x: number
  y: number

  norme(): number
  oppose(): void
  xSVG(coeff: number): number
  ySVG(coeff: number): number
}
/**
 * Interface minimale pour Polygone
 */
export interface IPolygone extends ObjetMathalea2D {
  listePoints: PointAbstrait[]
  nom: string
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  couleurDesHachures: string[]
  distanceDesHachures: number
  epaisseurDesHachures: number
  hachures: boolean | string
  perimetre: number
  color: [string, string]
  epaisseur: number
  pointilles: number
  opacite: number
  style: string
  bordures: [number, number, number, number]
  typeObjet?: string
  aire?: number
  triangulation: [IPointAbstrait, IPointAbstrait, IPointAbstrait][]

  binomesXY(coeff: number): string
  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number, amp: number): string
  tikzml(amp: number): string
}

export type CylindrePosition =
  | 'DeboutVuDessus'
  | 'baseAvantCoucheVuGauche'
  | 'baseCoteCoucheVuDroite'

export interface IPave extends ObjetMathalea2D {
  svg(coeff: number): string
  tikz(): string
}

export interface IEllipse extends ObjetMathalea2D {
  centre: IPoint
  rx: number
  ry: number
  couleurDeRemplissage: [string, string]
  opaciteDeRemplissage: number

  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number, amp: number): string
  tikzml(amp: number): string
}

export interface ISemiEllipse extends ObjetMathalea2D {
  centre: IPoint
  rx: number
  ry: number
  rayon: boolean
  hachures: string | boolean
  couleurDeRemplissage: [string, string]
  opaciteDeRemplissage: number
  couleurDesHachures: [string, string]
  epaisseurDesHachures: number
  distanceDesHachures: number
  M: IPoint
  N: IPoint
  angle: number
  large: number
  sweep: number
  anglesAxe: number

  svg(coeff: number): string
  tikz(): string
  svgml(coeff: number, amp: number): string
  tikzml(amp: number): string
}

export interface ICone extends ObjetMathalea2D {
  sommet: IPoint
  centre: IPoint
  couleurDeRemplissage: string
  opaciteDeRemplissage: number
  stringColor: string

  svg(coeff: number): string
  tikz(): string
}

export interface ISphere2d extends ObjetMathalea2D {
  centre: IPoint
  couleurDeRemplissage: string
  opaciteDeRemplissage: number

  svg(coeff: number): string
  tikz(): string
}

export interface ICylindre extends ObjetMathalea2D {
  centre: IPoint
  centre2: IPoint
  couleurDeRemplissage: string
  opaciteDeRemplissage: number
  stringColor: string

  svg(coeff: number): string
  tikz(): string
}

// Objets 3D projetés (mapping vers les interfaces 2D)

// Point 3D projeté en 2D
export interface IPoint3d {
  x: number
  y: number
  z: number
  isVisible: boolean
  label: string
  typeObjet: string
  c2d: IPoint
}

// Vecteur 3D projeté en 2D
export interface IVecteur3d {
  x: number
  y: number
  z: number
  matrice: any
  norme: number
  c2d: IVecteur
  representant: (A: IPoint3d) => ISegment
}

// Arête 3D projetée en 2D
export interface IArete3d {
  extremite1: IPoint3d
  extremite2: IPoint3d
  color: string
  isVisible: boolean
  c2d: ISegment
}

// Droite 3D projetée en 2D
export interface IDroite3d {
  directeur: IVecteur3d
  origine: IPoint3d
  point: unknown
  c2d: IDroite
}

// Polygone 3D projeté en 2D
export interface IPolygone3d {
  listePoints: IPoint3d[]
  color: string
  listePoints2d: IPoint[]
  aretes: IArete3d[]
  c2d: ISegment[]
}

type Coord3d = [number, number, number, string]
export interface IVisualPattern3D {
  shape?: IShape3D
  shapes: string[]
  prefixId?: string
  type: 'iso' | 'full3D'
  cells: Set<string>
  hasCell(x: number, y: number, z: number, shape: string): boolean
  iterate3d(n: number): Set<string>
  update3DCells(n: number): Coord3d[]
  getShapeOfCell(cell: string): string
  render3d(n: number): string
  render(
    n: number,
    dx: number,
    dy: number,
    angle: number,
  ): NestedObjetMathalea2dArray // ← Changement ici
  print(): string
}

/**
 * Interface pour les paramètres du constructeur
 */
export interface VisualPattern3DOptions {
  /**
   * Cellules initiales du motif
   */
  initialCells: Coord3d[] | string[] | Set<string>

  /**
   * Préfixe pour les identifiants
   */
  prefixId: string

  /**
   * Formes utilisées pour les cellules
   */
  shapes: string[]

  /**
   * Type de rendu
   */
  type: 'iso' | 'full3D'
}
export interface IShape3D {
  shapeId: string
  codeSvg: string
  codeTikz: string
  x: number
  y: number
  angle: number
  scale: number
  width: number // largeur en cm
  height: number // hauteur en cm
  pixelsParCm: number
  bordures: [number, number, number, number] // [xmin, ymin, xmax, ymax]
  opacite: number

  svg(coeff: number): string
  tikz(): string
  updateBordures(): void
  dilate(factor: number): void
  clone(x: number, y: number, z: number, angle: number): IShape3D
}
