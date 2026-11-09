import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
} from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Simplifier un quotient de nombres relatifs'
export const interactifReady = true

export const dateDePublication = '1/07/2026'
/**
 * @author  Jean-Claude Lhote
 *
 *
 */

export const uuid = 'fd5c6'

export const refs = {
  'fr-fr': ['can2N3-01'],
  'fr-ch': [],
}

const fractionsIrreductibles = obtenirListeFractionsIrreductibles()
export default class SimplifierQuotientNombresRelatifs extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    const f = this.quotaChoice('f', fractionsIrreductibles)
    const factor = this.quotaRandint('factor', 2, 12)
    const signes = choice([
      [-1, 1],
      [1, -1],
      [-1, -1],
    ])
    const frac = fraction(
      f.reduire(factor).num * signes[0],
      f.reduire(factor).den * signes[1],
    )
    this.reponse = frac.simplifie().texFSD

    this.question = `Réduire la fraction $${frac.texFraction}$ au maximum.`

    const explicationSigne =
      frac.num < 0 && frac.den < 0
        ? 'Le numérateur et le dénominateur sont négatifs : leur quotient est positif, on n\'écrit pas de signe devant la fraction.<br>'
        : 'Le numérateur et le dénominateur sont de signes contraires : leur quotient est négatif, on écrit donc le signe «\u00a0-\u00a0» devant la fraction.<br>'

    this.correction = `${explicationSigne}$${frac.texFraction}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}$`

    this.canEnonce = this.question
    this.canReponseACompleter = ''
  }
}
