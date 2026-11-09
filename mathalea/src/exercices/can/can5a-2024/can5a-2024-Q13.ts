import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une expression décrite par une phrase'
export const interactifReady = true

export const uuid = '3eda9'
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
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 30
      this.question =
        'Le produit de $5$ par la somme de $2$ et de $4$ est égal à : '
      this.correction = `la somme de $2$ et de $4$ est égal à : $2+4=6$.<br>
      Le produit de $5$ par la somme de $2$ et de $4$ est donc égal à : $5\\times 6=${miseEnEvidence(30)}$.`
    } else {
      const a = this.quotaRandint('a', 3, 4)
      const b = this.quotaRandint('b', 2, 5)
      const c = randint(1, 6, b)
      this.reponse = a * (b + c)
      this.question = `Le produit de $${a}$ par la somme de $${b}$ et de $${c}$ est égal à : `
      this.correction = `la somme de $${b}$ et de $${c}$ est égal à : $${b}+${c}=${b + c}$.<br>
      Le produit de $${a}$ par la somme de $${b}$ et de $${c}$ est donc égal à : $${a}\\times ${b + c}=${miseEnEvidence(this.reponse)}$`
    }

    this.canReponseACompleter = '$\\ldots$'
    if (!this.interactif && context.isHtml) {
      this.question += '$\\ldots$'
    }
  }
}
