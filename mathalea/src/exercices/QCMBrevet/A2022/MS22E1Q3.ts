import { reduirePolynomeDegre3 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '9802c'
export const refs = {
  'fr-fr': ['3L1QCM-07', 'BP2AutoI4', 'BP1AUTO066'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral développement (septembre 2022 Métropole)'
export const dateDePublication = '06/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep22Ex1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    this.reponses = [
      `$${reduirePolynomeDegre3(0, b, c - a * b, -a * c)}$`,
      `$${reduirePolynomeDegre3(0, b, c - a * b, c - a)}$`,
      `$${reduirePolynomeDegre3(0, b, c + a * b, a * c)}$`,
    ]
    this.enonce = `Une expression développée de $A=(x-${String(a)})(${String(b)}x+${String(c)})$ est :`
    this.correction = `$\\begin{aligned}A=(x-${String(a)})(${String(b)}x+${String(c)})&=x\\times ${String(b)}x+x\\times ${String(c)}-${String(a)}\\times ${String(b)}x-${String(a)}\\times ${String(c)}\\\\
    &=${String(b)}x^2+${String(c)}x-${String(b * a)}x-${String(c * a)}\\\\
    &=${miseEnEvidence(reduirePolynomeDegre3(0, b, c - a * b, -a * c))}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 3, 7)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 4)
      const b = randint(2, 4, [a])
      const c = randint(5, 9)
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
