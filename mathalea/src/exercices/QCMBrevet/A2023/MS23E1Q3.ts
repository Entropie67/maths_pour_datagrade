import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '80f6a'
export const refs = {
  'fr-fr': ['3L1QCM-04'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul expression 2nd degré (septembre 2023 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleSep23Ex1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const resultat = c ** 2 + a * c + b
    this.reponses = [
      `$${String(resultat)}$`,
      `$${String(-(c ** 2) + a * c + b)}$`,
      `$${String(c * c - a * c + b)}$`,
    ]
    this.enonce = `Quelle est la valeur de l'expression $x^2+${String(a)}x${ecritureAlgebrique(b)}$ pour $x=${c}$ ?`
    this.correction = ` $\\begin{aligned}
     x^2+${String(a)}x${ecritureAlgebrique(b)} &= (${String(c)})^2+${String(a)}\\times (${String(c)})${ecritureAlgebrique(b)} \\\\
                                                        &=${String(c * c)}${ecritureAlgebrique(a * c)}${ecritureAlgebrique(b)} \\\\
                                                        &= ${miseEnEvidence(String(resultat))} \\\\
                                                        \\end{aligned} $`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, -5, -2)
  }

  versionAleatoire = () => {
    const n = 3
    do {
      const a = choice([2, 4, 5, 6])
      const b = -randint(2, 6)
      const c = choice([-3, -4, -5])

      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
