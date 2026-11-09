import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea06'
export const refs = {
  'fr-fr': ['3AutoP01-2'],
  'fr-ch': ['11CTFA1A-8', '11LCFA1A-8', '11LSFA1A-8', 'PRQPF03C-7'],
}
export const interactifReady = true
export const titre = 'Calculer une distance avec une vitesse moyenne'
export const dateDePublication = '11/08/2026'

/**
 * DNB Centres étrangers juin 2026 - Question 6
 * @author Jean-Claude Lhote
 */
export default class AutoQ6CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' km' }
  }

  enonce(heures?: number, minutes?: number, vitesse?: number) {
    if (heures == null || minutes == null || vitesse == null) {
      heures = randint(2, 5)
      minutes = choice([15, 30, 45])
      vitesse = randint(2, 4) * 10
    }
    const duree = heures + minutes / 60
    const distance = vitesse * duree
    this.question = `Charlie a effectué un trajet en vélo en $${heures}$ h ${minutes > 0 ? `$${minutes}$ min` : ''} à une vitesse moyenne de $${vitesse}$ km/h.<br>
Calculer la distance, en km, parcourue par Charlie.`
    this.reponse = texNombre(distance, Number.isInteger(distance) ? 0 : 1)
    this.correction = `$${heures}$ h ${minutes > 0 ? `$${minutes}$ min` : ''} correspondent à $${texNombre(duree, 2)}$ h.<br>
La distance parcourue est $${vitesse}\\times ${texNombre(duree, 2)}=${miseEnEvidence(texNombre(distance, Number.isInteger(distance) ? 0 : 1))}\\text{ km}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(2, 30, 40)
    } else {
      this.enonce()
    }
  }
}
