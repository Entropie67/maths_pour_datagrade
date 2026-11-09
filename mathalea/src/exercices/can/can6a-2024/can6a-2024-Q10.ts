import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver une valeur possible de hauteur'
export const interactifReady = true

export const uuid = '8c474'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class TrouverLongueur extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const choix = this.canOfficielle
      ? [['une table', 80, 80, 'cm', 'dm', 'mm', 'm']]
      : [
          ['une table', 75, 85, 'cm', 'dm', 'mm', 'm'],
          ['un immeuble', 20, 30, 'm', 'dm', 'mm', 'cm'],
          ['une falaise', 15, 25, 'm', 'dm', 'mm', 'cm'],
          ['une girafe', 40, 50, 'dm', 'cm', 'mm', 'm'],
          ['une échelle', 200, 300, 'cm', 'dm', 'mm', 'm'],
          ['une bouteille', 28, 35, 'cm', 'dm', 'mm', 'm'],
          ['une télévision', 50, 60, 'cm', 'dm', 'mm', 'm'],
        ]
    const a = this.canOfficielle ? 0 : this.quotaRandint('a', 0, 6)
    const b = this.canOfficielle
      ? choix[a][1]
      : randint(choix[a][1] as number, choix[a][2] as number)
    const propositions2 = shuffle([
      [`$${b}\\text{ ${choix[a][3]}}$`],
      [`$${b}\\text{ ${choix[a][4]}}$`],
      [`$${b}\\text{ ${choix[a][5]}}$`],
      [`$${b}\\text{ ${choix[a][6]}}$`],
    ])
    const propositions = choice([
      [
        `$${b}\\text{ ${choix[a][3]}}$`,
        `$${b}\\text{ ${choix[a][4]}}$`,
        `$${b}\\text{ ${choix[a][5]}}$`,
        `$${b}\\text{ ${choix[a][6]}}$`,
      ],
    ])
    // this.reponse = propositions[0] Pas de this.reponse dans un qcm
    this.autoCorrection[0] = {
      options: { vertical: true, ordered: false },
      enonce: `La hauteur d'${choix[a][0]} est :`,
      propositions: [
        {
          texte: `${propositions[0]}`,
          statut: true,
        },
        {
          texte: `${propositions[1]}`,
          statut: false,
        },
        {
          texte: `${propositions[2]}`,
          statut: false,
        },
        {
          texte: `${propositions[3]}`,
          statut: false,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    if (!this.interactif) {
      this.question = 'Entoure la réponse possible. <br>'
      this.question += `La hauteur d'${choix[a][0]} est :<br>
    ${propositions2[0]} ${sp(1)}  ${propositions2[1]} ${sp(1)} ${propositions2[2]} ${sp(1)} ${propositions2[3]} `
    } else {
      this.question = 'Coche la réponse possible.<br>'
      this.question += ` La hauteur d'${choix[a][0]} est :` + qcm.texte
    }

    this.canEnonce = `Coche la réponse possible.<br>
    La hauteur d'${choix[a][0]} est : `
    this.canReponseACompleter = qcm.texte
    this.correction = `La hauteur d'${choix[a][0]} est $${miseEnEvidence(b)}\\text{ ${choix[a][3]}}$.`
  }
}
