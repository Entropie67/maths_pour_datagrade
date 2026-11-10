import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { cube } from '../../../lib/3d/3dProjectionMathalea2d/CubeIso'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'f6fd7'
export const refs = {
  'fr-fr': ['3G4QCM-2', 'BP2G18'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Brevet Amérique du Sud 2024 : Espace'
export const dateDePublication = '05/12/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */
const colorD = 'darkgray'
const colorT = 'gray'
const colorG = 'white'

export default class AmeriqueSud1224Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(
    empilement: number[][][],
    empilementBis: number[][][],
  ): void {
    const objets = []
    const alpha = 60
    const beta = -30
    // il faut trier les cubes : x décroissant puis y décroissant, puis z croissant
    const lstCoordonneesCubes = []
    const larg = 3
    const long = 3
    for (let i = larg - 1; i > -1; i--) {
      for (let j = long - 1; j > -1; j--) {
        for (let k = empilement[i][j][0]; k < empilement[i][j][1]; k++) {
          lstCoordonneesCubes.push([i, j, k])
        }
      }
    }
    const lstCoordonneesBis = []
    for (let i = larg - 1; i > -1; i--) {
      for (let j = long - 1; j > -1; j--) {
        for (let k = empilementBis[i][j][0]; k < empilementBis[i][j][1]; k++) {
          lstCoordonneesBis.push([i, j, k])
        }
      }
    }
    for (let i = 0; i < lstCoordonneesCubes.length; i++) {
      objets.push(
        ...cube(
          lstCoordonneesCubes[i][0],
          lstCoordonneesCubes[i][1],
          lstCoordonneesCubes[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const fleche = segment(pointAbstrait(4, 1.5), pointAbstrait(2, 2))
    fleche.styleExtremites = '->'
    fleche.epaisseur = 2
    objets.push(fleche)
    const figure = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline' } as const,
        fixeBordures(objets),
      ),
      objets,
    )

    const objets2: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesCubes.length; i++) {
      objets2.push(
        ...cube(
          lstCoordonneesCubes[i][0],
          lstCoordonneesCubes[i][1],
          lstCoordonneesCubes[i][2],
          0,
          0,
          { colorD: 'white', colorG: 'white', colorT: 'white' },
        ).c2d,
      )
    }
    const figure2 = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline' } as const,
        fixeBordures(objets2),
      ),
      objets2,
    )

    const objets3: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesBis.length; i++) {
      objets3.push(
        ...cube(
          lstCoordonneesBis[i][0],
          lstCoordonneesBis[i][1],
          lstCoordonneesBis[i][2],
          0,
          0,
          { colorD: 'white', colorG: 'white', colorT: 'white' },
        ).c2d,
      )
    }
    const figure3 = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline' } as const,
        fixeBordures(objets3),
      ),
      objets3,
    )

    const objets4: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesCubes.length; i++) {
      objets4.push(
        ...cube(
          lstCoordonneesCubes[i][0],
          lstCoordonneesCubes[i][1],
          lstCoordonneesCubes[i][2],
          90,
          0,
          { colorD: 'white', colorG: 'white', colorT: 'white' },
        ).c2d,
      )
    }
    const figure4 = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline' } as const,
        fixeBordures(objets4),
      ),
      objets4,
    )

    const objets5: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesBis.length; i++) {
      objets5.push(
        ...cube(
          lstCoordonneesBis[i][0],
          lstCoordonneesBis[i][1],
          lstCoordonneesBis[i][2],
          90,
          0,
          { colorD: 'white', colorG: 'white', colorT: 'white' },
        ).c2d,
      )
    }
    this.reponses = [figure2, figure3, figure4]
    this.enonce = `Quelle est la vue de droite de ce solide${sp()}?<br>
  ${figure}.`
    this.correction = figure2 /* 'La vue de droite présente de haut en bas:'
    const rangees: [number, number, number][] = []
    for (let h = 0; h < 5; h++) {
      const rangee: [number, number, number] = [0, 0, 0]
      for (let x = 0; x < 3; x++) {
        for (const cube of lstCoordonneesCubes) {
          if (cube[0] === x && cube[2] === h) {
            rangee[x]++
          }
        }
      }
      rangees[h] = rangee
    }
    rangees.reverse()
    this.correction += ` ${rangees.map(rangee => rangee.map(cube => cube !== 0 ? '$\\square$' : '$\\phantom{\\square}$').join('')).join('<br>')}`
    */
  }

  versionOriginale: () => void = () => {
    const ligne1 = [
      [1, 2],
      [1, 2],
      [1, 4],
    ]
    const ligne2 = [
      [0, 2],
      [0, 0],
      [0, 0],
    ]
    const ligne3 = [
      [0, 0],
      [0, 0],
      [0, 0],
    ]
    const empilement = [ligne1, ligne2, ligne3]
    const ligne1bis = [
      [1, 2],
      [0, 0],
      [0, 0],
    ]
    const ligne2bis = [
      [0, 2],
      [1, 2],
      [1, 4],
    ]
    const empilementBis = [ligne1bis, ligne2bis, ligne3]

    this.appliquerLesValeurs(empilement, empilementBis)
  }

  versionAleatoire: () => void = () => {
    const larg = 3
    const long = 3
    const hmax = 4
    const tabHauteurs = new Array(larg)
    for (let i = 0; i < larg; i++) {
      tabHauteurs[i] = new Array(long)
    }
    // premiere ligne
    for (let i = 0; i < larg; i++) {
      tabHauteurs[i][0] = randint(0, 1)
    }
    // deuxième ligne et suivantes
    for (let i = 0; i < larg; i++) {
      for (let j = 1; j < long; j++) {
        tabHauteurs[i][j] = Math.min(
          tabHauteurs[i][j - 1] + randint(0, 2),
          hmax,
        )
      }
    }
    tabHauteurs[randint(0, larg - 1)][long - 1] = hmax
    // Vérification Dernière Ligne : ne pas être vide.
    for (let i = 0; i < larg; i++) {
      tabHauteurs[i][long - 1] = Math.max(1, tabHauteurs[i][long - 1])
    }
    const ligne1 = tabHauteurs.map((el) => [0, el[0]])
    const ligne2 = tabHauteurs.map((el) => [0, el[1]])
    const ligne3 = tabHauteurs.map((el) => [0, el[2]])

    const empilement = [ligne1, ligne2, ligne3]
    const ligne1bis = [
      [1, 2],
      [0, 0],
      [0, 0],
    ]
    const ligne2bis = [
      [0, 2],
      [1, 2],
      [1, 4],
    ]
    const empilementBis = shuffle([ligne1bis, ligne2bis, ligne3])

    this.appliquerLesValeurs(empilement, empilementBis)
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
