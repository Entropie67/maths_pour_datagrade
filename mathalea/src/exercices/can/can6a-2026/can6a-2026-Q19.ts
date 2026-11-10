import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IFractionEtendue } from '../../../modules/FractionEtendue.type'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver le plus grand nombre (QCM)'
export const interactifReady = true

export const uuid = 'ytght'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(a?: IFractionEtendue, b?: IFractionEtendue) {
    if (a == null || b == null) {
      const denA = choice([2, 3, 4, 5])
      const numA = denA + 1
      const denB = numA + randint(1, 3)
      const numB = denB - 1
      a = fraction(numA, denA)
      b = fraction(numB, denB)
    }

    this.reponse = a.texFraction
    const liste = shuffle([a.texFraction, b.texFraction, 1])

    this.question = `Quel est le plus grand nombre ?<br>`
    this.autoCorrection[0] = {
      options: { ordered: false },
      enonce: `Quel est le plus grand nombre ?<br>`,
      propositions: [
        {
          texte: `$${a.texFraction}$`,
          statut: true,
        },
        {
          texte: `$${b.texFraction}$`,
          statut: false,
        },
        {
          texte: `$1$`,
          statut: false,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    this.question += qcm.texte

    this.correction = `La fraction $${a.texFraction}$ a un numérateur plus grand que son dénominateur, elle est donc plus grande que $1$.<br><br>
    La fraction $${b.texFraction}$ a un numérateur plus petit que son dénominateur, elle est donc plus petite que $1$.<br>
    Ainsi, le plus grand nombre est $${miseEnEvidence(a.texFraction)}$.`

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canEnonce = 'Entoure le plus grand nombre.'
    this.canReponseACompleter = `$${liste.join('~~;~~')}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(fraction(3, 2), fraction(8, 9))
    else this.enonce()
  }
}
