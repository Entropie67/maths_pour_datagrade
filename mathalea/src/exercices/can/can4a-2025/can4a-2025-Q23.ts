import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Réduire une expression'
export const interactifReady = true

export const uuid = '3422h'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q23 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(3, 9)
    }
    this.question = `Réduire $${a}x+x$.`
    this.correction = `$${a}x+x=x(${a}+1)=${miseEnEvidence(`${a + 1}x`)}$`

    this.reponse = `${reduireAxPlusB(a + 1, 0, 'x')}` // ${String(a + 1)}x`
    this.optionsDeComparaison = { expressionsForcementReduites: true }

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecX
    this.question += this.interactif ? '<br>' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5)
    else this.enonce()
  }
}
