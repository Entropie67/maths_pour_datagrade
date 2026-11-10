import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '67e19'
export const refs = {
  'fr-fr': ['3L1QCM-06', 'BP2AutoI20', 'BP1AUTO089'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral factorisation (2013 Polynésie)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class PolynesieJuin13Exo1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    const b2 = b ** 2 / 2
    this.reponses = [
      `$(${String(a)}x+${String(b)})(${String(a)}x-${String(b)})$`,
      `$(${String(a)}x-${String(b)})^2$`,
      `$(${String(a)}x-${String(b2)})(${String(a)}x+${String(b2)})$`,
    ]
    this.enonce = `Quelle est l'expression factorisée de $${String(a ** 2)}x^2-${String(b ** 2)}$ ?`
    this.correction = `$\\begin{aligned}${String(a ** 2)}x^2-${String(b ** 2)}&=${String(a)}^2x^2-${String(b)}^2\\\\
    &=(${String(a)}x)^2-${String(b)}^2\\\\
    &=${miseEnEvidence(`(${String(a)}x+${String(b)})(${String(a)}x-${String(b)})`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 4)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 9)
      const b = randint(2, 4) * 2
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
