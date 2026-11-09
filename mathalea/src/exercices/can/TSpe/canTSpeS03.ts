import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Limite de $\\mathrm{e}^{-n}\\pm kn$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '9c60f'
export const refs = {
  'fr-fr': ['canTSpeS03'],
  'fr-ch': [],
}
export const dateDePublication = '12/08/2024'

/**
 * limites de suites (canT)
 * @author Jean-claude Lhote
 *
 */
class ExpNPmKn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierLimites
  }

  nouvelleVersion() {
    const k = randint(2, 9)
    const pm = choice([true, false])
    const vn = '\\mathrm{e}^{-n}'
    const wn = `${k}n`
    this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier positif ou nul $n$ par : <br> $u_n = ${vn}${pm ? '+' : '-'}${wn}$.`

    this.correction = `On sait que $\\lim\\limits_{n\\to+\\infty} ${vn}=0$ et $\\lim\\limits_{n\\to+\\infty} ${wn}=+\\infty$.<br>`
    this.correction += 'Ainsi, par somme, '
    this.correction += pm
      ? `$\\lim\\limits_{n\\to+\\infty} ${vn}+${wn}=${miseEnEvidence('+\\infty')}$.`
      : `$\\lim\\limits_{n\\to+\\infty} ${vn}-${wn}=${miseEnEvidence('-\\infty')}$.`
    this.reponse = pm ? '+\\infty' : '-\\infty'
  }
}
export default ExpNPmKn
