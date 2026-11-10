import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une distance dans un repère orthonormé'
export const interactifReady = true

export const uuid = 'azm1g'
/**
 * Question 17 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { fonction: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '\\sqrt{40}'
    this.question =
      'Soient $A(5\\;;\\;9)$ et $B(7\\;;\\;3)$ dans un repère orthonormé.<br>Déterminer la longueur $AB$.'
    this.correction = `$AB = \\sqrt{{x_{\\overrightarrow{AB}}}^2 + {y_{\\overrightarrow{AB}}}^2}=\\sqrt{2^2 + 6^2} = ${miseEnEvidence('\\sqrt{40}')}$`
  }
}
