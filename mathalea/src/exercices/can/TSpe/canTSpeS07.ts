import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Limite de $n^m-n^p$'
export const interactifReady = true

export const uuid = '0ce7f'
export const refs = {
  'fr-fr': ['canTSpeS07'],
  'fr-ch': ['autres-5'],
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
    // n^m-n^p
    const m = randint(2, 9)
    const p = randint(2, 9, m)
    const diff = m - p
    const un = `n^${m}`
    const vn = `n^${p}`
    this.question = `Déterminer la limite de la suite $(u_n)$ définie pour tout entier $n$, strictement positif, par : <br> $u_n = ${un}-${vn}$.`
    this.correction = `On sait que $\\lim\\limits_{n\\to\\infty} ${un}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} ${vn}=+\\infty$.<br>`
    this.correction += `Nous avons donc une forme indéterminée du type «${sp()}$\\infty - \\infty$${sp()}», donc nous allons factoriser $${m > p ? `n^${m}` : `n^${p}`}$ :<br>`
    if (m > p) {
      this.correction += `$${un}-${vn}=n^${m}(1-${diff === 1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^${diff}}`})$.<br>Or, $\\lim\\limits_{n\\to\\infty} n^${m}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} 1-${diff === 1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^${diff}}`}=1$.<br>`
      this.reponse = '+\\infty'
    } else {
      this.correction += `$${un}-${vn}=n^${p}(${diff === -1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^{${-diff}}}`}-1)$.<br>Or, $\\lim\\limits_{n\\to\\infty} n^${p}=+\\infty$ et $\\lim\\limits_{n\\to\\infty} ${diff === -1 ? '\\dfrac{1}{n}' : `\\dfrac{1}{n^{${-diff}}}`}-1=-1$.<br>`
      this.reponse = '-\\infty'
    }
    this.correction += 'Ainsi, par produit, '
    this.correction += `$\\lim\\limits_{n\\to\\infty} ${un}-${vn}=${miseEnEvidence(this.reponse)}$.`
  }
}
