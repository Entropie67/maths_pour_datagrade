import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Compléter une fraction'
export const interactifReady = true

export const uuid = 'd4573'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N62Q9 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(1, 9)
    const b = 10 + a

    this.reponse = texNombre(b, 0)
    this.consigne = 'Complète. '
    this.correction = `$1 +\\dfrac{${a}}{10} =\\dfrac{10}{10}+ \\dfrac{${a}}{10}=\\dfrac{${miseEnEvidence(this.reponse)}}{10}$`
    this.question = `1 +\\dfrac{${a}}{10} =\\dfrac{%{champ1}}{10}`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$1 +\\dfrac{${a}}{10} =\\dfrac{\\ldots}{10}$ `
  }
}
