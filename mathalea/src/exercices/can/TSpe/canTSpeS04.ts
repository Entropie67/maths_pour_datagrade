import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Limite de $\\dfrac{a\\pm kn}{n}$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '76669'
export const refs = {
  'fr-fr': ['canTSpeS04'],
  'fr-ch': ['autres-17'],
}
export const dateDePublication = '12/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
class APlusbBnSurN extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    const a = randint(-9, 9, 0)
    const b = randint(1, 9)
    const pm = choice([true, false])
    const vn = `${a}${pm ? '+' : '-'}${b}n`
    this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier positif $n$ par :<br> $u_n = \\dfrac{${vn}}{n}$.`
    this.correction = `Pour tout entier n strictement positif, on a : $\\dfrac{${vn}}{n}=\\dfrac{${a}}{n}${pm ? '+' : '-'}${b}$.<br>`
    this.correction += `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${a}}{n}=0$ et $\\lim\\limits_{n\\to+\\infty} ${pm ? '' : '-'}${b}=${pm ? '' : '-'}${b}$.<br>`
    this.correction += 'Ainsi, par somme, '
    this.correction += `$\\lim\\limits_{n\\to+\\infty} \\dfrac{${vn}}{n}=${miseEnEvidence(`${pm ? '' : '-'}${b}`)}$.`
    this.reponse = `${pm ? '+' : '-'}${b}`
  }
}
export default APlusbBnSurN
