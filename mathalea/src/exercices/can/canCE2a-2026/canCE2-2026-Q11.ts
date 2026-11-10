import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = "Trouver le nombre de faces et d'arêtes d'un cube"
export const interactifReady = true

export const uuid = '5bd1f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q11 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(distracteur1?: string, distracteur2?: string) {
    if (distracteur1 == null || distracteur2 == null) {
      // Version aléatoire :
      // Un distracteur avec 6 faces mais mauvais nombre d'arêtes
      const aretesErreur1 = choice([8, 10, 14])
      distracteur1 = `$6$ faces et $${aretesErreur1}$ arêtes.`

      // Un distracteur avec mauvais nombre de faces et d'arêtes
      const facesErreur = choice([4, 8])
      const aretesErreur2 = choice([6, 8, 10])
      distracteur2 = `$${facesErreur}$ faces et $${aretesErreur2}$ arêtes.`
    }

    this.autoCorrection[0] = {
      propositions: [
        {
          texte: distracteur1,
          statut: false,
        },
        {
          texte: distracteur2,
          statut: false,
        },
        {
          texte: `$6$ faces et $12$ arêtes.`,
          statut: true,
        },
      ],
      options: { vertical: !context.isHtml },
    }

    this.consigne = `Coche la bonne réponse.<br>Un cube a${sp()}:`
    const monQcm = propositionsQcm(this, 0)
    this.canEnonce = this.consigne
    this.question = `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr +
      `Un cube possède toujours $${miseEnEvidence('6')}$ faces et $${miseEnEvidence('12')}$ arêtes.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('$6$ faces et $8$ arêtes.', '$8$ faces et $6$ arêtes.')
    else this.enonce()
  }
}
