import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la limite de $\\sqrt{n}-n^p$'
export const interactifReady = true

export const uuid = '41d1b'
export const refs = {
  'fr-fr': ['canTSpeS08'],
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
    // sqrt(n)-n^p ou n^p-sqrt(n)
    const m = randint(2, 9)
    const a = randint(1, 9)
    const choix = choice([true, false])
    const un = choix ? `${rienSi1(a)}\\sqrt{n}` : `n^${m}\\sqrt{n}`
    const vn = !choix ? `${rienSi1(a)}\\sqrt{n}` : `n^${m}\\sqrt{n}`
    this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier $n$, strictement positif, par : <br> $u_n = ${un}-${vn}$.`
    this.correction = `On sait que $\\lim\\limits_{n\\to\\infty} ${un}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} ${vn}=+\\infty$.<br>`
    this.correction +=
      'Nous avons donc une forme indéterminée du type «\u00a0$\\infty - \\infty$\u00a0», donc nous allons factoriser $\\sqrt{n}$ :<br> '
    if (choix) {
      this.correction += `$${un}-${vn}=\\sqrt{n}(${a}-n^${m})$.<br>Or, $\\lim\\limits_{n\\to\\infty} \\sqrt{n}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} ${a}-n^${m}=-\\infty$.<br>`
      this.reponse = '-\\infty'
    } else {
      this.correction += `$${un}-${vn}=\\sqrt{n}(n^${m}-${a})$.<br>Or, $\\lim\\limits_{n\\to\\infty} \\sqrt{n}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} n^${m}-${a}=+\\infty$.<br>`
      this.reponse = '+\\infty'
    }
    this.correction += 'Ainsi, par produit, '
    this.correction += `$\\lim\\limits_{n\\to\\infty} ${un}-${vn}=${miseEnEvidence(this.reponse)}$.`
  }
}
