import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer avec des dixièmes/centièmes'
export const interactifReady = true

export const uuid = '0021e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q11 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'unités.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 1234 : randint(1201, 1299)
    const b = this.canOfficielle
      ? 'dixièmes'
      : choice(['dixièmes', 'centièmes'])

    this.reponse =
      b === 'dixièmes'
        ? [`${texNombre(a / 10, 1)}`, `${Math.floor(a / 10)}`]
        : [`${texNombre(a / 100, 2)}`, `${Math.floor(a / 100)}`]
    this.question = `Le nombre $${texNombre(a, 0)}$ ${b} est égal à `

    if (!this.interactif) {
      this.question += '$\\ldots$ unités.'
    }
    this.correction = `$${texNombre(a, 0)}$ ${b} est égal à $ ${b === 'dixièmes' ? `${texNombre(a, 0)}\\div 10` : `${texNombre(a, 0)}\\div 100`} = 
    ${b === 'dixièmes' ? ` ${miseEnEvidence(`${texNombre(a / 10, 1)}`)}` : ` ${miseEnEvidence(`${texNombre(a / 100, 2)}`)}`}$ unités.`
    this.canReponseACompleter = '$\\ldots$ unités'
  }
}
