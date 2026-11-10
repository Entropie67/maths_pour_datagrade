import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Question $25$'
export const interactifReady = true

export const uuid = 'sbr6q'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ25 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  enonce(v?: number, forceSens?: boolean) {
    const sens = forceSens !== undefined ? forceSens : choice([true, false])

    if (sens) {
      // km/min → km/h
      if (v == null) {
        v = randint(1, 3)
      }
      const resultat = v * 60

      this.question = `$${v}~\\text{km/min}=$`

      this.correction = `Pour convertir des km/min en km/h, on multiplie par $60$ (car il y a $60$ minutes dans une heure) :<br>
      $${v}~\\text{km/min}=${v}\\times 60~\\text{km/h}=${miseEnEvidence(resultat)}~\\text{km/h}$`

      this.canReponseACompleter = '$\\ldots~\\text{km/h}$'
      this.reponse = resultat

      if (!this.interactif) {
        this.question += `$\\ldots~\\text{km/h}$`
      } else {
        this.optionsChampTexte = { texteApres: '$\\text{ km/h}$' }
      }
    } else {
      // km/h → km/min
      if (v == null) {
        v = randint(4, 10) * 60
      }
      const resultat = v / 60

      this.question = `$${v}~\\text{km/h}=$`

      this.correction = `Pour convertir des km/h en km/min, on divise par $60$ (car il y a $60$ minutes dans une heure) :<br>
      $${v}~\\text{km/h}=${v}\\div 60~\\text{km/min}=${miseEnEvidence(resultat)}~\\text{km/min}$`

      this.canReponseACompleter = '$\\ldots~\\text{km/min}$'
      this.reponse = resultat

      if (!this.interactif) {
        this.question += `$\\ldots~\\text{km/min}$`
      } else {
        this.optionsChampTexte = { texteApres: '$\\text{ km/min}$' }
      }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, true)
    else this.enonce()
  }
}
