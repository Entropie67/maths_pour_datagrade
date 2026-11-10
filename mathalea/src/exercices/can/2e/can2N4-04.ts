import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer $\\dfrac{1}{a}$ à la puissance $-1$ ou $-2$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '02/02/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '0aa94'

export const refs = {
  'fr-fr': ['can2N4-04', '2N43-flash4'],
  'fr-ch': [],
}
export default class calculPuissancesNegativeFraction extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = false
    const a = this.quotaRandint('a', 2, 12)
    const puissance = this.quotaChoice('puissance', [-2, -1])

    this.question = `Calculer $\\left(\\dfrac{1}{${a}}\\right)^{${puissance}}$.`
    this.correction = `$\\left(\\dfrac{1}{${a}}\\right)^{${puissance}}=${a}^{${-puissance}}=${miseEnEvidence(a ** -puissance)}$`
    this.reponse = a ** -puissance

    this.canReponseACompleter = ``
    if (this.versionQcm) {
      this.question = `$\\left(\\dfrac{1}{${a}}\\right)^{${puissance}}$ est égal à : `
      this.distracteurs = [
        `$-\\dfrac{1}{${a ** -puissance}}$`,
        `$${texNombre(a ** -puissance * -1)}$`,
        `$\\dfrac{1}{${a ** -puissance}}$`,
      ]
    }
  }
}
