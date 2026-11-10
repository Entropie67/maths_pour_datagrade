import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { cube } from '../../../lib/3d/3dProjectionMathalea2d/CubeIso'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { shuffle, shuffle2tableaux } from '../../../lib/outils/arrayOutils'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'f6jd7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Visualisation 3D'
export const dateDePublication = '02/02/2025'
/**
 * @author Jean-claude Lhote
 */
const colorT = 'darkgray'
const colorD = 'gray'
const colorG = 'lightgray'

const pentaminos: [number, number][][][] = [
  [
    [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 2],
    ],
  ],
  [
    [
      [0, 1],
      [0, 1],
      [0, 2],
      [0, 1],
    ],
  ],
  [
    [
      [0, 1],
      [0, 1],
      [0, 3],
    ],
  ],
  [
    [
      [0, 1],
      [0, 3],
      [0, 1],
    ],
  ],
  [
    [
      [1, 2],
      [0, 3],
      [1, 2],
    ],
  ],
  [
    [
      [0, 2],
      [0, 1],
      [0, 2],
    ],
  ],
  [
    [
      [0, 2],
      [0, 2],
      [0, 1],
    ],
  ],
]
/**
 * Cette fonction range les cubes de l'empilement dans un tableau de coordonnées de façon à ce que les cubes de la ligne de devant en bas soient en premier.
 * @param empilement
 */
function rangeCubes(empilement: [number, number][][]) {
  const lstCoordonneesCubes: [number, number, number][] = []
  const larg = empilement.length
  const long = empilement[0].length
  for (let i = larg - 1; i > -1; i--) {
    for (let j = long - 1; j > -1; j--) {
      for (let k = empilement[i][j][0]; k < empilement[i][j][1]; k++) {
        lstCoordonneesCubes.push([i, j, k])
      }
    }
  }
  return lstCoordonneesCubes
}
/**
 * Cette fonction prend un empilement de profondeur n et renvers l'ordre des lignes (1 devient n, 2 devient n-1 ...
 * @param empilement
 */
function permute1(empilement: [number, number][][]): [number, number][][] {
  const empilement1: [number, number][][] = []
  const larg = empilement[0].length
  empilement1[0] = []
  for (let i = 0; i < larg; i++) {
    empilement1[0][larg - 1 - i] = empilement[0][i]
  }
  return empilement1
}
/**
 *  cette fonction prend un empilement sur un rang de large et le bascule sur la droite pour obtenir un empilement de 1 de haut.
 * @param empilement
 */
function tourne1(empilement: [number, number][][]): [number, number][][] {
  const empilement1: [number, number][][] = []
  const larg = empilement[0].length
  const long = empilement.length
  let hmax = 0
  for (let i = 0; i < larg; i++) {
    for (let j = 0; j < long; j++) {
      hmax = Math.max(hmax, empilement[j][i][1])
    }
  }
  empilement1[0] = []
  for (let i = 0; i < hmax; i++) {
    empilement1[i] = []
  }
  for (let i = 0; i < hmax; i++) {
    for (let j = 0; j < larg; j++) {
      if (i < empilement[0][j][1] && i >= empilement[0][j][0]) {
        empilement1[i][j] = [0, 1]
      } else {
        empilement1[i][j] = [0, 0]
      }
    }
  }
  return empilement1
}
/**
 *
 * @param empilement Cette fonction effectue un quart de tour de l'empilement.
 * @returns
 */
function tourne2(empilement: [number, number][][]): [number, number][][] {
  const empilement1: [number, number][][] = []
  const larg = empilement[0].length
  const long = empilement.length
  for (let j = 0; j < larg; j++) {
    empilement1[j] = []
    for (let i = 0; i < long; i++) {
      empilement1[j][i] = empilement[i][j]
    }
  }
  return empilement1
}

export default class Visualisation3d extends ExerciceCan {
  enonce(
    empilement?: [number, number][][],
    empilementBis?: [number, number][][],
  ): void {
    const alpha = 70
    const beta = -30
    let officiel = true
    if (empilement == null || empilementBis == null) {
      officiel = false
      const listIndex = pentaminos.length - 1
      const choix = randint(0, listIndex)
      const choixBis = randint(0, listIndex, choix)
      empilement = pentaminos[choix]
      empilementBis = pentaminos[choixBis]
    }
    const lstCoordonneesCubes = rangeCubes(empilement)

    // La figure sans fioriture
    const objets0: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesCubes.length; i++) {
      objets0.push(
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
    const figure0 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets0),
      ),
      objets0,
    )

    // On permute ligne de devant et ligne de derrière
    const objets1: NestedObjetMathalea2dArray = []
    const empilement1 = permute1(empilement)
    const lstCoordonneesCubes1 = rangeCubes(empilement1)
    for (let i = 0; i < lstCoordonneesCubes1.length; i++) {
      objets1.push(
        ...cube(
          lstCoordonneesCubes1[i][0],
          lstCoordonneesCubes1[i][1],
          lstCoordonneesCubes1[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const figure1 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets1),
      ),
      objets1,
    )

    // On tourne d'un quart de tour dans l'axe de l'empilement pour le coucher
    const objets2: NestedObjetMathalea2dArray = []
    const empilement2 = tourne1(empilement)
    const lstCoordonneesCubes2 = rangeCubes(empilement2)
    for (let i = 0; i < lstCoordonneesCubes2.length; i++) {
      objets2.push(
        ...cube(
          lstCoordonneesCubes2[i][0],
          lstCoordonneesCubes2[i][1],
          lstCoordonneesCubes2[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const figure2 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets2),
      ),
      objets2,
    )

    // On tourne d'un quart de tour dans l'axe vertical après avoir permuté la ligne de devant et la ligne de derrière
    const objets4: NestedObjetMathalea2dArray = []
    const empilement3 = tourne2(permute1(empilement))
    const lstCoordonneesCubes3 = rangeCubes(empilement3)
    for (let i = 0; i < lstCoordonneesCubes3.length; i++) {
      objets4.push(
        ...cube(
          lstCoordonneesCubes3[i][0],
          lstCoordonneesCubes3[i][1],
          lstCoordonneesCubes3[i][2],
          alpha - 50,
          beta,
          { colorD: colorG, colorG: colorD, colorT },
        ).c2d,
      )
    }
    const figure4 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets4),
      ),
      objets4,
    )

    // On tourne d'un quart de tour dans l'axe vertical
    const objets5: NestedObjetMathalea2dArray = []
    const empilement4 = tourne2(empilement)
    const lstCoordonneesCubes4 = rangeCubes(empilement4)
    for (let i = 0; i < lstCoordonneesCubes4.length; i++) {
      objets5.push(
        ...cube(
          lstCoordonneesCubes4[i][0],
          lstCoordonneesCubes4[i][1],
          lstCoordonneesCubes4[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const figure5 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets5),
      ),
      objets5,
    )

    //
    const objets6: NestedObjetMathalea2dArray = []
    const empilement5 = tourne1(permute1(empilement))
    const lstCoordonneesCubes5 = rangeCubes(empilement5)
    for (let i = 0; i < lstCoordonneesCubes5.length; i++) {
      objets6.push(
        ...cube(
          lstCoordonneesCubes5[i][0],
          lstCoordonneesCubes5[i][1],
          lstCoordonneesCubes5[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const figure6 = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objets6),
      ),
      objets6,
    )
    const lstCoordonneesBis = rangeCubes(empilementBis)
    const objetsBis: NestedObjetMathalea2dArray = []
    for (let i = 0; i < lstCoordonneesBis.length; i++) {
      objetsBis.push(
        ...cube(
          lstCoordonneesBis[i][0],
          lstCoordonneesBis[i][1],
          lstCoordonneesBis[i][2],
          alpha,
          beta,
          { colorD, colorG, colorT },
        ).c2d,
      )
    }
    const figureBis = mathalea2d(
      Object.assign(
        { scale: 0.4, display: 'inline-block' } as const,
        fixeBordures(objetsBis),
      ),
      objetsBis,
    )
    const statuts = [false, false, false, true]
    const figuresCorrectes = officiel
      ? [figure0, figure1, figure2, figure4, figure5, figure6]
      : [figure0, figure1, figure2, figure4, figure5, figure6]
    const figures = shuffle(figuresCorrectes).slice(0, 3).concat(figureBis)
    shuffle2tableaux(figures, statuts)

    this.consigne = `Quelle pièce est différente des trois autres${sp()}?`
    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      propositions: [
        {
          texte: figures[0],
          statut: statuts[0],
        },
        {
          texte: figures[1],
          statut: statuts[1],
        },
        {
          texte: figures[2],
          statut: statuts[2],
        },
        {
          texte: figures[3],
          statut: statuts[3],
        },
      ],
    }
    const monQcm = propositionsQcm(this, 0)
    this.question = monQcm.texte
    this.correction =
      monQcm.texteCorr +
      `La pièce différente est la ${texteEnCouleurEtGras(['première', 'deuxième', 'troisième', 'quatrième'][statuts.indexOf(true)])}.`
    this.canEnonce = 'Entoure la pièce qui est différente des trois autres.'
    this.canReponseACompleter = `${figures[0]}${figures[1]}<br>${figures[2]}${figures[3]}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(
          [
            [
              [0, 1],
              [0, 1],
              [0, 2],
            ],
          ],
          [
            [
              [0, 1],
              [0, 2],
              [0, 1],
            ],
          ],
        )
    else this.enonce()
  }
}
