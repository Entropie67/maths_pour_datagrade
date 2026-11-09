import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Limite de $\\dfrac{u_n}{v_n}$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '10d04'
export const refs = {
  'fr-fr': ['canTSpeS06'],
  'fr-ch': ['autres-8'],
}
export const dateDePublication = '13/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
class UnSurVn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    const typeDeQuestion = randint(1, 4)
    switch (typeDeQuestion) {
      case 1:
        {
          // \\mathrm{e}^{+ou-n}/(a/n+ou-b)
          const a = randint(-9, 9, 0)
          const b = randint(1, 9)
          const c = randint(-1, 1, 0)
          const pm = choice([true, false])
          const vn = `\\dfrac{${a}}{n}${pm ? '+' : '-'}${b}`
          const un = `\\mathrm{e}^{${c === 1 ? '' : '-'}n}`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier $n$, strictement positif, par : <br> $u_n = \\dfrac{${un}}{${vn}}$.`
          this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${un}=${c === -1 ? '0' : '+\\infty'}$ et $\\lim\\limits_{n\\to+\\infty} ${vn}=${pm ? '' : '-'}${b}$.<br>`
          this.correction += 'Ainsi, par quotient, '
          this.correction +=
            c === -1
              ? `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence('0')}$.`
              : `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence(`${pm ? '+' : '-'}\\infty`)}$.`
          this.reponse = this.correction.split('=')[1].split('$')[0]
        }
        break
      case 2:
        {
          // (a+ou-b/n)/(c/n^d+ou-e)
          const a = randint(-9, 9, 0)
          const b = randint(1, 9)
          const c = randint(2, 9)
          const d = randint(2, 9)
          const e = randint(1, 9)
          const pm = choice([-1, 1])
          const vn = `\\dfrac{${c}}{n^${d}}${pm === 1 ? '+' : '-'}${e}`
          const un = `${a}${choice([true, false]) ? '+' : '-'}\\dfrac{${b}}{n}`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier n, strictement positif, par : $\\dfrac{${un}}{${vn}}$.`
          this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${un}=${a}$ et $\\lim\\limits_{n\\to+\\infty} ${vn}=${e * pm}$.<br>`
          this.correction += 'Ainsi, par quotient, '
          const limite = new FractionEtendue(a, e * pm).simplifie()
          this.correction += `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence(limite.texFSD)}$.`
          this.reponse = limite.texFSD
        }
        break
      case 3:
        {
          // (a+ou-b/n)/(c/n^d)
          const a = randint(-9, 9, 0)
          const b = randint(1, 9)
          const c = randint(2, 9)
          const d = randint(2, 9)
          const vn = `\\dfrac{${c}}{n^${d}}`
          const un = `${a}${choice([true, false]) ? '+' : '-'}\\dfrac{${b}}{n}`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier n, strictement positif, par : $\\dfrac{${un}}{${vn}}$.`
          this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${un}=${a}$ et $\\lim\\limits_{n\\to+\\infty} ${vn}=0^{+}$.<br>`
          this.correction += 'Ainsi, par quotient, '
          const limite = a > 0 ? '+\\infty' : '-\\infty'
          this.correction += `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence(limite)}$.`
          this.reponse = limite
        }
        break
      case 4:
        {
          // an/n^b
          const a = randint(-9, 9, 0)
          const b = randint(2, 9)
          const vn = `n^${b}`
          const un = `${rienSi1(a)}n`
          this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier n, strictement positif, par : $\\dfrac{${un}}{${vn}}$.`
          this.correction = `On sait que $\\dfrac{${un}}{${vn}}=${rienSi1(a)}n^{(1-${b})}=${a === 1 ? '' : `${a}\\times`}\\dfrac{1}{${b === 2 ? 'n' : `n^{${b - 1}}`}}$ et $\\lim\\limits_{n\\to+\\infty} \\dfrac{1}{${b === 2 ? 'n' : `n^{${b - 1}}`}}=0^{+}$.<br>`
          this.correction += 'Ainsi, par produit, '
          this.correction += `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence('0')}$.`
          this.reponse = '0'
        }
        break
    }
  }
}
export default UnSurVn
