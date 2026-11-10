import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { nombreDeChiffresDansLaPartieDecimale } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier astucieusement par $0{,}5$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 * Multiplier par 0,5 revient à diviser par 2, car 0,5 = 1/2.
 */
export const uuid = '24400'

export const refs = {
  'fr-fr': ['can6C2-10'],
  'fr-ch': [],
}

export default class MultiplierParZeroVirguleCinq extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const n = this.quotaRandint('n', 12, 199)
    this.reponse = n / 2
    const precision = nombreDeChiffresDansLaPartieDecimale(this.reponse)

    this.question = `Calculer $${n} \\times 0,5$.`

    this.correction = `$${n} \\times 0,5 = ${n} \\div 2 = ${miseEnEvidence(texNombre(this.reponse, precision))}$`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
Multiplier par $0,5$ revient à diviser par $2$, car $0,5 = \\dfrac{1}{2}$.<br>
Ainsi, $${n} \\times 0,5 = ${n} \\div 2 = ${texNombre(this.reponse, precision)}$.
  `,
      bleuMathalea,
    )
  }
}
