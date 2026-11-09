import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer avec des dixièmes/centièmes'
export const interactifReady = true

export const uuid = '43cd9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N62Q11 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'unités.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 54 : randint(51, 59)
    const b = this.canOfficielle
      ? 'dixièmes'
      : choice(['dixièmes', 'centièmes'])

    this.reponse = b === 'dixièmes' ? texNombre(10 * a, 0) : texNombre(a, 0)
    this.question = `$100\\times ${a}$ ${b} est égal à `
    if (!this.interactif) {
      this.question += '$\\ldots$ unités.'
    }
    this.correction = `$100\\times ${a}$ ${b} est égal à $100\\times ${b === 'dixièmes' ? `${texNombre(a / 10, 1)}` : `${texNombre(a / 100, 2)}`} = ${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = `$100\\times ${a}$ ${b} est égal à `
    this.canReponseACompleter = '$\\ldots$ unités'
  }
}
