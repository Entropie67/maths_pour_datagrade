import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import type { Elements3DDescription } from '../../3d/3d_dynamique/Canvas3DElement'
import { Shape3D, shapeCubeIso } from '../figures2d/Shape3d'
import { rangeCubes } from './patternsPreDef'

type Coord3d = [number, number, number, string]
/**
 * @author Jean-claude Lhote
 *
 */

function filterCells(cells: Set<string>): Set<string> {
  function hasAllNeightbors(cell: string, cells: Set<string>): boolean {
    const [x, y, z] = cell.split(';').map(Number)
    // Vérifie si toutes les cellules voisines sont présentes
    return (
      cells.has(`${x + 1};${y};${z}`) &&
      cells.has(`${x};${y - 1};${z}`) &&
      cells.has(`${x};${y};${z + 1}`)
    )
  }
  const filteredCells = new Set<string>()
  for (const cell of cells) {
    if (!hasAllNeightbors(cell, cells)) {
      // Si la cellule a tous ses voisins, on la supprime
      filteredCells.add(cell)
    }
  }
  return filteredCells
}

export class VisualPattern3D {
  shape?: Shape3D
  shapes: string[] // formes utilisées pour les cellules
  prefixId?: string
  type: 'iso' | 'full3D'
  cells: Set<string> // ce sont des coordonnées sous forme de chaîne de caractères "x,y" car les ensembles ne peuvent pas contenir d'objets complexes comme des tableaux
  // on utilise un ensemble pour stocker les cellules, ce qui permet d'éviter les doublons et de faciliter la vérification de la présence d'une cellule
  // et la conversion en chaîne de caractères permet de les stocker efficacement dans un ensemble

  constructor({
    initialCells,
    prefixId,
    shapes,
    type,
  }: {
    initialCells: Coord3d[] | string[] | Set<string>
    prefixId: string
    shapes: string[]
    type: 'iso' | 'full3D'
  }) {
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
          (initialCells as Coord3d[]).map(VisualPattern3D.coordToKey),
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
    this.type = type
    this.shapes = shapes == null ? ['cube'] : shapes
    this.prefixId = prefixId
  }

  hasCell(x: number, y: number, z: number, shape: string): boolean {
    return this.cells.has(VisualPattern3D.coordToKey([x, y, z, shape]))
  }

  iterate3d(this: VisualPattern3D, n: number): Set<string> {
    return this.cells // cette méthode doit être modifiée pour créer un motif changeant.
  }

  static coordToKey(coord: Coord3d): string {
    return `${coord[0]};${coord[1]};${coord[2]};${String(coord[3])}`
  }

  static keyToCoord(key: string): Coord3d {
    const [x, y, z, shape] = key.split(';')
    return [Number(x), Number(y), Number(z), shape] as Coord3d
  }

  update3DCells(n: number) {
    const cells = this.iterate3d(n)
    return Array.from(filterCells(cells)).map(VisualPattern3D.keyToCoord)
  }

  getShapeOfCell(cell: string): string {
    // const shape = VisualPattern3D.keyToCoord(cell)[3]
    // on peut implémenter une logique pour choisir la forme en fonction de la position de la cellule
    // par exemple, on peut alterner entre les formes ou choisir une forme en fonction de la position
    // ici, on retourne simplement la première forme de la liste
    // Pour les motifs à plusieurs formes, on peut implémenter une logique plus complexe en remplaçant cette méthode.
    return this.shapes[0] ?? 'cube'
  }

  private getCenterOfGravity(): [number, number, number] {
    if (this.cells.size === 0) return [0, 0, 0]
    let sumX = 0
    let sumY = 0
    let sumZ = 0
    let count = 0
    for (const cell of this.cells) {
      const [x, z, y] = VisualPattern3D.keyToCoord(cell)
      sumX += x
      sumY += y
      sumZ += z
      count++
    }
    return [sumX / count, sumY / count, -sumZ / count]
  }

  render3d(n: number): string {
    const cells = this.iterate3d(n)
    if (cells.size === 0) return ''

    const objects: Elements3DDescription[] = []
    for (const cell of cells) {
      const [x, y, z /*, shape */] = VisualPattern3D.keyToCoord(cell)
      objects.push({
        type: 'cube',
        pos: [x, z, -y], // adapte selon ta convention
        size: 1,
        color: '#ffffff',
        edges: true,
      })
    }
    objects.push(
      { type: 'ambientLight', color: 0xffffff, intensity: 1.2 },
      {
        type: 'directionalLight',
        pos: [5, 10, 5],
        color: 0xffffff,
        intensity: 2,
      },
      {
        type: 'directionalLight',
        pos: [-5, -10, -5],
        color: 0xffffff,
        intensity: 1.6,
      },
    )

    const content = {
      objects,
      backgroundColor: '#ffffff',
      autoCenterZoomMargin: 1.2,
    }

    // Déclenche le chargement lazy de Canvas3DElement (Three.js) pour que le custom element
    // soit enregistré avant que le navigateur ne connecte les <canvas-3d> au DOM.
    import('../../3d/3d_dynamique/Canvas3DElement').catch(() => {})

    const id = `${this.prefixId}-motif-${n}`
    const contentJson = encodeURIComponent(JSON.stringify(content))
    return `<canvas-3d id="${id}" content='${contentJson}' width="250" height="250"></canvas-3d>`
  }

  render(
    n: number,
    dx: number,
    dy: number,
    angle: number,
  ): NestedObjetMathalea2dArray {
    let cells: Set<string> = this.cells
    const newPattern = new VisualPattern3D({
      initialCells: cells,
      prefixId: this.prefixId ?? '',
      shapes: ['cube'],
      type: 'iso',
    })
    newPattern.iterate3d = this.iterate3d.bind(newPattern)
    cells = newPattern.iterate3d(n)
    const objets: NestedObjetMathalea2dArray = []

    if (cells.size === 0) {
      return objets
    }
    if (cells.size > 1000) {
      console.warn(
        "VisualPattern3d: le motif contient plus de 1000 cellules, l'affichage peut être long",
      )
    }
    if (cells.size > 10000) {
      console.warn(
        "VisualPattern3d: le motif contient plus de 10000 cellules, l'affichage peut être très long",
      )
    }
    if (cells.size > 100000) {
      console.warn(
        "VisualPattern3d: le motif contient plus de 100000 cellules, l'affichage peut être très très long",
      )
    }
    const filteredCells = filterCells(cells)
    const sortedCubes = Array.from(filteredCells).map(
      VisualPattern3D.keyToCoord,
    )
    const sortedCells = rangeCubes(sortedCubes).map(VisualPattern3D.coordToKey)

    for (const cell of sortedCells) {
      const [x, y, z, shape] = VisualPattern3D.keyToCoord(cell)
      if (this.shape == null) {
        this.shape = shapeCubeIso(shape, 0, 0, {
          fillStyle: '#ffffff',
          strokeStyle: '#000000',
          lineWidth: 1,
          opacite: 1,
          scale: 1,
        })
      }
      const newShape = this.shape.clone(x, y, z, angle ?? Math.PI / 6)
      newShape.updateBordures()
      objets.push(newShape)
    }
    return objets
  }

  print(): string {
    return Array.from(this.cells)
      .map(VisualPattern3D.keyToCoord)
      .map((coord) =>
        [
          coord.join(';'),
          this.getShapeOfCell(VisualPattern3D.coordToKey(coord)),
        ].join(':'),
      )
      .join('\n')
  }
}
