import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer un prix dans une situation de proportionnalité'
export const interactifReady = true

export const uuid = 'fdadd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Proportionnalite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '€' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 8 : randint(1, 5) * 2
    const k = this.canOfficielle ? 2.5 : choice([1.5, 2.5])
    const k1 = this.canOfficielle ? 1.5 : choice([1.5, 2.5])
    const b = k * a
    const nbreStylos = a * k1
    this.reponse = b * k1
    this.question = `$${a}$ stylos identiques coûtent $${b}$ €. <br>
        Quel est le prix de $${nbreStylos}$ stylos ? `

    this.correction = `$${a}$ stylos coûtent $${b}$ €.<br>
          $${a / 2}$ ${a / 2 === 1 ? 'stylo coûte' : 'stylos coûtent'}  $${texPrix(b / 2)}$ €.<br>
          Ainsi,   $${nbreStylos}$ stylos coûtent ${k1 === 2.5 ? `$2\\times ${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(this.reponse))}$ €.` : `$${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(this.reponse))}$ €.`}`

    this.canReponseACompleter = '$\\ldots$ €'
    if (this.interactif) {
      this.question += '<br>'
      this.optionsChampTexte = { texteApres: '€' }
    } else {
      this.question += '<br>$\\ldots$ €'
    }
  }
}
