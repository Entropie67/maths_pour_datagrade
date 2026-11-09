import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { abs } from '../../../lib/outils/nombres'
export const titre = 'Calculer avec une puissance de $10$'
export const interactifReady = true

export const uuid = '8990d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcPuissanceDe10 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [
      new Decimal(2025),
      new Decimal(2025).div(10),
      new Decimal(2025).div(100),
    ])
    const exp = this.quotaRandint('exp', -3, 3, [0])
    const expABS = abs(exp)
    this.consigne = 'Compléter.<br>'
    this.reponse = texNombre(exp, 0)
    this.question = `${texNombre(a, 4)} \\times 10^{%{champ1}} =${texNombre(Decimal.pow(10, exp).mul(a), 6)}`
    handleAnswers(this, 0, { champ1: { value: this.reponse } })
    this.correction = `$${texNombre(Decimal.pow(10, exp).mul(a), 6)}$ est $${texNombre(Decimal.pow(10, expABS), 0)}$ fois plus ${exp > 0 ? 'grand' : 'petit'} que $${texNombre(a, 4)}$.<br>
        ${exp > 0 ? `Comme $${texNombre(Decimal.pow(10, exp), 0)}=10^{${texNombre(exp, 0)}}$` : `Comme $\\dfrac{1}{${texNombre(Decimal.pow(10, -exp), 5)}}=${texNombre(Decimal.pow(10, exp), 5)}=10^{${texNombre(exp, 0)}}$`}, 
        alors l'égalité est : $${texNombre(a, 4)} \\times 10^{${miseEnEvidence(texNombre(exp, 0))}} =${texNombre(Decimal.pow(10, exp).mul(a), 6)}$.`

    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${texNombre(a, 4)} \\times 10^{\\ldots} =${texNombre(Decimal.pow(10, exp).mul(a), 5)}$`
  }
}
