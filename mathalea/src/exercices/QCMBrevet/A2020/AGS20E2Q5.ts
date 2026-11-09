import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = 'f7abe'
export const refs = {
  'fr-fr': ['3L1QCM-10', 'BP2AutoI5', 'BP1AUTO067'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral développement (09/2020 Antilles-Guyane)'
export const dateDePublication = '09/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AntillesSep20Ex2Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number): void {
    this.reponses = [
      `$x^2-${String(a ** 2)}$`,
      `$x^2+${String(a ** 2)}$`,
      '$2x$',
      `$2x-${String(a * a)}$`,
    ]
    this.enonce = `Une expression développée de $A=(x-${String(a)})(x+${String(a)})$ est :`
    this.correction = `$\\begin{aligned}A=(x-${String(a)})(x+${String(a)})&=x\\times x+x\\times ${String(a)}-${String(a)}\\times x-${String(a)}\\times ${String(a)}\\\\
    &=x^2+${String(a)}x-${String(a)}x-${String(a * a)}\\\\
    &=${miseEnEvidence(`x^2-${String(a * a)}`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const a = randint(2, 9)
      this.appliquerLesValeurs(a)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
