import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une médiane'
export const interactifReady = true

export const uuid = '7ab60'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Mediane extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 9
      this.question = 'Médiane de la série :<br>'
      this.question += `$12$${sp(1)};${sp(1)}$7$${sp(1)};${sp(1)}$8$${sp(1)};${sp(1)}$13$${sp(1)};${sp(1)}$9$`
      this.correction = `On ordonne la série :  $7$${sp(1)};${sp(1)}$8$${sp(1)};${sp(1)}$9$${sp(1)};${sp(1)}$12$${sp(1)};${sp(1)}$13$.<br>
       La série comporte $5$ valeurs donc la médiane est la troisième valeur : $${miseEnEvidence(this.reponse)}$.`
    } else {
      const med = randint(10, 15)
      const val1 = randint(2, 6)
      const val2 = randint(7, 9)
      const val3 = randint(16, 20)
      const val4 = randint(21, 25)
      const valeurs = shuffle([val1, val2, val3, val4, med])
      this.reponse = med
      this.question = 'Médiane de la série :<br>'
      this.question += `$${valeurs[0]}$${sp(1)};${sp(1)}$${valeurs[1]}$${sp(1)};${sp(1)}$${valeurs[2]}$${sp(1)};${sp(1)}$${valeurs[3]}$${sp(1)};${sp(1)}$${valeurs[4]}$ `
      this.correction = `On ordonne la série :  $${val1}$${sp(1)};${sp(1)}$${val2}$${sp(1)};${sp(1)}$${med}$${sp(1)};${sp(1)}$${val3}$${sp(1)};${sp(1)}$${val4}$.<br>
      La série comporte $5$ valeurs donc la médiane est la troisième valeur : $${miseEnEvidence(this.reponse)}$.`
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
