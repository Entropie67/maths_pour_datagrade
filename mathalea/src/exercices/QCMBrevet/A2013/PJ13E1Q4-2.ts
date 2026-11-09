import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '67e1c'
export const refs = {
  'fr-fr': ['3L1QCM-05', 'BP2AutoI19', 'BP1AUTO088'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral factorisation (2013 Centres étrangers)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class EtrangersJuin13Exo1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    const b2 = Math.sqrt(b)
    const a2 = Math.sqrt(a)
    this.reponses = [
      `$(${String(a2)}-${String(b2)}x)(${String(a2)}+${String(b2)}x)$`,
      `$${String(a - b)}x^2$`,
      `$(${String(a2)}-${String(b2)}x)^2$`,
    ]
    this.enonce = `La forme factorisée de $${String(a)}-${String(b)}x^2$ est :`
    this.correction = `$\\begin{aligned}${String(a)}-${String(b)}x^2&=${String(a2)}^2-${String(b2)}^2x^2\\\\
    &=${String(a2)}^2-(${String(b2)}x)^2\\\\
    &=${miseEnEvidence(`(${String(a2)}-${String(b2)}x)(${String(a2)}+${String(b2)}x)`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(9, 64)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 9)
      const b = randint(2, 9, [a])
      this.appliquerLesValeurs(a * a, b * b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
