import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer le résultat d'un produit"
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const uuid = 'b5324'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N6Q25 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 400
      : choice([30, 50, 70, 300, 700, 800, 3000, 7000, 4000])
    const b = this.canOfficielle ? 95 : randint(94, 98)

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: `Cocher le résultat du calcul $${texNombre(a, 0)}\\times ${b}$.`,
      propositions: [
        {
          texte: `$${texNombre(a * b, 0)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre((a * b) / 10, 0)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(a * b * 10, 0)}$`,
          statut: false,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = `${this.autoCorrection[0].enonce}${qcm.texte}`
    this.canEnonce = `Cocher le résultat du calcul $${texNombre(a, 0)}\\times ${b}$.`
    this.canReponseACompleter = qcm.texte
    this.reponse = a * b // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.
    this.correction =
      qcm.texteCorr +
      `Le résultat est proche de $${texNombre(a, 0)}\\times 100= ${texNombre(a * 100, 0)}$. <br>
    Il s'agit du nombre $${miseEnEvidence(texNombre(a * b, 0))}$.`
    this.canReponseACompleter = `\\raggedright $${sp(5)}$ \\faSquare[regular] $${texNombre(a * b, 0)}$ <br> $${sp(5)}$ \\faSquare[regular] $${texNombre((a * b) / 10, 0)}$ <br> $${sp(5)}$ \\faSquare[regular] $${texNombre(a * b * 10, 0)}$`
  }
}
