import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { obtenirListeFractionsIrreductibles } from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une somme entre fraction et entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '1853b'

export const refs = {
  'fr-fr': ['can3C1-02'],
  'fr-ch': ['11LCNO2C-1'],
}
export default class SommeEntierEtFractionIrred extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    const maFraction = this.quotaChoice(
      'maFraction',
      obtenirListeFractionsIrreductibles(),
    )
    const a = this.quotaRandint('a', 1, 4)
    const b = maFraction[0]
    const c = maFraction[1]
    const bSurC = new FractionEtendue(b, c)
    const d = new FractionEtendue(a * c + b, c).simplifie()
    this.reponse = d
    this.question = `Calculer sous la forme d'une fraction irréductible :  $${a}+${bSurC.texFraction}$.`
    this.correction = `$${a}+${bSurC.texFraction} = \\dfrac{${a} \\times ${c}}{${c}} + ${bSurC.texFraction} = \\dfrac{${a * c}}{${c}} + ${bSurC.texFraction}  =${miseEnEvidence(d.texFraction)}$`
  }
}
