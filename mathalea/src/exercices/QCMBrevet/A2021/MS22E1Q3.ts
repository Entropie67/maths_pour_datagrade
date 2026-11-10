import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { rotation } from '../../../lib/2d/transformations'
import { choice } from '../../../lib/outils/arrayOutils'
import { rotationAnimee } from '../../../modules/2dAnimation'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '39ed1'
export const refs = {
  'fr-fr': ['3G1QCM-3'],
  'fr-ch': ['10CTES2A-5', '10LCES2A-5', '10LSES2A-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Rotation (12/2021 Métropole)'
export const dateDePublication = '8/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSeptembre21Exo1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    azimut: number,
    angle1: number,
    angle2: number,
    angle3: number,
  ): void {
    const nuage = [
      pointAbstrait(0.5, 0.5),
      pointAbstrait(1.6, 0.5),
      pointAbstrait(1.6, 0.3),
      pointAbstrait(2, 0.75),
      pointAbstrait(1.6, 1.2),
      pointAbstrait(1.6, 1),
      pointAbstrait(0.5, 1),
    ]
    const centre = pointAbstrait(0, 0, 'O', 'above right')

    const traceO = tracePoint(centre)
    traceO.style = '+'
    traceO.taille = 3
    traceO.epaisseur = 1
    const fleche = rotation(polygone(...nuage), centre, azimut)
    const flecheV = rotation(fleche, centre, angle1)
    const flecheF1 = rotation(fleche, centre, angle2)
    const flecheF2 = rotation(fleche, centre, angle3)
    const flecheAnimee = rotationAnimee(fleche, centre, angle1)
    const label = latex2d('O', 0.3, -0.3, {})
    const objets1 = [traceO, label, fleche, flecheV]
    const objets2 = [traceO, label, fleche, flecheF1]
    const objets3 = [traceO, label, fleche, flecheF2]
    const objets4 = [traceO, label, fleche, flecheV, flecheAnimee]
    this.enonce = `Sur quelle figure a-t-on représenté une flèche et son image par une rotation de centre $O$ et d'angle $${Math.abs(angle1)}^\\circ$ ?`
    const fig1 = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 1, display: 'inline-block' } as const,
        fixeBordures(objets1),
      ),
      objets1,
    )
    const fig2 = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 1, display: 'inline-block' } as const,
        fixeBordures(objets2),
      ),
      objets2,
    )
    const fig3 = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 1, display: 'inline-block' } as const,
        fixeBordures(objets3),
      ),
      objets3,
    )
    const fig4 = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 1, display: 'inline-block' } as const,
        fixeBordures(objets4),
      ),
      objets4,
    )

    this.correction = fig4
    this.reponses = [fig1, fig2, fig3]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(0, 90, 45, 180)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const azimut = randint(0, 7) * 45
      const angle1 = choice([90, -90, 45, -45])
      const angle2 = choice([45, -45, 90, -90, 180], [angle1, -angle1])
      const angle3 = choice([45, -45, 90, -90, 180], [angle1, -angle1, angle2])
      this.appliquerLesValeurs(azimut, angle1, angle2, angle3)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
