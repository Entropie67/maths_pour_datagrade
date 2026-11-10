import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'

export const titre = ' (QCM)'
export const interactifReady = true

export const uuid = '2cdd4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE1Q8 extends ExerciceCan {
  enonce(situation?: number) {
    const situations = [
      // [valeur, objet, unité correcte, explication]
      [
        210,
        'la hauteur de la porte de la classe',
        'cm',
        `Une porte de classe mesure environ $2${sp()}\\text{m}$ de hauteur, soit`,
      ],
      [
        170,
        "la taille d'un adulte",
        'cm',
        `Un adulte mesure environ $1,70${sp()}\\text{m}$, soit`,
      ],
      [30, "la longueur d'une règle", 'cm', 'Une règle mesure généralement'],
      [20, "la longueur d'un cahier", 'cm', 'Un cahier mesure environ'],
      [150, "la hauteur d'une table", 'cm', 'Une table mesure environ'],
      [80, "la hauteur d'une chaise", 'cm', 'Une chaise mesure environ'],
      [25, "la longueur d'un livre", 'cm', 'Un livre mesure environ'],
    ]

    let situationChoisie
    if (situation == null) {
      situationChoisie = choice(situations)
    } else {
      situationChoisie = situations[situation]
    }

    const valeur = situationChoisie[0]
    const objet = situationChoisie[1]
    const uniteCorrecte = situationChoisie[2]
    const explication = situationChoisie[3]

    this.question = `Entoure ${objet}.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$${valeur}${sp()}\\text{m}$`,
          statut: false,
        },
        {
          texte: `$${valeur}${sp()}\\text{cm}$`,
          statut: true,
        },
        {
          texte: `$${valeur}${sp()}\\text{g}$`,
          statut: false,
        },
      ],
      options: { vertical: !context.isHtml },
    }
    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = valeur
    this.question += `${monQcm.texte}`
    this.canEnonce = 'Entoure la hauteur de la porte de la classe.'
    this.canReponseACompleter = monQcm.texte

    this.correction =
      monQcm.texteCorr +
      `${explication} $${miseEnEvidence(valeur)}$ ${texteEnCouleurEtGras(uniteCorrecte)}.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0)
    else this.enonce()
  }
}
