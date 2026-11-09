import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver le plus grand nombre (QCM)'
export const interactifReady = true

export const uuid = 'a01f3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(den1?: number, den2?: number, cherchePlusGrand?: boolean) {
    if (den1 == null || den2 == null || cherchePlusGrand == null) {
      den1 = randint(2, 9)
      do {
        den2 = randint(2, 9)
      } while (den2 === den1)
      cherchePlusGrand = choice([true, false])
    }

    const frac1 = fraction(1, den1)
    const frac2 = fraction(1, den2)
    const frac1PlusGrand = den1 < den2

    const statut1 = cherchePlusGrand ? frac1PlusGrand : !frac1PlusGrand
    const statut2 = !statut1

    const consigne = cherchePlusGrand ? 'le plus grand' : 'le plus petit'

    this.question = `Quel est ${consigne} nombre ?<br>`
    this.autoCorrection[0] = {
      options: { ordered: false },
      enonce: `Quel est ${consigne} nombre ?<br>`,
      propositions: [
        {
          texte: `$${frac1.texFraction}$`,
          statut: statut1,
        },
        {
          texte: `$${frac2.texFraction}$`,
          statut: statut2,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    this.question += qcm.texte

    const fracGagnante = statut1 ? frac1 : frac2
    const fracPerdante = statut1 ? frac2 : frac1
    const denGagnant = statut1 ? den1 : den2
    const denPerdant = statut1 ? den2 : den1

    this.reponse = fracGagnante.texFraction

    if (cherchePlusGrand) {
      this.correction = `Quand le numérateur est le même, plus le dénominateur est petit, plus la fraction est grande.<br>
    Comme $${denGagnant} < ${denPerdant}$, on a $${fracGagnante.texFraction} > ${fracPerdante.texFraction}$.<br>
    Le plus grand nombre est $${miseEnEvidence(fracGagnante.texFraction)}$.`
    } else {
      this.correction = `Quand le numérateur est le même, plus le dénominateur est grand, plus la fraction est petite.<br>
    Comme $${denGagnant} > ${denPerdant}$, on a $${fracGagnante.texFraction} < ${fracPerdante.texFraction}$.<br>
    Le plus petit nombre est $${miseEnEvidence(fracGagnante.texFraction)}$.`
    }

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canEnonce = `Entoure ${consigne} nombre.`
    this.canReponseACompleter = `$${frac1.texFraction}~~~~~${frac2.texFraction}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(5, 4, true)
    else this.enonce()
  }
}
