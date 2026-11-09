import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier par $10$ ou $100$ ou ...'
export const interactifReady = true

export const uuid = '93b90'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    if (this.canOfficielle) {
      reponse = 3087.2
      this.question = `$308,72\\times 10 ${this.interactif ? '=' : ''}$ `
      this.correction = `$308,72\\times 10=${miseEnEvidence(texNombre(reponse, 1))}$`
    } else {
      const d = this.quotaRandint('d', 1, 9) / 10
      const c = this.quotaRandint('c', 1, 9) / 100
      const a = this.quotaRandint('a', 1, 9) + d + c
      const k = this.quotaChoice('k', [10, 100, 1000])
      reponse = a * k
      this.question = `$${texNombre(a, 3)}\\times ${texNombre(k, 0)} ${this.interactif ? '=' : ''}$`
      this.correction = `$${texNombre(a, 3)}\\times ${texNombre(k)}=${miseEnEvidence(texNombre(a * k, 2))}$ `
    }
    this.reponse = reponse.toFixed(2)
  }
}
