import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { homothetie, rotation } from '../../../lib/2d/transformations'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'c4da7'
export const refs = {
  'fr-fr': ['3G1QCM-1'],
  'fr-ch': ['11LCES3A-6', '11LSES3A-6'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Rapport d'homothétie (2023 Métropole)"
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSeptembre23Exo1Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(azimut: number, rapport: number): void {
    const nuage = [
      pointAbstrait(-2, 0, 'A'),
      pointAbstrait(-1, -1, 'C'),
      pointAbstrait(-4, -1, 'B'),
    ]
    const centre = pointAbstrait(0, 0, 'O', 'above right')
    const traceO = tracePoint(centre)
    traceO.style = '+'
    traceO.taille = 3
    traceO.epaisseur = 1
    const triangleABC = rotation(
      polygone(nuage[0], nuage[1], nuage[2]),
      centre,
      azimut,
    )
    const triangleDEF = homothetie(triangleABC, centre, rapport, 'DEF')
    const labelABC = nommePolygone(triangleABC, 'ABC')
    const labelDEF = nommePolygone(triangleDEF, 'DEF')
    const labelO = latex2d('O', 0.5, 0.5, {})
    const objets = [
      triangleABC,
      triangleDEF,
      labelABC,
      labelDEF,
      traceO,
      labelO,
    ]
    const frac = new FractionEtendue(1, rapport)
    this.reponses = [
      `$${texNombre(rapport)}$`,
      `$${texNombre(-rapport)}$`,
      `$${frac.texFSD}$`,
    ]
    this.enonce = `Le triangle DEF est l'image du triangle ABC par
une homothétie de centre O. Quel est son rapport${sp()}?`
    this.enonce += mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1.5 }, fixeBordures(objets)),
      objets,
    )
    this.correction = `Les deux figures sont ${
      rapport < 0 ? "de part et d'autre de $O$" : 'du même côté de $O$'
    }, donc le rapport est ${rapport < 0 ? 'négatif' : 'positif'}.<br>
    De plus, ${Math.abs(rapport) > 1 ? 'DEF est plus grand que ABC' : 'DEF est plus petit que ABC'}
     donc le rapport ${Math.abs(rapport) > 1 ? "n'est pas compris entre $-1$ et $1$" : 'est compris entre $-1$ et $1$'}.<br>
    Le rapport est donc $${miseEnEvidence(texNombre(rapport, 1))}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(0, -2)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const azimut = randint(-3, 3) * 10
      const rapport = choice([-1, -2, 2, -3, 3])
      this.appliquerLesValeurs(azimut, rapport)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
