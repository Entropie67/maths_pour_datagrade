import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer le résultat d'un produit"
export const interactifReady = true

export const uuid = '83789'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q25 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = 9
    const b = this.canOfficielle ? 59 : randint(3, 8) * 10 + 9

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: `Coche le résultat du calcul $${texNombre(a, 0)}\\times ${b}$.`,
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

    this.question = qcm.texte
    this.canEnonce = 'Coche le plus grand nombre.'
    // this.canReponseACompleter = qcm.texte (mauvais à cause d'un mauvais saut de ligne)
    this.canReponseACompleter = `\\faSquare[regular] $${texNombre(a * b, 0)}$ \\faSquare[regular] $${texNombre((a * b) / 10, 0)}$ <br>\\faSquare[regular] $${texNombre(a * b * 10, 0)}$`

    this.reponse = a * b // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.
    this.correction =
      qcm.texteCorr +
      `Le résultat est dans le même ordre de grandeur que $10\\times ${texNombre(b + 1, 0)}= ${texNombre(10 * b + 10, 0)}$. <br>
     Il s'agit du nombre $${miseEnEvidence(texNombre(a * b, 0))}$.`
  }
}
