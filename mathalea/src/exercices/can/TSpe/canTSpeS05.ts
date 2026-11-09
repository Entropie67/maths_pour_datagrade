import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Limite de $u_n\\times v_n$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'bf67b'
export const refs = {
  'fr-fr': ['canTSpeS05'],
  'fr-ch': [],
}
export const dateDePublication = '13/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
class UnFoisVn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    const typeDeQuestion = randint(1, 2)
    switch (typeDeQuestion) {
      case 1:
        {
          // (cn+d)(a/n+ou-b)
          const a = randint(-9, 9, 0)
          const b = randint(1, 9)
          const c = randint(2, 9)
          const d = randint(1, 9, c)
          const pm = choice([true, false])
          const vn = `\\dfrac{${a}}{n}${pm ? '+' : '-'}${b}`
          const un = `${c}n+${d}`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier $n$, strictement positif, par : <br> $u_n = \\left(${un}\\right)\\left(${vn}\\right)$`
          this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${un}=+\\infty$ et $\\lim\\limits_{n\\to+\\infty} ${vn}=${pm ? '' : '-'}${b}$.<br>`
          this.correction += 'Ainsi, par produit, '
          this.correction += `$\\lim\\limits_{n\\to+\\infty} (${un})(${vn})=${miseEnEvidence(`${pm ? '+' : '-'}\\infty`)}$.`
          this.reponse = `${pm ? '+' : '-'}\\infty`
        }
        break
      case 2:
        {
          // (a+ou-b/n)(c/n^d+ou-e)
          const a = randint(-9, 9, 0)
          const b = randint(1, 9)
          const c = randint(2, 9)
          const d = randint(2, 9)
          const e = randint(1, 9)
          const pm = choice([-1, 1])
          const vn = `\\dfrac{${c}}{n^${d}}${pm === 1 ? '+' : '-'}${e}`
          const un = `${a}${choice([true, false]) ? '+' : '-'}\\dfrac{${b}}{n}`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier n, strictement positif, par : $\\left(${un}\\right)\\left(${vn}\\right)$.`
          this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${un}=${a}$ et $\\lim\\limits_{n\\to+\\infty} ${vn}=${e * pm}$.<br>`
          this.correction +=
            "Ainsi, d'après les règles des limites d'un produit, "
          this.correction += `$\\lim\\limits_{n\\to+\\infty} \\left(${un}\\right)\\left(${vn}\\right)=${miseEnEvidence(String(e * a * pm))}$.`
          this.reponse = `${String(e * a * pm)}`
        }
        break
    }
  }
}
export default UnFoisVn
