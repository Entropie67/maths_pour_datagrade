import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '67e1b'
export const refs = {
  'fr-fr': ['3L1QCM-03', 'BP2AutoI3', 'BP1AUTO065'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral développement (2013 Centres étrangers)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class PolynesieJuin13Exo1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.reponses = [
      `$${String(a ** 2)}x^2-${String(2 * a * b)}x+${String(b ** 2)}$`,
      `$${String(a ** 2)}x^2-${String(b ** 2)}$`,
      `$${String(a ** 2)}x^2-${String(2 * a * b)}x-${String(b ** 2)}$`,
    ]
    this.enonce = `La forme développée de $(${String(a)}x-${String(b)})^2$ est :`
    this.correction = `$\\begin{aligned}(${String(a)}x-${String(b)})^2&=(${String(a)}x-${String(b)})(${String(a)}x-${String(b)})\\\\
    &=${String(a)}x\\times ${String(a)}x-${String(a)}x\\times ${String(b)}-${String(b)}\\times ${String(a)}x+${String(b)}\\times ${String(b)}\\\\
    &=${String(a ** 2)}x^2-${String(a * b)}x-${String(a * b)}x+${b * b}\\\\
    &=${miseEnEvidence(`${String(a ** 2)}x^2-${String(2 * a * b)}x+${String(b ** 2)}`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7, 5)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 9)
      const b = randint(2, 9, [a])
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
