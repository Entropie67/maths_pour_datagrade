import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Compléter une fraction'
export const interactifReady = true

export const uuid = '698bb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q19 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const num1 = this.canOfficielle ? 38 : randint(31, 39)
    const num3 = this.canOfficielle ? 4 : randint(4, 5)
    const num2 = num3 * 10 - num1

    this.reponse = texNombre(num2, 0)
    this.consigne = 'Complète. '
    this.correction = `$\\dfrac{${num3}}{10}=\\dfrac{${num3 * 10}}{100}$<br><br>
     $\\dfrac{${num1}}{100}+\\dfrac{${miseEnEvidence(this.reponse)}}{100}=\\dfrac{${num3 * 10}}{100}$.`
    this.question = `\\dfrac{${num1}}{100}+\\dfrac{%{champ1}}{100}=\\dfrac{${num3}}{10} `
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$\\dfrac{${num1}}{100}+\\dfrac{\\ldots}{100}=\\dfrac{${num3}}{10}$ `
  }
}
