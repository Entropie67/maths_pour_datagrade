import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un rendu de monnaie'
export const interactifReady = true

export const uuid = '2cab2'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q23 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'centimes.' }
  }

  nouvelleVersion() {
    const a = 4
    const b = this.canOfficielle ? 30 : randint(1, 9) * 10
    this.reponse = texNombre(500 - 100 * a - b, 0)
    this.question = `Je dois payer $${a}$ euros et $${b}$ centimes. Je paie avec un billet de $5$ euros.<br>
      On me rend  `
    if (!this.interactif) {
      this.question += '$\\ldots$ centimes.'
    }

    this.correction = `
     De $${a}$ euros et $${b}$ centimes pour aller jusqu'à $5$ euros, il manque $${texNombre(500 - 100 * a - b, 0)}$ centimes.<br> 
     On me rend donc $${miseEnEvidence(texNombre(500 - 100 * a - b, 0))}$  centimes.`

    this.canEnonce = `Je dois payer $${a}$ euros et $${b}$ centimes. Je paie avec un billet de $5$ euros.`
    this.canReponseACompleter = 'On me rend $\\ldots$ centimes.'
  }
}
