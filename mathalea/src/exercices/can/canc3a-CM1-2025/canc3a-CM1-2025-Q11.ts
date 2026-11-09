import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer avec des dizaines/centaines'
export const interactifReady = true

export const uuid = '22907'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['PR-2'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q11 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'unités.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 42 : randint(31, 49, 40)
    const b = this.canOfficielle
      ? 'dizaines'
      : choice(['dizaines', 'centaines'])

    this.reponse =
      b === 'dizaines' ? texNombre(a * 10, 1) : texNombre(a * 100, 2)
    this.question = `Le nombre $${texNombre(a, 0)}$ ${b} est égal à `

    if (!this.interactif) {
      this.question += '$\\ldots$ unités.'
    }
    this.correction = `$${texNombre(a, 0)}$ ${b} est égal à $ ${b === 'dizaines' ? `${texNombre(a, 0)}\\times 10` : `${texNombre(a, 0)}\\times 100`} = ${miseEnEvidence(this.reponse)}$ unités.`
    this.canReponseACompleter = '$\\ldots$ unités'
  }
}
