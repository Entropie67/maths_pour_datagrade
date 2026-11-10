import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { latex2d } from '../../lib/2d/textes'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { shuffle } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Utiliser une grille pour déterminer des égalités vectorielles ou des vecteurs colinéaires'
export const dateDePublication = '27/06/2026'
export const interactifReady = true

/**
 * Déterminer graphiquement un coefficient de colinéarité sur une grille.
 * @author Jean-Claude Lhote
 */
export const uuid = '2d849'

export const refs = {
  'fr-fr': ['2G21-2'],
  'fr-ch': [],
}

const BORNES = {
  minX: 1,
  maxX: 9,
  minY: 1,
  maxY: 7,
} as const

const DIRECTIONS1: [number, number][] = [
  [2, 2],
  [0, 2],
  [2, 0],
]
const DIRECTIONS2: [number, number][] = [
  [-2, 0],
  [0, -2],
  [-2, -2],
]

function pointsTousDistincts(...points: Array<{ x: number; y: number }>) {
  return new Set(points.map(({ x, y }) => `${x};${y}`)).size === points.length
}

function listeVecteursColineaires(
  points: PointAbstrait[],
): [Vecteur, Vecteur][] {
  const liste: [Vecteur, Vecteur][] = []
  for (const point1 of points) {
    for (const point2 of points.filter((p) => p !== point1)) {
      const v1 = vecteur(point1, point2)
      v1.nom = `${point1.nom}${point2.nom}`
      for (const point3 of points.filter((p) => p !== point1 && p !== point2)) {
        for (const point4 of points.filter(
          (p) => p !== point1 && p !== point2 && p !== point3,
        )) {
          const v2 = vecteur(point3, point4)
          v2.nom = `${point3.nom}${point4.nom}`
          if (v1.x * v2.y === v1.y * v2.x) {
            liste.push([v1, v2])
          }
        }
      }
    }
  }
  return liste
}

function lissteVecteursEgaux(points: PointAbstrait[]): [Vecteur, Vecteur][] {
  const liste: [Vecteur, Vecteur][] = []
  for (const point1 of points) {
    for (const point2 of points.filter((p) => p !== point1)) {
      const v1 = vecteur(point1, point2)
      v1.nom = `${point1.nom}${point2.nom}`
      for (const point3 of points.filter((p) => p !== point1 && p !== point2)) {
        for (const point4 of points.filter(
          (p) => p !== point1 && p !== point2 && p !== point3,
        )) {
          const v2 = vecteur(point3, point4)
          v2.nom = `${point3.nom}${point4.nom}`
          if (v1.x === v2.x && v1.y === v2.y) {
            liste.push([v1, v2])
          }
        }
      }
    }
  }
  return liste
}

function listeVecteursMemeNorme(points: PointAbstrait[]): [Vecteur, Vecteur][] {
  const liste: [Vecteur, Vecteur][] = []
  for (const point1 of points) {
    for (const point2 of points.filter((p) => p !== point1)) {
      const v1 = vecteur(point1, point2)
      v1.nom = `${point1.nom}${point2.nom}`
      for (const point3 of points.filter((p) => p !== point1 && p !== point2)) {
        for (const point4 of points.filter(
          (p) => p !== point1 && p !== point2 && p !== point3,
        )) {
          const v2 = vecteur(point3, point4)
          v2.nom = `${point3.nom}${point4.nom}`
          if (v1.norme() === v2.norme()) {
            liste.push([v1, v2])
          }
        }
      }
    }
  }
  return liste
}

function listeVecteurMemeSens(points: PointAbstrait[]): [Vecteur, Vecteur][] {
  const liste: [Vecteur, Vecteur][] = []
  for (const point1 of points) {
    for (const point2 of points.filter((p) => p !== point1)) {
      const v1 = vecteur(point1, point2)
      v1.nom = `${point1.nom}${point2.nom}`
      for (const point3 of points.filter((p) => p !== point1 && p !== point2)) {
        for (const point4 of points.filter(
          (p) => p !== point1 && p !== point2 && p !== point3,
        )) {
          const v2 = vecteur(point3, point4)
          v2.nom = `${point3.nom}${point4.nom}`
          if (
            v1.x * v2.y === v1.y * v2.x &&
            v1.x * v2.x >= 0 &&
            v1.y * v2.y >= 0
          ) {
            liste.push([v1, v2])
          }
        }
      }
    }
  }
  return liste
}

function listeVecteursOpposes(points: PointAbstrait[]): [Vecteur, Vecteur][] {
  const liste: [Vecteur, Vecteur][] = []
  for (const point1 of points) {
    for (const point2 of points.filter((p) => p !== point1)) {
      const v1 = vecteur(point1, point2)
      v1.nom = `${point1.nom}${point2.nom}`
      for (const point3 of points.filter((p) => p !== point1 && p !== point2)) {
        for (const point4 of points.filter(
          (p) => p !== point1 && p !== point2 && p !== point3,
        )) {
          const v2 = vecteur(point3, point4)
          v2.nom = `${point3.nom}${point4.nom}`
          if (v1.x === -v2.x && v1.y === -v2.y) {
            liste.push([v1, v2])
          }
        }
      }
    }
  }
  return liste
}

export default class VecteursColineairesGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = ['Nombre de questions', 6]
    this.sup = 4
  }

  nouvelleVersion() {
    const nbQuestions = this.sup
    const pointsDistincts: Array<{ x: number; y: number }> = []
    do {
      pointsDistincts.length = 0
      pointsDistincts.push({
        x: randint(BORNES.minX, BORNES.maxX),
        y: randint(BORNES.minY, BORNES.maxY),
      })
      const directions1 = shuffle(DIRECTIONS1).slice(0, 2)
      for (let j = 0; j < 2; j++) {
        const [dx, dy] = directions1[j]
        pointsDistincts.push({
          x: pointsDistincts[j].x + dx,
          y: pointsDistincts[j].y + dy,
        })
      }
      const directions2 = shuffle(DIRECTIONS2)
      for (let j = 0; j < 3; j++) {
        const [dx, dy] = directions2[j]
        pointsDistincts.push({
          x: pointsDistincts[j + 2].x + dx,
          y: pointsDistincts[j + 2].y + dy,
        })
      }
    } while (!pointsTousDistincts(...pointsDistincts))

    const noms = creerNomDePolygone(6, ['Q'])
    const [A, B, C, D, E, F] = pointsDistincts.map((p, k) =>
      pointAbstrait(p.x, p.y, noms[k]),
    )
    const poly = polygone(A, B, C, D, E, A, F, C)
    const { xmin, xmax, ymin, ymax } = fixeBordures([A, B, C, D, E, F], {
      rxmin: -1,
      rxmax: 1,
      rymin: -1,
      rymax: 1,
    })
    const O = pointAbstrait((xmin + xmax) / 2, (ymin + ymax) / 2)
    const labels = [A, B, C, D, E, F].map((p) =>
      latex2d(
        p.nom,
        p.x + (p.x - O.x > 0 ? 0.2 : -0.2),
        p.y + (p.y - O.y >= 0 ? 0.2 : -0.2),
        {},
      ),
    )
    const objets = [
      grille(xmin, ymin, xmax, ymax, 'gray', 0.5, 0.5),
      labels,
      poly,
    ]

    const listeColineaires = listeVecteursColineaires([A, B, C, D, E, F])
    const listeEgaux = lissteVecteursEgaux([A, B, C, D, E, F])
    const listeMemeNorme = listeVecteursMemeNorme([A, B, C, D, E, F])
    const listeMemeSens = listeVecteurMemeSens([A, B, C, D, E, F])
    const listeOpposes = listeVecteursOpposes([A, B, C, D, E, F])

    const listeVecteurs = new Set(
      [
        ...listeColineaires,
        ...listeEgaux,
        ...listeMemeNorme,
        ...listeMemeSens,
        ...listeOpposes,
      ].map(([v1, v2]) => `${v1.nom};${v2.nom}`),
    )
    const quatrePairesDeVecteurs = shuffle(Array.from(listeVecteurs)).slice(
      0,
      nbQuestions,
    )

    this.consigne = mathalea2d(
      Object.assign(
        {
          scale: 2,
          pixelsParCm: 40,
        },
        fixeBordures(objets),
      ),
      objets,
    )
    let texte =
      'Cocher la ou les bonnes réponses (parfois, plusieurs choix sont possibles).<br>'
    let texteCorr = ''
    for (let k = 0; k < nbQuestions; k++) {
      const [nom1, nom2] = quatrePairesDeVecteurs[k].split(';')
      this.autoCorrection[k] = {
        propositions: [
          {
            texte: `Même direction`,
            statut: listeColineaires.some(
              ([v1, v2]) => v1.nom === nom1 && v2.nom === nom2,
            ),
          },
          {
            texte: `Même sens`,
            statut: listeMemeSens.some(
              ([v1, v2]) => v1.nom === nom1 && v2.nom === nom2,
            ),
          },
          {
            texte: `Même norme`,
            statut: listeMemeNorme.some(
              ([v1, v2]) => v1.nom === nom1 && v2.nom === nom2,
            ),
          },
          {
            texte: `Égaux`,
            statut: listeEgaux.some(
              ([v1, v2]) => v1.nom === nom1 && v2.nom === nom2,
            ),
          },
          {
            texte: `Opposés`,
            statut: listeOpposes.some(
              ([v1, v2]) => v1.nom === nom1 && v2.nom === nom2,
            ),
          },
        ],
        options: {
          ordered: true,
        },
      }
      const monQCM = propositionsQcm(this, k)
      const [v1, v2] = [
        ...listeColineaires,
        ...listeEgaux,
        ...listeMemeNorme,
        ...listeMemeSens,
        ...listeOpposes,
      ].find(([u, v]) => u.nom === nom1 && v.nom === nom2) as [Vecteur, Vecteur]
      texteCorr += `Les vecteurs $\\overrightarrow{${nom1}}\\begin{pmatrix}${v1.x}\\\\${v1.y}\\end{pmatrix}$ et $\\overrightarrow{${nom2}}\\begin{pmatrix}${v2.x}\\\\${v2.y}\\end{pmatrix}$.<br>${monQCM.texteCorr}`

      texte += `Les vecteurs $\\overrightarrow{${nom1}}$ et $\\overrightarrow{${nom2}}$ (ont ou sont) :<br>${monQCM.texte}<br>`
    }
    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
  }
}
