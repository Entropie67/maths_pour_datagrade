import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import type { Shape2D } from '../Figures2D'
import { listeEmojisInfos } from '../figures2d/listeEmojis'
import {
  listeShapes2DInfos,
  type ShapeInfos,
  type ShapeName,
} from '../figures2d/shapes2d'

type CellsOptions = {
  scale?: number // échelle de la forme
  rotate?: number // angle de rotation de la forme
  translate?: [number, number] // translation de la forme
}
type Coord = [number, number, ShapeName?, CellsOptions?] // Coordonnées sous forme de tableau de deux nombres, avec un troisième élément optionnel pour la forme à y mettre
/**
 * @author Jean-claude Lhote
 *
 */

export class VisualPattern {
  shapes: ShapeName[] // forme par défaut, utilisée pour les cellules sans forme spécifique
  cells: Set<string> // ce sont des coordonnées sous forme de chaîne de caractères "x,y" car les ensembles ne peuvent pas contenir d'objets complexes comme des tableaux
  // on utilise un ensemble pour stocker les cellules, ce qui permet d'éviter les doublons et de faciliter la vérification de la présence d'une cellule
  // et la conversion en chaîne de caractères permet de les stocker efficacement dans un ensemble

  constructor(
    initialCells: Coord[] | string[] | Set<string>,
    shapes?: ShapeName[],
  ) {
    if (initialCells instanceof Set) {
      // si initialCells est déjà un Set, on l'utilise directement
      this.cells = initialCells
    } else if (Array.isArray(initialCells)) {
      if (typeof initialCells[0] === 'string') {
        // si initialCells est déjà un tableau de chaînes de caractères, on le convertit en Set directement
        this.cells = new Set(initialCells as string[])
      } else if (Array.isArray(initialCells[0]) && initialCells[0].length > 2) {
        // si initialCells est un tableau de coordonnées, on les convertit en chaînes de caractères
        // en utilisant la méthode coordToKey
        this.cells = new Set(
          (initialCells as Coord[]).map(VisualPattern.coordToKey),
        )
      } else if (initialCells.length === 0) {
        this.cells = new Set()
      } else {
        throw new Error(
          'initialCells must be an array of coordinates or strings',
        )
      }
      // on initialise l'ensemble des cellules avec les coordonnées initiales
    } else {
      throw new Error(
        'initialCells must be a Set, an array of coordinates or an array of strings',
      )
    }
    if (
      shapes == null ||
      shapes.length === 0 ||
      !(
        Object.keys(listeShapes2DInfos).includes(shapes[0]) ||
        Object.keys(listeEmojisInfos).includes(shapes[0])
      )
    ) {
      this.shapes = ['carré']
    } else {
      this.shapes = []

      for (const shape of shapes) {
        if (
          !Object.keys(listeShapes2DInfos).includes(shape) &&
          !Object.keys(listeEmojisInfos).includes(shape)
        ) {
          throw new Error(
            `VisualPattern: la forme ${shape} n'existe pas dans la liste des formes`,
          )
        }
        this.shapes.push(shape)
      }

      if (this.shapes.length === 0) {
        throw new Error(
          "VisualPattern: aucune forme demandée n'existe pas dans la liste des formes",
        )
      }
    }
  }

  hasCell(
    x: number,
    y: number,
    shape: ShapeName,
    options: CellsOptions,
  ): boolean {
    return this.cells.has(VisualPattern.coordToKey([x, y, shape, options]))
  }

  iterate(this: VisualPattern, _n?: number): Set<string> {
    return this.cells // cette méthode doit être modifiée pour créer un motif changeant.
  }

  static coordToKey(coord: Coord): string {
    let shape: string
    let options:
      | { scale?: number; rotate?: number; translate?: [number, number] }
      | undefined = {} // on initialise les options à undefined
    if (coord.length === 2)
      shape = 'carré' // si la forme n'est pas précisée, on utilise 'carré' par défaut
    else shape = coord[2] ?? 'carré' // sinon on utilise la forme spécifiée
    if (coord.length === 4) {
      options = coord[3] ?? {} // si les options ne sont pas spécifiées, on utilise un objet vide
    }
    return `${coord[0]};${coord[1]};${shape};${JSON.stringify(options)}` // on utilise une chaîne de caractères pour représenter les coordonnées
  }

  static keyToCoord(key: string): Coord {
    const [x, y, shape, options] = key.split(';')
    const coordOptions = options ? JSON.parse(options) : {}
    return [Number(x), Number(y), (shape ?? 'carré') as ShapeName, coordOptions] // on utilise le type ShapeName pour le troisième élément
  }

  render(n: number, dx: number, dy: number): NestedObjetMathalea2dArray {
    let cells: Set<string> = this.cells
    const newPattern = new VisualPattern(cells, this.shapes)
    newPattern.iterate = this.iterate.bind(newPattern)
    cells = newPattern.iterate(n)
    if (cells.size === 0) {
      return []
    }
    if (cells.size > 1000) {
      console.warn(
        "PatternNumerique: le motif contient plus de 1000 cellules, l'affichage peut être long",
      )
    }
    if (cells.size > 10000) {
      console.warn(
        "PatternNumerique: le motif contient plus de 10000 cellules, l'affichage peut être très long",
      )
    }
    if (cells.size > 100000) {
      console.warn(
        "PatternNumerique: le motif contient plus de 100000 cellules, l'affichage peut être très très long",
      )
    }
    const objets: (Shape2D | undefined)[] = []
    for (const cell of cells) {
      const [x, y, shape, options] = VisualPattern.keyToCoord(cell)
      /*  if (x < 0 || y < 0) {
        throw new Error('PatternNumerique: les coordonnées doivent être positives')
      }
        */
      const isEmoji = 'unicode' in listeShapes2DInfos[shape ?? '']
      const isInListeShapes = 'shape2D' in listeShapes2DInfos[shape ?? '']
      if (!isEmoji && !isInListeShapes) {
        throw new Error(
          `PatternNumerique: la forme ${shape} n'existe pas dans la liste des formes`,
        )
      }

      const shape2d = isInListeShapes
        ? (listeShapes2DInfos[shape ?? 'carré'] as ShapeInfos).shape2D
        : isEmoji
          ? listeShapes2DInfos[shape ?? 'soleil'].shapeDef
          : (listeShapes2DInfos['carré'] as ShapeInfos).shape2D

      if (!shape2d) {
        throw new Error(`PatternNumerique: la forme ${shape} n'existe pas`)
      }
      const newShape = (shape2d as Shape2D).clone()
      const scale = options?.scale ?? 1 // on utilise l'échelle spécifiée ou 1 par défaut
      newShape.angle = options?.rotate ?? 0 // on utilise l'angle de rotation spécifié ou 0 par défaut
      const translate = options?.translate ?? [0, 0] // on utilise la translation
      newShape.y = y + dy + translate[1]
      newShape.x = x + dx + translate[0]
      newShape.scale = { x: scale, y: scale }

      newShape.updateBordures()
      objets.push(newShape)
    }
    if (objets.some((obj) => obj === undefined || !obj.tikz || !obj.svg)) {
      throw new Error(
        `PatternNumerique: un des objets est indéfini, vérifiez les formes utilisées dans le motif : ${this.print()}`,
      )
    }
    return objets.filter((obj): obj is Shape2D => obj !== undefined)
  }

  print(): string {
    return Array.from(this.cells).join(';')
  }
}
