import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Limite de $\\dfrac{a+n^m}{n^p}$'
export const interactifReady = true

export const uuid = '9cdad'
export const refs = {
  'fr-fr': ['canTSpeS09'],
  'fr-ch': [],
}
export const dateDePublication = '13/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
export default class LimiteFormeIndeterminee extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    // (a+ou-n^m)/n^p
    const m = randint(2, 9)
    const a = randint(1, 9)
    const p = randint(2, 9)
    const pm = choice(['+', '-'])
    const un = `${a}${pm}n^${m}`
    const vn = `n^${p}`
    this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier $n$, strictement positif, par : <br> $u_n=\\dfrac{${un}}{${vn}}$.`
    this.correction = `On sait que $\\lim\\limits_{n\\to\\infty} ${un}=${pm === '+' ? '+' : '-'}\\infty$ et $\\lim\\limits_{n\\to\\infty} ${vn}=+\\infty$.<br>`
    this.correction += `Nous avons donc une forme indéterminée du type «${sp()}$\\dfrac{\\infty}{\\infty}$${sp()}», donc nous allons factoriser $n^${m > p ? m : p}$ :<br> `
    if (p === m) {
      this.correction += `$\\dfrac{${un}}{${vn}}=\\dfrac{n^${p}(\\dfrac{${a}}{n^${p}}${pm}1)}{n^${p}}=\\dfrac{${a}}{n^${p}}${pm}1$ en simplifiant par $n^${p}$.<br>Or, $\\lim\\limits_{n\\to\\infty} \\dfrac{${a}}{n^${p}}=0$.<br>`
      this.reponse = pm === '+' ? '1' : '-1'
    } else if (p > m) {
      this.correction += `$\\dfrac{${un}}{${vn}}=\\dfrac{n^${p}(\\dfrac{${a}}{n^${p}}${pm}\\dfrac{1}{n^${p - m}})}{n^${p}}=\\dfrac{${a}}{n^${p}}${pm}\\dfrac{1}{n^${p - m}}$ en simplifiant par $n^${p}$.<br>Or, $\\lim\\limits_{n\\to\\infty} \\dfrac{${a}}{n^${p}}${pm}\\dfrac{1}{n^${p - m}}=0$.<br>`
      this.reponse = '0'
    } else {
      // m>p
      this.correction += `$\\dfrac{${un}}{${vn}}=\\dfrac{n^${m}(\\dfrac{${a}}{n^${m}}${pm}1)}{n^${m}\\times n^{${p - m}}}=\\dfrac{\\dfrac{${a}}{n^${m}}${pm}1}{\\dfrac{1}{n^${m - p}}}$ en simplifiant par $n^${m}$.<br>Or, $\\lim\\limits_{n\\to\\infty} \\dfrac{${a}}{n^${m}}${pm}1=${pm === '+' ? '1' : '-1'}$ et $\\lim\\limits_{n\\to\\infty} \\dfrac{1}{n^${m - p}}=0$.<br>`
      this.reponse = `${pm}\\infty`
    }
    this.correction += `Alors, $\\lim\\limits_{n\\to\\infty} \\dfrac{${un}}{${vn}}=${miseEnEvidence(this.reponse)}$.`
  }
}
