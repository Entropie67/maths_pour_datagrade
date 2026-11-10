import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un taux global'
export const interactifReady = true

export const uuid = '3acb0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class TauxGlobal extends ExerciceSimple {
  constructor() {
    super()
    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question =
        'Deux hausses successives de $100\\,\\%$ correspondent à une hausse globale de : '
      this.correction = `Augmenter de $100\\,\\%$ revient à multiplier par $2$. <br>
      Ainsi, les deux hausses successives de $100\\,\\%$ correspondent à un coefficient multiplicateur global de $4$.<br>
      On en déduit que la hausse globale est de $${miseEnEvidence('300')}\\,\\%$. `
      this.reponse = 300
      this.optionsChampTexte = { texteApres: '$\\%$' }
      if (!this.interactif) {
        this.question += '$\\ldots\\,\\%$'
      }
      this.canEnonce =
        'Deux hausses successives de $100\\,\\%$ correspondent à une hausse globale de : '
      this.canReponseACompleter = '$\\ldots\\,\\%$'
    } else {
      const taux = new Decimal(choice([10, 20, 30, 40, 50, 60])).div(100)
      const Taux = taux.mul(100)
      const coeff = taux.add(1)
      const coeffG = new Decimal(2).mul(coeff)
      this.reponse = texNombre(new Decimal(coeffG).sub(1).mul(100), 2)
      this.question = `Une hausse de $100\\,\\%$ suivie d'une hausse de $${texNombre(Taux, 0)}\\,\\%$ correspond à une hausse globale de : `
      this.correction = `Augmenter de $100\\,\\%$ revient à multiplier par $2$. <br>
        Augmenter de $${texNombre(Taux, 0)}\\,\\%$ revient à multiplier par $${texNombre(coeff, 2)}$.<br>
        Le coefficient multiplicateur global est donc $2\\times ${texNombre(coeff, 2)}=${texNombre(coeffG, 2)}$.<br>
        Ainsi, le taux global est donné par $${texNombre(coeffG, 2)}-1=${miseEnEvidence(this.reponse)}\\,\\%$.`

      this.optionsChampTexte = { texteApres: '$\\%$' }
      if (!this.interactif) {
        this.question += '$\\ldots\\,\\%$'
      }
      this.canEnonce = `Une hausse de $100\\,\\%$ suivie d'une hausse de $${texNombre(Taux, 0)}$ correspond à une hausse globale de : `
      this.canReponseACompleter = '$\\ldots\\,\\%$'
    }
  }
}
