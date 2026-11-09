import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer un prix dans une situation de proportionnalité'
export const interactifReady = true

export const uuid = 'fad30'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    if (this.canOfficielle) {
      reponse = 20
      this.question = `$4$ stylos identiques coûtent $8$ €.<br>
      Le prix de $10$ stylos est de : `
      this.canEnonce = `$4$ stylos identiques coûtent $8$ €.<br>
Le prix de $10$ stylos est de : `
      this.correction = `$4$ stylos coûtent $8$ € donc $2$ stylos coûtent $8\\div 2=4$ €.<br>
      Ainsi, $10$ stylos coûtent $${miseEnEvidence(reponse)}$ €.`
    } else {
      if (this.quotaChoice('cas', [true, false])) {
        const a = randint(2, 6)
        const k = randint(2, 4)
        const b = k * a
        reponse = k * b
        this.question = `$${a}$ stylos identiques coûtent $${b}$ €. <br>Le prix de $${b}$ stylos est de : `

        this.correction = `$${a}$ stylos coûtent $${b}$ €.<br>
        $${k}\\times${a}=${k * a}$ stylos coûtent $${k}\\times${b}=${miseEnEvidence(k * b)}$ €.`
      } else {
        const a = randint(1, 4) * 2
        const k = choice([1.5, 2.5])
        const b = k * a
        reponse = b * k
        this.question = `$${a}$ stylos identiques coûtent $${b}$ €. <br>
        Le prix de $${b}$ stylos est de : `
        this.canEnonce = `$${a}$ stylos identiques coûtent $${b}$ €. <br>
Le prix de $${b}$ stylos est de : `
        this.correction = `$${a}$ stylos coûtent $${b}$ €.<br>
          $${a / 2}$ ${a / 2 === 1 ? 'stylo coûte' : 'stylos coûtent'}  $${texPrix(b / 2)}$ €.<br>
          Ainsi,   $${b}$ stylos coûtent ${k > 2 ? `$2\\times ${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(reponse))}$ €.` : `$${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(reponse))}$ €.`}`
      }
    }
    this.reponse = reponse.toFixed(2)

    this.canReponseACompleter = '$\\ldots$ €'
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '€.' }
    } else {
      this.question += '$\\ldots$ €.'
    }
  }
}
