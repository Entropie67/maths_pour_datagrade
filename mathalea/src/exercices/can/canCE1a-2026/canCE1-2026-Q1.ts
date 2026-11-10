import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Trouver la moitié d'un nombre (QCM)"
export const interactifReady = true

export const uuid = 'fd416'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE1Q1 extends ExerciceCan {
  enonce(nbre?: number, moitie?: number, prop2?: number, prop3?: number) {
    if (nbre == null || moitie == null || prop2 == null || prop3 == null) {
      nbre = choice([30, 50, 70, 90])
      moitie = nbre / 2
      prop2 = moitie - 10
      prop3 = moitie + 10
    }

    this.question = `Entoure la moitié de $${nbre}$.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$${moitie}$`,
          statut: true,
        },
        {
          texte: `$${prop2}$`,
          statut: false,
        },
        {
          texte: `$${prop3}$`,
          statut: false,
        },
      ],
      options: { vertical: !context.isHtml },
    }
    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = moitie
    this.question += `${monQcm.texte}`
    this.canEnonce = `Coche la moitié de $${nbre}$.`
    this.correction =
      monQcm.texteCorr +
      `La moitié de $${nbre}$ est $${nbre}\\div 2=${miseEnEvidence(moitie)}$.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(70, 35, 15, 25)
    else this.enonce()
  }
}
