import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { pointAbstrait } from './PointAbstrait'
import { Polygone, polygone } from './polygones'
import { carre } from './polygonesParticuliers'
import { translation } from './transformations'
import { vecteur } from './Vecteur'

type BinomeXY = { x: number; y: number }
type BinomesXY = BinomeXY[]

/**
 * fonction utilitaire pour la classe Tetris
 * Détermine si deux points sont ceux d'un couple de points (dans l'ordre ou pas)
 * @param {PointAbstrait} pt1
 * @param {PointAbstrait} pt2
 * @param {[PointAbstrait,PointAbstrait]} couple
 * @returns {boolean}
 * @author Jean-claude Lhote
 */
export function trouveCouple(
  pt1: { x: number; y: number },
  pt2: { x: number; y: number },
  couple: [{ x: number; y: number }, { x: number; y: number }],
) {
  return (
    (pt1.x === couple[0].x &&
      pt1.y === couple[0].y &&
      pt2.x === couple[1].x &&
      pt2.y === couple[1].y) ||
    (pt1.x === couple[1].x &&
      pt1.y === couple[1].y &&
      pt2.x === couple[0].x &&
      pt2.y === couple[0].y)
  )
}
/**
 * fonction utilitaire pour la classe Tetris
 * @description Détermine si le point passé en paramètre est l'un des deux points d'un couple de points
 * @description Si c'est le cas, il renvoie le couple de points et la liste des couples restants après avoir supprimé le couple trouvé
 * @param {PointAbstrait} pt1
 * @param {[PointAbstrait,PointAbstrait][]} couplesPoints
 * @returns
 */
export function TrouveExtremites(
  pt1: { x: number; y: number },
  couplesPoints: [{ x: number; y: number }, { x: number; y: number }][],
) {
  const index = couplesPoints.findIndex(
    (couple: [{ x: number; y: number }, { x: number; y: number }]) =>
      (couple[0].x === pt1.x && couple[0].y === pt1.y) ||
      (couple[1].x === pt1.x && couple[1].y === pt1.y),
  )
  if (index !== -1) {
    const couple = couplesPoints[index]
    couplesPoints.splice(index, 1)
    if (couple[0].x === pt1.x && couple[0].y === pt1.y) {
      return {
        couple: [
          { x: couple[0].x, y: couple[0].y },
          { x: couple[1].x, y: couple[1].y },
        ],
        couplesPointsRestants: couplesPoints,
      }
    } else {
      return {
        couple: [
          { x: couple[1].x, y: couple[1].y },
          { x: couple[0].x, y: couple[0].y },
        ],
        couplesPointsRestants: couplesPoints,
      }
    }
  } else {
    return { couple: null, couplesPointsRestants: couplesPoints }
  }
}

/**
 * Classe Tetris
 * @description Cette classe permet de créer un pavage de carrés de surface aire
 * On crée une instance de la classe en lui donnant son aire et les coordonnées de l'origine (coin en bas à gauche du rectangle contenant son polygone)
 * Il faut savoir que les carresOccupes et les carresAdjacentDispo sont définis à partir du point (0;0), le polygone, lui, est translaté en (xOrigine; yOrigine).
 * sa propriété poly donne le polygone de la forme
 * sa méthode render retourne un array contenant toutes les cases carrées
 */
export class Polyquad {
  xOrigine: number
  yOrigine: number
  poly!: Polygone
  dots!: { x: number; y: number }[]
  carresOccupes: { x: number; y: number }[]
  carresAdjacentsDispo: { x: number; y: number }[]
  complexity: number
  rectangle: {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
  }

  constructor(aire: number, xOrigine: number, yOrigine: number) {
    this.xOrigine = xOrigine
    this.yOrigine = yOrigine
    const casesAdjacentes = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
    ]
    // on crée un polygone à base de carrés de surface aire
    let cpt = 0
    let aireTotale = 0
    let aireExt = 0
    do {
      this.carresOccupes = [{ x: 0, y: 0 }]
      cpt++
      this.carresAdjacentsDispo = casesAdjacentes.map((caseAdj) => ({
        x: caseAdj.x,
        y: caseAdj.y,
      }))
      while (this.carresOccupes.length < aire) {
        const index = randint(0, this.carresAdjacentsDispo.length - 1) // On choisit une case adjacente disponible
        const carreChoisi = this.carresAdjacentsDispo[index] // La voilà
        this.carresAdjacentsDispo.splice(index, 1) // On supprime la case choisie des cases adjacentes disponibles
        this.carresOccupes.push({ x: carreChoisi.x, y: carreChoisi.y }) // Elle devient une case occupée
        for (const caseAdj of casesAdjacentes) {
          const caseAdjDispo = {
            x: carreChoisi.x + caseAdj.x,
            y: carreChoisi.y + caseAdj.y,
          }
          if (
            this.carresOccupes.find(
              (caseOccupe) =>
                caseAdjDispo.x === caseOccupe.x &&
                caseAdjDispo.y === caseOccupe.y,
            ) == null
          ) {
            if (
              this.carresAdjacentsDispo.find(
                (caseAdjDispoTrouvee) =>
                  caseAdjDispo.x === caseAdjDispoTrouvee.x &&
                  caseAdjDispo.y === caseAdjDispoTrouvee.y,
              ) == null
            ) {
              this.carresAdjacentsDispo.push(caseAdjDispo)
            }
          }
        }
      }

      this.rectangle = this.findRectangle()
      aireTotale =
        (this.rectangle.xMax - this.rectangle.xMin) *
        (this.rectangle.yMax - this.rectangle.yMin)
      aireExt = this.aireExt()

      this.translate(-this.rectangle.xMin, -this.rectangle.yMin)
      // permet de renseigner this.dots (la liste des sommets.)
      this.detoure()
    } while (aireTotale - aireExt !== aire && cpt < 100)
    this.complexity = aireExt / aireTotale

    this.poly = translation(
      polygone(
        this.dots.map((el: { x: number; y: number }) =>
          pointAbstrait(el.x, el.y),
        ),
      ),
      vecteur(xOrigine, yOrigine),
    )
    this.poly.color = colorToLatexOrHTML('red')
    this.poly.couleurDeRemplissage = colorToLatexOrHTML('orange')
    this.poly.epaisseur = 2
  }

  ajouteCarres(n: number): Polyquad {
    let cpt = 0
    let aireTotale = 0
    let aireExt = 0
    const casesAdjacentes = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
    ]
    const aire = this.carresOccupes.length + n
    let carresOccupes
    let casesAdjacentsDispo
    const tetris2 = new Polyquad(aire, this.xOrigine, this.yOrigine)
    do {
      carresOccupes = JSON.parse(JSON.stringify(this.carresOccupes))
      casesAdjacentsDispo = JSON.parse(
        JSON.stringify(this.carresAdjacentsDispo),
      )
      cpt++
      while (carresOccupes.length < aire) {
        const index = randint(0, casesAdjacentsDispo.length - 1) // On choisit une case adjacente disponible
        const carreChoisi = casesAdjacentsDispo[index] // La voilà
        casesAdjacentsDispo.splice(index, 1) // On supprime la case choisie des cases adjacentes disponibles
        carresOccupes.push({ x: carreChoisi.x, y: carreChoisi.y }) // Elle devient une case occupée
        for (const caseAdj of casesAdjacentes) {
          const caseAdjDispo = {
            x: carreChoisi.x + caseAdj.x,
            y: carreChoisi.y + caseAdj.y,
          }
          if (
            carresOccupes.find(
              (caseOccupe: { x: number; y: number }) =>
                caseAdjDispo.x === caseOccupe.x &&
                caseAdjDispo.y === caseOccupe.y,
            ) == null
          ) {
            if (
              casesAdjacentsDispo.find(
                (caseAdjDispoTrouvee: { x: number; y: number }) =>
                  caseAdjDispo.x === caseAdjDispoTrouvee.x &&
                  caseAdjDispo.y === caseAdjDispoTrouvee.y,
              ) == null
            ) {
              casesAdjacentsDispo.push(caseAdjDispo)
            }
          }
        }
      }
      tetris2.carresOccupes = JSON.parse(JSON.stringify(carresOccupes))
      tetris2.carresAdjacentsDispo = JSON.parse(
        JSON.stringify(casesAdjacentsDispo),
      )
      tetris2.rectangle = tetris2.findRectangle()
      aireTotale =
        (tetris2.rectangle.xMax - tetris2.rectangle.xMin) *
        (tetris2.rectangle.yMax - tetris2.rectangle.yMin)
      aireExt = tetris2.aireExt()

      tetris2.translate(-tetris2.rectangle.xMin, -tetris2.rectangle.yMin)
      // permet de renseigner this.dots (la liste des sommets)
      tetris2.detoure()
    } while (aireTotale - aireExt !== aire && cpt < 100)
    tetris2.carresOccupes = JSON.parse(JSON.stringify(carresOccupes))
    tetris2.carresAdjacentsDispo = JSON.parse(
      JSON.stringify(casesAdjacentsDispo),
    )
    tetris2.complexity = aireExt / aireTotale

    tetris2.poly = translation(
      polygone(
        tetris2.dots.map((el: { x: number; y: number }) =>
          pointAbstrait(el.x, el.y),
        ),
      ),
      vecteur(tetris2.xOrigine, tetris2.yOrigine),
    )
    tetris2.poly.color = colorToLatexOrHTML('red')
    tetris2.poly.couleurDeRemplissage = colorToLatexOrHTML('orange')
    tetris2.poly.epaisseur = 2
    return tetris2
  }

  private findRectangle() {
    let xMin = 1000
    let xMax = -1000
    let yMin = 1000
    let yMax = -1000
    for (const carre of this.carresOccupes) {
      xMin = Math.min(xMin, carre.x)
      xMax = Math.max(xMax, carre.x + 1)
      yMin = Math.min(yMin, carre.y)
      yMax = Math.max(yMax, carre.y + 1)
    }
    return { xMin, xMax, yMin, yMax }
  }

  translate(dx: number, dy: number) {
    for (const carre of this.carresOccupes) {
      carre.x += dx
      carre.y += dy
    }
    for (const carre of this.carresAdjacentsDispo) {
      carre.x += dx
      carre.y += dy
    }
    this.rectangle = {
      xMin: this.rectangle.xMin + dx,
      xMax: this.rectangle.xMax + dx,
      yMin: this.rectangle.yMin + dy,
      yMax: this.rectangle.yMax + dy,
    }
  }

  rotate(sens: boolean) {
    const matriceTransfo = sens
      ? [
          [0, -1],
          [1, 0],
        ]
      : [
          [0, 1],
          [-1, 0],
        ]
    if (matriceTransfo == null)
      throw Error('La matrice ne peut pas être créée, ce qui est impossible')
    for (const carre of this.carresOccupes) {
      const x = matriceTransfo[0][0] * carre.x + matriceTransfo[0][1] * carre.y
      const y = matriceTransfo[1][0] * carre.x + matriceTransfo[1][1] * carre.y
      carre.x = x
      carre.y = y
    }
    for (const carre of this.carresAdjacentsDispo) {
      const x = matriceTransfo[0][0] * carre.x + matriceTransfo[0][1] * carre.y
      const y = matriceTransfo[1][0] * carre.x + matriceTransfo[1][1] * carre.y
      carre.x = x
      carre.y = y
    }
    this.rectangle = this.findRectangle()
    this.translate(-this.rectangle.xMin, -this.rectangle.yMin)
    // permet de renseigner this.dots (la liste des sommets.)
    this.detoure()

    this.poly = translation(
      polygone(
        this.dots.map((el: { x: number; y: number }) =>
          pointAbstrait(el.x, el.y),
        ),
      ),
      vecteur(this.xOrigine, this.yOrigine),
    )
    this.poly.color = colorToLatexOrHTML('red')
    this.poly.couleurDeRemplissage = colorToLatexOrHTML('orange')
    this.poly.epaisseur = 2
  }

  isEmpty(x: number, y: number) {
    return (
      this.carresOccupes.find((carre) => carre.x === x && carre.y === y) == null
    )
  }

  aireExt() {
    let aire = 0
    const xMin = Math.min(...this.carresOccupes.map((carre) => carre.x))
    const xMax = Math.max(...this.carresOccupes.map((carre) => carre.x))
    const yMin = Math.min(...this.carresOccupes.map((carre) => carre.y))
    const yMax = Math.max(...this.carresOccupes.map((carre) => carre.y))
    for (let y = yMin; y <= yMax; y++) {
      let xG = xMin
      let xD = xMax
      let fini = false
      do {
        if (this.isEmpty(xG, y) && this.isEmpty(xD, y)) {
          aire += 2
          xG++
          xD--
        } else if (this.isEmpty(xG, y)) {
          aire++
          xG++
        } else if (this.isEmpty(xD, y)) {
          aire++
          xD--
        } else {
          fini = true
        }
      } while (!fini)
    }
    return aire
  }

  render() {
    const objets: NestedObjetMathalea2dArray = []
    for (const car of this.carresOccupes) {
      const quad = carre(
        pointAbstrait(car.x + this.xOrigine, car.y + this.yOrigine),
        pointAbstrait(car.x + this.xOrigine + 1, car.y + this.yOrigine),
      )
      quad.couleurDeRemplissage = colorToLatexOrHTML('orange')
      quad.color = colorToLatexOrHTML('black')
      objets.push(quad)
    }
    return objets
  }

  detoure() {
    const borduresNonNettoyees: [boolean, boolean, boolean, boolean][][] = []
    for (let x = this.rectangle.xMin; x < this.rectangle.xMax; x++) {
      borduresNonNettoyees[x] = []

      for (let y = this.rectangle.yMin; y < this.rectangle.yMax; y++) {
        borduresNonNettoyees[x][y] =
          this.carresOccupes.find((carre) => carre.x === x && carre.y === y) ==
          null
            ? [false, false, false, false]
            : [true, true, true, true]
      }
    }
    const xor = function (a: boolean, b: boolean) {
      return (a || b) && !(a && b)
    }
    const borduresNettoyees: [boolean, boolean, boolean, boolean][][] = []
    for (let x = this.rectangle.xMin; x < this.rectangle.xMax; x++) {
      borduresNettoyees[x] = []
      for (let y = this.rectangle.yMin; y < this.rectangle.yMax; y++) {
        borduresNettoyees[x][y] = [false, false, false, false]
        borduresNettoyees[x][y][0] =
          y === 0
            ? borduresNonNettoyees[x][y][0]
            : xor(
                borduresNonNettoyees[x][y][0],
                borduresNonNettoyees[x][y - 1][2],
              )
        borduresNettoyees[x][y][1] =
          x === this.rectangle.xMax - 1
            ? borduresNonNettoyees[x][y][1]
            : xor(
                borduresNonNettoyees[x][y][1],
                borduresNonNettoyees[x + 1][y][3],
              )
        borduresNettoyees[x][y][2] =
          y === this.rectangle.yMax - 1
            ? borduresNonNettoyees[x][y][2]
            : xor(
                borduresNonNettoyees[x][y][2],
                borduresNonNettoyees[x][y + 1][0],
              )
        borduresNettoyees[x][y][3] =
          x === 0
            ? borduresNonNettoyees[x][y][3]
            : xor(
                borduresNonNettoyees[x][y][3],
                borduresNonNettoyees[x - 1][y][1],
              )
      }
    }
    let couplesCoords: [{ x: number; y: number }, { x: number; y: number }][] =
      []

    for (let x = this.rectangle.xMin; x < this.rectangle.xMax; x++) {
      for (let y = this.rectangle.yMin; y < this.rectangle.yMax; y++) {
        if (borduresNettoyees[x][y][0]) {
          const pt1 = { x, y }
          const pt2 = { x: x + 1, y }
          if (!couplesCoords.some((couple) => trouveCouple(pt1, pt2, couple)))
            couplesCoords.push([pt1, pt2])
        }
        if (borduresNettoyees[x][y][1]) {
          const pt1 = { x: x + 1, y }
          const pt2 = { x: x + 1, y: y + 1 }
          if (!couplesCoords.some((couple) => trouveCouple(pt1, pt2, couple)))
            couplesCoords.push([pt1, pt2])
        }
        if (borduresNettoyees[x][y][2]) {
          const pt1 = { x: x + 1, y: y + 1 }
          const pt2 = { x, y: y + 1 }
          if (!couplesCoords.some((couple) => trouveCouple(pt1, pt2, couple)))
            couplesCoords.push([pt1, pt2])
        }
        if (borduresNettoyees[x][y][3]) {
          const pt1 = { x, y: y + 1 }
          const pt2 = { x, y }
          if (!couplesCoords.some((couple) => trouveCouple(pt1, pt2, couple)))
            couplesCoords.push([pt1, pt2])
        }
      }
    }

    this.dots = [
      { x: couplesCoords[0][0].x, y: couplesCoords[0][0].y },
      { x: couplesCoords[0][1].x, y: couplesCoords[0][1].y },
    ]
    couplesCoords.shift()
    // afin d'éviter les boucles infinies, on limite le nombre d'itérations au nombre de couples de points.
    let cpt = couplesCoords.length
    while (couplesCoords.length > 0 && cpt > 0) {
      const { couple, couplesPointsRestants } = TrouveExtremites(
        this.dots[this.dots.length - 1],
        couplesCoords,
      )
      cpt--
      const seg = couple
      couplesCoords = couplesPointsRestants
      if (seg) {
        if (seg[1].x !== this.dots[0].x || seg[1].y !== this.dots[0].y) {
          this.dots.push({ x: seg[1].x, y: seg[1].y })
        }
      } else {
        // window.notifyLocal('Le segment suivant n\'a pas été trouvé !', { pointCourant: this.dots[this.dots.length - 1], couplesPoints })
      }
    }
    // on supprime les points intermédiaires
    this.dots = elimineBinomesXYIntermediairesAlignes(this.dots)
  }
}
/**
 * Vérifie si deux vecteurs sont orientés dans la même direction
 * @param {number} dx1 Composante x du premier vecteur
 * @param {number} dy1 Composante y du premier vecteur
 * @param {number} dx2 Composante x du second vecteur
 * @param {number} dy2 Composante y du second vecteur
 * @returns {boolean} true si les vecteurs sont orientés dans la même direction, false sinon
 */
function sontVecteursAlignes(
  dx1: number,
  dy1: number,
  dx2: number,
  dy2: number,
): boolean {
  if (dx1 === 0) {
    if (dy1 === 0) {
      return dx2 === 0 && dy2 === 0
    } else {
      return dy2 / dy1 > 0
    }
  }
  if (dy1 === 0) {
    if (dx1 === 0) {
      return dx2 === 0 && dy2 === 0
    } else {
      return dx2 / dx1 > 0
    }
  }
  return dx2 * dy1 === dx1 * dy2 && dx1 * dx2 > 0 && dy1 * dy2 > 0
}
/**
 * Supprime de la liste de binomesXY les binomes intermédiaires correspondant à des point alignés avec le précédent et le suivant afin de limiter le nombre de sommets d'un polygone
 * Elle permet aussi de supprimer les doublons consécutifs puisque forcément, ils sont alignés
 * @param {BinomesXY} binomesXY une liste de binomesXY
 * @returns {BinomesXY} une liste de binomesXY
 * @author Jean-claude Lhote
 */

export function elimineBinomesXYIntermediairesAlignes(binomesXY: BinomesXY) {
  // on supprime les binomesXY intermédiaires
  for (let i = 1; i < binomesXY.length - 1; ) {
    const pt1 = binomesXY[i - 1]
    const pt2 = binomesXY[i]
    const pt3 = binomesXY[i + 1]
    const dx = pt2.x - pt1.x
    const dy = pt2.y - pt1.y
    const dx2 = pt3.x - pt2.x
    const dy2 = pt3.y - pt2.y
    if (sontVecteursAlignes(dx, dy, dx2, dy2)) {
      binomesXY.splice(i, 1)
    } else {
      i++
    }
  }
  const pt1 = binomesXY[binomesXY.length - 1]
  const pt2 = binomesXY[0]
  const pt3 = binomesXY[1]
  const dx = pt2.x - pt1.x
  const dy = pt2.x - pt1.y
  const dx2 = pt3.x - pt2.x
  const dy2 = pt3.y - pt2.y
  if (dx2 === dx && dy2 === dy) {
    binomesXY.splice(0, 1)
  }
  return binomesXY
}
