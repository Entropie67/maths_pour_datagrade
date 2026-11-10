import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '2f4e0'
export const refs = {
  'fr-fr': ['3C1QCM-04'],
  'fr-ch': ['10LCQCMNO-14', '10LSQCMNO-14'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul avec des puissances (septembre 2022 Métropole)'
export const dateDePublication = '06/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep22Ex1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    mantisse: number,
    e1: number,
    e2: number,
    e3: number,
  ): void {
    const expV = e1 + e2 - e3
    const expF1 = e3 * e2 + e1
    const expF2 = e1 - e3
    this.reponses = [
      `$${String(mantisse)}^{${String(expV)}}$`,
      `$${String(mantisse)}^{${String(expF1)}}$`,
      `$${String(mantisse)}^{${String(expF2)}}$`,
    ]
    this.enonce = `$\\dfrac{${String(mantisse)}^{${String(e1)}}\\times ${String(mantisse)}^{${String(e2)}}}{${String(mantisse)}^{${String(e3)}}}$`
    this.correction = ` $\\begin{aligned}
     \\dfrac{${String(mantisse)}^{${String(e1)}}\\times ${String(mantisse)}^{${String(e2)}}}{${String(mantisse)}^{${String(e3)}}} &= \\dfrac{${String(mantisse)}^{${String(e1)}+${String(e2)}}}{${String(mantisse)}^{${String(e3)}}} \\\\
                                                        &= \\dfrac{${String(mantisse)}^{${String(e1 + e2)}}}{${String(mantisse)}^{${String(e3)}}} \\\\
                                                        &= ${String(mantisse)}^{${String(e1 + e2)}-${String(e3)}} \\\\
                                                         &= ${miseEnEvidence(`${String(mantisse)}^{${String(e1 + e2 - e3)}}`)}
                                                        \\end{aligned} $`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 7, 3, 2)
  }

  versionAleatoire = () => {
    const n = 3
    do {
      const mantisse = randint(2, 9)
      const e1 = randint(3, 8)
      const e2 = randint(3, 8, [e1])
      const e3 = randint(2, e1 + e2 - 1, [e1, e2])

      this.appliquerLesValeurs(mantisse, e1, e2, e3)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
