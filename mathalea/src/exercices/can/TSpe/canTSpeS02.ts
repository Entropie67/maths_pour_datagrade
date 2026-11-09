import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Limite de $n^{-m}\\pm n^{p}$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '81cd8'
export const refs = {
  'fr-fr': ['canTSpeS02'],
  'fr-ch': [],
}
export const dateDePublication = '12/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
class N2PlusUnSurN extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    const m = randint(-9, -1)
    const p = randint(1, 9)
    const pm = choice([true, false])
    const vn = m === -1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^${-m}}`
    const wn = p === 1 ? 'n' : `n^${p}`
    this.question =
      'Déterminer la limite de la suite $(u_n)$ définie pour tout entier positif $n$ par :<br> $u_n = '
    this.question += m === -1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^${-m}}`
    this.question += pm ? '+' : '-'
    this.question += p === 1 ? 'n$.' : `n^${p}$.`
    this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${vn}=0$ et $\\lim\\limits_{n\\to+\\infty} ${wn}=+\\infty$.<br>`
    this.correction += "Ainsi, d'après les règles des limites de la somme, "
    this.correction += pm
      ? `$\\lim\\limits_{n\\to+\\infty} ${vn}+${wn}=${miseEnEvidence('+\\infty')}$.`
      : `$\\lim\\limits_{n\\to+\\infty} ${vn}-${wn}=${miseEnEvidence('-\\infty')}$.`
    this.reponse = pm ? '+\\infty' : '-\\infty'
  }
}
export default N2PlusUnSurN
